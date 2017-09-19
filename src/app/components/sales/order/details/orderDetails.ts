import {Component, EventEmitter, HostListener, Input, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

import {
    UniModalService,
    UniSendEmailModal,
    ConfirmActions
} from '../../../../../framework/uniModal/barrel';
import {
    Address,
    CompanySettings,
    CurrencyCode,
    Customer,
    CustomerOrder,
    CustomerOrderItem,
    LocalDate,
    Project,
    StatusCodeCustomerOrder,
    Terms,
    NumberSeries
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
    NumberSeriesService
} from '../../../../services/services';

import {IUniSaveAction} from '../../../../../framework/save/save';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

import {GetPrintStatusText} from '../../../../models/printStatus';
import {SendEmail} from '../../../../models/sendEmail';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {ISummaryConfig} from '../../../common/summary/summary';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';

import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

import {OrderToInvoiceModal} from '../modals/ordertoinvoice';

declare var _;

// TODO: this can be removed when refactor is complete
class CustomerOrderExt extends CustomerOrder {
    public _InvoiceAddress: Address;
    public _InvoiceAddresses: Array<Address>;
    public _InvoiceAddressesID: number;

    public _ShippingAddress: Address;
    public _ShippingAddresses: Array<Address>;
    public _ShippingAddressesID: number;
}

@Component({
    selector: 'order-details',
    templateUrl: './orderDetails.html'
})
export class OrderDetails {
    @ViewChild(OrderToInvoiceModal) private oti: OrderToInvoiceModal;
    @ViewChild(TofHead) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() public orderID: any;

    private companySettings: CompanySettings;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private isDirty: boolean;
    private newOrderItem: CustomerOrderItem;
    private order: CustomerOrderExt;
    private orderItems: CustomerOrderItem[];

    private contextMenuItems: IContextMenuItem[] = [];
    private saveActions: IUniSaveAction[] = [];
    public summary: ISummaryConfig[] = [];
    private toolbarconfig: IToolbarConfig;

    private currencyCodes: Array<CurrencyCode>;
    private currencyCodeID: number;
    private currencyExchangeRate: number;
    private currentCustomer: Customer;
    private currentDeliveryTerm: Terms;
    private deliveryTerms: Terms[];
    private paymentTerms: Terms[];
    private printStatusPrinted: string = '200';
    private projects: Project[];
    private selectConfig: any;
    private numberSeries: NumberSeries[];
    private projectID: number;

    private customerExpandOptions: string[] = [
        'DeliveryTerms',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Project.ProjectTasks',
        'Info',
        'Info.Addresses',
        'Info.Emails',
        'Info.InvoiceAddress',
        'Info.ShippingAddress',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller'
    ];

    private expandOptions: Array<string> = [
        'Customer',
        'Customer.Info',
        'Customer.Info.Addresses',
        'Customer.Dimensions',
        'Customer.Dimensions.Project',
        'Customer.Dimensions.Department',
        'DefaultDimensions',
        'DeliveryTerms',
        'Items',
        'Items.Product.VatType',
        'Items.VatType',
        'Items.Dimensions',
        'Items.Dimensions.Project',
        'Items.Dimensions.Department',
        'Items.Account',
        'Items.Dimensions.Project.ProjectTasks',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller'
    ];

    // New
    private commentsConfig: any;
    private readonly: boolean;
    private recalcDebouncer: EventEmitter<any> = new EventEmitter();

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
        private numberSeriesService: NumberSeriesService
   ) {}

    public ngOnInit() {
        this.setSums();

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((orderItems) => {
            if (orderItems.length) {
                this.recalcItemSums(orderItems);
                let dirtyItems = orderItems.filter(x => x._isDirty);

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

            this.commentsConfig = {
                entityType: 'CustomerOrder',
                entityID: this.orderID
            };

            if (this.orderID) {
                Observable.forkJoin(
                    this.customerOrderService.Get(this.orderID, this.expandOptions),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    this.projectService.GetAll(null)
                ).subscribe(res => {
                    let order = <CustomerOrder>res[0];
                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.paymentTerms = res[3];
                    this.deliveryTerms = res[4];
                    this.projects = res[5];

                    if (!order.CurrencyCodeID) {
                        order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        order.CurrencyExchangeRate = 1;
                    }
                    this.currencyCodeID = order.CurrencyCodeID;
                    this.currencyExchangeRate = order.CurrencyExchangeRate;

                    this.projectID = order.DefaultDimensions && order.DefaultDimensions.ProjectID;
                    order.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);
                    
                    this.refreshOrder(order);
                    this.tofHead.focus();
                },
                    err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.customerOrderService.GetNewEntity(['DefaultDimensions'], CustomerOrder.EntityType),
                    this.userService.getCurrentUser(),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    customerID ? this.customerService.Get(
                        customerID, this.customerExpandOptions
                    ) : Observable.of(null),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(
                        `filter=NumberSeriesType.Name eq 'Customer Order number `
                        + `series' and Empty eq false and Disabled eq false`,
                        ['NumberSeriesType']
                    ),
                    this.projectService.GetAll(null)
                ).subscribe(
                    (res) => {
                        let order = <CustomerOrder>res[0];
                        order.OurReference = res[1].DisplayName;
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
                            order.DeliveryDate = order.OrderDate;
                        }
                        if (res[7]) {
                            order.DefaultDimensions.ProjectID = res[7].ID;
                            order.DefaultDimensions.Project = res[7];
                        }
                        this.numberSeries = res[8].map(x => this.numberSeriesService.translateSerie(x));
                        this.selectConfig = this.numberSeriesService.getSelectConfig(
                            this.orderID, this.numberSeries, 'Customer Order number series'
                        );
                        this.projects = res[9];

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

    private numberSeriesChange(selectedSerie) {
        this.order.OrderNumberSeriesID = selectedSerie.ID;
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

    public canDeactivate(): Observable<boolean> {
        return !this.isDirty
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveOrder();
                    }

                    return result !== ConfirmActions.CANCEL;
                });
    }

    public onOrderChange(order) {
        this.isDirty = true;
        this.updateSaveActions();
        let shouldGetCurrencyRate: boolean = false;

        let customerChanged: boolean = this.didCustomerChange(order);
        if (customerChanged) {
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
                    let replaceItemsProject: boolean = (response === ConfirmActions.ACCEPT);
                    this.tradeItemTable.setDefaultProjectAndRefreshItems(this.projectID, replaceItemsProject);
                });
            } else {        
                this.tradeItemTable.setDefaultProjectAndRefreshItems(this.projectID, true);
            }
        }

        // update currency code in detailsForm and tradeItemTable to selected currency code if selected
        // or from customer
        if ((!this.currencyCodeID && order.CurrencyCodeID)
            || this.currencyCodeID !== order.CurrencyCodeID) {
            this.currencyCodeID = order.CurrencyCodeID;
            this.tradeItemTable.updateAllItemVatCodes(this.currencyCodeID);
            shouldGetCurrencyRate = true;
        }

        if (this.order && this.order.OrderDate.toString() !== order.OrderDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        if (this.order && order.CurrencyCodeID !== this.order.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        this.order = _.cloneDeep(order);

        if (shouldGetCurrencyRate) {
            this.getUpdatedCurrencyExchangeRate(order)
                .subscribe(res => {
                    let newCurrencyRate = res;

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

                        let haveUserDefinedPrices = this.orderItems && this.orderItems.filter(
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
                            let baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);

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

    private refreshOrder(order?: CustomerOrder) {
        if (!order) {
            this.customerOrderService.Get(this.orderID, this.expandOptions).subscribe(
                res => this.refreshOrder(res),
                err => this.errorService.handle(err)
            );
            return;
        }

        this.readonly = order.StatusCode === StatusCodeCustomerOrder.TransferredToInvoice;
        this.newOrderItem = <any>this.tradeItemHelper.getDefaultTradeItemData(order);
        this.orderItems = order.Items.sort(function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; });
        this.order = <any>_.cloneDeep(order);
        this.isDirty = false;

        this.currentCustomer = order.Customer;
        this.currentDeliveryTerm = order.DeliveryTerms;

        this.setTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
        this.recalcDebouncer.next(order.Items);
    }

    private didCustomerChange(order: CustomerOrder): boolean {
        let change: boolean;

        if (!this.currentCustomer && !order.Customer) {
            return false;
        }

        if (this.currentCustomer) {
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
            let currencyDate: LocalDate = new LocalDate(order.OrderDate.toString());

            return this.currencyService.getCurrencyExchangeRate(
                order.CurrencyCodeID,
                this.companySettings.BaseCurrencyCodeID,
                currencyDate
            ).map(x => x.ExchangeRate);
        }
    }

    private recalcPriceAndSumsBasedOnSetPrices(item, newCurrencyRate) {
        item.PriceExVat = this.tradeItemHelper.round(item.PriceExVatCurrency * newCurrencyRate, 4);

        this.tradeItemHelper.calculatePriceIncVat(item);
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

        this.tradeItemHelper.calculatePriceIncVat(item);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.order.StatusCode;

        this.customerOrderService.statusTypes.forEach((status) => {
            let _state: UniStatusTrack.States;

            if (status.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (status.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (status.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
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

    public addOrder() {
        event.preventDefault();
        this.router.navigateByUrl('/sales/orders/0').then(res => {
            this.tofHead.focus();
        });
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

    private setTabTitle() {
        let tabTitle = '';
        if (this.order.OrderNumber) {
            tabTitle = 'Ordrenr. ' + this.order.OrderNumber;
        } else {
            tabTitle = (this.order.ID) ? 'Ordre (kladd)' : 'Ny ordre';
        }
        this.tabService.addTab({
            url: '/sales/orders/' + this.order.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Orders
        });
    }

    private updateToolbar() {
        let orderText = '';
        if (this.order.OrderNumber) {
            orderText = 'Ordrenummer. ' + this.order.OrderNumber;
        } else {
            orderText = (this.order.ID) ? 'Ordre (kladd)' : 'Ny ordre';
        }

        let customerText = (this.order.Customer)
            ? this.order.Customer.CustomerNumber + ' - ' + this.order.Customer.Info.Name
            : '';

        let baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
        let selectedCurrencyCode = this.getCurrencyCode(this.currencyCodeID);

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
            subheads: [
                {
                    title: customerText,
                    link: this.order.Customer ? `#/sales/customer/${this.order.Customer.ID}` : ''
                },
                { title: netSumText },
                { title: GetPrintStatusText(this.order.PrintStatus) }
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousOrder.bind(this),
                next: this.nextOrder.bind(this),
                add: this.addOrder.bind(this)
            },
            contextmenu: this.contextMenuItems,
            entityID: this.orderID,
            entityType: 'CustomerOrder'
        };
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
            disabled: transitions && !transitions['register'],
            main: (!transitions || transitions['register']) && !printStatus
        });



        this.saveActions.push({
            label: 'Skriv ut',
            action: (done) => this.saveAndPrint(done),
            main: this.order.OrderNumber > 0 && !printStatus && !this.isDirty,
            disabled: false
        });

        this.saveActions.push({
            label: 'Send på epost',
            action: (done) => {
                let model = new SendEmail();
                model.EntityType = 'CustomerOrder';
                model.EntityID = this.order.ID;
                model.CustomerID = this.order.CustomerID;
                model.EmailAddress = this.order.EmailAddress;

                const orderNumber = this.order.OrderNumber ? ` nr. ${this.order.OrderNumber}` : 'kladd';
                model.Subject = 'Ordre' + orderNumber;
                model.Message = 'Vedlagt finner du ordre' + orderNumber;

                this.modalService.open(UniSendEmailModal, {
                    data: model
                }).onClose.subscribe(email => {
                    if (email) {
                        this.reportService.generateReportSendEmail('Ordre id', email, null, done);
                    } else {
                        done();
                    }
                });
            },
            main: printStatus === 200 && !this.isDirty,
            disabled: false

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
        if (!orderItems || !orderItems.length) {
            return;
        }

        this.order.Items = orderItems;
        this.itemsSummaryData = this.tradeItemHelper
            .calculateTradeItemSummaryLocal(orderItems, this.companySettings.RoundingNumberOfDecimals);
        this.updateToolbar();
        this.setSums();
    }

    private saveOrder(): Promise<CustomerOrder> {
        this.order.Items = this.orderItems;
        this.order.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerOrderService.getNewGuid();
            }

            if (item.VatType) {
                item.VatType = null;
            }

            if (item.Product) {
                item.Product = null;
            }

            if (item.Account) {
                item.Account = null;
            }
        });

        if (this.order.DefaultDimensions && !this.order.DefaultDimensions.ID) {
            this.order.DefaultDimensions._createguid = this.customerOrderService.getNewGuid();
        }

        return new Promise((resolve, reject) => {

            if (TradeItemHelper.IsAnyItemsMissingProductID(this.order.Items)) {
                TradeItemHelper.clearFieldsInItemsWithNoProductID(this.order.Items);
            }

            // create observable but dont subscribe - resolve it in the promise
            var request = ((this.order.ID > 0)
                ? this.customerOrderService.Put(this.order.ID, this.order)
                : this.customerOrderService.Post(this.order));

            // If a currency other than basecurrency is used, and any lines contains VAT,
            // validate that this is correct before resolving the promise
            if (this.order.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
                let linesWithVat = this.order.Items.filter(x => x.SumVatCurrency > 0);
                if (linesWithVat.length > 0) {

                    const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                        + `${this.getCurrencyCode(this.order.CurrencyCodeID)} som valuta?`;

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
                                res => resolve(res),
                                err => reject(err)
                            );
                        } else {
                            const message = 'Endre MVA kode og lagre på ny';
                            reject(message);
                        }
                    });
                } else {
                    request.subscribe(res => {
                        if (res.OrderNumber) { this.selectConfig = undefined; }
                        resolve(res);
                    }, err => reject(err));
                }
            } else {
                request.subscribe(res => {
                    if (res.OrderNumber) { this.selectConfig = undefined; }
                    resolve(res);
                }, err => reject(err));
            }

        });
    }

    private saveAndTransferToInvoice(done: any) {
        // Set up subscription to listen to when items has been selected and button clicked in modal window.
        // Only setup one subscription - this is done to avoid problems with multiple callbacks
        if (this.oti.changed.observers.length === 0) {
            this.oti.changed.subscribe(items => {
                // Do not transfer to invoice if no items
                if (items.length === 0) {
                    this.toastService.addToast('Kan ikke overføre en ordre uten linjer', ToastType.warn, 5);
                    return;
                }

                var order: CustomerOrder = _.cloneDeep(this.order);
                order.Items = items;

                this.customerOrderService.ActionWithBody(order.ID, order, 'transfer-to-invoice')
                    .subscribe((invoice) => {
                        this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
                        done('Lagret og overført til faktura');
                    }, (err) => {
                        this.errorService.handle(err);
                        done('Feilet i overføring til faktura');
                    });
            });
        }

        // save order and open modal to select what to transfer to invoice
        this.saveOrder().then(res => {
            done('Ordre lagret');
            this.isDirty = false;
            this.oti.openModal(this.order);
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private saveOrderTransition(done: any, transition: string, doneText: string) {
        this.saveOrder().then((order) => {
            this.customerOrderService.Transition(order.ID, this.order, transition).subscribe(
                (res) => {
                    this.selectConfig = undefined;
                    done(doneText);
                    this.refreshOrder();
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

    private saveAndPrint(doneHandler: (msg: string) => void = null) {
        if (this.isDirty) {
            this.saveOrder().then(order => {
                this.isDirty = false;
                this.print(order.ID, doneHandler);
            }).catch(error => {
                if (doneHandler) { doneHandler('En feil oppstod ved utskrift av ordre!'); }
                this.errorService.handle(error);
            });
        } else {
            this.print(this.order.ID, doneHandler);
        }
    }

    private print(id, doneHandler: (msg?: string) => void = () => { }) {
        this.reportDefinitionService.getReportByName('Ordre id').subscribe((report) => {
            report.parameters = [{ Name: 'Id', value: id }];
            this.modalService.open(UniPreviewModal, {
                data: report
            }).onClose.subscribe(() => {
                doneHandler();

                this.customerOrderService.setPrintStatus(this.orderID, this.printStatusPrinted).subscribe(
                    (printStatus) => {
                        this.order.PrintStatus = +this.printStatusPrinted;
                        this.updateToolbar();
                    },
                    err => this.errorService.handle(err)
                );
            });
        }, (err) => {
            doneHandler('En feil oppstod ved utskrift av ordre');
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

    private setSums() {
        this.summary = [{
            value: this.getCurrencyCode(this.currencyCodeID),
            title: 'Valuta:',
                description: this.currencyExchangeRate ?
                'Kurs: ' + this.numberFormat.asMoney(this.currencyExchangeRate) : ''
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasisCurrency) : null,
            title: 'Avgiftsfritt',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasisCurrency) : null,
            title: 'Avgiftsgrunnlag',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumDiscountCurrency) : null,
            title: 'Sum rabatt',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency) : null,
            title: 'Nettosum',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumVatCurrency) : null,
            title: 'Mva',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.DecimalRoundingCurrency) : null,
            title: 'Øreavrunding',
        }, {
                value: this.itemsSummaryData ?
                    this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVatCurrency) : null,
            title: 'Totalsum',
        }];
    }
}
