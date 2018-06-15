import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

import {
    CompanySettings,
    CurrencyCode,
    Customer,
    CustomerInvoice,
    CustomerInvoiceItem,
    Dimensions,
    InvoicePaymentData,
    LocalDate,
    Project,
    Seller,
    SellerLink,
    StatusCodeCustomerInvoice,
    Terms,
    NumberSeries,
    VatType,
    Department,
    User,
    ReportDefinition,
} from '../../../../unientities';

import {
    BusinessRelationService,
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    CustomerInvoiceItemService,
    CustomerInvoiceReminderService,
    CustomerInvoiceService,
    CustomerService,
    DimensionService,
    EHFService,
    ErrorService,
    NumberFormat,
    ProjectService,
    ReportDefinitionService,
    ReportService,
    StatisticsService,
    TermsService,
    UserService,
    NumberSeriesService,
    EmailService,
    SellerService,
    SellerLinkService,
    VatTypeService,
    ElsaProductService,
    DimensionSettingsService,
    CustomDimensionService,
    DepartmentService,
    PaymentInfoTypeService,
    ModulusService,
} from '../../../../services/services';

import {
    UniModalService,
    UniRegisterPaymentModal,
    UniActivateAPModal,
    UniSendEmailModal,
    UniSendVippsInvoiceModal,
    ConfirmActions,
    UniConfirmModalV2,
    IModalOptions,
    UniChooseReportModal,
} from '../../../../../framework/uni-modal';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {ActivationEnum} from '../../../../models/activationEnum';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {SendEmail} from '../../../../models/sendEmail';
import {InvoiceTypes} from '../../../../models/Sales/InvoiceTypes';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {IToolbarConfig, ICommentsConfig, IShareAction, IToolbarSubhead} from '../../../common/toolbar/toolbar';
import {StatusTrack, IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';
import {roundTo} from '../../../common/utils/utils';

import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniTofSelectModal} from '../../common/tofSelectModal';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper, ISummaryLine} from '../../salesHelper/tradeItemHelper';

import {UniReminderSendingModal} from '../../reminder/sending/reminderSendingModal';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';

declare const _;

export enum CollectorStatus {
    Reminded = 42501,
    SendtToDebtCollection = 42502,
    FactoringRegistered = 42503,
    SentToFactoring = 42504,
    Completed = 42502
}

@Component({
    selector: 'uni-invoice',
    templateUrl: './invoice.html'
})
export class InvoiceDetails implements OnInit, AfterViewInit {
    @ViewChild(TofHead) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() public invoiceID: any;

    private invoice: CustomerInvoice;
    private invoiceItems: CustomerInvoiceItem[];
    private isDirty: boolean;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private newInvoiceItem: CustomerInvoiceItem;
    private printStatusPrinted: string = '200';
    private distributeEntityType = 'Models.Sales.CustomerInvoice';
    private projects: Project[];
    private departments: Department[];
    public currentDefaultProjectID: number;
    private readonly: boolean;

    private currencyInfo: string;
    public summaryLines: ISummaryLine[];

    public contextMenuItems: IContextMenuItem[] = [];
    private companySettings: CompanySettings;
    private recalcDebouncer: EventEmitter<any> = new EventEmitter();
    public saveActions: IUniSaveAction[] = [];
    public shareActions: IShareAction[];
    public toolbarconfig: IToolbarConfig;
    public toolbarSubheads: IToolbarSubhead[];

    private vatTypes: VatType[];
    private currencyCodes: Array<CurrencyCode>;
    private currencyCodeID: number;
    private currencyExchangeRate: number;
    public currentCustomer: Customer;
    public currentPaymentTerm: Terms;
    public currentDeliveryTerm: Terms;
    public currentUser: User;
    private deliveryTerms: Terms[];
    private paymentTerms: Terms[];
    public selectConfig: any;
    private numberSeries: NumberSeries[];
    private projectID: number;
    private ehfEnabled: boolean = false;
    private sellers: Seller[];
    private deletables: SellerLink[] = [];
    public currentInvoiceDate: LocalDate;
    private dimensionTypes: any[];
    private paymentInfoTypes: any[];
    private distributionPlans: any[];
    private reports: any[];

    private customerExpands: string[] = [
        'DeliveryTerms',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.DefaultEmail',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller'
    ];

    private invoiceExpands: Array<string> = [
        'Customer',
        'DefaultDimensions',
        'DeliveryTerms',
        'InvoiceReference',
        'JournalEntry',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller'
    ].concat(this.customerExpands.map(option => 'Customer.' + option));

    private invoiceItemExpands: string[] = [
        'Product.VatType',
        'VatType',
        'Account',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
    ];

    public commentsConfig: ICommentsConfig;

    constructor(
        private businessRelationService: BusinessRelationService,
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerService: CustomerService,
        private dimensionService: DimensionService,
        private ehfService: EHFService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private projectService: ProjectService,
        private reportDefinitionService: ReportDefinitionService,
        private reportService: ReportService,
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private termsService: TermsService,
        private toastService: ToastService,
        private tofHelper: TofHelper,
        private tradeItemHelper: TradeItemHelper,
        private userService: UserService,
        private numberSeriesService: NumberSeriesService,
        private emailService: EmailService,
        private sellerService: SellerService,
        private sellerLinkService: SellerLinkService,
        private vatTypeService: VatTypeService,
        private elsaProductService: ElsaProductService,
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private departmentService: DepartmentService,
        private paymentTypeService: PaymentInfoTypeService,
        private modulusService: ModulusService,
    ) {
        // set default tab title, this is done to set the correct current module to make the breadcrumb correct
        this.tabService.addTab({
            url: '/sales/invoices/',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });
    }

    public ngOnInit() {
        this.recalcItemSums(null);

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((invoiceItems) => {
            if (invoiceItems.length) {
                this.recalcItemSums(invoiceItems);
                this.isDirty = invoiceItems.some(item => item._isDirty);
            }
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];
            const customerID = +params['customerID'];
            const projectID = +params['projectID'];
            const hasCopyParam = params['copy'];

            this.commentsConfig = {
                entityType: 'CustomerInvoice',
                entityID: this.invoiceID
            };

            if (this.invoiceID === 0) {
                Observable.forkJoin(
                    this.customerInvoiceService.GetNewEntity(['DefaultDimensions'], CustomerInvoice.EntityType),
                    this.userService.getCurrentUser(),
                    customerID
                        ? this.customerService.Get(customerID, this.customerExpands)
                        : Observable.of(null),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(
                        `filter=NumberSeriesType.Name eq 'Customer Invoice number `
                        + `series' and Empty eq false and Disabled eq false`,
                        ['NumberSeriesType']
                    ),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1')
                ).subscribe((res) => {
                    let invoice = <CustomerInvoice>res[0];
                    this.currentUser = res[1];
                    invoice.OurReference = this.currentUser.DisplayName;
                    if (res[2]) {
                        invoice = this.tofHelper.mapCustomerToEntity(res[2], invoice);
                    }
                    this.companySettings = res[3];
                    this.currencyCodes = res[4];
                    this.paymentTerms = res[5];
                    this.deliveryTerms = res[6];
                    if (res[7]) {
                        invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                        invoice.DefaultDimensions.ProjectID = res[7].ID;
                        invoice.DefaultDimensions.Project = res[7];
                    }
                    this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[8]);
                    this.projects = res[9];
                    this.sellers = res[10];
                    this.vatTypes = res[11];
                    this.departments = res[12];
                    this.setUpDims(res[13]);
                    this.paymentInfoTypes = res[14];
                    this.distributionPlans = res[15];
                    this.reports = res[16];

                    invoice.InvoiceDate = new LocalDate(Date());

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    if (!invoice.PaymentTerms && !invoice.PaymentDueDate) {
                        invoice.PaymentDueDate = new LocalDate(
                            moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
                        );
                    } else {
                        this.setPaymentDueDate(invoice);
                    }

                    if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
                        this.setDeliveryDate(invoice);
                    } else {
                        invoice.DeliveryDate = null;
                    }

                    this.selectConfig = this.numberSeriesService.getSelectConfig(
                        this.invoiceID, this.numberSeries, 'Customer Invoice number series'
                    );

                    this.refreshInvoice(invoice);
                    this.recalcItemSums(null);
                    this.tofHead.focus();
                }, err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.getInvoice(this.invoiceID),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1')
                ).subscribe((res) => {
                    const invoice = res[0];
                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.paymentTerms = res[3];
                    this.deliveryTerms = res[4];
                    this.projects = res[5];
                    this.sellers = res[6];
                    this.vatTypes = res[7];
                    this.departments = res[8];
                    this.setUpDims(res[9]);
                    this.paymentInfoTypes = res[10];
                    this.distributionPlans = res[11];
                    this.reports = res[12];

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    if (!invoice.PaymentTerms && !invoice.PaymentDueDate) {
                        invoice.PaymentDueDate = new LocalDate(
                            moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
                        );
                    } else if (!invoice.PaymentDueDate) {
                        this.setPaymentDueDate(invoice);
                    }

                    invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                    if (invoice.DefaultDimensions) {
                        this.projectID = invoice.DefaultDimensions.ProjectID;
                    }
                    invoice.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);

                    if (hasCopyParam) {
                        this.refreshInvoice(this.copyInvoice(invoice));
                    } else {
                        this.refreshInvoice(invoice);
                    }
                    this.tofHead.focus();
                }, err => this.errorService.handle(err));
            }
        }, err => this.errorService.handle(err));
    }

    public ngAfterViewInit() {
         this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => this.tradeItemTable.focusFirstRow());
    }

    private getInvoice(ID: number): Observable<CustomerInvoice> {
        if (!ID) {
            return this.customerInvoiceService.GetNewEntity(
                ['DefaultDimensions'],
                CustomerInvoice.EntityType
            );
        }

        return Observable.forkJoin(
            this.customerInvoiceService.Get(ID, this.invoiceExpands),
            this.customerInvoiceItemService.GetAll(
                `filter=CustomerInvoiceID eq ${ID}&hateoas=false`,
                this.invoiceItemExpands
            )
        ).map(res => {
            const invoice: CustomerInvoice = res[0];
            const invoiceItems: CustomerInvoiceItem[] = res[1];

            invoice.Items = invoiceItems;
            return invoice;
        });
    }


    private ehfReadyUpdateSaveActions() {
        if (!this.invoice || !!!this.invoice.Customer) {
            this.ehfEnabled = false;
            return;
        }

        // Possible to receive EHF for this customer?
        const peppoladdress = this.invoice.Customer.PeppolAddress
            ? this.invoice.Customer.PeppolAddress
            : '9908:' + this.invoice.Customer.OrgNumber;
        this.ehfService.GetAction(
            null, 'is-ehf-receiver',
            'peppoladdress=' + peppoladdress + '&entitytype=CustomerInvoice'
        ).subscribe(enabled => {
            this.ehfEnabled = enabled;
            this.updateSaveActions();
        }, err => this.errorService.handle(err));
    }

    public numberSeriesChange(selectedSerie) {
        this.invoice.InvoiceNumberSeriesID = selectedSerie.ID;
    }

    private getCollectorStatusText(status: CollectorStatus): string {
        let statusText: string = '';
        switch (status) {
            case CollectorStatus.Reminded: {
                statusText = 'Purret';
                break;
            }
            case CollectorStatus.SendtToDebtCollection: {
                statusText = 'Sent til inkasso';
                break;
            }
        }
        return statusText;
    }

    private setUpDims(dims) {
        this.dimensionTypes = [{
            Label: 'Avdeling',
            Dimension: 2,
            IsActive: true,
            Property: 'DefaultDimensions.DepartmentID',
            Data: this.departments
        }];

        const queries = [];

        dims.forEach((dim) => {
            this.dimensionTypes.push({
                Label: dim.Label,
                Dimension: dim.Dimension,
                IsActive: dim.IsActive,
                Property: 'DefaultDimensions.Dimension' + dim.Dimension + 'ID',
                Data: []
            });
            queries.push(this.customDimensionService.getCustomDimensionList(dim.Dimension));
        });

        Observable.forkJoin(queries).subscribe((res) => {
            res.forEach((list, index) => {
                this.dimensionTypes[index + 1].Data = res[index];
            });
        });
    }

    private sendEHFAction(doneHandler: (msg: string) => void = null) {
        if (this.companySettings.APActivated && this.companySettings.APGuid) {
            this.askSendEHF(doneHandler);
        } else {
            this.modalService.confirm({
                header: 'Markedsplassen',
                message: 'Til markedsplassen for å kjøpe tilgang til å sende EHF?',
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Nei'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.elsaProductService.FindProductByName('EHF').subscribe(p => {
                        this.router.navigateByUrl('/marketplace/add-ons/' + p.id);
                    });
                }
                doneHandler('');
            });
        }
    }

    private askAddressSettings(doneHandler: (msg?: string) => void) {
        this.modalService.confirm({
            header: 'Ditt firma mangler adresse informasjon',
            message: 'Gå til firmainnstillinger for å fylle ut minimum adresselinje 1?',
            buttonLabels: {
                accept: 'Ja',
                cancel: 'Nei'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                doneHandler('');
                this.router.navigate(['/settings/company']);
            } else {
                doneHandler('Husk å fylle ut minimum adresselinje 1 i firmainnstillingene for å sende EHF');
            }
        });
    }

    private sendToVipps(id, doneHandler: (msg?: string) => void = null) {
        this.modalService.open(UniSendVippsInvoiceModal, {
            data: new Object({InvoiceID: id})
        }).onClose.subscribe(text => {
            doneHandler();
        });
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

    public canDeactivate(): Observable<boolean> {
        const saveButtonLabel = this.invoice && this.invoice.ID && this.invoice.StatusCode > 42001 ? 'Lagre' : 'Lagre som kladd';
        return !this.isDirty
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal(saveButtonLabel)
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        if (!this.invoice.ID && !this.invoice.StatusCode) {
                            this.invoice.StatusCode = StatusCode.Draft;
                        }
                        this.saveInvoice();
                    }

                    return result !== ConfirmActions.CANCEL;
                });
    }

    public onInvoiceChange(invoice: CustomerInvoice) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;

        const customerChanged: boolean = this.didCustomerChange(invoice);
        if (customerChanged) {
            if (invoice.Customer.StatusCode === StatusCode.InActive) {
                const options: IModalOptions = {message: 'Vil du aktivere kunden?'};
                this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                    if (res === ConfirmActions.ACCEPT) {
                        this.customerService.activateCustomer(invoice.CustomerID).subscribe(
                            response => {
                                invoice.Customer.StatusCode = StatusCode.Active;
                                this.onInvoiceChange(invoice);
                                this.toastService.addToast('Kunde aktivert', ToastType.good);
                            },
                            err => this.errorService.handle(err)
                        );
                    }
                    return;
                });
            }

            if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
                this.setPaymentDueDate(invoice);
            }
            if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
                this.setDeliveryDate(invoice);
            }

            // update currency code in detailsForm to customer's currency code
            if (invoice.Customer.CurrencyCodeID) {
                invoice.CurrencyCodeID = invoice.Customer.CurrencyCodeID;
            } else {
                invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            shouldGetCurrencyRate = true;
        }

        // refresh items if project changed
        if (invoice.DefaultDimensions && invoice.DefaultDimensions.ProjectID !== this.projectID) {
            this.projectID = invoice.DefaultDimensions.ProjectID;

            if (this.invoiceItems.length) {
                this.modalService.confirm({
                    header: `Endre prosjekt på alle varelinjer?`,
                    message: `Vil du endre til dette prosjektet på alle eksisterende varelinjer?`,
                    buttonLabels: {
                        accept: 'Ja',
                        reject: 'Nei'
                    }
                }).onClose.subscribe(response => {
                    const replaceItemsProject: boolean = (response === ConfirmActions.ACCEPT);
                    this.tradeItemTable
                        .setDefaultProjectAndRefreshItems(invoice.DefaultDimensions.ProjectID, replaceItemsProject);
                });
            } else {
                this.tradeItemTable.setDefaultProjectAndRefreshItems(invoice.DefaultDimensions.ProjectID, true);
            }
        }

        // If the update comes from dimension view
        if (invoice['_updatedField']) {
            const dimension = invoice['_updatedField'].split('.');
            const dimKey = parseInt(dimension[1].substr(dimension[1].length - 3, 1), 10);
            if (!isNaN(dimKey) && dimKey >= 5) {
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, invoice[dimension[0]][dimension[1]]);
            } else {
                // Department, Region and Reponsibility hits here!
                this.tradeItemTable.setNonCustomDimsOnTradeItems(dimension[1], invoice.DefaultDimensions[dimension[1]]);
            }
        }

        this.updateCurrency(invoice, shouldGetCurrencyRate);

        this.currentInvoiceDate = invoice.InvoiceDate;

        this.invoice = _.cloneDeep(invoice);
        this.updateSaveActions();
    }

    private updateCurrency(invoice: CustomerInvoice, getCurrencyRate: boolean) {
        let shouldGetCurrencyRate = getCurrencyRate;

        if (this.currentInvoiceDate.toString() !== invoice.InvoiceDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        // update currency code in detailsForm and tradeItemTable to selected currency code if selected
        // or from customer
        if ((!this.currencyCodeID && invoice.CurrencyCodeID) || this.currencyCodeID !== invoice.CurrencyCodeID) {
            this.currencyCodeID = invoice.CurrencyCodeID;
            this.tradeItemTable.updateAllItemVatCodes(this.currencyCodeID);
            shouldGetCurrencyRate = true;
        }

        if (this.invoice && invoice.CurrencyCodeID !== this.invoice.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        // If not getting currencyrate, we're done
        if (!shouldGetCurrencyRate) {
            return;
        }

        this.getUpdatedCurrencyExchangeRate(invoice).subscribe(res => {
            const newCurrencyRate = res;

            if (!this.currencyExchangeRate) {
                this.currencyExchangeRate = 1;
            }

            if (newCurrencyRate === this.currencyExchangeRate) {
                return;
            }

            if (newCurrencyRate !== this.currencyExchangeRate) {
                this.currencyExchangeRate = newCurrencyRate;
                invoice.CurrencyExchangeRate = res;

                let askUserWhatToDo: boolean = false;

                let newTotalExVatBaseCurrency: number;
                let diffBaseCurrency: number;
                let diffBaseCurrencyPercent: number;

                const haveUserDefinedPrices = this.invoiceItems && this.invoiceItems.filter(
                    x => x.PriceSetByUser
                ).length > 0;

                if (haveUserDefinedPrices) {
                    // calculate how much the new currency will affect the amount for the base currency,
                    // if it doesnt cause a change larger than 5%, don't bother asking the user what
                    // to do, just use the set prices
                    newTotalExVatBaseCurrency = this.itemsSummaryData.SumTotalExVatCurrency * newCurrencyRate;
                    diffBaseCurrency = Math.abs(newTotalExVatBaseCurrency - this.itemsSummaryData.SumTotalExVat);

                    diffBaseCurrencyPercent =
                        this.tradeItemHelper.round(
                            (diffBaseCurrency * 100) / Math.abs(this.itemsSummaryData.SumTotalExVat), 1
                        );

                    // 5% is set as a limit for asking the user now, but this might need to be reconsidered,
                    // or make it possible to override it either on companysettings, customer, or the TOF header
                    if (diffBaseCurrencyPercent > 5) {
                        askUserWhatToDo = true;
                    }
                }

                if (askUserWhatToDo) {
                    const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
                    const modalMessage = 'Endringen førte til at en ny valutakurs ble hentet. '
                        + 'Du har overstyrt en eller flere priser, '
                        + 'og dette fører derfor til at totalsum eks. mva '
                        + `for ${baseCurrencyCode} endres med ${diffBaseCurrencyPercent}% `
                        + `til ${baseCurrencyCode} ${this.numberFormat.asMoney(newTotalExVatBaseCurrency)}.\n\n`
                        + `Vil du heller rekalkulere valutaprisene basert på ny kurs og standardprisen på varene?`;

                    this.modalService.confirm({
                        header: 'Rekalkulere valutapriser for varer?',
                        message: modalMessage,
                        buttonLabels: {
                            accept: 'Ikke rekalkuler valutapriser',
                            reject: 'Rekalkuler valutapriser'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            // we need to calculate the base currency amount numbers if we are going
                            // to keep the currency amounts - if not the data will be out of sync
                            this.invoiceItems.forEach(item => {
                                if (item.PriceSetByUser) {
                                    this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                } else {
                                    this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                }
                            });
                        } else if (response === ConfirmActions.REJECT) {
                            // we need to calculate the currency amounts based on the original prices
                            // defined in the base currency
                            this.invoiceItems.forEach(item => {
                                this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                            });
                        }

                        // make unitable update the data after calculations
                        this.invoiceItems = this.invoiceItems.concat();
                        this.recalcItemSums(this.invoiceItems);

                        // update the model
                        this.invoice = _.cloneDeep(invoice);
                    });

                } else if (this.invoiceItems && this.invoiceItems.length > 0) {
                    // the currencyrate has changed, but not so much that we had to ask the user what to do,
                    // so just make an assumption what to do; recalculated based on set price if user
                    // has defined a price, and by the base currency price if the user has not set a
                    // specific price
                    this.invoiceItems.forEach(item => {
                        if (item.PriceSetByUser) {
                            this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                        } else {
                            this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                        }
                    });

                    // make unitable update the data after calculations
                    this.invoiceItems = this.invoiceItems.concat();
                    this.recalcItemSums(this.invoiceItems);

                    // update the model
                    this.invoice = _.cloneDeep(invoice);
                } else {
                    // update
                    this.recalcItemSums(this.invoiceItems);

                    // update the model
                    this.invoice = _.cloneDeep(invoice);
                }
            }
        },
        err => this.errorService.handle(err));
    }

    public onSellerDelete(sellerLink: SellerLink) {
        this.deletables.push(sellerLink);
    }

    private askSendEHF(doneHandler: (msg: string) => void = null) {
        if (this.companySettings.DefaultAddress && this.companySettings.DefaultAddress.AddressLine1) {
            if (this.invoice.PrintStatus === 300) {
                this.modalService.confirm({
                    header: 'Bekreft EHF sending',
                    message: 'Vil du sende EHF på nytt?',
                    buttonLabels: {
                        accept: 'Send',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.sendEHF(doneHandler);
                    } else {
                        doneHandler('');
                    }
                });
            } else {
                this.sendEHF(doneHandler);
            }
        } else {
            this.askAddressSettings(doneHandler);
        }
    }

    private sendEHF(doneHandler: (msg: string) => void = null) {
        this.customerInvoiceService.PutAction(this.invoice.ID, 'send-ehf').subscribe(
            () => {
                this.toastService.addToast('EHF sendt', ToastType.good, 3, 'Til ' + this.invoice.Customer.Info.Name);
                if (doneHandler) { doneHandler('EHF sendt'); }
            },
            (err) => {
                if (doneHandler) { doneHandler('En feil oppstod ved sending av EHF!'); }
                this.errorService.handle(err);
            });
    }

    private didCustomerChange(invoice: CustomerInvoice): boolean {
        let change: boolean;

        if (!this.currentCustomer && !invoice.Customer) {
            return false;
        }

        if (invoice.Customer && this.currentCustomer) {
            change = invoice.Customer.ID !== this.currentCustomer.ID;
        } else if (invoice.Customer && invoice.Customer.ID) {
            change = true;
        }

        this.currentCustomer = invoice.Customer;
        return change;
    }

    private setPaymentDueDate(invoice: CustomerInvoice) {
        if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
            invoice.PaymentDueDate = invoice.InvoiceDate;

            if (invoice.PaymentTerms.CreditDays < 0) {
                invoice.PaymentDueDate = new LocalDate(
                    moment(invoice.InvoiceDate).endOf('month').toDate()
                );
            }

            invoice.PaymentDueDate = new LocalDate(
                moment(invoice.PaymentDueDate).add(Math.abs(invoice.PaymentTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private setDeliveryDate(invoice: CustomerInvoice) {
        if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
            invoice.DeliveryDate = invoice.InvoiceDate;

            if (invoice.DeliveryTerms.CreditDays < 0) {
                invoice.DeliveryDate = new LocalDate(moment(invoice.InvoiceDate).endOf('month').toDate());
            }

            invoice.DeliveryDate = new LocalDate(
                moment(invoice.DeliveryDate).add(Math.abs(invoice.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private getUpdatedCurrencyExchangeRate(invoice: CustomerInvoice): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!invoice.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === invoice.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            const currencyDate: LocalDate = new LocalDate(invoice.InvoiceDate.toString());

            return this.currencyService.getCurrencyExchangeRate(
                invoice.CurrencyCodeID,
                this.companySettings.BaseCurrencyCodeID,
                currencyDate
            ).map(x => x.ExchangeRate);
        }
    }

    private recalcPriceAndSumsBasedOnSetPrices(item, newCurrencyRate) {
        item.PriceExVat = this.tradeItemHelper.round(item.PriceExVatCurrency * newCurrencyRate, 4);

        this.tradeItemHelper.calculatePriceIncVat(item, newCurrencyRate);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, newCurrencyRate) {
        if (!item.PriceSetByUser || !item.Product) {
            // if price has not been changed by the user, recalc based on the PriceExVat.
            // we do this before using the products price in case the product has been changed
            // after the item was created. This is also done if no Product is selected
            item.PriceExVatCurrency = this.tradeItemHelper.round(item.PriceExVat / newCurrencyRate, 4);
        } else {
            // if the user has changed the price for this item, we need to recalc based
            // on the product's PriceExVat, because using the items PriceExVat will not make
            // sense as that has also been changed when the user when the currency price
            // was changed
            item.PriceExVatCurrency = this.tradeItemHelper.round(item.Product.PriceExVat / newCurrencyRate, 4);

            // if price was set by user, it is not any longer
            item.PriceSetByUser = false;
        }

        this.tradeItemHelper.calculatePriceIncVat(item, newCurrencyRate);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private getReminderStoppedSubStatus(): Promise<any> {
        let reminderStopSubStatus: any = null;
        let reminderStoppedByText = '';
        let reminderStoppedTimeStamp: Date = null;

        return new Promise((resolve, reject) => {
            this.statisticsService.GetAll(
                `model=AuditLog&orderby=AuditLog.CreatedAt desc&filter=AuditLog.EntityID eq ${this.invoiceID} and `
                + `EntityType eq 'CustomerInvoice' and Field eq 'DontSendReminders' and NewValue eq `
                + `'true'&select=User.DisplayName as Username,Auditlog.CreatedAt as `
                + `Date&join=AuditLog.CreatedBy eq User.GlobalIdentity `
            )
            .map(data => data.Data ? data.Data : [])
            .subscribe(brdata => {
                if (brdata && brdata.length > 0) {
                    reminderStoppedByText = `Aktivert av ${brdata[0]['Username']} `
                        + `${moment(new Date(brdata[0]['Date'])).fromNow()}`;
                    reminderStoppedTimeStamp = new Date(brdata[0]['Date']);

                    reminderStopSubStatus = {
                        title: reminderStoppedByText,
                        state: STATUSTRACK_STATES.Active,
                        timestamp: reminderStoppedTimeStamp
                    };
                    resolve(reminderStopSubStatus);
                }
            }, err => reject(err));
        });
    }

    private getCollectionSubStatus(colStatus: CollectorStatus): Promise<any> {

        let subStatux: any = null;
        let statusText = '';
        let statusTimeStamp: Date = null;
        const subStatuses: StatusTrack[] = [];

        switch (colStatus) {
            case CollectorStatus.Reminded: {
                return new Promise((resolve, reject) => {
                    this.statisticsService.GetAll(
                        `model=CustomerInvoiceReminder&orderby=CustomerInvoiceReminder.ReminderNumber `
                        + `desc&filter=CustomerInvoiceReminder.CustomerInvoiceID eq ${this.invoiceID}`
                        + `&select=CustomerInvoiceReminder.CreatedAt as Date,CustomerInvoiceReminder.ReminderNumber `
                        + `as ReminderNumber,CustomerInvoiceReminder.DueDate as DueDate `
                    )
                    .map(data => data.Data ? data.Data : [])
                    .subscribe(brdata => {
                        if (brdata && brdata.length > 0) {
                            brdata.forEach(element => {
                                const pastDue: boolean = new Date(element['DueDate']) < new Date();
                                const pastDueText = pastDue ? 'forfalt for' : 'forfall om';
                                statusText = `${element['ReminderNumber']}. purring, `
                                    + `${pastDueText} ${moment(new Date(element['DueDate'])).fromNow()}`;
                                statusTimeStamp = new Date(element['Date']);
                                subStatux = {
                                    title: statusText,
                                    state: STATUSTRACK_STATES.Active,
                                    timestamp: statusTimeStamp
                                };
                                subStatuses.push(subStatux);
                            });
                            resolve(subStatuses);
                        }
                    }, err => reject(err));
                });
            }

            case CollectorStatus.SendtToDebtCollection: {
                return new Promise((resolve, reject) => {
                    this.statisticsService.GetAll(
                        `model=AuditLog&orderby=AuditLog.CreatedAt desc&filter=AuditLog.EntityID eq `
                        + `${this.invoiceID} and EntityType eq 'CustomerInvoice' and Field eq 'CollectorStatusCode' `
                        + `and NewValue eq '42502'&select=User.DisplayName as Username,Auditlog.CreatedAt as `
                        + `Date&join=AuditLog.CreatedBy eq User.GlobalIdentity `
                    )
                    .map(data => data.Data ? data.Data : [])
                    .subscribe(brdata => {
                        if (brdata && brdata.length > 0) {
                            brdata.forEach(element => {
                                statusText = `Sent av ${element['Username']} `
                                    + `${moment(new Date(element['Date'])).fromNow()}`;
                                statusTimeStamp = new Date(element['Date']);
                                subStatux = {
                                    title: statusText,
                                    state: STATUSTRACK_STATES.Active,
                                    timestamp: statusTimeStamp
                                };
                                subStatuses.push(subStatux);
                            });
                            resolve(subStatuses);
                        }
                    }, err => reject(err));
                });
            }
        }
    }

    private getStatustrackConfig() {
        const statustrack: IStatus[] = [];
        let activeStatus = 0;
        if (this.invoice) {
            activeStatus = this.invoice.StatusCode || 1;
        }

        const statuses = [...this.customerInvoiceService.statusTypes];
        const spliceIndex = (activeStatus === StatusCodeCustomerInvoice.PartlyPaid)
            ? statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.Paid)
            : statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.PartlyPaid);

        if (spliceIndex >= 0) {
            statuses.splice(spliceIndex, 1);
        }

        statuses.forEach((status) => {
            let _state: STATUSTRACK_STATES;

            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
            }

            statustrack.push({
                title: status.Text,
                state: _state,
                code: status.Code
            });
        });

        if (this.invoice.DontSendReminders) {

            this.getReminderStoppedSubStatus().then(substatus => {
                statustrack.push({
                    title: 'Purrestoppet',
                    state: STATUSTRACK_STATES.Obsolete,
                    code: 0,
                    forceSubstatus: true,
                    substatusList: substatus ? [substatus] : []
                });
            }).catch(err => this.errorService.handle(err));
        }



        if (this.invoice.CollectorStatusCode > 42500
            && this.invoice.CollectorStatusCode < 42505
            && !this.invoice.DontSendReminders
        ) {
            const statusText = this.getCollectorStatusText(this.invoice.CollectorStatusCode);
            if (statusText !== '') {
                this.getCollectionSubStatus(this.invoice.CollectorStatusCode).then(substatus => {
                    statustrack.push({
                        title: statusText,
                        state: STATUSTRACK_STATES.Obsolete,
                        code: 0,
                        forceSubstatus: true,
                        substatusList: substatus ? substatus : []
                    });
                }).catch(err => this.errorService.handle(err));
            }
        }

        return statustrack;
    }

    private refreshInvoice(invoice: CustomerInvoice): void {
        this.isDirty = false;

        this.newInvoiceItem = <any>this.tradeItemHelper.getDefaultTradeItemData(invoice);
        this.readonly = !!invoice.ID && !!invoice.StatusCode && invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;
        this.invoiceItems = invoice.Items.sort(
            function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
        );

        this.currentCustomer = invoice.Customer;
        this.currentPaymentTerm = invoice.PaymentTerms;
        this.currentDeliveryTerm = invoice.DeliveryTerms;

        invoice.DefaultSeller = invoice.DefaultSeller;
        this.currentDefaultProjectID = invoice.DefaultDimensions.ProjectID;

        this.currentInvoiceDate = invoice.InvoiceDate;

        this.invoice = _.cloneDeep(invoice);
        this.updateCurrency(invoice, true);
        this.recalcDebouncer.next(invoice.Items);
        this.updateTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
        this.ehfReadyUpdateSaveActions();
    }

    private updateTabTitle() {
        const tabTitle = (this.invoice.InvoiceNumber)
            ? 'Fakturanr. ' + this.invoice.InvoiceNumber
            : (this.invoice.ID) ? 'Faktura (kladd)' : 'Ny faktura';

        this.tabService.addTab({
            url: '/sales/invoices/' + this.invoice.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Invoices
        });
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

        const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
        const selectedCurrencyCode = this.getCurrencyCode(this.currencyCodeID);

        let netSumText = '';

        if (this.itemsSummaryData) {
            netSumText = `Netto ${selectedCurrencyCode} `
                + `${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} `
                    + `${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat)}`;
            }
        } else {
            netSumText = `Netto ${selectedCurrencyCode} `
                + `${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmount)}`;
            }
        }

        const reminderStopText = this.invoice.DontSendReminders ? 'Purrestopp' : '';

        const toolbarconfig: IToolbarConfig = {
            title: invoiceText,
            subheads: this.getToolbarSubheads(),
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: () => this.invoice.ID ? this.router.navigateByUrl('/sales/invoices/0') : this.ngOnInit()
            },
            contextmenu: this.contextMenuItems,
            entityID: this.invoiceID,
            entityType: 'CustomerInvoice'
        };

        this.updateShareActions();
        this.toolbarconfig = toolbarconfig;
    }

    private getToolbarSubheads() {
        if (!this.invoice) {
            return;
        }

        const subheads: IToolbarSubhead[] = [];

        if (this.invoice.DontSendReminders) {
            subheads.push({title: 'Purrestopp'});
        }

        if (this.invoice.InvoiceType === InvoiceTypes.CreditNote && this.invoice.InvoiceReference) {
            subheads.push({
                title: `Kreditering av faktura nr. ${this.invoice.InvoiceReference.InvoiceNumber}`,
                link: `#/sales/invoices/${this.invoice.InvoiceReference.ID}`
            });
        }

        if (this.invoice.JournalEntry) {
            subheads.push({
                title: `Bilagsnr. ${this.invoice.JournalEntry.JournalEntryNumber}`,
                link: `#/accounting/transquery;JournalEntryNumber=`
                    + `${this.invoice.JournalEntry.JournalEntryNumber}`
            });
        }

        if (this.invoice.RestAmountCurrency) {
            subheads.push({
                label: this.invoice.RestAmountCurrency > 0
                    ? 'Restbeløp' : 'Overbetalt beløp',
                title: this.numberFormat.asMoney(Math.abs(this.invoice.RestAmountCurrency))
            });
        }

        return subheads;
    }

    // Save actions
    private updateShareActions() {
        this.shareActions = [
            {
                label: 'Skriv ut / send e-post',
                action: () => this.chooseForm(),
                disabled: () => false
            },
            {
                label: 'Send purring',
                action: () => this.sendReminderAction(),
                disabled: () => this.invoice.DontSendReminders || this.invoice.StatusCode === StatusCode.Completed
            },
            {
                label: 'Distribuer',
                action: () => this.distribute(),
                disabled: () => !this.invoice['UseReportID'] || !this.invoice['DistributionPlanID'] || !this.invoice.ID
            }
        ];
    }

    private updateSaveActions() {
        if (!this.invoice) { return; }
        this.saveActions = [];
        const transitions = (this.invoice['_links'] || {}).transitions;
        const id = this.invoice.ID;
        const status = this.invoice.StatusCode;
        const printStatus = this.invoice.PrintStatus;

        if (!this.invoice.InvoiceNumber) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: done => this.saveAsDraft(done),
                disabled: false
            });
        } else {
            if (this.isDirty && id) {
                    this.saveActions.push({
                    label: 'Lagre endringer',
                    action: done => this.saveInvoice(done).then(res => {
                        if (res) {
                            this.getInvoice(this.invoice.ID).subscribe(invoice => {
                                this.refreshInvoice(invoice);
                            });
                        }
                    }),
                    disabled: false,
                    main: true
                });
            }
        }

        if (this.invoice.InvoiceType === InvoiceTypes.Invoice) {
            this.saveActions.push({
                label: 'Krediter faktura',
                action: (done) => this.creditInvoice(done),
                disabled: !status || status === StatusCodeCustomerInvoice.Draft,
                main: status === StatusCodeCustomerInvoice.Paid && !this.isDirty
            });
        }

        this.saveActions.push({
            label: (this.invoice.InvoiceType === InvoiceTypes.CreditNote) ? 'Krediter' : 'Fakturer',
            action: done => this.transition(done),
            disabled: id > 0 && !transitions['invoice'] && !transitions['credit']
                || !this.currentCustomer || (this.currentCustomer && !this.currentCustomer.CustomerNumber),
            main: !id || (transitions && (transitions['invoice'] || transitions['credit'])),
        });

        this.saveActions.push({
            label: 'Ny basert på',
            action: (done) => {
                this.newBasedOn().then(res => {
                    done('Faktura kopiert');
                }).catch(error => {
                    done(error);
                });
            },
            disabled: false
        });

        this.saveActions.push({
            label: 'Send EHF',
            action: (done) => this.sendEHFAction(done),
            disabled: status < StatusCodeCustomerInvoice.Invoiced,
            main: printStatus !== 300 && this.ehfEnabled
                && status === StatusCodeCustomerInvoice.Invoiced && !this.isDirty
        });

        this.saveActions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: !transitions || !transitions['pay'],
            main: id > 0 && transitions['pay'] && !this.isDirty
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

    private saveInvoice(done = (msg: string) => {}): Promise<any> {
        this.invoice.Items = this.tradeItemHelper.prepareItemsForSave(this.invoiceItems);

        if (this.invoice.DefaultSeller && this.invoice.DefaultSeller.ID > 0) {
            this.invoice.DefaultSellerID = this.invoice.DefaultSeller.ID;
        }

        if (this.invoice.DefaultSeller && this.invoice.DefaultSeller.ID === null) {
            this.invoice.DefaultSeller = null;
            this.invoice.DefaultSellerID = null;
        }

        if (this.invoice.DefaultDimensions && !this.invoice.DefaultDimensions.ID) {
            this.invoice.DefaultDimensions._createguid = this.customerInvoiceService.getNewGuid();
        }

        // add deleted sellers back to 'Sellers' to delete with 'Deleted' property, was sliced locally/in view
        if (this.deletables) {
            this.deletables.forEach(sellerLink => this.invoice.Sellers.push(sellerLink));
        }

        return new Promise((resolve, reject) => {
            const request = (this.invoice.ID > 0)
                ? this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
                : this.customerInvoiceService.Post(this.invoice);

            if (this.invoice.PaymentDueDate < this.invoice.InvoiceDate) {
                return reject('Forfallsdato må være lik eller senere enn fakturadato.');
            }

            if (this.invoice.Items.filter(x => !x.VatTypeID && (x.PriceExVat > 0 || x.PriceIncVat > 0)).length > 0) {
                return reject('Kan ikke lagre faktura, mvakode må velges på alle linjene med et beløp');
            }

            // If a currency other than basecurrency is used, and any lines contains VAT,
            // validate that this is correct before resolving the promise
            if (this.invoice.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
                const linesWithVat = this.invoice.Items.filter(x => x.SumVatCurrency > 0);
                if (linesWithVat.length > 0) {
                    const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                        + `${this.getCurrencyCode(this.invoice.CurrencyCodeID)} som valuta?`;

                    this.modalService.confirm({
                        header: 'Vennligst bekreft',
                        message: modalMessage,
                        buttonLabels: {
                            accept: 'Ja, lagre med MVA',
                            cancel: 'Avbryt'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            request.subscribe(
                                res => {
                                    if (res.InvoiceNumber) { this.selectConfig = undefined; }
                                    resolve(res);
                                },
                                err => reject(err)
                            );
                        } else {
                            const message = 'Endre MVA kode og lagre på ny';
                            reject(message);
                        }
                    });

                } else {
                    request.subscribe(res => {
                        if (res.InvoiceNumber) { this.selectConfig = undefined; }
                        resolve(res);
                        done('Lagring fullført');
                    }, err => reject(err));
                }
            } else {
                request.subscribe(res => {
                    resolve(res);
                    done('Lagring fullført');
                }, err => reject(err));
            }
        }).catch(err => {
            this.errorService.handle(err);
            done('Lagring feilet');
        });
    }

    private newBasedOn(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.invoice.ID) {
                this.router.navigateByUrl('sales/invoices/' + this.invoice.ID + ';copy=true');
                resolve(true);
            } else {
                const config = {
                    service: this.customerInvoiceService,
                    moduleName: 'Invoice',
                    label: 'Fakturanr'
                };

                this.modalService.open(UniTofSelectModal, { data: config }).onClose.subscribe((id: number) => {
                    if (id) {
                        resolve(id);
                        this.router.navigateByUrl('sales/invoices/' + id + ';copy=true');
                    } else {
                        reject('Kopiering avbrutt');
                    }

                });
            }
        });
    }

    private copyInvoice(invoice: CustomerInvoice): CustomerInvoice {
        invoice.ID = 0;
        invoice.InvoiceNumber = null;
        invoice.InvoiceNumberSeriesID = null;
        invoice.StatusCode = null;
        invoice.PrintStatus = null;
        invoice.DontSendReminders = false;
        invoice.InvoiceDate = new LocalDate();
        invoice.JournalEntry = null;
        invoice.JournalEntryID = null;
        invoice.Payment = null;
        invoice.PaymentID = null;
        invoice.DeliveryDate = null;
        if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
            this.setPaymentDueDate(invoice);
        } else {
            invoice.PaymentDueDate = new LocalDate(
                moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
            );
        }
        invoice.InvoiceReferenceID = null;
        invoice.Comment = null;
        delete invoice['_links'];

        invoice.Sellers = invoice.Sellers.map(item => {
            item.CustomerInvoiceID = null;
            return item;
        });

        invoice.Items = invoice.Items.map((item: CustomerInvoiceItem) => {
            item.CustomerInvoiceID = 0;
            item.ID = 0;
            item.StatusCode = null;
            return item;
        });

        return invoice;
    }

    private transition(done: any) {
        const isDraft = this.invoice.ID >= 1;

        const isCreditNote = this.invoice.InvoiceType === InvoiceTypes.CreditNote;
        const doneText = isCreditNote ? 'Faktura kreditert' : 'Faktura fakturert';

        if (this.invoice.Customer.OrgNumber && !this.modulusService.isValidOrgNr(this.invoice.Customer.OrgNumber)) {
            return this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft kunde',
                message: `Ugyldig org.nr. '${this.invoice.Customer.OrgNumber}' på kunde. Vil du fortsette?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(
                response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.saveInvoice(done).then((invoice) => {
                            if (invoice) {
                                this.isDirty = false;

                                // Update ID to avoid posting multiple times
                                // in case any of the following requests fail
                                if (invoice.ID && !this.invoice.ID) {
                                    this.invoice.ID = invoice.ID;
                                }

                                if (!isDraft) {
                                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                                    return;
                                }

                                this.customerInvoiceService.Transition(invoice.ID, null, 'invoice').subscribe(
                                    (res) => this.selectConfig = undefined,
                                    (err) => this.errorService.handle(err),
                                    () => {
                                        this.getInvoice(invoice.ID).subscribe(res => {
                                            this.refreshInvoice(res);
                                            done(doneText);
                                        });
                                    }
                                );
                            } else {
                                done('Lagring feilet');
                            }
                        }).catch(error => {
                            this.handleSaveError(error, done);
                        });
                    }
                    return done();
                }
            );
        }

        this.saveInvoice(done).then((invoice) => {
            if (invoice) {
                this.isDirty = false;

                // Update ID to avoid posting multiple times
                // in case any of the following requests fail
                if (invoice.ID && !this.invoice.ID) {
                    this.invoice.ID = invoice.ID;
                }

                if (!isDraft) {
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                    return;
                }

                this.customerInvoiceService.Transition(invoice.ID, null, 'invoice').subscribe(
                    (res) => this.selectConfig = undefined,
                    (err) => this.errorService.handle(err),
                    () => {
                        this.getInvoice(invoice.ID).subscribe(res => {
                            this.refreshInvoice(res);
                            done(doneText);
                        });
                    }
                );
            } else {
                done('Lagring feilet');
            }
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private reminderStop(done) {
        this.invoice.DontSendReminders = !this.invoice.DontSendReminders;

        this.saveInvoice(done).then((invoice) => {
            if (invoice) {
                this.isDirty = false;
                this.updateToolbar();
                this.updateSaveActions();
                done(this.invoice.DontSendReminders ? 'Purrestopp aktivert' : 'Purrestopp opphevet');
            } else {
                done('Lagring feilet');
            }
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private saveAsDraft(done) {
        const requiresPageRefresh = !this.invoice.ID;
        if (!this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft;
        }

        this.saveInvoice(done).then((invoice) => {
            if (invoice) {
                this.isDirty = false;
                if (requiresPageRefresh) {
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                } else {
                    this.getInvoice(this.invoice.ID).subscribe(
                        res => this.refreshInvoice(res),
                        err => this.errorService.handle(err)
                    );
                }
                done('Lagring fullført');
            } else {
                done('Lagring feilet');
            }
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private printAction(reportForm: ReportDefinition): Observable<any> {
        const savedInvoice = this.isDirty
            ? Observable.fromPromise(this.saveInvoice())
            : Observable.of(this.invoice);

        return savedInvoice.switchMap((invoice) => {
            return this.modalService.open(UniPreviewModal, {
                data: reportForm
            }).onClose.switchMap(() => {
                return this.customerInvoiceService.setPrintStatus(
                    this.invoice.ID,
                    this.printStatusPrinted
                ).finally(() => {
                    this.invoice.PrintStatus = +this.printStatusPrinted;
                    this.updateToolbar();
                });
            });
        });
    }

    private sendEmailAction(reportForm: ReportDefinition, entity: CustomerInvoice, entityTypeName: string, name: string): Observable<any> {
        const savedInvoice = this.isDirty
            ? Observable.fromPromise(this.saveInvoice())
            : Observable.of(this.invoice);

        return savedInvoice.switchMap(invoice => {
            return this.emailService.sendReportEmailAction(reportForm, entity, entityTypeName, name);
        });
    }

    public chooseForm() {
        return this.modalService.open(
            UniChooseReportModal,
            {data: {
                name: 'Faktura',
                typeName: 'Invoice',
                entity: this.invoice,
                type: ReportTypeEnum.INVOICE
            }}
        ).onClose.map(res => {
            if (res === ConfirmActions.CANCEL || !res) {
                return;
            }

            if (res.action === 'print') {
                this.printAction(res.form).subscribe();
            }

            if (res.action === 'email') {
                this.sendEmailAction(res.form, res.entity, res.entityTypeName, res.name).subscribe();
            }
        });
    }

    private sendReminderAction(): Observable<any> {
        return this.customerInvoiceReminderService.createInvoiceRemindersForInvoicelist([this.invoice.ID])
            .switchMap((reminders) => {
                return this.modalService.open(UniReminderSendingModal, {
                    data: reminders
                }).onClose;
            });
    }

    private distribute() {
        return Observable.create((obs) => {
            this.reportService.disptribute(this.invoice.ID, this.distributeEntityType).subscribe(() => {
                obs.complete();
            }, err => obs.complete() );
        });
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
        const title = `Register betaling, Kunde-faktura ${this.invoice.InvoiceNumber || ''}, `
            + `${this.invoice.CustomerName || ''}`;

        const invoicePaymentData: InvoicePaymentData = {
            Amount: roundTo(this.invoice.RestAmount),
            AmountCurrency: this.invoice.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID ?
                roundTo(this.invoice.RestAmount) : roundTo(this.invoice.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: this.invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: new LocalDate(Date()),
            AgioAccountID: null,
            BankChargeAccountID: 0,
            AgioAmount: 0
        };

        const paymentModal = this.modalService.open(UniRegisterPaymentModal, {
            header: title,
            data: invoicePaymentData,
            modalConfig: {
                entityName: 'CustomerInvoice',
                currencyCode: this.currencyCodeID ? this.getCurrencyCode(this.currencyCodeID) : '',
                currencyExchangeRate: this.invoice.CurrencyExchangeRate
            }
        });


        // HOME OFFICE FROM HERE

        paymentModal.onClose.subscribe((payment) => {
            if (payment) {
                this.customerInvoiceService.ActionWithBody(this.invoice.ID, payment, 'payInvoice').subscribe(
                    res => {
                        done('Betaling vellykket');
                        this.toastService.addToast(
                            'Faktura er betalt. Betalingsnummer: ' + res.JournalEntryNumber,
                            ToastType.good,
                            5
                        );

                        this.getInvoice(this.invoice.ID).subscribe(invoice => {
                            this.refreshInvoice(invoice);
                        });
                    },
                    err => {
                        done('Feilet ved registrering av betaling');
                        this.errorService.handle(err);
                    }
                );
            } else {
                done();
            }
        });
    }

    private handleSaveError(error, donehandler) {
        if (typeof (error) === 'string') {
            if (donehandler) {
                donehandler('Lagring avbrutt. ' + error);
            }
        } else {
            if (donehandler) {
                donehandler('Lagring feilet');
            }
            this.errorService.handle(error);
        }
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
    public recalcItemSums(invoiceItems: CustomerInvoiceItem[] = null) {
        const items = invoiceItems && invoiceItems.filter(line => !line.Deleted);
        const decimals = this.companySettings && this.companySettings.RoundingNumberOfDecimals;

        this.itemsSummaryData = items && items.length
            ? this.tradeItemHelper.calculateTradeItemSummaryLocal(items, decimals)
            : undefined;

        if (this.itemsSummaryData) {
            this.summaryLines = this.tradeItemHelper.getSummaryLines2(items, this.itemsSummaryData);
        }

        if (this.currencyCodeID && this.currencyExchangeRate) {
            this.currencyInfo = `${this.getCurrencyCode(this.currencyCodeID)} `
                + `(kurs: ${this.numberFormat.asMoney(this.currencyExchangeRate)})`;
        }
    }
}
