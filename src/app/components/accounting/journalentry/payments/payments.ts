import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {HttpParams} from '@angular/common/http';
import {CustomerInvoice, Account, CompanySettings, LocalDate, NumberSeries} from '../../../../unientities';
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
    NumberSeriesService,
    JournalEntryService,
} from '../../../../services/services';
import {
    UniModalService,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import {JournalEntryData} from '@app/models';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'payments',
    templateUrl: './payments.html'
})
export class Payments {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;
    @ViewChild(JournalEntryManual) public journalEntryManual: JournalEntryManual;

    public contextMenuItems: IContextMenuItem[] = [];
    public invoiceTable: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    private ignoreInvoiceIdList: Array<number> = [];
    private defaultBankAccount: Account;
    public toolbarConfig: IToolbarConfig = {};
    private reminderFeeSumList: any;
    public selectConfig: any;
    public selectedNumberSeries: NumberSeries;

    constructor(
        private tabService: TabService,
        private customerInvoiceService: CustomerInvoiceService,
        private accountService: AccountService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private router: Router,
        private statisticsService: StatisticsService,
        private numberSeriesService: NumberSeriesService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Innbetalinger',
            url: '/accounting/journalentry/payments',
            moduleID: UniModules.Payments,
            active: true
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

    public journalEntryManualInitialized() {
        const id = this.journalEntryService.getSessionNumberSeries();

        this.selectedNumberSeries = id
            ? this.journalEntryManual.numberSeries.find(serie => serie.ID === id)
            : this.journalEntryManual.numberSeries[0];

        if (!this.selectedNumberSeries) {
            // the numberseries that was used is not found - this indicates that the user
            // has changed year, so the previsous used numberseries is not valid anymore.
            // Set the first available numberseries - this will ask the user to update
            // existing journalentries if any
            if (id) {
                // get the numberseries based on the id, and find the corresponding
                // numberseries for this year
                this.numberSeriesService.Get(id)
                    .subscribe(currentNumberSeries => {
                        if (currentNumberSeries) {
                            // try to find a valid numberseries based on the type and taskid
                            const validNumberSeries =
                                this.journalEntryManual.numberSeries
                                    .find(x => x.NumberSeriesTypeID === currentNumberSeries.NumberSeriesTypeID
                                        && x.NumberSeriesTaskID === currentNumberSeries.NumberSeriesTaskID);

                            if (validNumberSeries) {
                                // we found one with the same type/task, use that one
                                this.numberSeriesChanged(validNumberSeries, false);
                            } else {
                                // no valid found, just use the first in the list then..
                                this.numberSeriesChanged(this.journalEntryManual.numberSeries[0], false);
                            }
                        }
                    }, err => {
                        // we couldnt find any numberseries based on the set id, it has probably
                        // been deleted, so just set the first one we have..
                        this.numberSeriesChanged(this.journalEntryManual.numberSeries[0], false);
                    });
            }
        }

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
            omitFinalCrumb: true,
            contextmenu: this.contextMenuItems
        };

        const selectConfig = this.journalEntryManual
        && this.journalEntryManual.numberSeries.length > 1 ?
            {
                items: this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(this.journalEntryManual.numberSeries),
                label: 'Nummerserie',
                selectedItem: this.selectedNumberSeries
            }
            : null;

        this.selectConfig = selectConfig;

        this.toolbarConfig = toolbarConfig;
    }

    public numberSeriesChanged(selectedNumberSerie, askBeforeChanging: boolean) {
        if (this.journalEntryManual) {
            if (selectedNumberSerie && (!this.selectedNumberSeries || selectedNumberSerie.ID !== this.selectedNumberSeries.ID)) {
                const currentData = this.journalEntryManual.getJournalEntryData();

                if (askBeforeChanging && currentData && currentData.length > 0) {
                    this.modalService.open(UniConfirmModalV2, {
                        header: 'Bekreft endring',
                        message: 'Du har allerede lagt til bilag - '
                            + 'endring av nummerserie kan kunne oppdatere bilagsnr for alle bilagene',
                        buttonLabels: {
                            accept: 'Fortsett',
                            cancel: 'Avbryt'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            // Update current selected numberseries. Set to data, tab and sessionstorage
                            this.selectedNumberSeries = selectedNumberSerie;

                            currentData.forEach(data => { data.NumberSeriesID = selectedNumberSerie.ID; });
                            const url = this.router.url;
                            this.tabService.currentActiveTab.url = url + ';numberseriesID=' + this.selectedNumberSeries.ID;
                            this.journalEntryService.setSessionNumberSeries(this.selectedNumberSeries.ID);
                        }
                        this.setupToolBarconfig();
                    });
                } else {
                    // Update current selected numberseries. Set to tab and sessionstorage
                    this.selectedNumberSeries = selectedNumberSerie;
                    const url = this.router.url;
                    this.tabService.currentActiveTab.url = url + ';numberseriesID=' + this.selectedNumberSeries.ID;
                    this.journalEntryService.setSessionNumberSeries(this.selectedNumberSeries.ID);
                    this.setupToolBarconfig();
                }
            }
        }
    }

    private openPredefinedDescriptions() {
        this.router.navigate(['./predefined-descriptions']);
    }

    public rowSelected(invoice: CustomerInvoice) {
        if (this.journalEntryManual) {
            const newJournalEntry: JournalEntryData = new JournalEntryData();
            newJournalEntry.InvoiceNumber = invoice.InvoiceNumber;
            newJournalEntry.CustomerInvoiceID = invoice.ID;
            newJournalEntry.CustomerInvoice = invoice;
            newJournalEntry.CurrencyID = invoice.CurrencyCodeID;
            newJournalEntry.CurrencyCode = invoice.CurrencyCode;
            newJournalEntry.Description = 'Innbetaling';
            newJournalEntry.VatDate = new LocalDate();
            newJournalEntry.DueDate = new LocalDate();
            newJournalEntry.FinancialDate = new LocalDate();
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

                // Calculate reminder fee and interest
                if (invoice.StatusCode === 42002) {
                    newJournalEntry.Amount += (invoice['_ReminderFee'] || 0) + (invoice['_InterestFee'] || 0);
                    newJournalEntry.AmountCurrency += (invoice['_ReminderFeeCurrency'] || 0) + (invoice['_InterestFeeCurrency'] || 0);
                }
            }

            // Add new journalentry data for the payment
            this.journalEntryManual.addJournalEntryData(newJournalEntry);

            // Hide invoice from table if it is added to the journalentry list,
            // to avoid adding the same invoice multiple times
            this.ignoreInvoiceIdList.push(invoice.ID);
            this.table.refreshTableData();
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
                + `sum(ReminderFee) as SumReminderFee,`
                + `sum(InterestFeeCurrency) as SumInterestFeeCurrency,`
                + `sum(InterestFee) as SumInterestFee`
            )
        ).subscribe((response: Array<any>) => {
            this.reminderFeeSumList = response[0];

        this.lookupFunction = (urlParams: HttpParams) => {
            urlParams = urlParams || new HttpParams();
            urlParams = urlParams.set(
                'expand',
                'Customer,JournalEntry,JournalEntry.Lines,JournalEntry.Lines.Account,'
                    + 'JournalEntry.Lines.SubAccount,CurrencyCode,CustomerInvoiceReminders'
            );

            if (urlParams.get('orderby') === null) {
                urlParams = urlParams.set('orderby', 'PaymentDueDate');
            }

            if (urlParams.get('filter')) {
                urlParams = urlParams.set('filter', '( ' + urlParams.get('filter') + ' ) and (RestAmount gt 0 or CollectorStatusCode ne 42505)');
            } else {
                urlParams = urlParams.set('filter', 'RestAmount gt 0');
            }

            if (this.ignoreInvoiceIdList.length > 0) {
                const ignoreFilterString = ' and ( ID ne ' + this.ignoreInvoiceIdList.join(' and ID ne ') + ' ) ';
                urlParams = urlParams.set('filter', urlParams.get('filter') + ignoreFilterString);
            }
            return this.customerInvoiceService.GetAllByHttpParams(urlParams)
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
            .setWidth('8%')
            .setFilterable(false);

        const dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%')
            .setFilterable(false);

        const taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const currencyFeeCurrencyCol = new UniTableColumn('_ReminderFeeCurrency', 'Purregebyr', UniTableColumnType.Number)
            .setWidth('6%')
            .setFilterable(false)
            .setFormat('{0:n}')
            .setCls('column-align-right');
        const interestFeeCurrencyCol = new UniTableColumn('_InterestFeeCurrency', 'Renter', UniTableColumnType.Number)
            .setFilterable(false)
            .setVisible(false);

        const restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        const currencyCodeCol = new UniTableColumn('CurrencyCode', `Valuta`, UniTableColumnType.Number)
            .setTemplate(row => row && row.CurrencyCode && row.CurrencyCode.Code)
            .setWidth('8%')
            .setFilterable(false)
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

        this.invoiceTable = new UniTableConfig('acconting.journalEntry.payments', false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setMultiRowSelect(false)
            .setDataMapper(cInvoices => {
                return cInvoices.map(cInvoice => {
                    if (this.reminderFeeSumList.Data) {
                        const sum = this.reminderFeeSumList.Data.find(c => c.CustomerInvoiceReminderCustomerInvoiceID === cInvoice.ID);
                        if (sum) {
                            cInvoice['_ReminderFee'] = sum.SumReminderFee;
                            cInvoice['_ReminderFeeCurrency'] = sum.SumReminderFeeCurrency;
                            cInvoice['_InterestFee'] = sum.SumInterestFee;
                            cInvoice['_InterestFeeCurrency'] = sum.SumInterestFeeCurrency;
                            cInvoice.RestAmountCurrency += sum.SumReminderFeeCurrency + sum.SumInterestFeeCurrency;
                            cInvoice.RestAmount += sum.SumReminderFee + sum.SumInterestFee;
                        }
                    }
                    return cInvoice;
                });
            })
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCurrencyCol, currencyFeeCurrencyCol, interestFeeCurrencyCol, restAmountCurrencyCol, currencyCodeCol,
                creditedAmountCol, statusCol]);

            });
        }
}
