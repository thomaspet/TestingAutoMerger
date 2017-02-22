import {Component, Input, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {TofHelper} from '../../salesHelper/tofHelper';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {CustomerInvoice, CustomerInvoiceItem, CompanySettings, CurrencyCode} from '../../../../unientities';
import {StatusCodeCustomerInvoice, LocalDate} from '../../../../unientities';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {ISummaryConfig} from '../../../common/summary/summary';
import {StatusCode} from '../../salesHelper/salesEnums';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {IContextMenuItem} from 'unitable-ng2/main';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {InvoiceTypes} from '../../../../models/Sales/InvoiceTypes';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {TradeItemTable} from '../../common/tradeItemTable';
import {TofHead} from '../../common/tofHead';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {CompanySettingsService} from '../../../../services/services';
import {ActivateAPModal} from '../../../common/modals/activateAPModal';
import {ReminderSendingModal} from '../../reminder/sending/reminderSendingModal';
import {
    CustomerInvoiceService,
    CustomerInvoiceItemService,
    BusinessRelationService,
    UserService,
    ReportDefinitionService,
    CustomerService,
    NumberFormat,
    ErrorService,
    EHFService,
    CustomerInvoiceReminderService,
    CurrencyCodeService,
    CurrencyService
} from '../../../../services/services';
import moment from 'moment';

declare const _;

@Component({
    selector: 'uni-invoice',
    templateUrl: 'app/components/sales/invoice/details/invoice.html'
})
export class InvoiceDetails {
    @ViewChild(UniConfirmModal)
    private confirmModal: UniConfirmModal;

    @ViewChild(RegisterPaymentModal)
    public registerPaymentModal: RegisterPaymentModal;

    @ViewChild(PreviewModal)
    public previewModal: PreviewModal;

    @ViewChild(SendEmailModal)
    private sendEmailModal: SendEmailModal;

    @ViewChild(TofHead)
    private tofHead: TofHead;

    @ViewChild(TradeItemTable)
    private tradeItemTable: TradeItemTable;

    @ViewChild(ActivateAPModal)
    public activateAPModal: ActivateAPModal;

    @ViewChild(ReminderSendingModal)
    public reminderSendingModal: ReminderSendingModal;

    @Input()
    public invoiceID: any;

    private isDirty: boolean;
    private invoice: CustomerInvoice;
    private invoiceItems: CustomerInvoiceItem[];
    private newInvoiceItem: CustomerInvoiceItem;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private summaryFields: ISummaryConfig[];
    private readonly: boolean;

    private recalcDebouncer: EventEmitter<any> = new EventEmitter();
    private saveActions: IUniSaveAction[] = [];
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    private companySettings: CompanySettings;

    private currencyCodes: Array<CurrencyCode>;
    private currencyCodeID: number;
    private currencyExchangeRate: number;

    private customerExpandOptions: string[] = ['Info', 'Info.Addresses', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department'];
    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType', 'Items.Account',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'InvoiceReference', 'JournalEntry'].concat(this.customerExpandOptions.map(option => 'Customer.' + option));

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private reportDefinitionService: ReportDefinitionService,
        private businessRelationService: BusinessRelationService,
        private userService: UserService,
        private toastService: ToastService,
        private customerService: CustomerService,
        private numberFormat: NumberFormat,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private tofHelper: TofHelper,
        private tradeItemHelper: TradeItemHelper,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private ehfService: EHFService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService
    ) {
        // set default tab title, this is done to set the correct current module to make the breadcrumb correct
        this.tabService.addTab({ url: '/sales/invoices/', name: 'Faktura', active: true, moduleID: UniModules.Invoices });
    }

    public ngOnInit() {
        this.summaryFields = [
            {title: 'Avgiftsfritt', value: this.numberFormat.asMoney(0)},
            {title: 'Avgiftsgrunnlag', value: this.numberFormat.asMoney(0)},
            {title: 'Sum rabatt', value: this.numberFormat.asMoney(0)},
            {title: 'Nettosum', value: this.numberFormat.asMoney(0)},
            {title: 'Mva', value: this.numberFormat.asMoney(0)},
            {title: 'Øreavrunding', value: this.numberFormat.asMoney(0)},
            {title: 'Totalsum', value: this.numberFormat.asMoney(0)},
        ];

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((invoiceItems) => {
            if (invoiceItems.length) {
                this.recalcItemSums(invoiceItems);
            }
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];
            const customerID = +params['customerID'];

            if (this.invoiceID === 0) {
                Observable.forkJoin(
                    this.customerInvoiceService.GetNewEntity([], CustomerInvoice.EntityType),
                    this.userService.getCurrentUser(),
                    customerID ? this.customerService.Get(customerID, this.customerExpandOptions) : Observable.of(null),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null)
                ).subscribe((res) => {
                    let invoice = <CustomerInvoice>res[0];
                    invoice.OurReference = res[1].DisplayName;
                    invoice.InvoiceDate = <any>new LocalDate(); // TODO: Remove <any> when backend is ready
                    invoice.PaymentDueDate = null;
                    if (res[2]) {
                        invoice = this.tofHelper.mapCustomerToEntity(res[2], invoice);
                    }
                    this.companySettings = res[3];

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    this.currencyCodes = res[4];

                    this.setupContextMenuItems();
                    this.refreshInvoice(invoice);
                }, err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.customerInvoiceService.Get(this.invoiceID, this.expandOptions),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null)
                ).subscribe((res) => {
                    let invoice = res[0];
                    this.companySettings = res[1];

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    this.currencyCodes = res[2];

                    this.setupContextMenuItems();
                    this.refreshInvoice(invoice);
                }, err => this.errorService.handle(err));
            }

        }, err => this.errorService.handle(err));
    }

    private setupContextMenuItems() {
        // contextMenu
        this.contextMenuItems = [
            {
                label: this.companySettings.APActivated && this.companySettings.APGuid ? 'Send EHF' : 'Aktiver og send EHF',
                action: () => this.sendEHFAction(),
                disabled: () => {
                    return this.invoice.StatusCode !== StatusCodeCustomerInvoice.Invoiced;
                }
            },
            {
                label: 'Send på epost',
                action: () => this.sendEmailAction(),
                disabled: () => !this.invoice.ID
            },
            {
                label: 'Send purring',
                action: () => this.sendReminderAction(),
                disabled: () => this.invoice.DontSendReminders || this.invoice.StatusCode === StatusCode.Completed
            }
        ];
    }

    private sendEHFAction() {
        if (this.companySettings.APActivated && this.companySettings.APGuid) {
            this.sendEHF();
        } else {
            this.activateAPModal.openModal();

            if (this.activateAPModal.Changed.observers.length === 0) {
                this.activateAPModal.Changed.subscribe((activate) => {
                    this.ehfService.Activate(activate).subscribe((ok) => {
                        if (ok) {
                            this.toastService.addToast('Aktivering', ToastType.good, 3, 'EHF aktivert');
                            this.sendEHF();
                        } else {
                            this.toastService.addToast('Aktivering feilet!', ToastType.bad, 5, 'Noe galt skjedde ved aktivering');
                        }
                    },
                    (err) => {
                        this.errorService.handle(err);
                    });
                });
            }
        }
    }

    private sendEmailAction() {
        let sendemail = new SendEmail();
        sendemail.EntityType = 'CustomerInvoice';
        sendemail.EntityID = this.invoice.ID;
        sendemail.CustomerID = this.invoice.CustomerID;
        sendemail.Subject = 'Faktura ' + (this.invoice.InvoiceNumber ? 'nr. ' + this.invoice.InvoiceNumber : 'kladd');
        sendemail.Message = 'Vedlagt finner du Faktura ' + (this.invoice.InvoiceNumber ? 'nr. ' + this.invoice.InvoiceNumber : 'kladd');
        this.sendEmailModal.openModal(sendemail);

        if (this.sendEmailModal.Changed.observers.length === 0) {
            this.sendEmailModal.Changed.subscribe((email) => {
                this.reportDefinitionService.generateReportSendEmail('Faktura id', email);
            });
        }
    }

    private sendReminderAction() {
        this.customerInvoiceReminderService.createInvoiceRemindersForInvoicelist([this.invoice.ID])
            .subscribe((reminders) => {
                this.reminderSendingModal.confirm(reminders).then((action) => {
                    if (action !== ConfirmActions.CANCEL) {
                        this.updateToolbar();
                    }
                });
            }, (err) => this.errorService.handle(err));
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 34) {
            event.preventDefault();
            this.tradeItemTable.focusFirstRow();
        } else if (key === 33) {
            event.preventDefault();
            this.tradeItemTable.blurTable();
            this.tofHead.focus();
        }
    }

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Ønsker du å lagre fakturaen før du fortsetter?',
                'Ulagrede endringer',
                true
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    if (!this.invoice.StatusCode) {
                        this.invoice.StatusCode = StatusCode.Draft;
                    }
                    this.saveInvoice().subscribe(
                        (res) => {
                            this.isDirty = false;
                            resolve(true);
                        },
                        (err) => {
                            this.errorService.handle(err);
                            resolve(false);
                        }
                    );
                } else if (action === ConfirmActions.REJECT) {
                    resolve(true);
                } else {
                    resolve(false);
                    this.updateTabTitle();
                }
            });
        });
    }

    public onInvoiceChange(invoice: CustomerInvoice) {
        const isDifferent = (a, b) => a.toString() !== b.toString();

        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;

        // update invoices currencycodeid if the customer changed
        if (this.didCustomerChange(invoice)) {
            if (invoice.Customer.CurrencyCodeID) {
                invoice.CurrencyCodeID = invoice.Customer.CurrencyCodeID;
            } else {
                invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            shouldGetCurrencyRate = true;
        }

        if (invoice.Customer) {
            invoice.CreditDays = invoice.CreditDays
                || invoice.Customer.CreditDays
                || this.companySettings.CustomerCreditDays;

            if (invoice.InvoiceDate) {
                if (isDifferent(this.invoice.InvoiceDate, invoice.InvoiceDate)) {
                    invoice.PaymentDueDate = <any>new LocalDate(
                        moment(invoice.InvoiceDate).add(invoice.CreditDays, 'days').toDate()
                    ); // TODO: Remove <any> when backend is ready
                }
            }
        }

        if ((!this.currencyCodeID && invoice.CurrencyCodeID)
            || this.currencyCodeID !== invoice.CurrencyCodeID) {
            this.currencyCodeID = invoice.CurrencyCodeID;
            shouldGetCurrencyRate = true;
        }

        if (this.invoice && this.invoice.InvoiceDate.toString() !== invoice.InvoiceDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        if (this.invoice && invoice.CurrencyCodeID !== this.invoice.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        this.invoice = _.cloneDeep(invoice);

        if (shouldGetCurrencyRate) {
            this.getUpdatedCurrencyExchangeRate(invoice)
                .subscribe(res => {
                    let newCurrencyRate = res;

                    if (!this.currencyExchangeRate) {
                        this.currencyExchangeRate = 1;
                    }

                    if (newCurrencyRate !== this.currencyExchangeRate) {
                        this.currencyExchangeRate = newCurrencyRate;
                        invoice.CurrencyExchangeRate = res;

                        if (this.invoiceItems && this.invoiceItems.filter(x => !x.PriceSetByUser).length > 0) {
                            this.confirmModal.confirm(
                                `Det er lagt inn linjer som er basert på en annen valutakurs enn den som nå er valgt - vil du rekalkulere priser basert på ny kurs?`,
                                'Rekalkulere priser for produkter?',
                                false,
                                {accept: 'Rekalkuler priser', reject: 'Ikke rekalkuler'}
                            ).then((response: ConfirmActions) => {
                                if (response === ConfirmActions.ACCEPT) {
                                    // we need to calculate the currency amounts based on the original prices
                                    // defined in the base currency
                                    this.invoiceItems.forEach(item => {
                                        this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                    });

                                } else if (response === ConfirmActions.REJECT) {
                                    // we need to calculate the base currency amount numbers if we are going
                                    // to keep the currency amounts - if not the data will be out of sync
                                    this.invoiceItems.forEach(item => {
                                        this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                    });
                                }

                                // make unitable update the data after calculations
                                this.invoiceItems = this.invoiceItems.concat();
                                this.recalcItemSums(this.invoiceItems);

                                // update the model
                                this.invoice = _.cloneDeep(invoice);
                            });
                        } else if (this.invoiceItems && this.invoiceItems.length > 0) {
                            // we need to calculate the new currency amount numbers if we are going
                            // to keep the set currency amounts
                            this.invoiceItems.forEach(item => {
                                this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                            });

                            // make unitable update the data after calculations
                            this.invoiceItems = this.invoiceItems.concat();
                            this.recalcItemSums(this.invoiceItems);

                            // update the model
                            this.invoice = _.cloneDeep(invoice);
                        }
                    }
                }, err => this.errorService.handle(err)
            );
        }

    }

    private sendEHF() {
        this.customerInvoiceService.PutAction(this.invoice.ID, 'send-ehf').subscribe(
            () => {
                this.toastService.addToast('EHF sendt', ToastType.good, 3, 'Til ' + this.invoice.Customer.Info.Name);
            },
            (err) => {
                this.errorService.handle(err);
            });
    }

    private didCustomerChange(invoice: CustomerInvoice): boolean {
        return invoice.Customer
            && (!this.invoice
            || (invoice.Customer && !this.invoice.Customer)
            || (invoice.Customer && this.invoice.Customer && invoice.Customer.ID !== this.invoice.Customer.ID))
    }

    private getUpdatedCurrencyExchangeRate(invoice: CustomerInvoice): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!invoice.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === invoice.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            let currencyDate: LocalDate = new LocalDate(invoice.InvoiceDate.toString());

            return this.currencyService.getCurrencyExchangeRate(invoice.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, currencyDate)
                .map(x => x.ExchangeRate);
        }
    }

    private recalcPriceAndSumsBasedOnSetPrices(item, newCurrencyRate) {
        item.PriceExVat = this.tradeItemHelper.round(item.PriceExVatCurrency * newCurrencyRate, 4);

        this.tradeItemHelper.calculatePriceIncVat(item);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, newCurrencyRate) {
        if (!item.PriceSetByUser) {
            item.PriceExVatCurrency = this.tradeItemHelper.round(item.PriceExVat / newCurrencyRate, 4);
        }

        this.tradeItemHelper.calculatePriceIncVat(item);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = 0;
        if (this.invoice) {
            activeStatus = this.invoice.StatusCode || 1;
        }

        let statuses = [...this.customerInvoiceService.statusTypes];
        const spliceIndex = (activeStatus === StatusCodeCustomerInvoice.PartlyPaid)
            ? statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.Paid)
            : statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.PartlyPaid);

        if (spliceIndex >= 0) {
            statuses.splice(spliceIndex, 1);
        }

        statuses.forEach((status) => {
            let _state: UniStatusTrack.States;

            if (status.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (status.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (status.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack.push({
                title: status.Text,
                state: _state,
                code: status.Code
            });
        });

        return statustrack;
    }

    private refreshInvoice(invoice: CustomerInvoice) {
        if (!invoice.CreditDays && invoice.Customer) {
            invoice.CreditDays = invoice.CreditDays
                || invoice.Customer.CreditDays
                || this.companySettings.CustomerCreditDays;
        }

        if (invoice.InvoiceDate && !invoice.PaymentDueDate && invoice.CreditDays) {
            invoice.PaymentDueDate = <any>new LocalDate(
                moment(invoice.InvoiceDate).add(invoice.CreditDays, 'days').toDate()
            ); // TODO: Remove <any> when backend is ready
        }

        this.newInvoiceItem = <any> this.tradeItemHelper.getDefaultTradeItemData(invoice);
        this.readonly = invoice.StatusCode && invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;
        this.invoiceItems = invoice.Items;
        this.invoice = _.cloneDeep(invoice);
        this.recalcDebouncer.next(invoice.Items);
        this.updateTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
    }

    private updateTabTitle() {
        let tabTitle = '';
        if (this.invoice.InvoiceNumber) {
            tabTitle = 'Fakturanr. ' + this.invoice.InvoiceNumber;
        } else {
            tabTitle = (this.invoice.ID) ? 'Faktura (kladd)' : 'Ny faktura';
        }
        this.tabService.addTab({ url: '/sales/invoices/' + this.invoice.ID, name: tabTitle, active: true, moduleID: UniModules.Invoices });
    }

    private updateToolbar() {
        let invoiceText = '';
        if (this.invoice.InvoiceNumber) {
            const prefix = this.invoice.InvoiceType === InvoiceTypes.Invoice ? 'Fakturanr.' : 'Kreditnota.';
            invoiceText = `${prefix} ${this.invoice.InvoiceNumber}`;
        } else {
            invoiceText = (this.invoice.ID) ? 'Faktura (kladd)' : 'Ny faktura';
        }

        let customerText = '';
        if (this.invoice.Customer && this.invoice.Customer.Info) {
            customerText = `${this.invoice.Customer.CustomerNumber} - ${this.invoice.Customer.Info.Name}`;
        }

        let baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
        let selectedCurrencyCode = this.getCurrencyCode(this.currencyCodeID);

        let netSumText = '';

        if (this.itemsSummaryData) {
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat)}`;
            }
        } else {
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmount)}`;
            }
        }

        let reminderStopText = this.invoice.DontSendReminders ? 'Purrestopp' : '';

        let toolbarconfig: IToolbarConfig = {
            title: invoiceText,
            subheads: [
                {title: customerText, link: this.invoice.Customer ? `#/sales/customer/${this.invoice.Customer.ID}` : ''},
                {title: netSumText},
                {title: GetPrintStatusText(this.invoice.PrintStatus)},
                {title: reminderStopText}
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: () => this.router.navigateByUrl('/sales/invoices/0')
            },
            contextmenu: this.contextMenuItems,
            entityID: this.invoiceID,
            entityType: 'CustomerInvoice'
        };

        if (this.invoice.InvoiceType === InvoiceTypes.CreditNote && this.invoice.InvoiceReference) {
            toolbarconfig.subheads.push({
                title: `Kreditering av faktura nr. ${this.invoice.InvoiceReference.InvoiceNumber}`,
                link: `#/sales/invoices/${this.invoice.InvoiceReference.ID}`
            });
        }

        if (this.invoice.JournalEntry) {
            toolbarconfig.subheads.push({
                title: `Bilagsnr. ${this.invoice.JournalEntry.JournalEntryNumber}`,
                link: `#/accounting/transquery/details;JournalEntryNumber=${this.invoice.JournalEntry.JournalEntryNumber}`
            });
        }

        this.toolbarconfig = toolbarconfig;
    }

    // Save actions
    private updateSaveActions() {
        this.saveActions = [];
        const transitions = (this.invoice['_links'] || {}).transitions;
        const id = this.invoice.ID;
        const status = this.invoice.StatusCode;

        if (!this.invoice.InvoiceNumber) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: done => this.saveAsDraft(done),
                disabled: false
            });
        }

        this.saveActions.push({
            label: 'Skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: !this.invoice.ID,
        });

        if (this.invoice.InvoiceType === InvoiceTypes.Invoice) {
            this.saveActions.push({
                label: 'Krediter faktura',
                action: (done) => this.creditInvoice(done),
                disabled: !status || status === StatusCodeCustomerInvoice.Draft,
                main: status === StatusCodeCustomerInvoice.Paid
            });
        }

        this.saveActions.push({
            label: (this.invoice.InvoiceType === InvoiceTypes.CreditNote) ? 'Krediter' : 'Fakturer',
            action: done => this.transition(done),
            disabled: id > 0 && !transitions['invoice'] && !transitions['credit'],
            main: !id || transitions['invoice'] || transitions['credit']
        });

        this.saveActions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: !transitions || !transitions['pay'],
            main: id > 0 && transitions['pay']
        });

        this.saveActions.push({
            label: this.invoice.DontSendReminders ? 'Opphev purrestopp' : 'Aktiver purrestopp',
            action: (done) => this.reminderStop(done),
            disabled: this.invoice.StatusCode === StatusCodeCustomerInvoice.Paid
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteInvoice(done),
            disabled: status !== StatusCodeCustomerInvoice.Draft
        });
    }

    private saveInvoice(): Observable<CustomerInvoice> {
        this.invoice.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed
        this.invoice.Items = this.invoiceItems;

        // Prep new orderlines for complex put
        this.invoice.Items.forEach(item => {
            if (item.ID && item['_createguid']) {
                delete item['_createguid'];
            }

            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerInvoiceItemService.getNewGuid();
            }

            if (item.VatType) {
                item.VatType = null;
            }

            if (item.Product) {
                item.Product = null;
            }
        });

        if (!this.invoice.CreditDays) {
            if (this.invoice.PaymentDueDate && this.invoice.InvoiceDate) {
                this.invoice.CreditDays = moment(this.invoice.PaymentDueDate).diff(moment(this.invoice.InvoiceDate), 'days');
            } else if (this.invoice.Customer && this.invoice.Customer.CreditDays) {
                this.invoice.CreditDays = this.invoice.Customer.CreditDays;
            } else if (this.companySettings && this.companySettings.CustomerCreditDays) {
                this.invoice.CreditDays = this.companySettings.CustomerCreditDays;
            } else {
                this.invoice.CreditDays = 0;
            }
        }

        if (!this.invoice.PaymentDueDate) {
            this.invoice.PaymentDueDate = <any>new LocalDate(
                moment(this.invoice.InvoiceDate).add(this.invoice.CreditDays, 'days').toDate()
            );
        }

        if (!this.invoice.DeliveryDate) {
            // TODO: Remove <any> when backend is ready
            this.invoice.DeliveryDate = this.invoice.InvoiceDate || <any>new LocalDate();
        }

        if (!TradeItemHelper.IsItemsValid(this.invoice.Items)) {
            const message = 'En eller flere varelinjer mangler produkt';
            return Observable.throw(message);
        }

        return (this.invoice.ID > 0)
            ? this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            : this.customerInvoiceService.Post(this.invoice);
    }

    private transition(done: any) {
        const isDraft = this.invoice.ID >= 1;

        const isCreditNote = this.invoice.InvoiceType === InvoiceTypes.CreditNote;
        const doneText = isCreditNote ? 'Faktura kreditert' : 'Faktura fakturert';
        const errText =  isCreditNote ? 'Kreditering feiler' : 'Fakturering feilet';

        this.saveInvoice().subscribe(
            (invoice) => {
                this.isDirty = false;
                if (!isDraft) {
                    done(doneText);
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                    return;
                }

                this.customerInvoiceService.Transition(invoice.ID, null, 'invoice').subscribe(
                    (res) => {
                        done(doneText);
                        this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((refreshed) => {
                            this.refreshInvoice(refreshed);
                        });
                    },
                    (err) => {
                        done(errText);
                        this.errorService.handle(err);
                    }
                );
            },
            (err) => {
                done('Noe gikk galt under fakturering');
                this.errorService.handle(err);
            }
        );
    }

    private reminderStop(done) {
        this.invoice.DontSendReminders = !this.invoice.DontSendReminders;

        this.saveInvoice().subscribe(
            (invoice) => {
                this.isDirty = false;
                this.updateToolbar();
                this.updateSaveActions();
                done(this.invoice.DontSendReminders ? 'Purrestopp aktivert' : 'Purrestopp opphevet')
            }, (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveAsDraft(done) {
        const requiresPageRefresh = !this.invoice.ID;
        if (!this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft; // TODO: replace with enum from salesEnums.ts!
        }

        this.saveInvoice().subscribe(
            (invoice) => {
                this.isDirty = false;
                if (requiresPageRefresh) {
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                } else {
                    this.customerInvoiceService.Get(invoice.ID, this.expandOptions)
                        .subscribe(
                            res => this.refreshInvoice(res),
                            err => this.errorService.handle(err)
                        );
                }
                done('Lagring fullført');
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveAndPrint(done) {
        if (!this.invoice.ID && !this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft;
        }

        this.saveInvoice().subscribe(
            (invoice) => {
                this.isDirty = false;
                this.reportDefinitionService.getReportByName('Faktura id').subscribe((report) => {
                    this.previewModal.openWithId(report, invoice.ID);
                    done('Lagring fullført');
                });
            },
            (err) => done('Noe gikk galt under lagring')
        );
    }

    private creditInvoice(done) {
        this.customerInvoiceService.createCreditNoteFromInvoice(this.invoice.ID).subscribe(
            (data) => {
                done('Kreditering fullført');
                this.router.navigateByUrl('/sales/invoices/' + data.ID);
            },
            (err) => {
                done('Feil ved kreditering');
                this.errorService.handle(err);
            }
        );
    }

    private payInvoice(done) {
        const title = `Register betaling, Faktura ${this.invoice.InvoiceNumber || ''}, ${this.invoice.CustomerName || ''}`;

        // Set up subscription to listen canceled modal
        if (this.registerPaymentModal.canceled.observers.length === 0) {
            this.registerPaymentModal.canceled.subscribe(() => {
                done();
            });
        }

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.
        if (this.registerPaymentModal.changed.observers.length === 0) {
            this.registerPaymentModal.changed.subscribe((modalData: any) => {
                this.customerInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
                    this.toastService.addToast('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber, ToastType.good, 5);
                    done('Betaling registrert');
                    this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((invoice) => {
                        this.refreshInvoice(invoice);
                    });
                }, (err) => {
                    done('Feilet ved registrering av betaling');
                    this.errorService.handle(err);
                });
            });
        }

        const invoiceData = {
            Amount: this.invoice.RestAmount,
            PaymentDate: new LocalDate(Date())
        };

        this.registerPaymentModal.openModal(this.invoice.ID, title, invoiceData);
    }

    private deleteInvoice(done) {
        this.customerInvoiceService.Remove(this.invoice.ID, null).subscribe(
            (res) => {
                this.isDirty = false;
                this.router.navigateByUrl('/sales/invoices');
            },
            (err) => {
                this.errorService.handle(err);
                done('Noe gikk galt under sletting');
            }
        );
    }

    public nextInvoice() {
        this.customerInvoiceService.getNextID(this.invoice.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/invoices/' + id);
                } else {
                    this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere fakturaer etter denne');
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public previousInvoice() {
        this.customerInvoiceService.getPreviousID(this.invoice.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/invoices/' + id);
                } else {
                    this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere fakturaer før denne');
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private getCurrencyCode(currencyCodeID: number): string {
        let currencyCode: CurrencyCode;

        if (this.currencyCodes) {
            if (currencyCodeID) {
                currencyCode = this.currencyCodes.find(x => x.ID === currencyCodeID);
            } else if (this.companySettings) {
                currencyCode = this.currencyCodes.find(x => x.ID === this.companySettings.BaseCurrencyCodeID);
            }
        }

        return currencyCode ? currencyCode.Code : '';
    }


    // Summary
    public recalcItemSums(invoiceItems) {
        if (!invoiceItems) {
            return;
        }

        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(invoiceItems);
        this.updateSaveActions();
        this.updateToolbar();

        this.summaryFields = [
            {
                value: this.getCurrencyCode(this.currencyCodeID),
                title: 'Valuta:',
                description: this.currencyExchangeRate ? 'Kurs: ' + this.numberFormat.asMoney(this.currencyExchangeRate) : ''
            },
            {
                title: 'Avgiftsfritt',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasisCurrency)
            },
            {
                title: 'Avgiftsgrunnlag',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasisCurrency)
            },
            {
                title: 'Sum rabatt',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumDiscountCurrency)
            },
            {
                title: 'Nettosum',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency)
            },
            {
                title: 'Mva',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumVatCurrency)
            },
            {
                title: 'Øreavrunding',
                value: this.numberFormat.asMoney(this.itemsSummaryData.DecimalRoundingCurrency)
            },
            {
                title: 'Totalsum',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVatCurrency)
            },
        ];
    }
}
