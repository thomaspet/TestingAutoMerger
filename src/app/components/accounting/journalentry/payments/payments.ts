import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {CustomerInvoice, JournalEntryData, Account, CompanySettings, LocalDate} from '../../../../unientities';
import {JournalEntryManual} from  '../journalentrymanual/journalentrymanual';
import {
    ErrorService,
    CustomerInvoiceService,
    AccountService,
    CompanySettingsService
} from '../../../../services/services';

import * as moment from 'moment';

@Component({
    selector: 'payments',
    templateUrl: './payments.html'
})
export class Payments {
    @ViewChild(UniTable) private table;
    @ViewChild(JournalEntryManual) private journalEntryManual;

    private invoiceTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private ignoreInvoiceIdList: Array<number> = [];
    private defaultBankAccount: Account;
    private toolbarConfig = {
        title: 'Registrering av innbetalinger'
    }

    constructor(
        private tabService: TabService,
        private customerInvoiceService: CustomerInvoiceService,
        private accountService: AccountService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ name: 'Innbetalinger', url: '/accounting/journalentry/payments', moduleID: UniModules.Payments, active: true });

        this.companySettingsService.Get(1, ['CompanyBankAccount', 'CompanyBankAccount.Account'])
            .subscribe((data: CompanySettings) => {
                if (data && data.CompanyBankAccount && data.CompanyBankAccount.Account) {
                    this.defaultBankAccount = data.CompanyBankAccount.Account;
                } else {
                    this.accountService.GetAll('filter=AccountNumber eq 1920 and Visible eq true')
                        .subscribe((accounts: Array<Account>) => {
                            if (accounts && accounts.length > 0) {
                                this.defaultBankAccount = accounts[0];
                            }
                        }, err => this.errorService.handle(err));
                }
            }, err => this.errorService.handle(err));

        this.setupInvoiceTable();
    }

    private onRowSelectionChanged(invoice: CustomerInvoice) {
        if (!invoice) {
            alert('Vennligst velg bare en faktura om gangen');
        } else {
            if (this.journalEntryManual) {

                let newJournalEntry: JournalEntryData = new JournalEntryData();
                newJournalEntry.InvoiceNumber = invoice.InvoiceNumber;
                newJournalEntry.CustomerInvoiceID = invoice.ID;
                newJournalEntry.FinancialDate = new LocalDate(moment().toDate());
                newJournalEntry.Description = 'Innbetaling';

                if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
                    for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                        let line = invoice.JournalEntry.Lines[i];

                        if (line.Account.UsePostPost) {
                            newJournalEntry.Amount = line.RestAmount;

                            if (line.SubAccount) {
                                newJournalEntry.CreditAccountID = line.SubAccountID;
                                newJournalEntry.CreditAccount = line.SubAccount;
                            } else {
                                newJournalEntry.CreditAccountID = line.AccountID;
                                newJournalEntry.CreditAccount = line.Account;
                            }

                            if (this.defaultBankAccount) {
                                newJournalEntry.DebitAccount = this.defaultBankAccount;
                                newJournalEntry.DebitAccountID = this.defaultBankAccount.ID;
                            }

                            break;
                        }
                    }
                }

                // add new journalentry data for the payment
                this.journalEntryManual.addJournalEntryData(newJournalEntry);

                // hide invoice form table if it is added to the journalentry list, to avoid adding the same invoice multiple times
                this.ignoreInvoiceIdList.push(invoice.ID);
                this.table.refreshTableData();
            }
        }
    }

    private setupInvoiceTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer,JournalEntry,JournalEntry.Lines,JournalEntry.Lines.Account,JournalEntry.Lines.SubAccount');

            if (urlParams.get('orderby') === null) {
                urlParams.set('orderby', 'PaymentDueDate');
            }

            if (urlParams.get('filter')) {
                urlParams.set('filter', '( ' + urlParams.get('filter') + ' ) and RestAmount gt 0');
            } else {
                urlParams.set('filter', 'RestAmount gt 0');
            }

            if (this.ignoreInvoiceIdList.length > 0) {
                let ignoreFilterString = ' and ( ID ne ' + this.ignoreInvoiceIdList.join(' and ID ne ') + ' ) ';
                urlParams.set('filter', urlParams.get('filter') + ignoreFilterString);
            }

            return this.customerInvoiceService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        var invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
            .setFilterOperator('contains');

        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setFilterOperator('contains');

        var customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains');

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var restAmountCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('15%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerInvoiceService.getStatusText(dataItem.StatusCode, dataItem.InvoiceType);
            });

        // Setup table
        this.invoiceTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCol, restAmountCol, creditedAmountCol, statusCol]);
    }
}
