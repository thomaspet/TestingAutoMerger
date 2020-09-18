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
import { FeaturePermissionService } from '@app/featurePermissionService';

@Component({
    selector: 'payments',
    templateUrl: './payments.html'
})
export class Payments {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
    @ViewChild(JournalEntryManual, { static: true }) public journalEntryManual: JournalEntryManual;

    public contextMenuItems: IContextMenuItem[] = [];
    public invoiceTable: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    private ignoreInvoiceIdList: Array<number> = [];
    private defaultBankAccount: Account;
    public toolbarConfig: IToolbarConfig = {};
    private reminderFeeSumList: any;
    public busy: boolean = false;
    public selectConfig: any;
    public selectedNumberSeries: NumberSeries;
    public selectString: string =
        'ID as ID,' +
        'InvoiceNumber as InvoiceNumber,' +
        'InvoiceDate as InvoiceDate,' +
        'PaymentDueDate as PaymentDueDate,' +
        'TaxInclusiveAmount as TaxInclusiveAmount,' +
        'TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency,' +
        'Reminder.ReminderFee,' +
        'Reminder.InterestFee,' +
        'Reminder.ReminderFeeCurrency,' +
        'Reminder.InterestFeeCurrency,' +
        'add(add(isnull(RestAmountCurrency, 0), isnull(Reminder.InterestFeeCurrency,0)),' +
        ' isnull(Reminder.ReminderFeeCurrency, 0)) as RestAmount,' +
        'Customer.CustomerNumber,' +
        'CustomerName as CustomerName,' +
        'CreditedAmount as CreditedAmount,' +
        'StatusCode as StatusCode,' +
        'CurrencyCode.Code as CurrencyCode';

    public customerInvoiceExpands: string[] = [
        'JournalEntry', 'JournalEntry.Lines', 'JournalEntry.Lines.Account', 'JournalEntry.Lines.SubAccount', 'CurrencyCode'
    ];
        // 'Customer,,,,' +
        // 'JournalEntry.Lines.SubAccount,CurrencyCode,CustomerInvoiceReminders';

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
        private modalService: UniModalService,
        private featurePermissionService: FeaturePermissionService
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
            }
        ];

        if (this.featurePermissionService.canShowUiFeature('ui.accounting.fixed-texts')) {
            this.contextMenuItems.push({
                action: (item) => this.openPredefinedDescriptions(),
                disabled: (item) => false,
                label: 'Faste tekster'
            });
        }

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

    public rowSelected(row) {
        if (this.journalEntryManual) {
            this.busy = true;
            this.customerInvoiceService.Get(row.ID, this.customerInvoiceExpands).subscribe((invoice: CustomerInvoice) => {
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
                        newJournalEntry.Amount += (row['ReminderReminderFee'] || 0) + (row['ReminderInterestFee'] || 0);
                        newJournalEntry.AmountCurrency += (row['ReminderReminderFeeCurrency'] || 0) + (row['ReminderInterestFeeCurrency'] || 0);
                    }
                }

                newJournalEntry.NetAmount = newJournalEntry.Amount;
                newJournalEntry.NetAmountCurrency = newJournalEntry.AmountCurrency;

                // Add new journalentry data for the payment
                this.journalEntryManual.addJournalEntryData(newJournalEntry);

                // Hide invoice from table if it is added to the journalentry list,
                // to avoid adding the same invoice multiple times
                this.ignoreInvoiceIdList.push(invoice.ID);
                this.table.refreshTableData();
                this.busy = false;
            }, err => {
                this.busy = false;
                this.errorService.handle(err);
             });
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

                urlParams = urlParams.set('model', 'CustomerInvoice');
                urlParams = urlParams.set('expand', 'Customer,CurrencyCode');
                urlParams = urlParams.set('select', this.selectString);
                urlParams = urlParams.set('join', 'CustomerInvoice.ID eq CustomerInvoiceReminder.CustomerInvoiceID as Reminder');

                if (urlParams.get('orderby') === null) {
                    urlParams = urlParams.set('orderby', 'PaymentDueDate');
                }

                if (urlParams.get('filter')) {
                    urlParams = urlParams.set('filter', '( ' + urlParams.get('filter') + ' ) ' +
                    'and (RestAmount gt 0 or CollectorStatusCode ne 42505)');
                } else {
                    urlParams = urlParams.set('filter', 'RestAmount gt 0');
                }

                if (this.ignoreInvoiceIdList.length > 0) {
                    const ignoreFilterString = ' and ( ID ne ' + this.ignoreInvoiceIdList.join(' and ID ne ') + ' ) ';
                    urlParams = urlParams.set('filter', urlParams.get('filter') + ignoreFilterString);
                }

                return this.statisticsService.GetAllByHttpParams(urlParams);
            };

            // Define columns to use in the table
            const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
                .setWidth('6%')
                .setFilterOperator('contains');

            const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
                .setWidth('6%')
                .setAlias('CustomerCustomerNumber')
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

            const amountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Number)
                .setWidth('8%')
                .setFilterOperator('eq')
                .setFormat('{0:n}')
                .setCls('column-align-right');

            const currencyFeeCurrencyCol = new UniTableColumn('Reminder.ReminderFeeCurrency', 'Purregebyr', UniTableColumnType.Number)
                .setWidth('6%')
                .setFilterable(false)
                .setAlias('ReminderReminderFeeCurrency')
                .setFormat('{0:n}')
                .setCls('column-align-right');

            const interestFeeCurrencyCol = new UniTableColumn('Reminder.InterestFeeCurrency', 'Renter', UniTableColumnType.Number)
                .setFilterable(false)
                .setAlias('ReminderInterestFeeCurrency')
                .setVisible(false);

            const restAmountCurrencyCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
                .setWidth('8%')
                .setFilterOperator('eq')
                .setFormat('{0:n}')
                .setCls('column-align-right');

            const currencyCodeCol = new UniTableColumn('CurrencyCode.Code', `Valuta`, UniTableColumnType.Number)
                .setAlias('CurrencyCode')
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

            this.invoiceTable = new UniTableConfig('acconting.journalEntry.payments', false, true, 15)
                .setSearchable(true)
                .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol, amountCurrencyCol,
                    currencyFeeCurrencyCol, interestFeeCurrencyCol, restAmountCurrencyCol, currencyCodeCol, creditedAmountCol, statusCol
                ]);

            });
        }
}
