import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
import {
    UniTable, UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {URLSearchParams} from '@angular/http';
import {CustomerInvoice, Account, CompanySettings, LocalDate} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {Router} from '@angular/router';
import {
    StatisticsService,
    ErrorService,
    CustomerInvoiceService,
    AccountService,
    CompanySettingsService,
} from '../../../../services/services';

import * as moment from 'moment';
import {JournalEntryData} from '../../../../models/models';
import { ToastService } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'payments',
    templateUrl: './payments.html'
})
export class Payments {
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(JournalEntryManual) public journalEntryManual: JournalEntryManual;

    public contextMenuItems: IContextMenuItem[] = [];
    public invoiceTable: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;
    private ignoreInvoiceIdList: Array<number> = [];
    private defaultBankAccount: Account;
    public toolbarConfig: IToolbarConfig = {};
    private reminderFeeSumList: any;

    constructor(
        private tabService: TabService,
        private customerInvoiceService: CustomerInvoiceService,
        private accountService: AccountService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private router: Router,
        private statisticsService: StatisticsService,
    ) {
        this.tabService.addTab({
            name: 'Innbetalinger', url: '/accounting/journalentry/payments',
            moduleID: UniModules.Payments, active: true
        });

        this.companySettingsService.Get(1, ['BaseCurrencyCode', 'CompanyBankAccount', 'CompanyBankAccount.Account'])
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
        this.setupToolBarconfig();
    }

    private setupToolBarconfig() {
        this.contextMenuItems = [
            {
                label: 'Tøm listen',
                action: () => this.journalEntryManual.removeJournalEntryData(),
                disabled: () => false,
            },
            {
                    action: (item) => this.openPredefinedDescriptions(),
                    disabled: (item) => false,
                    label: 'Faste tekster'
            }

        ];

        const toolbarConfig: IToolbarConfig = {
            title: 'Registrering av innbetalinger',
            contextmenu: this.contextMenuItems
        };

        this.toolbarConfig = toolbarConfig;
    }

    private openPredefinedDescriptions() {
        this.router.navigate(['./predefined-descriptions']);
    }

    public onRowSelectionChanged(invoice: CustomerInvoice) {
        if (!invoice) {
            alert('Vennligst velg bare en faktura om gangen');
        } else {
            if (this.journalEntryManual) {

                const newJournalEntry: JournalEntryData = new JournalEntryData();
                newJournalEntry.InvoiceNumber = invoice.InvoiceNumber;
                newJournalEntry.CustomerInvoiceID = invoice.ID;
                newJournalEntry.CustomerInvoice = invoice;
                newJournalEntry.CurrencyID = invoice.CurrencyCodeID;
                newJournalEntry.CurrencyCode = invoice.CurrencyCode;
                newJournalEntry.Description = 'Innbetaling';
                newJournalEntry.PaymentID = invoice.PaymentID;

                if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
                    for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                        const line = invoice.JournalEntry.Lines[i];

                        if (line.Account.UsePostPost) {
                            newJournalEntry.Amount = line.RestAmount;
                            newJournalEntry.AmountCurrency = line.RestAmountCurrency;

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

                    // calculate reminder fee
                    if (invoice.StatusCode === 42002) {
                        newJournalEntry.Amount += invoice['_ReminderFee'] || 0;
                        newJournalEntry.AmountCurrency += invoice['_ReminderFeeCurrency'] || 0;
                    }
                }

                // add new journalentry data for the payment
                this.journalEntryManual.addJournalEntryData(newJournalEntry);

                // hide invoice form table if it is added to the journalentry list,
                // to avoid adding the same invoice multiple times
                this.ignoreInvoiceIdList.push(invoice.ID);
                this.table.refreshTableData();
            }
        }
    }

    private setupInvoiceTable() {

        Observable.forkJoin(
            this.statisticsService.GetAll(
                `model=CustomerInvoiceReminder`
                + '&join=CustomerInvoice on CustomerInvoiceReminder.CustomerInvoiceID eq CustomerInvoice.ID'
                + `&filter=CustomerInvoice.RestAmount gt 0`
                + `&select=CustomerInvoiceID,`
                + `sum(ReminderFeeCurrency) as SumReminderFeeCurrency,`
                + `sum(ReminderFee) as SumReminderFee`
            )
        ).subscribe((response: Array<any>) => {
            this.reminderFeeSumList = response[0];
            console.log(this.reminderFeeSumList);

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set(
                'expand',
                'Customer,JournalEntry,JournalEntry.Lines,JournalEntry.Lines.Account,'
                    + 'JournalEntry.Lines.SubAccount,CurrencyCode'
            );

            if (urlParams.get('orderby') === null) {
                urlParams.set('orderby', 'PaymentDueDate');
            }

            if (urlParams.get('filter')) {
                urlParams.set('filter', '( ' + urlParams.get('filter') + ' ) and RestAmount gt 0');
            } else {
                urlParams.set('filter', 'RestAmount gt 0');
            }

            if (this.ignoreInvoiceIdList.length > 0) {
                const ignoreFilterString = ' and ( ID ne ' + this.ignoreInvoiceIdList.join(' and ID ne ') + ' ) ';
                urlParams.set('filter', urlParams.get('filter') + ignoreFilterString);
            }
            return this.customerInvoiceService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };








        // Define columns to use in the table
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
            .setWidth('6%')
            .setFilterOperator('contains');

        const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setWidth('6%')
            .setFilterOperator('contains');

        const customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text)
            .setWidth('20%')
            .setFilterOperator('contains');

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        const dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        const taxInclusiveAmountCurrencyCol = new UniTableColumn(
            'TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Number
        )
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const currencyFeeCurrencyCol = new UniTableColumn(
            '_ReminderFeeCurrency', 'Purregebyr', UniTableColumnType.Number
        )
            .setWidth('6%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const currencyCodeCol = new UniTableColumn('CurrencyCode', `Valuta`, UniTableColumnType.Number)
            .setTemplate(row => row && row.CurrencyCode && row.CurrencyCode.Code)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('6%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerInvoiceService.getStatusText(dataItem.StatusCode, dataItem.InvoiceType);
            });

        // Setup table

        this.invoiceTable = new UniTableConfig('acconting.journalEntry.payments', false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setDataMapper(cInvoices => {
                return cInvoices.map(cInvoice => {
                    if (this.reminderFeeSumList.Data) {
                        const sum = this.reminderFeeSumList.Data.find(c => c.CustomerInvoiceReminderCustomerInvoiceID === cInvoice.ID);
                        if (sum) {
                            cInvoice['_ReminderFee'] = sum.SumReminderFee;
                            cInvoice['_ReminderFeeCurrency'] = sum.SumReminderFeeCurrency;
                            cInvoice.RestAmountCurrency += sum.SumReminderFeeCurrency;
                            cInvoice.RestAmount += sum.SumReminderFee;
                        }
                    }

                    // cInvoices map må returnere endret invoice for hver iterasjon
                    return cInvoice;
                });
            })
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCurrencyCol, currencyFeeCurrencyCol, restAmountCurrencyCol, currencyCodeCol,
                creditedAmountCol, statusCol]);

            });
        }
}
