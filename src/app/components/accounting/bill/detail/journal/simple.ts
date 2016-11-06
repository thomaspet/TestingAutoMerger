import {Component, Input, Output, EventEmitter, Pipe, PipeTransform} from '@angular/core';
import {FinancialYear, VatType, SupplierInvoice, JournalEntryLineDraft, JournalEntry, Account, StatusCodeSupplierInvoice} from '../../../../../unientities';
import {IConfig as ITableConfig, Column, ColumnType, IChangeEvent, Editable, ILookupDetails, IStartEdit} from '../../../../timetracking/utils/editable/editable';
import {ToastService, ToastType} from '../../../../../../framework/unitoast/toastservice';
import {safeDec, trimLength} from '../../../../timetracking/utils/utils';
import {Lookupservice} from '../../../../timetracking/utils/lookup';
import {checkGuid} from '../../../../../services/common/dimensionservice';
import {FinancialYearService} from '../../../../../services/services';


@Component({
    selector: 'bill-simple-journalentry',
    templateUrl: 'app/components/accounting/bill/detail/journal/simple.html',
})
export class BillSimpleJournalEntryView {
    @Input() public set supplierinvoice(value: SupplierInvoice ) {
        this.current = value;
        this.initFromInvoice(this.current);
    }
    @Output() public valueChange: EventEmitter<any> = new EventEmitter();

    public hasMultipleEntries: boolean = false;
    public current: SupplierInvoice;
    public rootItem: JournalEntryLineDraft;
    public costItems: Array<JournalEntryLineDraft> = [];
    public tableConfig: ITableConfig;

    private financialYearID: number = 0;
    private financialYears: Array<FinancialYear>;
    private isReadOnly: boolean = false;
    private editable: Editable;

    constructor(
        private toast: ToastService,
        private lookup: Lookupservice,
        private financialYearService: FinancialYearService) {

        this.clear();
        this.initTableConfig();
        this.initYear();
    }

    public ngOnInit() {
        
    }

    private initFromInvoice(invoice: SupplierInvoice) {
        this.hasMultipleEntries = false;
        this.analyzeEntries(invoice);        
    }

    private clear() {
        this.isReadOnly = false;
        this.costItems.length = 0; 
        this.rootItem = this.newEntry(4000);
        this.costItems.push(this.rootItem);
    }

    private newEntry(account?: number): JournalEntryLineDraft {
        var entry = new JournalEntryLineDraft();
        entry.Amount = 0;
        var acc = new Account();
        acc.AccountNumber = 0;
        acc.AccountName = '';        
        entry.Account = acc;
        entry.VatPercent = 25;
        return entry;
    }

    private analyzeEntries(invoice: SupplierInvoice) {

        if (!invoice) { return; }

        // this.toast.addToast('analyzeEntries: lines =' + ((invoice && invoice.JournalEntry && invoice.JournalEntry.DraftLines) ? invoice.JournalEntry.DraftLines.length : 0), ToastType.good, 2);

        var entry = invoice && invoice.JournalEntry ? invoice.JournalEntry : null;
        var lines = entry && entry.DraftLines ? entry.DraftLines : [];

        this.isReadOnly = this.current ? this.current.StatusCode >= StatusCodeSupplierInvoice.Journaled : false;

        if (lines.length > 0) {
            var numberOfCostAccounts = 0;
            var firstLine = lines[0];
            this.costItems.length = 0; 

            lines.forEach((x, index) => {
                let acc = x.Account ? x.Account.AccountNumber : 0;
                if ((acc !== 0) && (acc !== invoice.Supplier.SupplierNumber)) {
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
                this.rootItem = firstLine;

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
                new Column('Account.AccountNumber', '', 
                    ColumnType.Integer, { 
                        route: 'accounts', 
                        select: 'AccountNumber,AccountName,ID', visualKey: 'AccountNumber', 
                        blankFilter: 'AccountNumber ge 4000 and AccountNumber le 9999',
                        model: 'account' 
                    }),
                new Column('VatTypeID', '',
                    ColumnType.Integer, {
                        route: 'vattypes',
                        select: 'VatCode,Name,ID', visualKey: 'VatCode',
                        model: 'vattype'
                    }
                ),
                { name: 'Amount' }
            ],
            events: {
                onChange: (event: IChangeEvent) => {
                    return this.lookup.checkAsyncLookup(event, (e) => this.updateChange(e), (e) => this.asyncValidationFailed(e) ) || this.updateChange(event);
                }, 
                onStartEdit: (info: IStartEdit) => {
                    if (this.isReadOnly) {
                        info.cancel = true;
                    }
                },
                onTypeSearch: details => this.lookup.onTypeSearch(details),
                onInit: control => this.editable                
            }
        };
    }

    private updateChange(change: IChangeEvent) {
        var line: JournalEntryLineDraft;
        var actualRowIndex = -1;
        var isLastRow = change.row >= this.costItems.length - 1;

        if (change.row > this.costItems.length - 1 ) {
            line = new JournalEntryLineDraft();
        } else {
            line = this.costItems[change.row];
        }

        // Existing row ?
        actualRowIndex = line['_rowIndex'];
        if (actualRowIndex === undefined) {
            this.current.JournalEntry = this.current.JournalEntry || new JournalEntry();
            this.current.JournalEntry.DraftLines = this.current.JournalEntry.DraftLines || []; 
            this.current.JournalEntry.DraftLines.push(line);    
            actualRowIndex = this.current.JournalEntry.DraftLines.length - 1;
            line['_rowIndex'] = actualRowIndex;
            checkGuid(this.current.JournalEntry);           
            checkGuid(line);
            this.checkJournalYear(this.current.JournalEntry);
        }

        switch (change.columnDefinition.name) {
            case 'Account.AccountNumber':
                if (change.lookupValue) {
                    line.Account = change.lookupValue;
                    line.AccountID = change.lookupValue.ID;
                    line.VatTypeID = change.lookupValue.VatTypeID;
                }
                break;
            case 'VatTypeID':
                if (change.lookupValue) {
                    line.VatType = change.lookupValue;
                    line.VatTypeID = change.lookupValue.ID;
                    line.VatPercent = change.lookupValue.VatPercent;
                }
                break;
            case 'Amount':
                line.Amount = safeDec(change.value);
                break;
        }

        change.updateCell = false;

        if (isLastRow) {
            this.costItems.push(this.newEntry());
        }


        this.valueChange.emit({ rowIndex: actualRowIndex, item: line, details: change });
    }

    private asyncValidationFailed(event: IChangeEvent) {
        var droplistItems = this.editable.getDropListItems({ col: event.col, row: event.row});
        if (droplistItems && droplistItems.length === 1 && event.columnDefinition) {
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
        var comp = JSON.parse(localStorage.getItem('activeCompany'));
        if (comp) {
            var companyName = comp.Name;
            fc = this.financialYearService.getActiveFinancialYearInLocalstorage(companyName);
        }        
        if (fc) {
            this.financialYears = [fc];
            this.financialYearID = fc.ID;
        } else {
            this.financialYearService.GetAll(null).subscribe((response) => {
                this.financialYears = response;
            });
        }
    }

    private checkJournalYear(entry: JournalEntry) {
        if (!entry.FinancialYearID) {
            if ((!this.financialYearID) && (this.financialYears && this.financialYears.length > 0)) {
                // todo: locate matching year
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
            return acc.AccountNumber + ' - ' + trimLength(acc.AccountName, 18);
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
