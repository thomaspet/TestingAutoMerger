import {ViewChild, Component, Input, Output, EventEmitter, Pipe, PipeTransform} from '@angular/core';
import {FinancialYear, VatType, SupplierInvoice,
    JournalEntryLineDraft, JournalEntry, Account, StatusCodeSupplierInvoice} from '../../../../../unientities';
import {ICopyEventDetails, IConfig as ITableConfig, Column, ColumnType,
    IChangeEvent, ITypeSearch, Editable,
    ILookupDetails, IStartEdit} from '../../../../common/utils/editable/editable';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {roundTo, safeDec, safeInt, trimLength} from '../../../../common/utils/utils';
import {Lookupservice} from '../../../../../services/services';
import {
    FinancialYearService,
    ErrorService,
    VatTypeService,
    checkGuid
} from '../../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniMath} from '../../../../../../framework/core/uniMath';
import {Observable} from 'rxjs/Observable';
declare const _; // lodash
import * as moment from 'moment';

@Component({
    selector: 'bill-simple-journalentry',
    templateUrl: './simple.html',
})
export class BillSimpleJournalEntryView {
    @Input() public supplierinvoice: BehaviorSubject<SupplierInvoice>;
    @Output() public valueChange: EventEmitter<any> = new EventEmitter();

    @ViewChild(Editable) private editable: Editable;
    public hasMultipleEntries: boolean = false;
    public current: SupplierInvoice;
    public costItems: Array<JournalEntryLineDraft> = [];
    public tableConfig: ITableConfig;
    public journalEntryNumber: string;

    private vatTypes: Array<VatType> = [];

    public sumVat: number = 0;
    public sumRemainder: number = 0;

    private financialYearID: number = 0;
    private financialYears: Array<FinancialYear>;
    private isReadOnly: boolean = false;
    private currentSupplierID: number = 0;
    private hasSuggestions: boolean = false;
    private suggestions: Array<IJournalHistoryItem> = [];

    constructor(
        private toast: ToastService,
        private lookup: Lookupservice,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService,
        private vatTypeService: VatTypeService
    ) {
        this.clear();
        this.initTableConfig();
        this.initYear();
    }

    public ngOnInit() {
        this.vatTypeService.GetVatTypesWithDefaultVatPercent(null)
            .subscribe(vattypes => {
                this.vatTypes = vattypes;

                // run the vatpercent calculations in case the supplierinvoice finished loading
                // before the vattypes were loaded
                if (this.current) {
                    this.updateVatPercentBasedOnDate();
                }
            }, err => this.errorService.handle(err)
        );

        this.supplierinvoice.subscribe((value: SupplierInvoice) => {
            let dateChanged = this.current && value && this.current.InvoiceDate !== value.InvoiceDate;

            if (!_.isEqual(this.current, value)) {
                this.current = _.cloneDeep(value); // we need to refresh current to view actual data
                this.initFromInvoice(this.current);
                this.calcRemainder();
            } else {
                this.calcRemainder();
            }

            // for now, check vatpercentage changes every time, because the _isEqual above
            // does not seem to work as it should always - this.current is already updated
            // when this function runs if a journalentry draftline exists..
            //if (dateChanged) {
                this.updateVatPercentBasedOnDate();
                this.calcRemainder();
            //}
        });
    }

    private initFromInvoice(invoice: SupplierInvoice) {
        if (invoice.SupplierID !== this.currentSupplierID) {
            this.currentSupplierID = invoice.SupplierID;
        }

        this.hasMultipleEntries = false;
        this.analyzeEntries(invoice);
        this.journalEntryNumber = invoice && invoice.JournalEntry ?
            invoice.JournalEntry.JournalEntryNumber : undefined;
    }

    public closeEditor() {
        if (this.editable) {
            this.editable.closeEditor();
        }
    }

    public lookupHistory() {
        this.suggestions = [];
        this.hasSuggestions = false;
        if (this.costItems && this.costItems.length > 0
            && this.costItems[0].AccountID > 0) {
            this.hasSuggestions = false;
            return;
        }
        let observable = this.lookup.statQuery('supplierinvoice', 'select=lines.accountid as AccountID'
            + ',account.accountnumber as AccountNumber,max(invoicedate) as LastDate'
            + ',account.AccountName as AccountName,count(id) as Counter'
            + `&filter=supplierid eq ${this.currentSupplierID} and accountgroup.groupnumber ge 300`
            + (this.current.ID ? ` and id ne ${this.current.ID}` : '')
            + '&join=&expand=journalentry,journalentry.lines,journalentry.lines.account'
            + ',journalentry.lines.account.accountgroup&top=10&orderby=count(id) desc');
        observable.subscribe( x => {
            var items: Array<IJournalHistoryItem> = <any>x;
            if (items) {
                this.hasSuggestions = items.length > 0;
                items.forEach( item => item.Label = `${item.AccountNumber} - ${item.AccountName}` );
            }
            this.suggestions = items;
        });
    }

    public clear() {
        this.isReadOnly = false;
        this.sumRemainder = 0;
        this.sumVat = 0;
        this.journalEntryNumber = '';
        this.costItems.length = 0;
        this.currentSupplierID = 0;
        this.hasSuggestions = false;
        this.suggestions = [];
        this.ensureWeHaveSingleEntry();
        this.closeEditor();
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
        entry.AmountCurrency = sum;
        var acc = new Account();
        acc.AccountNumber = 0;
        acc.AccountName = '';
        entry.Account = acc;
        entry.VatPercent = 0;
        return entry;
    }

    private calcRemainder(): number {
        var sumItems = 0;
        var total: number = this.current && this.current.TaxInclusiveAmountCurrency
            ? this.current.TaxInclusiveAmountCurrency : 0;
        var sumVat: number = 0;
        if (total) {
            this.costItems.forEach(x => {
                var value = safeDec(x.AmountCurrency);
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

    public updateVatPercentBasedOnDate() {
        if (!this.current) {
            return;
        }

        const invoicedate = moment(this.current.InvoiceDate);
        const newVatTypes = [];
        let didAnythingChange = false;

        this.vatTypes.forEach((vatType) => {
            const currentPercentage =
                vatType.VatTypePercentages.find(y =>
                    (moment(y.ValidFrom) <= invoicedate && y.ValidTo && moment(y.ValidTo) >= invoicedate)
                    || (moment(y.ValidFrom) <= invoicedate && !y.ValidTo));

            if (currentPercentage) {
                if (vatType.VatPercent != currentPercentage.VatPercent) {
                    didAnythingChange = true;
                }
                vatType.VatPercent = currentPercentage.VatPercent;
            }

            newVatTypes.push(vatType);
        });

        if (didAnythingChange || this.costItems.filter(x => x.VatType && !x.VatType.VatPercent).length > 0) {
            this.vatTypes = newVatTypes;
            this.costItems.forEach(ci => {
                if (ci.VatType) {
                    ci.VatType = this.vatTypes.find(x => x.ID === ci.VatType.ID);
                }
            });

            this.costItems = _.cloneDeep(this.costItems);
        }
    }

    private analyzeEntries(invoice: SupplierInvoice) {

        if (!invoice) { return; }

        var entry = invoice && invoice.JournalEntry ? invoice.JournalEntry : null;
        var lines = entry && entry.DraftLines ? entry.DraftLines : [];

        this.isReadOnly = this.current ? this.current.StatusCode >= StatusCodeSupplierInvoice.Journaled : false;

        if (lines.length === 0) {
            // Old entries from previous invoice ?
            if (this.costItems && this.costItems.length > 0 && this.costItems[0].AccountID) {
                // Make sure we reset everything
                this.clear();
                this.currentSupplierID = invoice.SupplierID;
                this.lookupHistory();
            }
        } else {
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

            if (numberOfCostAccounts > 0) {
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
                        filter: 'setornull(visible)'
                    }),
                new Column('VatTypeID', '', ColumnType.Integer,
                    <any>{
                        // the routes/selects/models is not used here because vattypes are retrieved in ngOnInit
                        // and resolved using a promise
                        route: '',
                        visualKey: 'VatCode',
                        visualKeyType: ColumnType.Text,
                        render: x => (`${x.VatCode}: ${x.VatPercent}% - ${trimLength(x.Name, 12)}`),
                        getValue: x => this.vatTypes.find(y => y.ID === x),
                        searchValue: x => this.vatTypes.filter(vt => vt.VatCode.indexOf(x.toString()) !== -1 || vt.Name.indexOf(x.toString()) !== -1)
                    }
                ),
                new Column('Description'),
                new Column('AmountCurrency'),
                new Column('delete', '', ColumnType.Action)
            ],
            events: {

                onChange: (event: IChangeEvent) => {
                    return this.lookup.checkAsyncLookup(event, (e) => this.updateChange(e),
                        (e) => this.asyncValidationFailed(e)) || this.updateChange(event);
                },

                onStartEdit: (info: IStartEdit) => {
                    if (info.row === -1) {
                        return;
                    }
                    if (this.isReadOnly) {
                        info.cancel = true;
                    } else {
                        if (info.columnDefinition.name === 'Description') {
                            info.value = this.costItems[info.row].Description;
                        }
                        if (info.columnDefinition.name === 'AmountCurrency') {
                            info.value = this.costItems[info.row].AmountCurrency + '';
                        }
                        if (info.columnDefinition.name === 'Account.AccountNumber') {
                            if (this.hasSuggestions) {
                                info.value = this.suggestions[0].Label;
                                info.flagChanged = true;
                            }
                        }

                        this.calcRemainder();
                    }
                },

                onTypeSearch: details => {
                    if (details.columnDefinition.name === 'AmountCurrency') {
                        this.createGrossValueData(details);
                    } else if ((<any>details).columnDefinition.lookup.searchValue) {
                        details.promise = new Promise(resolve => {
                            resolve((<any>details).columnDefinition.lookup.searchValue(details.value));
                        });

                        this.lookup.onTypeSearch(details);
                    } else {
                        this.lookup.onTypeSearch(details);
                    }
                },

                onCopyCell: (details: ICopyEventDetails) => {
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
                        case 'AmountCurrency':
                            row.AmountCurrency = rowAbove.AmountCurrency;
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
        if ((!row.AmountCurrency) && (this.sumRemainder)) {
            row.AmountCurrency = this.sumRemainder;
        }
        if ((!row.Description) && (this.current && this.current.Supplier && this.current.Supplier.Info)) {
            row.Description = this.current.Supplier.SupplierNumber + ' - '
                + this.current.Supplier.Info.Name + ' - ' + 'fakturanr.' + this.current.InvoiceNumber;
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
        // set correct basecurrencyamounts
        if (this.current.JournalEntry && this.current.JournalEntry.DraftLines) {
            this.current.JournalEntry.DraftLines.forEach(line => {
                if (line.CurrencyExchangeRate && line.CurrencyExchangeRate !== 1) {
                    line.Amount = UniMath.round(line.AmountCurrency * line.CurrencyExchangeRate);
                } else {
                    line.CurrencyExchangeRate = 1;
                    line.Amount = line.AmountCurrency;
                }
            });
        }

        this.supplierinvoice.next(this.current);

        if (actualRowIndex >= 0) {
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
                this.supplierinvoice.next(this.current);
                this.costItems.forEach(x => { if (x['_rowIndex'] > actualRowIndex) { x['_rowIndex']--; } });
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
            this.supplierinvoice.next(this.current);
        }
        return actualRowIndex;
    }

    private updateChange(change: IChangeEvent) {
        var line: JournalEntryLineDraft;

        var isLastRow = change.row >= this.costItems.length - 1;

        if (change.row > this.costItems.length - 1) {
            line = new JournalEntryLineDraft();
        } else {
            line = this.costItems[change.row];
        }


        switch (change.columnDefinition.name) {
            case 'Account.AccountNumber':
                if (change.lookupValue) {
                    line.Account = change.lookupValue;
                    line.AccountID = change.lookupValue.ID;
                    line.VatTypeID = change.lookupValue.VatTypeID;
                    line.VatType = null;

                    if (line.VatTypeID) {
                        line.VatType = this.vatTypes.find(x => x.ID === line.VatTypeID);
                        line.VatPercent = line.VatType.VatPercent;
                        this.checkRowSum(line, change.row);
                        this.calcRemainder();
                        this.editable.reloadCellValue();
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

            case 'AmountCurrency':
                if (typeof (change.value) === 'object') {
                    line.AmountCurrency = change.value.sum;
                } else {
                    line.AmountCurrency = roundTo(change.value);
                }
                change.reloadAfterEdit = true;
                if (change.row > 0 && (!this.sumRemainder)) {
                    this.calcRemainder();
                    this.autoBalanceFirstRow();
                }
                if (line.AmountCurrency !== this.current.TaxInclusiveAmountCurrency) {
                    line['_setByUser'] = true;
                }
                break;
        }

        change.updateCell = false;

        this.enrollNewRow(line);

        // TODO: removed this addEmpty row since that is checked in other places also
        if (isLastRow) {
            this.addEmptyRowAtBottom();
        }

        this.raiseUpdateFromCostIndex(change.row, change);
    }


    private autoBalanceFirstRow() {
        if (this.sumRemainder) {
            let line = this.costItems[0];
            var sum = line.AmountCurrency || 0;
            let adjustedValue = roundTo(sum + (this.sumRemainder || 0));
            if (!line['_setByUser']) {
                line.AmountCurrency = adjustedValue;
                this.calcRemainder();
            }
        }
    }

    private asyncValidationFailed(event: IChangeEvent) {
        if (!this.editable) {
            return;
        }
        // No match: take first item in dropdown-list ?
        var droplistItems = this.editable.getDropListItems({ col: event.col, row: event.row });

        if (droplistItems && droplistItems.length > 0 && event.columnDefinition) {

            var lk: ILookupDetails = event.columnDefinition.lookup;
            let item = droplistItems[0];
            event.value = item[lk.colToSave || 'ID'];
            event.lookupValue = item;
            event.userTypedValue = false;
            this.updateChange(event);
        } else {
            this.toast.addToast(event.columnDefinition.label, ToastType.bad, 3,
                `Ugyldig ${event.columnDefinition.label}: ${event.value}`);
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
            entry.FinancialYearID = this.financialYearID;
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
            return trimLength(value, format ? safeInt(format) : 10);
        }
    }
}

interface IJournalHistoryItem {
    AccountID: number;
    AccountNumber: number;
    Amount: number;
    AccountName: string;
    Counter: number;
    Label: string;
    LastDate: Date;
}
