import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FileService} from '@app/services/services';
import {ImportTemplate, FieldMapEnum, FieldTypeEnum} from './bankformatModels';

@Component({
    selector: 'bank-file-editor',
    templateUrl: './bank-file-editor.html',
    styleUrls: ['./bank-file-editor.sass']
})
export class BankFileEditor implements OnChanges {
    @Input() fileID: number;
    busy = false;
    rows: Array<any> = [];
    rawLines: Array<string> = [];
    template: ImportTemplate;
    colNames: string[];
    colTypes: string[];

    private currentImportedFileID: number;
    private fileContent = '';
    private colsAddedDynamicaly = false;

    constructor(private fileService: FileService) {
        this.template = this.createDefaultTemplate();
        this.colNames = ImportTemplate.getFieldNames();
        this.colTypes = ImportTemplate.getFieldTypeNames();
    }

    private createDefaultTemplate() {
        const t = new ImportTemplate();
        t.SkipRows = 1;
        t.addColumn(FieldMapEnum.Skip);
        return t;
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
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType-1];
                break;
            case FieldMapEnum.Date:
                col.DataType = FieldTypeEnum.NorDate;
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType-1];
                break;
            default:
                col.DataType = FieldTypeEnum.Text;
                col.FieldTypeName = ImportTemplate.getFieldTypeNames()[col.DataType-1];
                break;
    
        }
    }

    onColTypeChange(typeName: string, index: number) {
        const col = this.template.Columns[index];
        col.DataType = ImportTemplate.getFieldTypeNames().indexOf(col.FieldTypeName) + 1;
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
            const row = this.splitRow(lines[i], template);
            this.rows.push(row);
        }
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
                const cols = lines[i].split(this.mapSeparator(template.Separator));
                if (cols.length > template.Columns.length) {
                    template.addColumn(FieldMapEnum.Skip);
                    this.colsAddedDynamicaly = true;
                }
            }
        }
    }

    private splitRow(source: string, template: ImportTemplate) {
        const row: string[] = [];
        if (template.IsFixed) {
            template.Columns.forEach( x => {
                const text = source.length >= x.StartPos + x.Length ? source.substr(x.StartPos - 1, x.Length || 1) : '';
                row.push(text);
            });
        } else {
            const cols = source.split(this.mapSeparator(template.Separator));
            template.Columns.forEach( x => {
                const text =  x.StartPos <= cols.length ? cols[x.StartPos - 1] : '';
                row.push(text);
            });
        }
        return row;
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
