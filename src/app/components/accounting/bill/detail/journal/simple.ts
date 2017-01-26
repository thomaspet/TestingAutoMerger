import {ViewChild, Component, Input, Output, EventEmitter, Pipe, PipeTransform} from '@angular/core';
import {FinancialYear, VatType, SupplierInvoice, JournalEntryLineDraft, JournalEntry, Account, StatusCodeSupplierInvoice} from '../../../../../unientities';
import {ICopyEventDetails, IConfig as ITableConfig, Column, ColumnType, IChangeEvent, ITypeSearch, Editable, ILookupDetails, IStartEdit} from '../../../../timetracking/utils/editable/editable';
import {ToastService, ToastType} from '../../../../../../framework/unitoast/toastservice';
import {roundTo, safeDec, safeInt, trimLength, capitalizeSentence} from '../../../../timetracking/utils/utils';
import {Lookupservice} from '../../../../timetracking/utils/lookup';
import {
    FinancialYearService,
    ErrorService,
    checkGuid
} from '../../../../../services/services';

@Component({
    selector: 'bill-simple-journalentry',
    templateUrl: 'app/components/accounting/bill/detail/journal/simple.html',
})
export class BillSimpleJournalEntryView {
    @Input() public set supplierinvoice(value: SupplierInvoice ) {
        this.current = value;
        this.initFromInvoice(this.current);
        this.calcRemainder();
    }
    @Output() public valueChange: EventEmitter<any> = new EventEmitter();

    @ViewChild(Editable) private editable: Editable;
    public hasMultipleEntries: boolean = false;
    public current: SupplierInvoice;
    public costItems: Array<JournalEntryLineDraft> = [];
    public tableConfig: ITableConfig;
    public journalEntryNumber: string;

    public sumVat: number = 0;
    public sumRemainder: number = 0;

    private financialYearID: number = 0;
    private financialYears: Array<FinancialYear>;
    private isReadOnly: boolean = false;

    constructor(
        private toast: ToastService,
        private lookup: Lookupservice,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService
    ) {
        this.clear();
        this.initTableConfig();
        this.initYear();
    }

    public ngOnInit() {

    }

    private initFromInvoice(invoice: SupplierInvoice) {
        this.hasMultipleEntries = false;
        this.analyzeEntries(invoice);
        this.journalEntryNumber = invoice && invoice.JournalEntry ? invoice.JournalEntry.JournalEntryNumber : undefined;
        if (this.editable) {
            this.editable.closeEditor();
        }
    }

    public clear() {
        this.isReadOnly = false;
        this.sumRemainder = 0;
        this.sumVat = 0;
        this.journalEntryNumber = '';
        this.costItems.length = 0;
        this.ensureWeHaveSingleEntry();
    }

    public focus() {
        if (this.editable) {
            this.editable.editRow(0);
        }
    }

    private ensureWeHaveSingleEntry() {
        if (this.costItems.length === 0) {
            this.addEmptyRowAtBottom();
        }
    }

    private addEmptyRowAtBottom() {
        this.costItems.push(this.newEntry());
    }

    private newEntry(sum = 0): JournalEntryLineDraft {
        var entry = new JournalEntryLineDraft();
        entry.Amount = sum;
        var acc = new Account();
        acc.AccountNumber = 0;
        acc.AccountName = '';
        entry.Account = acc;
        entry.VatPercent = 0;
        return entry;
    }

    private calcRemainder(): number {
        var sumItems = 0;
        var total: number = this.current && this.current.TaxInclusiveAmount ? this.current.TaxInclusiveAmount : 0;
        var sumVat: number = 0;
        if (total) {
            this.costItems.forEach( x => {
                var value = safeDec(x.Amount);
                if (x.VatType && x.VatType.VatPercent) {
                    sumVat += roundTo((value * x.VatType.VatPercent) / (100 + x.VatType.VatPercent));
                }
                sumItems += value;
            });
            this.sumVat = sumVat;
            this.sumRemainder = roundTo(total - sumItems);
            return this.sumRemainder;
        }
        return 0;
    }

    private analyzeEntries(invoice: SupplierInvoice) {

        if (!invoice) { return; }

        var entry = invoice && invoice.JournalEntry ? invoice.JournalEntry : null;
        var lines = entry && entry.DraftLines ? entry.DraftLines : [];

        this.isReadOnly = this.current ? this.current.StatusCode >= StatusCodeSupplierInvoice.Journaled : false;

        if (lines.length > 0) {
            var numberOfCostAccounts = 0;
            var firstLine = lines[0];
            this.costItems.length = 0;

            // Extract 'non-supplier' items
            lines.forEach((x, index) => {
                let acc = x.Account ? x.Account.AccountNumber : 0;
                if (acc !== invoice.Supplier.SupplierNumber) {
                    numberOfCostAccounts++;
                    if (numberOfCostAccounts === 1) {
                        firstLine = lines[index];
                    }
                    x['_rowIndex'] = index; // save original index
                    this.costItems.push(x);
                }
            });

            if (numberOfCostAccounts > 0 ) {
                if (numberOfCostAccounts > 1) {
                    this.hasMultipleEntries = true;
                }
                if (!this.isReadOnly) {
                    this.costItems.push(this.newEntry());
                }

            } else {
                this.clear();
            }
        }

    }

    private initTableConfig() {
        this.tableConfig = {
            columns: [
                new Column('Account.AccountNumber', '', ColumnType.Integer,
                    {
                        route: 'accounts',
                        select: 'AccountNumber,AccountName,ID,VatTypeID', visualKey: 'AccountNumber',
                        blankFilter: 'AccountNumber ge 4000 and AccountNumber le 9999 and setornull(visible)',
                        model: 'account',
                        expand: 'VatType', filter: 'setornull(visible)'
                    }),
                new Column('VatTypeID', '', ColumnType.Integer,
                    {
                        route: 'vattypes',
                        select: 'VatCode,Name,VatPercent,ID', visualKey: 'VatCode', visualKeyType: ColumnType.Text,
                        model: 'vattype',
                        render: x => (`${x.VatCode}: ${x.VatPercent}% - ${trimLength(x.Name,12)}`)
                    }
                ),
                new Column('Description'),
                new Column('Amount'),
                new Column('delete', '', ColumnType.Action)
            ],
            events: {

                onChange: (event: IChangeEvent) => {
                    return this.lookup.checkAsyncLookup(event, (e) => this.updateChange(e), (e) => this.asyncValidationFailed(e) ) || this.updateChange(event);
                },

                onStartEdit: (info: IStartEdit) => {
                    if (this.isReadOnly) {
                        info.cancel = true;
                    } else {
                        if (info.columnDefinition.name === 'Description') {
                            info.value = this.costItems[info.row].Description;
                        }
                        this.calcRemainder();
                    }
                },

                onTypeSearch: details => {
                    if (details.columnDefinition.name === 'Amount') {
                        this.createGrossValueData(details);
                    } else {
                        this.lookup.onTypeSearch(details);
                    }
                },

                onCopyCell: (details: ICopyEventDetails) => {
                    debugger;
                    if (details.position.row <= 0) { return; }
                    var row = this.costItems[details.position.row];
                    var rowAbove = this.costItems[details.position.row - 1];
                    this.enrollNewRow(row);
                    switch (details.columnDefinition.name) {
                        case 'Account.AccountNumber':
                            row.Account = rowAbove.Account;
                            row.AccountID = rowAbove.AccountID;
                            row.VatType = rowAbove.VatType;
                            row.VatTypeID = rowAbove.VatTypeID;
                            this.checkRowSum(row, details.position.row);
                            break;
                        case 'VatTypeID':
                            row.VatType = rowAbove.VatType;
                            row.VatTypeID = rowAbove.VatTypeID;
                            break;
                        case 'Description':
                            row.Description = rowAbove.Description;
                            break;
                        case 'Amount':
                            row.Amount = rowAbove.Amount;
                            break;
                    }
                    details.copyAbove = false;
                    this.raiseUpdateFromCostIndex(details.position.row);
                    if (details.position.row >= this.costItems.length - 1) {
                        this.addEmptyRowAtBottom();
                    }
                }
            }
        };
    }

    private checkRowSum(row: JournalEntryLineDraft, rowIndex: number) {
        if ((!row.Amount) && (this.sumRemainder)) {
            row.Amount = this.sumRemainder;
        }
        if ((!row.Description) && (this.current && this.current.Supplier && this.current.Supplier.Info)) {
            row.Description = capitalizeSentence(this.current.Supplier.Info.Name, 2);
        }
    }

    private createGrossValueData(details: ITypeSearch) {
        var line: JournalEntryLineDraft = this.costItems[details.position.row];
        if (line.VatType && line.VatType.VatPercent) {
            var currentSum = safeDec(details.value);
            var grossValue = roundTo(currentSum * ((100 + line.VatType.VatPercent) / 100));
            details.rows = [{ sum: grossValue }];
            details.renderFunc = x => `+ ${line.VatType.VatPercent}% = ${x.sum}`;
            details.ignore = false;
        }
    }

    private raiseUpdateFromCostIndex(costIndex: number, cargo?: any) {
        var line = this.costItems[costIndex];
        this.calcRemainder();
        if (!line) { return; }
        var actualRowIndex = line['_rowIndex'];
        this.raiseUpdateEvent(actualRowIndex, line, cargo);
    }

    private raiseUpdateEvent(actualRowIndex: number, item: any, cargo: any) {
        if (actualRowIndex >= 0 ) {
            this.valueChange.emit({ rowIndex: actualRowIndex, item: item, details: cargo });
        }
    }

    public onRowActionClicked(rowIndex: number, item: any) {
        if (this.isReadOnly) { return; }
        this.editable.closeEditor();
        var line = this.costItems[rowIndex];
        var actualRowIndex = line['_rowIndex'];
        this.costItems.splice(rowIndex, 1);
        if (actualRowIndex >= 0 && (actualRowIndex !== undefined)) {
            line.Deleted = true;
            this.raiseUpdateEvent(rowIndex, line, { action: 'deleted' });
            if (!line.ID) {
                this.current.JournalEntry.DraftLines.splice(actualRowIndex, 1);
                this.costItems.forEach( x => { if (x['_rowIndex'] > actualRowIndex ) { x['_rowIndex']--; } } );
            }
        }
        this.ensureWeHaveSingleEntry();
        this.calcRemainder();
    }

    private enrollNewRow(row: JournalEntryLineDraft) {
        var actualRowIndex = row['_rowIndex'];
        if (actualRowIndex === undefined) {
            this.current.JournalEntry = this.current.JournalEntry || new JournalEntry();
            this.current.JournalEntry.DraftLines = this.current.JournalEntry.DraftLines || [];
            this.current.JournalEntry.DraftLines.push(row);
            actualRowIndex = this.current.JournalEntry.DraftLines.length - 1;
            row['_rowIndex'] = actualRowIndex;
            checkGuid(this.current.JournalEntry);
            checkGuid(row);
            this.checkJournalYear(this.current.JournalEntry);
        }
        return actualRowIndex;
    }

    private updateChange(change: IChangeEvent) {
        var line: JournalEntryLineDraft;

        var isLastRow = change.row >= this.costItems.length - 1;

        if (change.row > this.costItems.length - 1 ) {
            line = new JournalEntryLineDraft();
        } else {
            line = this.costItems[change.row];
        }

        this.enrollNewRow(line);

        switch (change.columnDefinition.name) {
            case 'Account.AccountNumber':
                if (change.lookupValue) {
                    line.Account = change.lookupValue;
                    line.AccountID = change.lookupValue.ID;
                    line.VatTypeID = change.lookupValue.VatTypeID;
                    line.VatType = change.lookupValue.VatType;
                    if ((!line.VatType) && line.VatTypeID ) {
                        this.lookup.getSingle<VatType>('vattypes', line.VatTypeID).subscribe( x => {
                            line.VatType = x;
                            line.VatPercent = x.VatPercent;
                            this.checkRowSum(line, change.row);
                            this.calcRemainder();
                            this.editable.reloadCellValue();
                        });
                    } else {
                        this.checkRowSum(line, change.row);
                    }
                } else {
                    this.toast.addToast('no lookupvalue: ' + change.value, ToastType.warn, 4);
                }
                break;

            case 'VatTypeID':
                if (change.lookupValue) {
                    line.VatType = change.lookupValue;
                    line.VatTypeID = change.lookupValue.ID;
                    line.VatPercent = change.lookupValue.VatPercent;
                }
                break;

            case 'Description':
                line.Description = change.value;
                break;

            case 'Amount':
                if (typeof(change.value) === 'object') {
                    line.Amount = change.value.sum;
                } else {
                    line.Amount = roundTo(change.value);
                }
                change.reloadAfterEdit = true;
                if (change.row > 0 && (!this.sumRemainder) ) {
                    this.calcRemainder();
                    this.autoBalanceFirstRow();
                }
                if (line.Amount !== this.current.TaxInclusiveAmount) {
                    line['_setByUser'] = true;
                }
                break;
        }

        change.updateCell = false;

        if (isLastRow) {
            this.addEmptyRowAtBottom();
        }

        this.raiseUpdateFromCostIndex(change.row, change);
    }


    private autoBalanceFirstRow() {
        if (this.sumRemainder) {
            let line = this.costItems[0];
            var sum = line.Amount || 0;
            let adjustedValue = roundTo(sum + (this.sumRemainder || 0));
            if (!line['_setByUser']) {
                line.Amount = adjustedValue;
                this.calcRemainder();
            }
        }
    }

    private asyncValidationFailed(event: IChangeEvent) {
        if (!this.editable) {
            return;
        }
        // No match: take first item in dropdown-list ?
        var droplistItems = this.editable.getDropListItems({ col: event.col, row: event.row});
        if (droplistItems && droplistItems.length > 0 && event.columnDefinition) {
            var lk: ILookupDetails = event.columnDefinition.lookup;
            let item = droplistItems[0];
            event.value = item[lk.colToSave || 'ID'];
            event.lookupValue = item;
            event.userTypedValue = false;
            this.updateChange(event);
        } else {
            this.toast.addToast(event.columnDefinition.label, ToastType.bad, 3, `Ugyldig ${event.columnDefinition.label}: ${event.value}`);
        }
    }

    private initYear() {
        var fc: FinancialYear;
        fc = this.financialYearService.getYearInLocalStorage();

        if (fc) {
            this.financialYears = [fc];
            this.financialYearID = fc.ID;
        } else {
            this.financialYearService.GetAll(null).subscribe((response) => {
                this.financialYears = response;
            }, err => this.errorService.handle(err));
        }
    }

    private checkJournalYear(entry: JournalEntry) {
        if (!entry.FinancialYearID) {
            if ((!this.financialYearID) && (this.financialYears && this.financialYears.length > 0)) {
                // todo: locate ideally matching year
                this.financialYearID = this.financialYears[0].ID;
            }
            entry.FinancialYearID =  this.financialYearID;
        }
    }

}

// PIPES

@Pipe({
  name: 'account'
})
export class AccountPipe implements PipeTransform {

    public transform(value: any, format?: string) {
        var acc: Account = value;

        if (acc && acc.AccountNumber) {
            return acc.AccountNumber + ' - ' + trimLength(acc.AccountName, 13);
        }
    }
}

@Pipe({
  name: 'vatcode'
})
export class VatCodePipe implements PipeTransform {

    public transform(value: any, format?: string) {
        var code: VatType = value;
        if (code && code.ID) {
            return code.VatCode + ' - ' + code.VatPercent + '%';
        }
    }
}

@Pipe({
  name: 'trimtext'
})
export class TrimTextPipe implements PipeTransform {

    public transform(value: any, format?: string) {
        if (value) {
            return trimLength(value, format ? safeInt(format) : 10 );
        }
    }
}
