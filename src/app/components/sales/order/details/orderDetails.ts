import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {
    UniModalService,
    UniSendEmailModal,
    ConfirmActions,
    IModalOptions,
    UniConfirmModalV2,
    UniChooseReportModal,
} from '../../../../../framework/uni-modal';
import {
    CompanySettings,
    CurrencyCode,
    Customer,
    CustomerOrder,
    CustomerOrderItem,
    Dimensions,
    LocalDate,
    Project,
    Seller,
    SellerLink,
    StatusCodeCustomerOrder,
    Terms,
    NumberSeries,
    VatType,
    Department,
    User,
    ReportDefinition,
} from '../../../../unientities';
import {
    AddressService,
    BusinessRelationService,
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    CustomerOrderService,
    CustomerOrderItemService,
    CustomerService,
    DepartmentService,
    ErrorService,
    NumberFormat,
    ProjectService,
    ReportDefinitionService,
    ReportService,
    TermsService,
    UserService,
    NumberSeriesService,
    EmailService,
    SellerService,
    SellerLinkService,
    VatTypeService,
    DimensionSettingsService,
    CustomDimensionService,
    PaymentInfoTypeService,
    ModulusService,
} from '../../../../services/services';

import {IUniSaveAction} from '../../../../../framework/save/save';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';

import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {SendEmail} from '../../../../models/sendEmail';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {IToolbarConfig, ICommentsConfig, IShareAction, IToolbarSubhead} from '../../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';

import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniTofSelectModal} from '../../common/tofSelectModal';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper, ISummaryLine} from '../../salesHelper/tradeItemHelper';

import {UniOrderToInvoiceModal} from '../orderToInvoiceModal';
import * as moment from 'moment';
declare var _;

@Component({
    selector: 'order-details',
    templateUrl: './orderDetails.html'
})
export class OrderDetails implements OnInit, AfterViewInit {
    @ViewChild(TofHead) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() public orderID: any;

    private companySettings: CompanySettings;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private isDirty: boolean;
    private printStatusPrinted: string = '200';
    private distributeEntityType: string = 'Models.Sales.CustomerOrder';
    private numberSeries: NumberSeries[];
    private projectID: number;
    private deletables: SellerLink[] = [];

    newOrderItem: CustomerOrderItem;
    order: CustomerOrder;
    orderItems: CustomerOrderItem[];

    contextMenuItems: IContextMenuItem[] = [];
    shareActions: IShareAction[];
    saveActions: IUniSaveAction[] = [];

    currencyInfo: string;
    summaryLines: ISummaryLine[];

    commentsConfig: ICommentsConfig;
    toolbarconfig: IToolbarConfig;
    vatTypes: VatType[];
    currencyCodes: Array<CurrencyCode>;
    currencyCodeID: number;
    currencyExchangeRate: number;
    currentCustomer: Customer;
    currentDeliveryTerm: Terms;
    currentUser: User;
    deliveryTerms: Terms[];
    paymentTerms: Terms[];

    projects: Project[];
    departments: Department[];
    currentDefaultProjectID: number;
    selectConfig: any;

    sellers: Seller[];

    currentOrderDate: LocalDate;
    dimensionTypes: any[];
    paymentInfoTypes: any[];
    distributionPlans: any[];
    reports: any[];


    readonly: boolean;
    recalcDebouncer: EventEmitter<any> = new EventEmitter();

    private customerExpands: string[] = [
        'DeliveryTerms',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Project.ProjectTasks',
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.InvoiceAddress',
        'Info.ShippingAddress',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller',
        'Distributions'
    ];

    private orderExpands: Array<string> = [
        'Customer',
        'Customer.Info',
        'Customer.Info.Addresses',
        'Customer.Dimensions',
        'Customer.Dimensions.Project',
        'Customer.Dimensions.Department',
        'DefaultDimensions',
        'DeliveryTerms',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller'
    ];

    private orderItemExpands: string[] = [
        'Product.VatType',
        'VatType',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
        'Account',
        'Dimensions.Project.ProjectTasks',
    ];

    constructor(
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private customerService: CustomerService,
        private customerOrderService: CustomerOrderService,
        private customerOrderItemService: CustomerOrderItemService,
        private departmentService: DepartmentService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private projectService: ProjectService,
        private reportDefinitionService: ReportDefinitionService,
        private reportService: ReportService,
        private route: ActivatedRoute,
        private router: Router,
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
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private paymentInfoTypeService: PaymentInfoTypeService,
        private modulusService: ModulusService,
   ) {}

    public ngOnInit() {
        // this.setSums();

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((orderItems) => {
            if (orderItems.length) {
                this.recalcItemSums(orderItems);
                const dirtyItems = orderItems.filter(x => x._isDirty);

                if (dirtyItems.length > 0) {
                    if (!this.isDirty) {
                        this.isDirty = true;
                        this.updateSaveActions();
                    }
                }
            }
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.orderID = +params['id'];
            const customerID = +params['customerID'];
            const projectID = +params['projectID'];
            const hasCopyParam = params['copy'];

            this.commentsConfig = {
                entityType: 'CustomerOrder',
                entityID: this.orderID
            };

            if (this.orderID) {
                Observable.forkJoin(
                    this.getOrder(this.orderID),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentInfoTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 2')
                ).subscribe(res => {
                    const order = <CustomerOrder>res[0];
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

                    if (!order.CurrencyCodeID) {
                        order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        order.CurrencyExchangeRate = 1;
                    }
                    this.currencyCodeID = order.CurrencyCodeID;
                    this.currencyExchangeRate = order.CurrencyExchangeRate;

                    order.DefaultDimensions = order.DefaultDimensions || new Dimensions();
                    if (order.DefaultDimensions) {
                        this.projectID = order.DefaultDimensions.ProjectID;
                    }
                    order.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);

                    if (hasCopyParam) {
                        this.refreshOrder(this.copyOrder(order));
                    } else {
                        this.refreshOrder(order);
                    }

                    this.tofHead.focus();
                },
                    err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.getOrder(0),
                    this.userService.getCurrentUser(),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    customerID ? this.customerService.Get(
                        customerID, this.customerExpands
                    ) : Observable.of(null),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(
                        `filter=NumberSeriesType.Name eq 'Customer Order number `
                        + `series' and Empty eq false and Disabled eq false`,
                        ['NumberSeriesType']
                    ),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentInfoTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 2')
                ).subscribe(
                    (res) => {
                        let order = <CustomerOrder>res[0];
                        this.currentUser = res[1];
                        order.OurReference = this.currentUser.DisplayName;
                        this.companySettings = res[2];
                        this.currencyCodes = res[3];
                        this.paymentTerms = res[4];
                        this.deliveryTerms = res[5];
                        if (res[6]) {
                            order = this.tofHelper.mapCustomerToEntity(res[6], order);
                            if (order.DeliveryTerms && order.DeliveryTerms.CreditDays) {
                                this.setDeliveryDate(order);
                            }
                        } else {
                            order.DeliveryDate = null;
                        }
                        if (res[7]) {
                            order.DefaultDimensions = order.DefaultDimensions || new Dimensions();
                            order.DefaultDimensions.ProjectID = res[7].ID;
                            order.DefaultDimensions.Project = res[7];
                        }
                        this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[8]);
                        this.selectConfig = this.numberSeriesService.getSelectConfig(
                            this.orderID, this.numberSeries, 'Customer Order number series'
                        );
                        this.projects = res[9];
                        this.sellers = res[10];
                        this.vatTypes = res[11];
                        this.departments = res[12];
                        this.setUpDims(res[13]);
                        this.paymentInfoTypes = res[14];
                        this.distributionPlans = res[15];
                        this.reports = res[16];

                        if (!!customerID && res[6] && res[6]['Distributions']
                        && res[6]['Distributions'].CustomerOrderDistributionPlanID) {
                            order.DistributionPlanID = res[6]['Distributions'].CustomerOrderDistributionPlanID;
                        } else if (this.companySettings['Distributions']) {
                            order.DistributionPlanID = this.companySettings['Distributions'].CustomerOrderDistributionPlanID;
                        }

                        order.OrderDate = new LocalDate(Date());

                        if (!order.CurrencyCodeID) {
                            order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                            order.CurrencyExchangeRate = 1;
                        }
                        this.currencyCodeID = order.CurrencyCodeID;
                        this.currencyExchangeRate = order.CurrencyExchangeRate;

                        this.refreshOrder(order);
                    },
                    err => this.errorService.handle(err)
                    );
            }
        });
    }

    public ngAfterViewInit() {
        this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => this.tradeItemTable.focusFirstRow());
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

    private getOrder(ID: number): Observable<CustomerOrder> {
        if (!ID) {
            return this.customerOrderService.GetNewEntity(
                ['DefaultDimensions'],
                CustomerOrder.EntityType
            );
        }

        return Observable.forkJoin(
            this.customerOrderService.Get(ID, this.orderExpands),
            this.customerOrderItemService.GetAll(
                `filter=CustomerOrderID eq ${ID}&hateoas=false`,
                this.orderItemExpands
            )
        ).map(res => {
            const order: CustomerOrder = res[0];
            const orderItems: CustomerOrderItem[] = res[1];

            order.Items = orderItems;
            return order;
        });
    }

    public numberSeriesChange(selectedSerie) {
        this.order.OrderNumberSeriesID = selectedSerie.ID;
    }

    private handleSaveError(error, donehandler?) {
        if (donehandler) {
            donehandler('Lagring avbrutt');
        }

        this.errorService.handle(error);
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (this.isDirty) {
            return this.modalService.openUnsavedChangesModal().onClose
                .switchMap(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        return Observable.fromPromise(this.saveOrder())
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

    public onOrderChange(order) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;

        const customerChanged: boolean = this.didCustomerChange(order);
        if (customerChanged) {
            if (order.Customer.StatusCode === StatusCode.InActive) {
                const options: IModalOptions = {message: 'Vil du aktivere kunden?'};
                this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                    if (res === ConfirmActions.ACCEPT) {
                        this.customerService.activateCustomer(order.CustomerID).subscribe(
                            response => {
                                order.Customer.StatusCode = StatusCode.Active;
                                this.onOrderChange(order);
                                this.toastService.addToast('Kunde aktivert', ToastType.good);
                            },
                            err => this.errorService.handle(err)
                        );
                    }
                    return;
                });
            }

            if (order.DeliveryTerms && order.DeliveryTerms.CreditDays) {
                this.setDeliveryDate(order);
            }

            // update currency code in detailsForm to customer's currency code
            if (order.Customer.CurrencyCodeID) {
                order.CurrencyCodeID = order.Customer.CurrencyCodeID;
            } else {
                order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }

            shouldGetCurrencyRate = true;
        }

        // refresh items if project changed
        if (order.DefaultDimensions && order.DefaultDimensions.ProjectID !== this.projectID) {
            this.projectID = order.DefaultDimensions.ProjectID;

            if (this.orderItems.length) {
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
                        .setDefaultProjectAndRefreshItems(order.DefaultDimensions.ProjectID, replaceItemsProject);
                });
            } else {
                this.tradeItemTable.setDefaultProjectAndRefreshItems(order.DefaultDimensions.ProjectID, true);
            }
        }

        // If the update comes from dimension view
        if (order['_updatedField']) {
            const dimension = order['_updatedField'].split('.');
            const dimKey = parseInt(dimension[1].substr(dimension[1].length - 3, 1), 10);
            if (!isNaN(dimKey) && dimKey >= 5) {
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, order[dimension[0]][dimension[1]]);
            } else {
                // Department, Region and Reponsibility hits here!
                this.tradeItemTable.setNonCustomDimsOnTradeItems(dimension[1], order.DefaultDimensions[dimension[1]]);
            }
        }

        this.updateCurrency(order, shouldGetCurrencyRate);

        if (
            customerChanged && this.currentCustomer &&
            this.currentCustomer['Distributions'] &&
            this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID) {
                if (order.DistributionPlanID &&
                    order.DistributionPlanID !== this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID) {
                    this.modalService.open(UniConfirmModalV2,
                        {
                            header: 'Oppdatere distribusjonsplan?',
                            buttonLabels: {
                                accept: 'Oppdater',
                                reject: 'Ikke oppdater'
                            },
                            message: 'Kunden du har valgt har en annen distribusjonsplan enn den som allerede er valgt for ' +
                            'denne ordren. Ønsker du å oppdatere distribusjonsplanen for denne ordren til å matche kundens?'
                        }
                    ).onClose.subscribe((res) => {
                        if (res === ConfirmActions.ACCEPT) {
                            order.DistributionPlanID = this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID;
                            this.toastService.addToast('Oppdatert', ToastType.good, 5, 'Distribusjonsplan oppdatert');
                            this.order = order;
                        }
                    });
                } else {
                    order.DistributionPlanID = this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID;
                    this.order = order;
                }
            } else {
                this.order = order;
            }

        this.currentOrderDate = order.OrderDate;
        this.updateSaveActions();
    }

    private updateCurrency(order: CustomerOrder, getCurrencyRate: boolean) {
        let shouldGetCurrencyRate = getCurrencyRate;

        // update currency code in detailsForm and tradeItemTable to selected currency code if selected
        // or from customer
        if ((!this.currencyCodeID && order.CurrencyCodeID) || this.currencyCodeID !== order.CurrencyCodeID) {
            this.currencyCodeID = order.CurrencyCodeID;
            this.tradeItemTable.updateAllItemVatCodes(this.currencyCodeID);
            shouldGetCurrencyRate = true;
        }

        if (this.currentOrderDate.toString() !== order.OrderDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        if (this.order && order.CurrencyCodeID !== this.order.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        if (shouldGetCurrencyRate) {
            this.getUpdatedCurrencyExchangeRate(order)
                .subscribe(res => {
                    const newCurrencyRate = res;

                    if (!this.currencyExchangeRate) {
                        this.currencyExchangeRate = 1;
                    }

                    let askUserWhatToDo: boolean = false;

                    let newTotalExVatBaseCurrency: number;
                    let diffBaseCurrency: number;
                    let diffBaseCurrencyPercent: number;

                    if (newCurrencyRate !== this.currencyExchangeRate) {
                        this.currencyExchangeRate = newCurrencyRate;
                        order.CurrencyExchangeRate = res;

                        const haveUserDefinedPrices = this.orderItems && this.orderItems.filter(
                            x => x.PriceSetByUser
                        ).length > 0;

                        if (haveUserDefinedPrices) {
                            // calculate how much the new currency will affect the amount for the base currency,
                            // if it doesnt cause a change larger than 5%, don't bother asking the user what
                            // to do, just use the set prices
                            newTotalExVatBaseCurrency = this.itemsSummaryData.SumTotalExVatCurrency * newCurrencyRate;
                            diffBaseCurrency = Math.abs(newTotalExVatBaseCurrency
                                - this.itemsSummaryData.SumTotalExVat);

                            diffBaseCurrencyPercent =
                                this.tradeItemHelper.round(
                                    (diffBaseCurrency * 100) / Math.abs(this.itemsSummaryData.SumTotalExVat), 1
                                );

                            // 5% is set as a limit for asking the user now, but this might need to be reconsidered,
                            // or make it possible to override it either on companysettings, customer,
                            // or the TOF header
                            if (diffBaseCurrencyPercent > 5) {
                                askUserWhatToDo = true;
                            }
                        }

                        if (askUserWhatToDo) {
                            const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);

                            const modalMessage = 'Endringen førte til at en ny valutakurs ble hentet. Du har '
                                + 'overstyrt en eller flere priser, og dette fører derfor til at totalsum eks. mva '
                                + `for ${baseCurrencyCode} endres med ${diffBaseCurrencyPercent}% til `
                                + `${baseCurrencyCode} ${this.numberFormat.asMoney(newTotalExVatBaseCurrency)}.\n\n`
                                + `Vil du heller rekalkulere valutaprisene basert på ny kurs og standardprisen `
                                + `på varene?`;

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
                                    this.orderItems.forEach(item => {
                                        if (item.PriceSetByUser) {
                                            this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                        } else {
                                            this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(
                                                item, this.currencyExchangeRate
                                            );
                                        }
                                    });
                                } else if (response === ConfirmActions.REJECT) {
                                    // we need to calculate the currency amounts based on the original prices
                                    // defined in the base currency
                                    this.orderItems.forEach(item => {
                                        this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(
                                            item, this.currencyExchangeRate
                                        );
                                    });
                                }

                                // make unitable update the data after calculations
                                this.orderItems = this.orderItems.concat();
                                this.recalcItemSums(this.orderItems);

                                // update the model
                                this.order = _.cloneDeep(order);
                            });

                        } else if (this.orderItems && this.orderItems.length > 0) {
                            // the currencyrate has changed, but not so much that we had to ask the user what to do,
                            // so just make an assumption what to do; recalculated based on set price if user
                            // has defined a price, and by the base currency price if the user has not set a
                            // specific price
                            this.orderItems.forEach(item => {
                                if (item.PriceSetByUser) {
                                    this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                } else {
                                    this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                }
                            });

                            // make unitable update the data after calculations
                            this.orderItems = this.orderItems.concat();
                            this.recalcItemSums(this.orderItems);

                            // update the model
                            this.order = _.cloneDeep(order);
                        } else {
                            // update
                            this.recalcItemSums(this.orderItems);

                            // update the model
                            this.order = _.cloneDeep(order);
                        }
                    }
                }, err => this.errorService.handle(err)
                );
        }
    }

    public onSellerDelete(sellerLink: SellerLink) {
        this.deletables.push(sellerLink);
    }

    private refreshOrder(order?: CustomerOrder): Promise<boolean> {
        return new Promise((resolve) => {
            const orderObservable = !!order
                ? Observable.of(order)
                : this.getOrder(this.orderID);

            orderObservable.subscribe(res => {
                if (!order) { order = res; }

                this.readonly = res.StatusCode === StatusCodeCustomerOrder.TransferredToInvoice;
                this.newOrderItem = <any>this.tradeItemHelper.getDefaultTradeItemData(order);
                this.orderItems = res.Items.sort(
                    function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
                );
                this.isDirty = false;

                this.currentCustomer = res.Customer;
                this.currentDeliveryTerm = res.DeliveryTerms;

                order.DefaultSeller = order.DefaultSeller;
                this.currentDefaultProjectID = order.DefaultDimensions.ProjectID;

                this.currentOrderDate = order.OrderDate;

                this.order = _.cloneDeep(order);
                this.updateCurrency(order, true);
                this.updateTab();
                this.updateToolbar();
                this.updateSaveActions();
                this.recalcDebouncer.next(res.Items);

                resolve(true);
            });
        });
    }

    private didCustomerChange(order: CustomerOrder): boolean {
        let change: boolean;

        if (!this.currentCustomer && !order.Customer) {
            return false;
        }

        if (order.Customer && this.currentCustomer) {
            change = order.Customer.ID !== this.currentCustomer.ID;
        } else if (order.Customer && order.Customer.ID) {
            change = true;
        }

        this.currentCustomer = order.Customer;
        return change;
    }

    private setDeliveryDate(order: CustomerOrder) {
        if (order.DeliveryTerms && order.DeliveryTerms.CreditDays) {
            order.DeliveryDate = order.OrderDate;

            if (order.DeliveryTerms.CreditDays < 0) {
                order.DeliveryDate = new LocalDate(moment(order.OrderDate).endOf('month').toDate());
            }

            order.DeliveryDate = new LocalDate(
                moment(order.DeliveryDate).add(Math.abs(order.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private getUpdatedCurrencyExchangeRate(order: CustomerOrder): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!order.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === order.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            const currencyDate: LocalDate = new LocalDate(order.OrderDate.toString());

            return this.currencyService.getCurrencyExchangeRate(
                order.CurrencyCodeID,
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
        const activeStatus = this.order.StatusCode;

        this.customerOrderService.statusTypes.forEach((status) => {
            let _state: STATUSTRACK_STATES;

            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
            }

            let addStatus: boolean = true;

            if (status.Code === StatusCodeCustomerOrder.PartlyTransferredToInvoice) {
                if (activeStatus !== status.Code) {
                    addStatus = false;
                }
            }

            if (addStatus) {
                statustrack.push({
                    title: status.Text,
                    state: _state,
                    code: status.Code
                });
            }
        });
        return statustrack;
    }

    public nextOrder() {
        this.customerOrderService.getNextID(this.order.ID).subscribe(
            (ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/orders/' + ID);
                } else {
                    this.toastService.addToast('Ikke flere ordre etter denne', ToastType.warn, 5);
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public previousOrder() {
        this.customerOrderService.getPreviousID(this.order.ID).subscribe(
            (ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/orders/' + ID);
                } else {
                    this.toastService.addToast('Ikke flere ordre før denne', ToastType.warn, 5);
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private updateTab(order?: CustomerOrder) {
        if (!order) {
            order = this.order;
        }

        let tabTitle = '';
        if (order.OrderNumber) {
            tabTitle = 'Ordrenr. ' + order.OrderNumber;
        } else {
            tabTitle = (order.ID) ? 'Ordre (kladd)' : 'Ny ordre';
        }
        this.tabService.addTab({
            url: '/sales/orders/' + order.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Orders
        });
    }

    private getToolbarSubheads() {
        if (!this.order) {
            return;
        }

        const subheads: IToolbarSubhead[] = [];

        if (this.order.RestExclusiveAmountCurrency) {
            subheads.push({
                label: 'Restbeløp',
                title: this.numberFormat.asMoney(Math.abs(this.order.RestExclusiveAmountCurrency)) + ' eks. mva'
            });
        }

        return subheads;
    }

    private updateToolbar() {
        let orderText = '';
        if (this.order.OrderNumber) {
            orderText = 'Ordrenummer. ' + this.order.OrderNumber;
        } else {
            orderText = (this.order.ID) ? 'Ordre (kladd)' : 'Ny ordre';
        }

        const customerText = (this.order.Customer)
            ? this.order.Customer.CustomerNumber + ' - ' + this.order.Customer.Info.Name
            : '';

        const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
        const selectedCurrencyCode = this.getCurrencyCode(this.currencyCodeID);

        let netSumText = '';

        if (this.itemsSummaryData) {
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat
                .asMoney(this.itemsSummaryData.SumTotalExVatCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat
                    .asMoney(this.itemsSummaryData.SumTotalExVat)}`;
            }
        } else {
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat
                .asMoney(this.order.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.order.TaxExclusiveAmount)}`;
            }
        }

        this.toolbarconfig = {
            title: orderText,
            subheads: this.getToolbarSubheads(),
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousOrder.bind(this),
                next: this.nextOrder.bind(this),
                add: () => this.order.ID ? this.router.navigateByUrl('sales/orders/0') : this.ngOnInit()
            },
            contextmenu: this.contextMenuItems,
            entityID: this.orderID,
            entityType: 'CustomerOrder'
        };

        this.updateShareActions();
    }

    private printAction(reportForm: ReportDefinition): Observable<any> {
        const savedOrder = this.isDirty
            ? Observable.fromPromise(this.saveOrder())
            : Observable.of(this.order);

        return savedOrder.switchMap((order) => {
            return this.modalService.open(UniPreviewModal, {
                data: reportForm
            }).onClose.switchMap(() => {
                return this.customerOrderService.setPrintStatus(
                    this.order.ID,
                    this.printStatusPrinted
                ).finally(() => {
                    this.order.PrintStatus = +this.printStatusPrinted;
                    this.updateToolbar();
                });
            });
        });
    }

    private sendEmailAction(reportForm: ReportDefinition, entity: CustomerOrder, entityTypeName: string, name: string): Observable<any> {
        const savedOrder = this.isDirty
            ? Observable.fromPromise(this.saveOrder())
            : Observable.of(this.order);

        return savedOrder.switchMap(order => {
            return this.emailService.sendReportEmailAction(reportForm, entity, entityTypeName, name);
        });
    }

    public chooseForm() {
        return this.modalService.open(
            UniChooseReportModal,
            {data: {
                name: 'Ordre',
                typeName: 'Order',
                entity: this.order,
                type: ReportTypeEnum.ORDER
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

    private distribute() {
        return Observable.create((obs) => {
            this.reportService.distribute(this.order.ID, this.distributeEntityType).subscribe(() => {
                this.toastService.addToast(
                    'Ordre er lagt i kø for distribusjon',
                    ToastType.good,
                    ToastTime.short);
                obs.complete();
            }, err => {
                this.errorService.handle(err);
                obs.complete();
            });
        });
    }

    private updateShareActions() {
        this.shareActions = [
            {
                label: 'Skriv ut / send e-post',
                action: () => this.chooseForm(),
                disabled: () => !this.order.ID
            },
            {
                label: 'Distribuer',
                action: () => this.distribute(),
                disabled: () => !this.order.ID
            }
        ];
    }

    private updateSaveActions() {
        const transitions = (this.order['_links'] || {}).transitions;
        const printStatus = this.order.PrintStatus;

        this.saveActions = [];

        this.saveActions.push({
            label: 'Registrer',
            action: (done) => {
                if (this.order.ID) {
                    this.saveOrderTransition(done, 'register', 'Registrert');
                } else {
                    this.saveOrder().then(res => {
                        done('Ordre registrert');
                        this.isDirty = false;
                        this.router.navigateByUrl('/sales/orders/' + res.ID);
                    }).catch(error => {
                        this.handleSaveError(error, done);
                    });
                }
            },
            disabled: transitions && !transitions['register'] || !this.currentCustomer,
            main: (!transitions || transitions['register']) && !printStatus
        });

        if (!this.order.ID) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: (done) => {
                    this.order.StatusCode = StatusCode.Draft;
                    this.saveOrder().then(res => {
                        done('Lagring fullført');
                        this.isDirty = false;
                        this.router.navigateByUrl('/sales/orders/' + res.ID);
                    }).catch(error => {
                        this.handleSaveError(error, done);
                    });
                },
                disabled: false
            });
        }

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                this.saveOrder().then(res => {
                    done('Lagring fullført');
                    this.orderID = res.ID;
                    this.refreshOrder();
                }).catch(error => {
                    this.handleSaveError(error, done);
                });
            },
            main: this.isDirty || (this.order.ID && printStatus === 100),
            disabled: !this.order.ID
        });

        this.saveActions.push({
            label: 'Ny basert på',
            action: (done) => {
                this.newBasedOn().then(res => {
                    done('Ordre kopiert');
                }).catch(error => {
                    done(error);
                });
            },
            disabled: false
        });

        this.saveActions.push({
            label: 'Lagre og overfør til faktura',
            action: (done) => this.saveAndTransferToInvoice(done),
            disabled: !transitions || !transitions['transferToInvoice']
        });

        this.saveActions.push({
            label: 'Avslutt ordre',
            action: (done) => this.saveOrderTransition(done, 'complete', 'Ordre avsluttet'),
            disabled: !transitions || !transitions['complete']
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteOrder(done),
            disabled: this.order.StatusCode !== StatusCodeCustomerOrder.Draft
        });
    }

    private recalcItemSums(orderItems: any) {
        const items = orderItems && orderItems.filter(item => !item.Deleted);
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

        this.updateToolbar();
    }

    private newBasedOn(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.order.ID) {
                resolve(true);
                this.router.navigateByUrl('sales/orders/' + this.order.ID + ';copy=true');
            } else {
                const config = {
                    service: this.customerOrderService,
                    moduleName: 'Order',
                    label: 'Ordrenr'
                };

                this.modalService.open(UniTofSelectModal, { data: config }).onClose.subscribe((id: number) => {
                    if (id) {
                        resolve(id);
                        this.router.navigateByUrl('sales/orders/' + id + ';copy=true');
                    } else {
                        reject('Kopiering avbrutt');
                    }

                });
            }
        });
    }

    private copyOrder(order: CustomerOrder): CustomerOrder {
        order.ID = 0;
        order.OrderNumber = null;
        order.OrderNumberSeriesID = null;
        order.StatusCode = null;
        order.PrintStatus = null;
        order.Comment = null;
        delete order['_links'];

        order.Sellers = order.Sellers.map(item => {
            item.CustomerOrderID = null;
            return item;
        });

        order.Items = order.Items.map((item: CustomerOrderItem) => {
            item.CustomerOrderID = 0;
            item.ID = 0;
            item.StatusCode = null;
            return item;
        });

        return order;
    }

    private saveOrder(): Promise<CustomerOrder> {
        this.order.Items = this.tradeItemHelper.prepareItemsForSave(this.orderItems);

        if (this.order.DefaultDimensions && !this.order.DefaultDimensions.ID) {
            this.order.DefaultDimensions._createguid = this.customerOrderService.getNewGuid();
        }

        if (this.order.DefaultSeller && this.order.DefaultSeller.ID > 0) {
            this.order.DefaultSellerID = this.order.DefaultSeller.ID;
        }

        if (this.order.DefaultSeller && this.order.DefaultSeller.ID === null) {
            this.order.DefaultSeller = null;
            this.order.DefaultSellerID = null;
        }

        // add deleted sellers back to 'Sellers' to delete with 'Deleted' property, was sliced locally/in view
        if (this.deletables) {
            this.deletables.forEach(sellerLink => this.order.Sellers.push(sellerLink));
        }

        return new Promise((resolve, reject) => {
            const saveRequest = ((this.order.ID > 0)
                ? this.customerOrderService.Put(this.order.ID, this.order)
                : this.customerOrderService.Post(this.order));

            this.checkCurrencyAndVatBeforeSave().subscribe(canSave => {
                if (canSave) {
                    saveRequest.subscribe(
                        res => {
                            if (res.OrderNumber) { this.selectConfig = undefined; }
                            this.updateTab(res);
                            resolve(res);
                        },
                        err => reject(err)
                    );
                } else {
                    reject('Endre MVA kode og lagre på ny');
                }
            });
        });
    }

    private checkCurrencyAndVatBeforeSave(): Observable<boolean> {
        if (this.order.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
            const linesWithVat = this.order.Items.filter(x => x.SumVatCurrency > 0);
            if (linesWithVat.length > 0) {
                const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                    + `${this.getCurrencyCode(this.order.CurrencyCodeID)} som valuta?`;

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

    private saveAndTransferToInvoice(done: any) {
        if (!this.order.Customer) {
            this.toastService.addToast('Kan ikke overføre ordre uten kunde', ToastType.warn, 5);
            done('');
            return;
        }

        // save order and open modal to select what to transfer to invoice
        this.saveOrder().then(success => {
            done('Ordre lagret');
            this.isDirty = false;

            this.modalService.open(UniOrderToInvoiceModal, {
                data: this.order.ID
            }).onClose.subscribe(order => {
                if (order && order.Items && order.Items.length) {
                    this.customerOrderService.ActionWithBody(
                        order.ID,
                        order,
                        'transfer-to-invoice'
                    ).subscribe(
                        res => this.router.navigateByUrl('/sales/invoices/' + res.ID),
                        err => this.errorService.handle(err)
                    );
                }
            });
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private saveOrderTransition(done: any, transition: string, doneText: string) {
        if (this.order.Customer.OrgNumber && !this.modulusService.isValidOrgNr(this.order.Customer.OrgNumber)) {
            return this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft kunde',
                message: `Ugyldig org.nr. '${this.order.Customer.OrgNumber}' på kunde. Vil du fortsette?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(
                response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.saveOrder().then((order) => {
                            this.customerOrderService.Transition(order.ID, this.order, transition).subscribe(
                                (res) => {
                                    this.selectConfig = undefined;
                                    this.refreshOrder()
                                        .then(() => done(doneText));
                                },
                                (err) => {
                                    done('Lagring feilet');
                                    this.errorService.handle(err);
                                }
                            );
                        }).catch(error => {
                            this.handleSaveError(error, done);
                        });
                    }
                    return done();
                }
            );
        }
        this.saveOrder().then((order) => {
            this.customerOrderService.Transition(order.ID, this.order, transition).subscribe(
                (res) => {
                    this.selectConfig = undefined;
                    this.refreshOrder()
                        .then(() => done(doneText));
                },
                (err) => {
                    done('Lagring feilet');
                    this.errorService.handle(err);
                }
            );
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private deleteOrder(done) {
        this.customerOrderService.Remove(this.order.ID, null).subscribe(
            (success) => {
                this.isDirty = false;
                this.router.navigateByUrl('/sales/orders');
            },
            (err) => {
                this.errorService.handle(err);
                done('Sletting feilet');
            }
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
}
