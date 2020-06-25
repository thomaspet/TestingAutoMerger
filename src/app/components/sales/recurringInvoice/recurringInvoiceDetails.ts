import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as moment from 'moment';

import {
    CompanySettings,
    CurrencyCode,
    Customer,
    RecurringInvoice,
    StatusCodeRecurringInvoice,
    Dimensions,
    LocalDate,
    Project,
    Seller,
    SellerLink,
    StatusCodeCustomerInvoice,
    NumberSeries,
    VatType,
    Department,
    User,
    RecurringInvoiceItem
} from '../../../unientities';

import {
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    RecurringInvoiceService,
    CustomerService,
    ErrorService,
    NumberFormat,
    ProjectService,
    ReportDefinitionService,
    ReportService,
    UserService,
    NumberSeriesService,
    SellerService,
    VatTypeService,
    DimensionSettingsService,
    CustomDimensionService,
    DepartmentService,
    PaymentInfoTypeService,
    AccountMandatoryDimensionService,
} from '@app/services/services';

import {
    UniModalService,
    ConfirmActions,
    UniConfirmModalV2,
    IModalOptions
} from '@uni-framework/uni-modal';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IContextMenuItem} from '@uni-framework/ui/unitable/index';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {TradeHeaderCalculationSummary} from '../../../models/sales/TradeHeaderCalculationSummary';

import {IToolbarConfig, ICommentsConfig} from '../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../common/tofHead';
import {TradeItemTable} from '../common/tradeItemTable';

import {StatusCode} from '../salesHelper/salesEnums';
import {TofHelper} from '../salesHelper/tofHelper';
import {TradeItemHelper, ISummaryLine} from '../salesHelper/tradeItemHelper';
import {UniRecurringInvoiceLogModal} from './recurringInvoiceLogModal';

declare const _;

@Component({
    selector: 'uni-recurring-invoice',
    templateUrl: './recurringInvoiceDetails.html'
})
export class UniRecurringInvoice implements OnInit {
    @ViewChild(TofHead, { static: true }) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() invoiceID: any;

    private distributeEntityTypeInvoice = 'Models.Sales.CustomerInvoice';
    private distributeEntityTypeOrder = 'Models.Sales.CustomerOrder';
    private isDirty: boolean;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private numberSeries: NumberSeries[];
    private projectID: number;

    readonly: boolean;
    invoice: RecurringInvoice;
    invoiceItems: RecurringInvoiceItem[];
    newInvoiceItem: RecurringInvoiceItem;

    projects: Project[];
    departments: Department[];

    currencyInfo: string;
    summaryLines: ISummaryLine[];

    private contextMenuItems: IContextMenuItem[] = [];
    companySettings: CompanySettings;
    recalcDebouncer: EventEmitter<any> = new EventEmitter();
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig;
    commentsConfig: ICommentsConfig;

    vatTypes: VatType[];
    currencyCodes: Array<CurrencyCode>;
    currencyCodeID: number;
    currencyExchangeRate: number;
    private currentCustomer: Customer;
    currentUser: User;

    selectConfig: any;
    hasWarned: boolean = false;

    sellers: Seller[];
    dimensionTypes: any[];
    paymentInfoTypes: any[];
    allDistributionPlans: any[];
    distributionPlans: any[];
    allReports: any[];
    reports: any[];
    reportType = 1;
    log: any[];
    accountsWithMandatoryDimensionsIsUsed = true;

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
        'Info.Contacts.Info',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'Distributions'
    ];

    private invoiceExpands: Array<string> = [
        'Customer.Info.Contacts.Info',
        'DefaultDimensions',
        'DeliveryTerms',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
    ].concat(this.customerExpands.map(option => 'Customer.' + option));

    constructor(
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private recurringInvoiceService: RecurringInvoiceService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private projectService: ProjectService,
        private reportDefinitionService: ReportDefinitionService,
        private reportService: ReportService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private toastService: ToastService,
        private tofHelper: TofHelper,
        private tradeItemHelper: TradeItemHelper,
        private userService: UserService,
        private numberSeriesService: NumberSeriesService,
        private sellerService: SellerService,
        private vatTypeService: VatTypeService,
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private departmentService: DepartmentService,
        private paymentTypeService: PaymentInfoTypeService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService
    ) { }

    ngOnInit() {
        this.recalcItemSums(null);
        this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe((result) => {
            this.accountsWithMandatoryDimensionsIsUsed = result > 0;
        });

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((invoiceItems) => {
            if (invoiceItems.length) {
                this.recalcItemSums(invoiceItems);
                this.isDirty = invoiceItems.some(item => item._isDirty);
                if (this.isDirty) {
                    this.updateSaveActions();
                }
            }
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];
            const customerID = +params['customerID'];
            const projectID = +params['projectID'];

            this.commentsConfig = {
                entityType: 'RecurringInvoice',
                entityID: this.invoiceID
            };

            if (this.invoiceID === 0) {
                Observable.forkJoin(
                    this.recurringInvoiceService.GetNewEntity(['DefaultDimensions'], RecurringInvoice.EntityType),
                    this.userService.getCurrentUser(),
                    customerID
                        ? this.customerService.Get(customerID, this.customerExpands)
                        : Observable.of(null),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
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
                    this.reportService.getDistributions2Types(this.distributeEntityTypeInvoice, this.distributeEntityTypeOrder),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1 or ReportType eq 2')
                ).subscribe((res) => {
                    let invoice = <RecurringInvoice>res[0];

                    // Set defaults
                    invoice.TimePeriod = 3;
                    invoice.Interval = 1;
                    invoice.ProduceAs = 1;
                    invoice.StartDate = new LocalDate();

                    invoice.NextInvoiceDate = new LocalDate(moment().toDate());

                    this.currentUser = res[1];
                    invoice.OurReference = this.currentUser.DisplayName;
                    if (res[2]) {
                        invoice = this.tofHelper.mapCustomerToEntity(res[2], invoice);
                    }
                    this.companySettings = res[3];
                    this.currencyCodes = res[4];

                    if (res[5]) {
                        invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                        invoice.DefaultDimensions.ProjectID = res[5].ID;
                        invoice.DefaultDimensions.Project = res[5];
                    }
                    this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[6]);
                    this.projects = res[7];
                    this.sellers = res[8];
                    this.vatTypes = res[9];
                    this.departments = res[10];
                    this.setUpDims(res[11]);
                    this.paymentInfoTypes = res[12];
                    this.allDistributionPlans = res[13];
                    this.allReports = res[14];
                    this.setTypeSpecificValues(invoice);

                    this.selectConfig = this.numberSeriesService.getSelectConfig(
                        this.invoiceID, this.numberSeries, 'Customer Invoice number series'
                    );

                    if (!!customerID && res[2] && res[2]['Distributions'] && res[2]['Distributions'].CustomerInvoiceDistributionPlanID) {
                        invoice.DistributionPlanID = res[2]['Distributions'].CustomerInvoiceDistributionPlanID;
                    } else if (this.companySettings['Distributions']) {
                        invoice.DistributionPlanID = this.companySettings['Distributions'].CustomerInvoiceDistributionPlanID;
                    }

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
                        this.setDeliveryDate(invoice);
                    } else {
                        invoice.DeliveryDate = null;
                    }

                    this.refreshInvoice(invoice);
                    this.recalcItemSums(null);
                    this.tofHead.focus();
                    if (this.accountsWithMandatoryDimensionsIsUsed) {
                        this.tofHead.clearValidationMessage();
                    }
                }, err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.getInvoice(this.invoiceID),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentTypeService.GetAll(null),
                    this.reportService.getDistributions2Types(this.distributeEntityTypeInvoice, this.distributeEntityTypeOrder),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1 or ReportType eq 2'),
                    this.numberSeriesService.GetAll(
                        `filter=NumberSeriesType.Name eq 'Customer Invoice number `
                        + `series' and Empty eq false and Disabled eq false`,
                        ['NumberSeriesType']
                    )
                    ).subscribe((res) => {
                    const invoice = res[0];
                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.projects = res[3];
                    this.sellers = res[4];
                    this.vatTypes = res[5];
                    this.departments = res[6];
                    this.setUpDims(res[7]);
                    this.paymentInfoTypes = res[8];
                    this.allDistributionPlans = res[9];
                    this.allReports = res[10];
                    this.setTypeSpecificValues(invoice);
                    this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[11]);

                    this.selectConfig = this.numberSeriesService.getSelectConfig(
                        0, this.numberSeries, 'Customer Invoice number series'
                    );

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                    if (invoice.DefaultDimensions) {
                        this.projectID = invoice.DefaultDimensions.ProjectID;
                    }
                    invoice.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);

                    this.refreshInvoice(invoice);
                    this.tofHead.focus();
                    if (this.accountsWithMandatoryDimensionsIsUsed && invoice.CustomerID && invoice.StatusCode !== StatusCodeRecurringInvoice.Active) {
                        this.tofHead.getValidationMessage(invoice.CustomerID, invoice.DefaultDimensionsID);
                    }
                }, err => this.errorService.handle(err));
            }
        }, err => this.errorService.handle(err));
    }

    private setTypeSpecificValues(invoice: RecurringInvoice) {
        this.reportType = this.getReportType(invoice);
        this.reports = this.allReports.filter(x => x.ReportType === this.reportType);
        if (this.reportType === 1) {
            this.distributionPlans = this.allDistributionPlans.filter(x => x.EntityType === this.distributeEntityTypeInvoice);
        } else {
            this.distributionPlans = this.allDistributionPlans.filter(x => x.EntityType === this.distributeEntityTypeOrder);
        }
    }

    private getReportType(invoice: any): number {
        return invoice.ProduceAs === 1 ? 1 : 2;
    }

    private getInvoice(ID: number): Observable<RecurringInvoice> {
        if (!ID) {
            return this.recurringInvoiceService.GetNewEntity(['DefaultDimensions'], RecurringInvoice.EntityType);
        }

        return Observable.forkJoin(
            this.recurringInvoiceService.Get(ID, this.invoiceExpands, true),
            this.recurringInvoiceService.getInvoiceItems(ID),
            this.recurringInvoiceService.getLog(ID)
        ).map(res => {
            const invoice: RecurringInvoice = res[0];
            const invoiceItems: RecurringInvoiceItem[] = res[1].map(item => {
                if (item.Dimensions) {
                    item.Dimensions = this.customDimensionService.mapDimensionInfoToDimensionObject(item.Dimensions);
                }
                return item;
            });

            this.log = res[2];

            invoice.Items = invoiceItems;
            return invoice;
        });
    }

    numberSeriesChange(selectedSerie) {
        this.invoice.InvoiceNumberSeriesID = selectedSerie.ID;
    }

    private setUpDims(dims) {
        this.dimensionTypes = [];

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
            res.forEach((item, index) => {
                this.dimensionTypes[index].Data = item;
            });
        });
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
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

    canDeactivate(): boolean | Observable<boolean> {
        if (this.isDirty) {
            return this.modalService.openUnsavedChangesModal().onClose
                .switchMap(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        if (!this.invoice.ID && !this.invoice.StatusCode) {
                            this.invoice.StatusCode = StatusCode.Draft;
                        }

                        return Observable.fromPromise(this.saveInvoice())
                            .catch(err => {
                                this.handleSaveError(err);
                                return Observable.of(false);
                            })
                            .map(res => !!res);
                    }

                    return Observable.of(result !== ConfirmActions.CANCEL);
                });
        }
        return true;
    }


    onInvoiceChange(invoice: RecurringInvoice) {
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
            this.tradeItemTable.setDefaultProjectAndRefreshItems(invoice.DefaultDimensions, true);
            if (this.accountsWithMandatoryDimensionsIsUsed && invoice.CustomerID && invoice.StatusCode !== StatusCodeRecurringInvoice.Active) {
                this.tofHead.getValidationMessage(invoice.CustomerID, invoice.DefaultDimensionsID, invoice.DefaultDimensions);
            }
        }

        this.updateCurrency(invoice, shouldGetCurrencyRate);

        if (
            customerChanged && this.currentCustomer &&
            this.currentCustomer['Distributions'] &&
            this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID
        ) {
            if (invoice.DistributionPlanID &&
                invoice.DistributionPlanID !== this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID) {
                this.modalService.open(UniConfirmModalV2,
                    {
                        header: 'Oppdatere utsendelsesplanen?',
                        buttonLabels: {
                            accept: 'Oppdater',
                            reject: 'Ikke oppdater'
                        },
                        message: 'Kunden du har valgt har en annen utsendelsesplanen enn den som allerede er valgt for ' +
                        'denne faktura. Ønsker du å oppdatere utsendelsesplanenen for denne faktura til å matche kundens?'
                    }
                ).onClose.subscribe((res) => {
                    if (res === ConfirmActions.ACCEPT) {
                        invoice.DistributionPlanID = this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID;
                        this.toastService.addToast('Oppdatert', ToastType.good, 5, 'Utsendelsesplanen oppdatert');
                        this.invoice = invoice;
                    }
                });
            } else {
                invoice.DistributionPlanID = this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID;
            }
        }
        if (this.reportType !== this.getReportType(invoice)) {
            this.setTypeSpecificValues(invoice);
        }
        this.invoice = invoice;
        this.updateSaveActions();
    }

    onDimensionChange(event: {field: string, value: any}) {
        if (event.field && event.value) {
            const invoice = this.invoice;

            this.newInvoiceItem = this.tradeItemHelper.getDefaultTradeItemData(invoice);

            const fieldSplit = event.field.split('.');
            const dimKey = parseInt(fieldSplit[1].replace(/\D/g, ''), 10);

            if (!isNaN(dimKey) && dimKey >= 5) {
                // Custom dims
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, invoice[fieldSplit[0]][fieldSplit[1]]);
            } else {
                // Project, Department, Region and Reponsibility
                this.tradeItemTable.setNonCustomDimsOnTradeItems(fieldSplit[1], invoice.DefaultDimensions[fieldSplit[1]]);
            }
            if (
                this.accountsWithMandatoryDimensionsIsUsed
                && invoice.CustomerID
                && invoice.StatusCode !== StatusCodeRecurringInvoice.Active
            ) {
                this.tofHead.getValidationMessage(invoice.CustomerID, invoice.DefaultDimensionsID, invoice.DefaultDimensions);
            }
        }
    }

    onFreetextChange() {
        // Stupid data flow requires this
        this.invoice = _.cloneDeep(this.invoice);
        this.isDirty = true;
        this.updateSaveActions();
    }

    private updateCurrency(invoice: RecurringInvoice, getCurrencyRate: boolean) {
        let shouldGetCurrencyRate = getCurrencyRate;

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

        if (this.invoice.StatusCode !== null && this.invoice.StatusCode !== 42001) {
            shouldGetCurrencyRate = false;
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

    private didCustomerChange(invoice: RecurringInvoice): boolean {
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

    private setDeliveryDate(invoice: RecurringInvoice) {
        if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
            invoice.DeliveryDate = new LocalDate(
                moment(invoice.DeliveryDate).add(Math.abs(invoice.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private getUpdatedCurrencyExchangeRate(invoice: RecurringInvoice): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!invoice.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === invoice.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            const currencyDate: LocalDate = new LocalDate();

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

    private getStatustrackConfig() {
        const statustrack: IStatus[] = [];
        let activeStatus = 0;
        if (this.invoice) {
            activeStatus = this.invoice.StatusCode || 1;
        }

        const statuses = [
            { Code: StatusCodeRecurringInvoice.Active, Text: 'Aktiv' },
            { Code: StatusCodeRecurringInvoice.InActive, Text: 'Inaktiv' },
        ];
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

        return statustrack;
    }

    private refreshInvoice(invoice: RecurringInvoice): void {
        this.isDirty = false;
        this.invoiceID = invoice.ID;
        this.newInvoiceItem = <any>this.tradeItemHelper.getDefaultTradeItemData(invoice);
        this.readonly = !!invoice.ID && !!invoice.StatusCode && invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;
        this.invoiceItems = invoice.Items.sort(
            function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
        );

        this.currentCustomer = invoice.Customer;

        this.invoice = _.cloneDeep(invoice);
        this.updateCurrency(invoice, true);
        this.recalcDebouncer.next(invoice.Items);
        if (this.tradeItemTable) {
            this.tradeItemTable.getMandatoryDimensionsReports();
        }
        this.updateTab();
        this.updateToolbar();
        this.updateSaveActions();
        this.checkIfActiveAndNoDistributionPlan();
    }

    private updateTab(invoice?: RecurringInvoice) {
        if (!invoice) {
            invoice = this.invoice;
        }
        this.tabService.addTab({
            url: '/sales/recurringinvoice/' + invoice.ID,
            name: invoice.ID ? 'SALES.RECURRING_INVOICE.RECURRING_INVOICE_NUMBER~' + invoice.ID
                : 'SALES.RECURRING_INVOICE.RECURRING_INVOICE_NEW',
            active: true,
            moduleID: UniModules.RecurringInvoice
        });
    }

    private updateToolbar() {
        const toolbarconfig: IToolbarConfig = {
            title: this.invoice.ID ? 'SALES.RECURRING_INVOICE.RECURRING_INVOICE_NUMBER~' + this.invoice.ID
                : 'SALES.RECURRING_INVOICE.RECURRING_INVOICE_NEW',
            subheads: [],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: () => this.invoice.ID ? this.router.navigateByUrl('/sales/recurringinvoice/0') : this.ngOnInit()
            },
            contextmenu: this.contextMenuItems,
            entityID: this.invoiceID,
            entityType: 'RecurringInvoice'
        };

        this.toolbarconfig = toolbarconfig;

        if (this.log && this.log.length && this.invoice.ID) {
            toolbarconfig.subheads.push({
                title: 'Se fakturalogg',
                classname: 'subhead-link',
                event: () => {
                    this.showRecurringInvoiceLog();
                }
            });
        }
    }

    private updateSaveActions() {
        if (!this.invoice) { return; }

        this.saveActions = [
            {
                label: 'Lagre',
                action: done => this.saveAndRefreshInvoice(done),
                disabled: false,
                main: this.isDirty
            },
            {
                label: 'Aktiver',
                action: done => this.transtition('activate', done, 'Aktivering'),
                main: this.invoice.StatusCode === StatusCodeRecurringInvoice.InActive && !this.isDirty,
                disabled: !this.invoice.ID || this.invoice.StatusCode === StatusCodeRecurringInvoice.Active
            },
            {
                label: 'Deaktiver',
                action: done => this.transtition('deactivate', done, 'Deaktivering'),
                disabled: !this.invoice.ID || this.invoice.StatusCode === StatusCodeRecurringInvoice.InActive
            },
            {
                label: 'Generer neste',
                action: done => this.transtition('execute', done, 'Generering av ' + (this.invoice.ProduceAs === 1 ? 'faktura' : 'ordre')),
                main: false,
                disabled: !this.invoice.ID || this.invoice.StatusCode === StatusCodeRecurringInvoice.InActive
            },
            {
                label: 'Slett',
                action: done => this.deleteRecurringInvoice(done),
                main: false,
                disabled: !this.invoice.ID
            }
        ];
    }

    public showRecurringInvoiceLog() {
        const options: IModalOptions = {
            header: 'SALES.RECURRING_INVOICE.LOG_HEADER~' + this.invoiceID,
            buttonLabels: {
                accept: 'Ferdig'
            },
            data: {
                reccuringInvoiceID: this.invoice.ID
            }
        };
        this.modalService.open(UniRecurringInvoiceLogModal, options);
    }

    private saveAndRefreshInvoice(done) {
        const requiresPageRefresh = !this.invoice.ID;

        // If null, set to 0 so field is updated
        this.invoice.MaxIterations = this.invoice.MaxIterations || 0;
        this.saveInvoice(done).then(res => {
            if (res) {
                this.isDirty = false;
                if (requiresPageRefresh) {
                    this.router.navigateByUrl('sales/recurringinvoice/' + res.ID);
                } else {
                    this.getInvoice(res.ID).subscribe(invoice => {
                        this.refreshInvoice(invoice);
                    });
                }
            }
        }).catch((err) => {
            done('Lagring avbrutt');
        });
    }

    private saveInvoice(done = (msg: string) => {}): Promise<RecurringInvoice> {
        // Lets do some checks that invoice is valid
        if (!this.invoiceItems.length) {
            this.toastService.addToast('Ikke lagret', ToastType.warn, 5, 'Du får ikke lagret uten varelinjer');
            return Promise.reject(null);
        }
        if (!this.invoice.Customer) {
            this.toastService.addToast('Ikke lagret', ToastType.warn, 5, 'Du får ikke lagret uten kunde');
            return Promise.reject(null);
        }

        this.invoice.Items = this.tradeItemHelper.prepareItemsForSave(this.invoiceItems);

        if (this.invoice.DefaultSeller && this.invoice.DefaultSeller.ID > 0) {
            this.invoice.DefaultSellerID = this.invoice.DefaultSeller.ID;
        }

        if (this.invoice.DefaultSeller && this.invoice.DefaultSeller.ID === null) {
            this.invoice.DefaultSeller = null;
            this.invoice.DefaultSellerID = null;
        }

        if (this.invoice.DefaultDimensions && !this.invoice.DefaultDimensions.ID) {
            this.invoice.DefaultDimensions._createguid = this.recurringInvoiceService.getNewGuid();
        }

        return new Promise((resolve, reject) => {
            const saveRequest = (this.invoice.ID > 0)
                ? this.recurringInvoiceService.Put(this.invoice.ID, this.invoice)
                : this.recurringInvoiceService.Post(this.invoice);

            this.checkCurrencyAndVatBeforeSave().subscribe(canSave => {
                if (canSave) {
                    saveRequest.subscribe(
                        res => {
                            this.updateTab(res);
                            resolve(res);
                            this.tradeItemTable.showWarningIfMissingMandatoryDimensions(this.invoiceItems);
                            done('Lagring fullført');
                        },
                        err => {
                            this.errorService.handle(err);
                            reject(err);
                        });
                } else {
                    done('Lagring avbrutt');
                }
            });
        });
    }

    private checkCurrencyAndVatBeforeSave(): Observable<boolean> {
        if (this.invoice.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
            const linesWithVat = this.invoice.Items.filter(x => x.SumVatCurrency > 0);
            if (linesWithVat.length > 0) {
                const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                    + `${this.getCurrencyCode(this.invoice.CurrencyCodeID)} som valuta?`;

                return this.modalService.confirm({
                    header: 'Vennligst bekreft',
                    message: modalMessage,
                    buttonLabels: {
                        accept: 'Ja, lagre med MVA',
                        cancel: 'Avbryt'
                    }
                }).onClose.map(response => {
                    return response === ConfirmActions.ACCEPT;
                });
            }
        }

        return Observable.of(true);
    }

    private transtition(action: string, done, doneString: string) {
        this.recurringInvoiceService.transitionAction(this.invoice.ID, action).subscribe((res) => {
            this.getInvoice(this.invoice.ID).subscribe((invoice) => {
                this.refreshInvoice(invoice);
                done(`${doneString} fullført.`);
            });
        }, err => { done(`${doneString} feilet.`); this.handleSaveError(err); });
    }

    private deleteRecurringInvoice(done) {
        this.modalService.open(UniConfirmModalV2, {
            header: 'SALES.RECURRING_INVOICE.DELETE',
            message: 'SALES.RECURRING_INVOICE.DELETE_CONFIRM',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe((res) => {
            if (res === ConfirmActions.ACCEPT) {
                this.recurringInvoiceService.Remove(this.invoice.ID).subscribe(() => {
                    this.toastService.addToast('Slettet', ToastType.good, 6, `SALES.RECURRING_INVOICE.DELETED_NR~${this.invoice.ID}`);
                    this.router.navigateByUrl('/sales/recurringinvoice');
                }, err => this.handleSaveError(err));
            } else {
                done('Sletting avbrutt. Ingenting endret');
            }
        });
    }

    private handleSaveError(error, donehandler?) {
        if (donehandler) {
            donehandler('Lagring avbrutt');
        }

        this.errorService.handle(error);
    }

    private checkIfActiveAndNoDistributionPlan() {
        // Dont spam toast warning
        if (this.hasWarned) {
            return;
        }

        // If the recurring invoice is active and the client has not activated auto distribution in company settings
        if (this.invoice.StatusCode === 46002 && !this.companySettings.AutoDistributeInvoice) {
            this.toastService.addToast('Automatisk utsendelse avslått', ToastType.warn, 15,
            'Du har ikke aktivert automatisk utsendelse. Det vil ikke sendes noe før du aktiverer det under firmainnstillinger.' +
            '<br/><a href="/#/settings/company">Gå til firmainnstillinger</a>');
            this.hasWarned = true;
        } else if (this.invoice.StatusCode === 46002 && !this.invoice.DistributionPlanID) {
            this.toastService.addToast('Utsendelsesplan mangler', ToastType.warn, 15,
            'Det er ikke definert en utsendelsesplan på denne faktura. Gå til fanen "Utsendelse" for å velge en,' +
            ' eller gå til Innstillinger -> Utsendelse for å lage en ny plan.');
            this.hasWarned = true;
        }
    }

    private nextInvoice() {
        this.recurringInvoiceService.getNextID(this.invoice.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/recurringinvoice/' + id);
                } else {
                    this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere fakturaer etter denne');
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private previousInvoice() {
        this.recurringInvoiceService.getPreviousID(this.invoice.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/recurringinvoice/' + id);
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
    private recalcItemSums(invoiceItems: RecurringInvoiceItem[] = null) {
        const items = invoiceItems && invoiceItems.filter(line => !line.Deleted);
        const decimals = this.tradeItemHelper.getCompanySettingsNumberOfDecimals(this.companySettings, this.currencyCodeID);

        this.itemsSummaryData = items && items.length
            ? this.tradeItemHelper.calculateTradeItemSummaryLocal(items, decimals)
            : undefined;

        if (this.itemsSummaryData) {
            this.summaryLines = this.tradeItemHelper.getSummaryLines(items, this.itemsSummaryData);
        }

        if (this.currencyCodeID && this.currencyExchangeRate) {
            this.currencyInfo = `${this.getCurrencyCode(this.currencyCodeID)} `
                + `(kurs: ${this.numberFormat.asMoney(this.currencyExchangeRate)})`;
        }
    }
}
