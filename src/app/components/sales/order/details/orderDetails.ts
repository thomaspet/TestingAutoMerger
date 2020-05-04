import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, throwError, of} from 'rxjs';

import {
    UniModalService,
    ConfirmActions,
    IModalOptions,
    UniConfirmModalV2,
} from '@uni-framework/uni-modal';
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
    StatusCodeCustomerOrder,
    NumberSeries,
    VatType,
    Department,
    User,
    Contact, CustomerInvoiceItem,
} from '@uni-entities';
import {
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
    UserService,
    NumberSeriesService,
    SellerService,
    VatTypeService,
    DimensionSettingsService,
    CustomDimensionService,
    PaymentInfoTypeService,
    ModulusService,
    InvoiceHourService,
    AccountMandatoryDimensionService,
} from '@app/services/services';

import {IUniSaveAction} from '@uni-framework/save/save';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {TradeHeaderCalculationSummary} from '@app/models/sales/TradeHeaderCalculationSummary';

import {IToolbarConfig, ICommentsConfig, IToolbarSubhead} from '../../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';

import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniTofSelectModal} from '../../common/tofSelectModal';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper, ISummaryLine} from '../../salesHelper/tradeItemHelper';

import {UniOrderToInvoiceModal} from '../orderToInvoiceModal';
import {UniChooseOrderHoursModal} from '@app/components/sales/order/modal/chooseOrderHoursModal';
import {AuthService} from '@app/authService';

import * as moment from 'moment';
import {cloneDeep} from 'lodash';
import {TofReportModal} from '../../common/tof-report-modal/tof-report-modal';
import {switchMap, tap, catchError, map} from 'rxjs/operators';

@Component({
    selector: 'order-details',
    templateUrl: './orderDetails.html',
    styleUrls: ['./orderDetails.sass']
})
export class OrderDetails implements OnInit, AfterViewInit {
    @ViewChild(TofHead, { static: true }) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() orderID: any;

    private companySettings: CompanySettings;
    itemsSummaryData: TradeHeaderCalculationSummary;
    private isDirty: boolean;
    private distributeEntityType: string = 'Models.Sales.CustomerOrder';
    private numberSeries: NumberSeries[];
    private projectID: number;
    private askedAboutSettingDimensionsOnItems: boolean = false;
    newOrderItem: CustomerOrderItem;
    order: CustomerOrder;
    orderItems: CustomerOrderItem[];

    saveActions: IUniSaveAction[] = [];

    currencyInfo: string;
    summaryLines: ISummaryLine[];

    commentsConfig: ICommentsConfig;
    toolbarconfig: IToolbarConfig;
    vatTypes: VatType[];
    currencyCodes: Array<CurrencyCode>;
    currencyCodeID: number;
    currencyExchangeRate: number;
    private currentCustomer: Customer;
    currentUser: User;

    projects: Project[];
    departments: Department[];
    selectConfig: any;

    sellers: Seller[];
    contacts: Contact[];

    private currentOrderDate: LocalDate;
    dimensionTypes: any[];
    paymentInfoTypes: any[];
    distributionPlans: any[];
    reports: any[];
    canSendEHF: boolean = false;
    hoursOnOrderCount: number = 0;
    nonTransferredHoursOnOrderCount: number = 0;
    private transferredWorkItemIDs: number[] = [];

    readonly: boolean;
    recalcDebouncer: EventEmitter<any> = new EventEmitter();
    hasTimetrackingAccess: boolean = false;
    accountsWithMandatoryDimensionsIsUsed = true;

    isDistributable = false;

    private customerExpands: string[] = [
        'DeliveryTerms',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
        'Dimensions.Project.ProjectTasks',
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.InvoiceAddress',
        'Info.ShippingAddress',
        'Info.Contacts.Info',
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
        'Customer.Info.Contacts.Info',
        'Customer.Dimensions',
        'Customer.Dimensions.Project',
        'Customer.Dimensions.Department',
        'Customer.Dimensions.Dimension5',
        'Customer.Dimensions.Dimension6',
        'Customer.Dimensions.Dimension7',
        'Customer.Dimensions.Dimension8',
        'Customer.Dimensions.Dimension9',
        'Customer.Dimensions.Dimension10',
        'Customer.Distributions',
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
        'Dimensions.Info',
        'Account',
        'Dimensions.Project.ProjectTasks',
    ];

    constructor(
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
        private toastService: ToastService,
        private tofHelper: TofHelper,
        private tradeItemHelper: TradeItemHelper,
        private userService: UserService,
        private numberSeriesService: NumberSeriesService,
        private sellerService: SellerService,
        private vatTypeService: VatTypeService,
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private paymentInfoTypeService: PaymentInfoTypeService,
        private modulusService: ModulusService,
        private invoiceHoursService: InvoiceHourService,
        private authService: AuthService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService
   ) {}

    ngOnInit() {
        // this.setSums();
        this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe((result) => {
            this.accountsWithMandatoryDimensionsIsUsed = result > 0;
        });

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
                entityID: !hasCopyParam ? this.orderID : 0
            };

            this.authService.authentication$.take(1).subscribe(authDetails => {
                this.hasTimetrackingAccess = this.authService.hasUIPermission(authDetails.user, 'ui_timetracking');
                if (this.orderID) {
                    Observable.forkJoin(
                        this.getOrder(this.orderID),
                        this.companySettingsService.Get(1, ['APOutgoing']),
                        this.currencyCodeService.GetAll(null),
                        this.projectService.GetAll(null),
                        this.sellerService.GetAll(null),
                        this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                        this.departmentService.GetAll(null),
                        this.dimensionsSettingsService.GetAll(null),
                        this.paymentInfoTypeService.GetAll(null),
                        this.reportService.getDistributions(this.distributeEntityType),
                        this.reportDefinitionService.GetAll('filter=ReportType eq 2'),
                        this.hasTimetrackingAccess
                            ? this.invoiceHoursService.getInvoicableHoursOnOrder(this.orderID).catch(() => Observable.of([]))
                            : Observable.of([]),
                    ).subscribe(res => {
                        const order = <CustomerOrder>res[0];
                        this.askedAboutSettingDimensionsOnItems = false;
                        if (order && order.Customer && order.Customer.Info) {
                            this.contacts = order.Customer.Info.Contacts;
                        } else {
                            this.contacts = [];
                        }
                        this.companySettings = res[1];

                        this.canSendEHF = this.companySettings.APActivated
                            && this.companySettings.APOutgoing
                            && this.companySettings.APOutgoing.some(format => {
                            return format.Name === 'EHF INVOICE 2.0';
                        });

                        this.currencyCodes = res[2];
                        this.projects = res[3];
                        this.sellers = res[4];
                        this.vatTypes = res[5];
                        this.departments = res[6];
                        this.setUpDims(res[7]);
                        this.paymentInfoTypes = res[8];
                        this.distributionPlans = res[9];
                        this.reports = res[10];
                        if (res[11] && res[11][0]) {
                            this.hoursOnOrderCount = res[11][0].SumMinutes / 60;
                            this.nonTransferredHoursOnOrderCount = res[11][0]['SumNotTransfered'] / 60;
                        }

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
                            if (!this.currentCustomer && order.Customer) {
                                this.currentCustomer = order.Customer;
                            }
                            this.refreshOrder(this.copyOrder(order));
                        } else {
                            this.refreshOrder(order);
                        }

                        this.tofHead.focus();
                        if (this.accountsWithMandatoryDimensionsIsUsed && order.CustomerID) {
                            this.tofHead.getValidationMessage(order.CustomerID, order.DefaultDimensionsID);
                        }
                    },
                        err => this.errorService.handle(err));
                } else {
                    Observable.forkJoin(
                        this.getOrder(0),
                        this.userService.getCurrentUser(),
                        this.companySettingsService.Get(1),
                        this.currencyCodeService.GetAll(null),
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
                            this.askedAboutSettingDimensionsOnItems = false;
                            let order = <CustomerOrder>res[0];
                            this.currentUser = res[1];
                            order.OurReference = this.currentUser.DisplayName;
                            this.companySettings = res[2];
                            this.currencyCodes = res[3];
                            this.contacts = [];
                            if (res[4]) {
                                order = this.tofHelper.mapCustomerToEntity(res[4], order);
                                this.contacts = order.Customer.Info.Contacts;
                            }
                            if (res[5]) {
                                order.DefaultDimensions = order.DefaultDimensions || new Dimensions();
                                order.DefaultDimensions.ProjectID = res[5].ID;
                                order.DefaultDimensions.Project = res[5];
                            }
                            this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[6]);
                            this.selectConfig = this.numberSeriesService.getSelectConfig(
                                this.orderID, this.numberSeries, 'Customer Order number series'
                            );
                            this.projects = res[7];
                            this.sellers = res[8];
                            this.vatTypes = res[9];
                            this.departments = res[10];
                            this.setUpDims(res[11]);
                            this.paymentInfoTypes = res[12];
                            this.distributionPlans = res[13];
                            this.reports = res[14];

                            if (!!customerID && res[4] && res[4]['Distributions']
                            && res[4]['Distributions'].CustomerOrderDistributionPlanID) {
                                order.DistributionPlanID = res[4]['Distributions'].CustomerOrderDistributionPlanID;
                            } else if (this.companySettings['Distributions']) {
                                order.DistributionPlanID = this.companySettings['Distributions'].CustomerOrderDistributionPlanID;
                            }

                            order.OrderDate = new LocalDate(Date());
                            if (order.DeliveryTerms && order.DeliveryTerms.CreditDays) {
                                this.setDeliveryDate(order);
                            } else {
                                order.DeliveryDate = null;
                            }

                            if (!order.CurrencyCodeID) {
                                order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                                order.CurrencyExchangeRate = 1;
                            }
                            this.currencyCodeID = order.CurrencyCodeID;
                            this.currencyExchangeRate = order.CurrencyExchangeRate;

                            this.refreshOrder(order);
                            if (this.accountsWithMandatoryDimensionsIsUsed) {
                                this.tofHead.clearValidationMessage();
                            }
                        },
                        err => this.errorService.handle(err)
                    );
                }
            });
        });
    }

    ngAfterViewInit() {
        this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => this.tradeItemTable.focusFirstRow());
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

    private getOrder(ID: number): Observable<CustomerOrder> {
        if (!ID) {
            return this.customerOrderService.GetNewEntity(
                ['DefaultDimensions'],
                CustomerOrder.EntityType
            );
        }

        return Observable.forkJoin(
            this.customerOrderService.Get(ID, this.orderExpands, true),
            this.customerOrderItemService.GetAll(
                `filter=CustomerOrderID eq ${ID}&hateoas=false`,
                this.orderItemExpands
            )
        ).map(res => {
            const order: CustomerOrder = res[0];
            const orderItems: CustomerOrderItem[] = res[1].map(item => {
                if (item.Dimensions) {
                    item.Dimensions = this.customDimensionService.mapDimensionInfoToDimensionObject(item.Dimensions);
                }
                return item;
            });

            order.Items = orderItems;
            return order;
        });
    }

    numberSeriesChange(selectedSerie) {
        this.order.OrderNumberSeriesID = selectedSerie.ID;
    }

    private handleSaveError(error, donehandler?) {
        if (donehandler) {
            donehandler('Lagring avbrutt');
        }

        this.errorService.handle(error);
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal().onClose.pipe(
            switchMap(result => {
                if (result === ConfirmActions.ACCEPT) {
                    return this.saveOrder(false).pipe(
                        map(res => !!res),
                        catchError(err => {
                            this.errorService.handle(err);
                            return of(false);
                        })
                    );
                }

                return of(result !== ConfirmActions.CANCEL);
            })
        );
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

    updateContacts(order) {
        if (this.currentCustomer && this.currentCustomer.Info) {
            this.contacts = this.currentCustomer.Info.Contacts;
        } else if (order.Customer && order.Customer.Info && order.Customer.Info.Contacts) {
            this.contacts = order.Customer.Info.Contacts;
        } else {
            this.contacts = [];
        }
    }

    onOrderChange(order) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;
        this.updateContacts(order);
        const customerChanged: boolean = this.didCustomerChange(order);
        if (customerChanged) {
            if ((!order.Customer.ID || order.Customer.ID === 0) && order.Customer.OrgNumber !== null) {
                this.customerService.getCustomers(order.Customer.OrgNumber).subscribe(res => {
                    if (res.Data.length > 0) {
                        let orgNumberUses = 'Det finnes allerede kunde med dette organisasjonsnummeret registrert i UE: <br><br>';
                        res.Data.forEach(function (ba) {
                            orgNumberUses += ba.CustomerNumber + ' ' + ba.Name + ' <br>';
                        });
                        this.toastService.addToast('', ToastType.warn, 60, orgNumberUses);
                    }
                }, err => this.errorService.handle(err));
            }

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
            this.tradeItemTable.setDefaultProjectAndRefreshItems(order.DefaultDimensions, true);
            if (this.accountsWithMandatoryDimensionsIsUsed && order.CustomerID) {
                this.tofHead.getValidationMessage(order.CustomerID, order.DefaultDimensionsID, order.DefaultDimensions);
            }
        }

        if (order['_updatedField']) {
            this.tradeItemTable.setDefaultProjectAndRefreshItems(order.DefaultDimensions, false);
            this.newOrderItem = <any>this.tradeItemHelper.getDefaultTradeItemData(order);

            const dimension = order['_updatedField'].split('.');

            if (order['_updatedFields'] && order['_updatedFields'].toString().includes('Dimension')) {
                this.askedAboutSettingDimensionsOnItems = false;
            }


            const dimKey = parseInt(dimension[1].substr(dimension[1].length - 3, 1), 10);
            if (!isNaN(dimKey) && dimKey >= 5) {
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, order[dimension[0]][dimension[1]], this.askedAboutSettingDimensionsOnItems);
                this.askedAboutSettingDimensionsOnItems = true;
            } else {
                // Project, Department, Region and Reponsibility hits here!
                this.tradeItemTable.setNonCustomDimsOnTradeItems(dimension[1], order.DefaultDimensions[dimension[1]], this.askedAboutSettingDimensionsOnItems);
                this.askedAboutSettingDimensionsOnItems = true;
            }
            if (this.accountsWithMandatoryDimensionsIsUsed && order.CustomerID) {
                this.tofHead.getValidationMessage(order.CustomerID, null, order.DefaultDimensions);
            }
        }

        order.CurrencyCodeID = order.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID;
        this.currencyCodeID = order.CurrencyCodeID;

        this.updateCurrency(order, shouldGetCurrencyRate);

        if (
            customerChanged && this.currentCustomer &&
            this.currentCustomer['Distributions'] &&
            this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID
        ) {
            if (order.DistributionPlanID &&
                order.DistributionPlanID !== this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID) {
                this.modalService.open(UniConfirmModalV2,
                    {
                        header: 'Oppdatere utsendelsesplan?',
                        buttonLabels: {
                            accept: 'Oppdater',
                            reject: 'Ikke oppdater'
                        },
                        message: 'Kunden du har valgt har en annen utsendelsesplan enn den som allerede er valgt for ' +
                        'denne ordren. Ønsker du å oppdatere utsendelsesplanen for denne ordren til å matche kundens?'
                    }
                ).onClose.subscribe((res) => {
                    if (res === ConfirmActions.ACCEPT) {
                        order.DistributionPlanID = this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID;
                        this.toastService.addToast('Oppdatert', ToastType.good, 5, 'Utsendelsesplan oppdatert');
                        this.order = order;
                    }
                });
            } else {
                order.DistributionPlanID = this.currentCustomer['Distributions'].CustomerOrderDistributionPlanID;
            }
        }
        this.order = order;
        this.currentOrderDate = order.OrderDate;
        this.updateSaveActions();
    }

    onFreetextChange() {
        // Stupid data flow requires this
        this.order = cloneDeep(this.order);
        this.isDirty = true;
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
                                this.order = cloneDeep(order);
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
                            this.order = cloneDeep(order);
                        } else {
                            // update
                            this.recalcItemSums(this.orderItems);

                            // update the model
                            this.order = cloneDeep(order);
                        }
                    }
                }, err => this.errorService.handle(err)
                );
        }
    }

    private refreshOrder(order?: CustomerOrder): Promise<boolean> {
        return new Promise((resolve) => {
            const orderObservable = !!order
                ? Observable.of(order)
                : this.getOrder(this.orderID);

            Observable.forkJoin(
                orderObservable,
                this.hasTimetrackingAccess
                    ? this.invoiceHoursService.getInvoicableHoursOnOrder(this.orderID).catch(() => Observable.of([]))
                    : Observable.of([]),
                ).subscribe(res => {
                if (!order) { order = res[0]; }

                this.readonly = res[0].StatusCode === StatusCodeCustomerOrder.TransferredToInvoice;
                this.newOrderItem = <any>this.tradeItemHelper.getDefaultTradeItemData(order);
                this.orderItems = res[0].Items.sort(
                    function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
                );
                this.isDirty = false;

                this.currentCustomer = res[0].Customer;

                order.DefaultSeller = order.DefaultSeller;

                this.currentOrderDate = order.OrderDate;

                if (res[1] && res[1][0]) {
                    this.hoursOnOrderCount = res[1][0].SumMinutes / 60;
                    this.nonTransferredHoursOnOrderCount = res[1][0]['SumNotTransfered'] / 60;
                }

                this.order = cloneDeep(order);

                this.recalcItemSums(order.Items);
                this.updateCurrency(order, true);

                if (this.tradeItemTable) {
                    this.tradeItemTable.getMandatoryDimensionsReports();
                }

                this.isDistributable = this.tofHelper.isDistributable('CustomerOrder', this.order, this.companySettings, this.distributionPlans);

                this.updateTab();
                this.updateToolbar();
                this.updateSaveActions();

                resolve(true);
            });
        });
    }

    private didCustomerChange(order: CustomerOrder): boolean {
        let change: boolean;

        if (!this.currentCustomer && !order.Customer) {
            return false;
        }

        if (!this.currentCustomer && order.Customer.ID === 0) {
            change = true;
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

    private nextOrder() {
        this.customerOrderService.getNextID(this.order.ID).subscribe(
            (ID) => {
                if (ID) {
                    this.hoursOnOrderCount = 0;
                    this.nonTransferredHoursOnOrderCount = 0;
                    this.router.navigateByUrl('/sales/orders/' + ID);
                } else {
                    this.toastService.addToast('Ikke flere ordre etter denne', ToastType.warn, 5);
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private previousOrder() {
        this.customerOrderService.getPreviousID(this.order.ID).subscribe(
            (ID) => {
                if (ID) {
                    this.hoursOnOrderCount = 0;
                    this.nonTransferredHoursOnOrderCount = 0;
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
        if (!this.order || !this.order.ID) {
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

        const config: IToolbarConfig = {
            title: orderText,
            subheads: this.getToolbarSubheads(),
            statustrack: this.getStatustrackConfig(),
            hideDisabledActions: true,
            navigation: {
                prev: this.previousOrder.bind(this),
                next: this.nextOrder.bind(this),
            },
            entityID: this.orderID,
            entityType: 'CustomerOrder',
            buttons: [{
                class: 'icon-button',
                icon: 'remove_red_eye',
                action: () => this.preview(),
                tooltip: 'Forhåndsvis'
            }]
        };

        if (this.order.ID) {
            config.buttons.push({
                label: 'Ny ordre',
                action: () => this.router.navigateByUrl('sales/orders/0')
            });
        } else {
            config.buttons.push({
                label: 'Lagre kladd',
                action: () => {
                    this.order.StatusCode = StatusCode.Draft;
                    return this.saveOrder();
                }
            });
        }

        this.toolbarconfig = config;
    }

    private preview() {
        const openPreview = (order) => {
            return this.modalService.open(TofReportModal, {
                data: {
                    entityLabel: 'Ordre',
                    entityType: 'CustomerOrder',
                    entity: order,
                    reportType: ReportTypeEnum.ORDER,
                    hideEmailButton: true,
                    hidePrintButton: true
                }
            }).onClose;
        };

        if (this.isDirty) {
            if (!this.order.ID) {
                this.order.StatusCode = StatusCode.Draft;
            }

            return this.saveOrder().pipe(
                switchMap(order => openPreview(order))
            );
        } else {
            return openPreview(this.order);
        }
    }

    private printOrEmail() {
        return this.modalService.open(TofReportModal, {
            data: {
                entityLabel: 'Ordre',
                entityType: 'CustomerOrder',
                entity: this.order,
                reportType: ReportTypeEnum.ORDER
            }
        }).onClose.map(selectedAction => {
            let printStatus;
            if (selectedAction === 'print') {
                printStatus = '200';
            } else if (selectedAction === 'email') {
                printStatus = '100';
            }

            if (printStatus) {
                this.customerOrderService.setPrintStatus(this.order.ID, printStatus).subscribe(
                    () => {
                        this.order.PrintStatus = +printStatus;
                        this.updateToolbar();
                    },
                    err => console.error(err)
                );
            }
        });
    }

    private updateSaveActions() {
        const transitions = (this.order['_links'] || {}).transitions;
        const printStatus = this.order.PrintStatus;
        this.saveActions = [];

        if (!transitions || transitions['register']) {
            this.saveActions.push({
                label: 'Registrer',
                action: (done) => {
                    if (this.order.ID) {
                        this.transition(done, 'register');
                    } else {
                        this.saveOrder().subscribe(
                            () => done(),
                            err => {
                                this.errorService.handle(err);
                                done();
                            }
                        );
                    }
                },
                disabled: !this.currentCustomer,
                main: !printStatus
            });
        }

        if (this.order.ID) {
            this.saveActions.push({
                label: 'Lagre',
                action: (done) => {
                    this.saveOrder().subscribe(
                        () => done(),
                        err => {
                            this.errorService.handle(err);
                            done();
                        }
                    );
                },
                main: this.isDirty || (this.order.ID && printStatus === 100),
            });

            if (this.isDistributable) {
                this.saveActions.push({
                    label: 'Send via utsendelsesplan',
                    action: (done) => {
                        this.reportService.distribute(this.order.ID, this.distributeEntityType).subscribe(
                            () => {
                                this.toastService.toast({
                                    title: 'Ordre er lagt i kø for utsendelse',
                                    type: ToastType.good,
                                    duration: ToastTime.short
                                });

                                done();
                            },
                            err => {
                                this.errorService.handle(err);
                                done();
                            }
                        );
                    }
                });
            }

            this.saveActions.push({
                label: 'Skriv ut / send e-post',
                action: (done) => this.printOrEmail().subscribe(() => done()),
            });
        }

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
            action: (done) => this.transition(done, 'complete'),
            disabled: !transitions || !transitions['complete']
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteOrder(done),
            disabled: this.order.StatusCode !== StatusCodeCustomerOrder.Draft
        });
    }

    private recalcItemSums(orderItems: CustomerOrderItem[] = null) {
        const items = orderItems && orderItems.filter(item => !item.Deleted);
        const decimals = this.tradeItemHelper.getCompanySettingsNumberOfDecimals(this.companySettings, this.currencyCodeID);

        this.itemsSummaryData = items && items.length
            ? this.tradeItemHelper.calculateTradeItemSummaryLocal(items, decimals)
            : undefined;

        if (this.itemsSummaryData) {
            this.summaryLines = this.tradeItemHelper.getSummaryLines(items, this.itemsSummaryData);
        } else {
            this.summaryLines = [];
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

        if (this.currentCustomer && this.currentCustomer.Info) {
            order.CustomerName = this.currentCustomer.Info.Name;
            if (this.currentCustomer.Info.Addresses && this.currentCustomer.Info.Addresses.length > 0) {
                var address = this.currentCustomer.Info.Addresses[0];
                if (this.currentCustomer.Info.InvoiceAddressID) {
                    address = this.currentCustomer.Info.Addresses.find(x => x.ID == this.currentCustomer.Info.InvoiceAddressID);
                }
                order.InvoiceAddressLine1 = address.AddressLine1;
                order.InvoiceAddressLine2 = address.AddressLine2;
                order.InvoiceAddressLine3 = address.AddressLine3;
                order.InvoicePostalCode = address.PostalCode;
                order.InvoiceCity = address.City;
                order.InvoiceCountry = address.Country;
                order.InvoiceCountryCode = address.CountryCode;

                if (this.currentCustomer.Info.ShippingAddressID) {
                    address = this.currentCustomer.Info.Addresses.find(x => x.ID == this.currentCustomer.Info.ShippingAddressID);
                }
                order.ShippingAddressLine1 = address.AddressLine1;
                order.ShippingAddressLine2 = address.AddressLine2;
                order.ShippingAddressLine3 = address.AddressLine3;
                order.ShippingPostalCode = address.PostalCode;
                order.ShippingCity = address.City;
                order.ShippingCountry = address.Country;
                order.ShippingCountryCode = address.CountryCode;
            }
        }
        return order;
    }

    private saveOrder(reloadAfterSave = true): Observable<CustomerOrder> {
        this.order.Items = this.tradeItemHelper.prepareItemsForSave(this.orderItems);
        this.order = this.tofHelper.beforeSave(this.order);

        return this.checkCurrencyAndVatBeforeSave().pipe(switchMap(canSave => {
            if (!canSave) {
                return throwError('Lagring avbrutt');
            }

            const navigateAfterSave = !this.order.ID;
            const saveRequest = this.order.ID > 0
                ? this.customerOrderService.Put(this.order.ID, this.order)
                : this.customerOrderService.Post(this.order);

            return saveRequest.pipe(switchMap(order => {
                this.isDirty = false;
                if (reloadAfterSave) {
                    if (navigateAfterSave) {
                        this.router.navigateByUrl('sales/orders/' + order.ID);
                        return of(order);
                    } else {
                        return this.getOrder(order.ID).pipe(
                            tap(res => this.refreshOrder(res))
                        );
                    }
                } else {
                    return of(order);
                }
            }));
        }));
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

        this.saveOrder(false).subscribe(
            order => {
                this.modalService.open(UniOrderToInvoiceModal, {
                    data: this.order.ID
                }).onClose.subscribe(res => {
                    if (res && res.Items && res.Items.length) {
                        this.customerOrderService.ActionWithBody(res.ID, res, 'transfer-to-invoice').subscribe(
                            invoice => this.router.navigateByUrl('/sales/invoices/' + invoice.ID),
                            err => {
                                this.errorService.handle(err);
                                this.getOrder(order.ID).subscribe(
                                    updatedOrder => {
                                        this.refreshOrder(updatedOrder);
                                        done();
                                    },
                                    error => {
                                        console.error(error);
                                        done();
                                    }
                                );
                            }
                        );
                    } else {
                        done();
                    }
                });
            },
            err => {
                this.errorService.handle(err);
                done();
            }
        );
    }

    private transition(doneCallback, transition: string) {
        const orgNumber = this.order.Customer && this.order.Customer.OrgNumber;
        let canTransitionCheck = of(true);
        if (orgNumber && !this.modulusService.isValidOrgNr(orgNumber)) {
            canTransitionCheck = this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft kunde',
                message: `Ugyldig org.nr. '${orgNumber}' på kunde. Vil du fortsette?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
        }

        canTransitionCheck.subscribe(canTransition => {
            if (!canTransition) {
                doneCallback();
                return;
            }

            this.saveOrder(false).subscribe(
                order => {
                    const refreshOrder = () => {
                        this.getOrder(order.ID).subscribe(
                            updatedOrder => {
                                this.refreshOrder(updatedOrder);
                                doneCallback();
                            },
                            err => {
                                console.error(err);
                                this.refreshOrder(order);
                                doneCallback();
                            }
                        );
                    };

                    this.customerOrderService.Transition(order.ID, this.order, transition).subscribe(
                        () => {
                            this.selectConfig = undefined;
                            refreshOrder();
                        },
                        err => {
                            this.errorService.handle(err);
                            refreshOrder();
                        }
                    );
                },
                err => {
                    this.errorService.handle(err);
                    doneCallback();
                }
            );
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

    openModal() {
        this.modalService.open(UniChooseOrderHoursModal, {
            data: {
                order: this.order,
                settings: this.companySettings,
                vatTypes: this.vatTypes,
                transferredHoursIDs: this.transferredWorkItemIDs
            },
            closeOnClickOutside: false,
            closeOnEscape: true,
            header: 'Overføring av timer 1/2',
        }).onClose.subscribe((result: {items: CustomerOrderItem[], transferredHoursIDs: number[]}) => {
            if (result && result.items) {
                this.orderItems = result.items;
                this.transferredWorkItemIDs = result.transferredHoursIDs;
                this.isDirty = true;
                this.updateSaveActions();
                this.recalcItemSums(this.orderItems);
            }
        });
    }

    onTradeItemsChange() {
        this.order.Items = this.orderItems;
        this.order = cloneDeep(this.order);
        this.recalcDebouncer.emit(this.orderItems);
    }
}
