import {Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {FileService} from '@app/services/services';
import {ImportTemplate, FieldMapEnum, FieldTypeEnum, ImportColumn} from './bankformatModels';

@Component({
    selector: 'bank-file-editor',
    templateUrl: './bank-file-editor.html',
    styleUrls: ['./bank-file-editor.sass']
})
export class BankFileEditor implements OnChanges {
    @Input() fileID: number;
    @Output() onValidate = new EventEmitter();
    busy = false;
    rows: Array<any> = [];
    rawLines: Array<string> = [];
    template: ImportTemplate;
    colNames: string[];
    colTypes: string[];
    lastValidation: { success: boolean; message?: string } = { success: false, message: '' };
    templateWasLoaded = false;
    hasDateError: ImportColumn;

    private currentImportedFileID: number;
    private fileContent = '';
    private colsAddedDynamicaly = false;

    constructor(private fileService: FileService) {
        this.template = this.createDefaultTemplate();
        this.colNames = ImportTemplate.getFieldNames();
        this.colTypes = ImportTemplate.getFieldTypeNames();
    }

    clear() {
        localStorage.setItem('customBankStatementTemplate', '');
        this.template = this.createDefaultTemplate(false);
        this.templateWasLoaded = false;
        this.applyTemplate(this.template);
    }

    private createDefaultTemplate(autoLoad = true) {
        const t = new ImportTemplate();
        const stored = autoLoad ? localStorage.getItem('customBankStatementTemplate') : null;
        if (stored) {
            if (t.loadFromText(stored)) { this.templateWasLoaded = true; return t; }
        }
        t.SkipRows = 1;
        t.addColumn(FieldMapEnum.Skip, undefined, 0);
        return t;
    }

    setTemplate(template: ImportTemplate) {
        this.template = ImportTemplate.Check(template);
    }

    getTemplate() {
        const t = new ImportTemplate();
        t.Name = this.template.Name;
        t.IsFixed = this.template.IsFixed;
        t.Separator = this.template.Separator;
        t.SkipRows = this.template.SkipRows;
        t.Columns = this.template.Columns.filter( x => x.FieldMapping > 0);
        return t;
    }

    validate(): { success: boolean; message?: string } {
        this.hasDateError = undefined;
        const validation = { success: false, message: '' };
        const dateCol = this.template.Columns.find( x => x.FieldMapping === FieldMapEnum.Date);
        let amountCol = this.template.Columns.find( x => x.FieldMapping === FieldMapEnum.Amount);
        const debetCol = this.template.Columns.find( x => x.FieldMapping === FieldMapEnum.Debit);
        const creditCol = this.template.Columns.find( x => x.FieldMapping === FieldMapEnum.Credit);
        if ((!amountCol) && (debetCol && creditCol)) { amountCol = debetCol; }
        if (dateCol && amountCol) {
            if (!this.checkDateFormat(dateCol)) {
                validation.message = `Sjekk at datoformatet gir en gyldig dato`;
                this.hasDateError = dateCol;
            } else {
                validation.success = true;
                this.raiseOnValidateEvent(validation);
                return validation;
            }
        } else {
            validation.message = (!(dateCol || amountCol)) ? `Du må velge dato- og beløpskolonne`
                : !dateCol ? 'Du må velge datokolonne' : 'Du må velge beløpskolonne';
        }
        this.raiseOnValidateEvent(validation);
        return validation;
    }

    raiseOnValidateEvent(evt: { success: boolean; message?: string }) {
        this.lastValidation = evt;
        if (evt.success) {
            localStorage.setItem('customBankStatementTemplate', JSON.stringify(this.getTemplate()));
        }
        this.onValidate.emit(evt);
    }

    ngOnChanges() {
        if (this.fileID && this.fileID !== this.currentImportedFileID) {
            this.busy = true;
            this.currentImportedFileID = this.fileID;
            this.fileService.downloadXml(this.fileID, 'text/plain')
            .finally( () => this.busy = false)
            .subscribe( blob => {
                const reader = new FileReader();
                reader.addEventListener('loadend', e => {
                    this.fileContent = (<any>e.srcElement).result;
                    this.analyzeFile(this.fileContent);
                });
                reader.readAsText(blob);
            });
        } else {
            this.applyTemplate(this.template);
        }
    }

    onColChange(colName: string, index: number) {
        const col = this.template.Columns[index];
        col.FieldMapping = ImportTemplate.getFieldNames().indexOf(col.FieldName);
        switch (col.FieldMapping) {
            case FieldMapEnum.Amount:
            case FieldMapEnum.Debit:
            case FieldMapEnum.Credit:
            case FieldMapEnum.Presign:
                col.DataType = FieldTypeEnum.Decimal;
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType - 1];
                break;
            case FieldMapEnum.Date:
                col.DataType = FieldTypeEnum.NorDate;
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType - 1];
                break;
            default:
                col.DataType = FieldTypeEnum.Text;
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType - 1];
                break;
        }
        this.validate();
    }

    onColTypeChange(typeName: string, index: number) {
        const col = this.template.Columns[index];
        col.DataType = ImportTemplate.getFieldTypeNames().indexOf(col.FieldTypeName) + 1;
        this.validate();
    }

    private analyzeFile(fileContent: string) {
        this.rows = [];
        if (!fileContent) { return; }
        this.rawLines = this.fileContent.split(/\r?\n/);
        this.applyTemplate(this.template);
    }

    private applyTemplate(template: ImportTemplate) {
        this.autoDetectNewColumns(template);
        const lines = this.rawLines;
        const nTop = lines.length > 8 ? 8 : lines.length;
        this.rows = [];
        for (let i = 0; i < nTop; i++) {
            const row = this.sliceTextRow(lines[i], template);
            if (!this.rowLooksEmpty(row)) {
                this.rows.push(row);
            }
        }
        this.validate();
    }

    private rowLooksEmpty(row: string[]): boolean {
        if (row === undefined || row === null) { return true; }
        if (row.length === 0) { return true; }
        let nEmpty = 0; let nActive = 0;
        row.forEach( x => {
            if (x === null || x === undefined || x.trim() === '') { nEmpty++; } else { nActive++; }
        });
        if (nEmpty > 0 && nActive <= 1) { return true; }
        return false;
    }

    private checkDateFormat(dataCol: ImportColumn): boolean {
        let nMatch = 0; let nFail = 0;
        const index = this.template.Columns.indexOf(dataCol);
        const thisYear = new Date().getFullYear();
        this.rows.forEach( x => {
            const value = x[index];
            if (value === null || value === '') { return; }
            const date = this.parseDate(dataCol.DataType, value);
            if (date && date.getFullYear() >= thisYear - 10 && date.getFullYear() <= thisYear + 10) {
                nMatch++;
            } else {
                nFail = 0;
            }
        });
        return nMatch > nFail;
    }

    private parseDate(type: FieldTypeEnum, value: string): Date {
        switch (type) {
            case FieldTypeEnum.IsoDate:
                return this.splitDate(value);
            case FieldTypeEnum.IsoDate2:
                return this.splitDate(value, 6, 4);
            case FieldTypeEnum.NorDate:
                return this.splitDate(value, 0, 3, 6);
            default:
                return null;
        }
    }

    private splitDate(value: string, dyPos = 8, mdPos = 5, yrPos = 0, yrLength = 4) {
        const yr = parseInt(value.substr(yrPos, yrLength), 10);
        const md = parseInt(value.substr(mdPos, 2), 10) - 1;
        const dy = parseInt(value.substr(dyPos, 2), 10);
        if (md < 0 || md > 12) { return null; }
        if (dy < 1 || dy > 31) { return null; }
        if (yr < 1900 || yr > 2199 ) { return null; }
        return new Date(yr, md, dy);
    }

    private trimApostrophes(value: string): string {
        if (value.length > 2 && value.substr(0 , 1) === '"' && value.substr(value.length - 1, 1) === '"') {
            return value.substr(1, value.length - 2).trim();
        }
        return value.trim();
    }

    private autoDetectNewColumns(template: ImportTemplate) {
        const lines = this.rawLines;
        const nTop = lines.length > 8 ? 8 : lines.length;
        this.rows = [];
        if (template.IsFixed === false) {
            if (this.colsAddedDynamicaly) {
                template.Columns = [];
            }
            for (let i = 0; i < nTop; i++) {
                const cols = this.csvSplit(lines[i], this.mapSeparator(template.Separator));
                if (cols.length > template.Columns.length) {
                    template.addColumn(FieldMapEnum.Skip, undefined, 0);
                    this.colsAddedDynamicaly = true;
                }
            }
        }
    }

    private sliceTextRow(source: string, template: ImportTemplate) {
        const row: string[] = [];
        if (template.IsFixed) {
            template.Columns.forEach( x => {
                const text = source.length >= x.StartPos + x.Length ? source.substr(x.StartPos - 1, x.Length || 1) : '';
                row.push(this.trimApostrophes(text));
            });
        } else {
            const cols = this.csvSplit(source, this.mapSeparator(template.Separator));
            template.Columns.forEach( x => {
                const text =  x.StartPos <= cols.length ? cols[x.StartPos - 1] : '';
                row.push(this.trimApostrophes(text));
            });
        }
        return row;
    }

    private csvSplit(value: string, divider = ',') {
        let pos = 0;
        let posStart = 0;
        let bEscapeActive = false;
        let curSymbol = '';
        let prevSymbol = '';
        let isInQuotes = false;
        const pars = [];
        for (pos = 0; pos < value.length; pos++) {
            bEscapeActive = prevSymbol === '\\';
            curSymbol = value.substr(pos, 1);
            if (!bEscapeActive && curSymbol === '\"') {
                isInQuotes = !isInQuotes;
            }

            if (!isInQuotes) {
                if ((curSymbol === divider) && !bEscapeActive) {
                    pars.push(value.substr(posStart, pos - posStart));
                    posStart = pos + 1;
                }
            }
            prevSymbol = curSymbol;
        }

        if (value.length >= posStart) {
            pars.push(value.substr(posStart, value.length - posStart));
        }

        return pars;
      }

    private mapSeparator(value: string) {
        switch (value) {
            case 'TAB': return '\t';
            case 'SPACE': return ' ';
            default:
                return value;
        }
    }

}
