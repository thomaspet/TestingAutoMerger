import {Component, Input, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {OrderToInvoiceModal} from '../modals/ordertoinvoice';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {IContextMenuItem} from 'unitable-ng2/main';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ISummaryConfig} from '../../../common/summary/summary';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {TradeItemTable} from '../../common/tradeItemTable';
import {TofHead} from '../../common/tofHead';
import {StatusCode} from '../../salesHelper/salesEnums';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    Address,
    CustomerOrder,
    CustomerOrderItem,
    StatusCodeCustomerOrder,
    CompanySettings,
    CurrencyCode,
    LocalDate
} from '../../../../unientities';
import {
    CompanySettingsService,
    CustomerOrderService,
    CustomerOrderItemService,
    CustomerService,
    BusinessRelationService,
    UserService,
    ErrorService,
    NumberFormat,
    ProjectService,
    DepartmentService,
    AddressService,
    ReportDefinitionService,
    CurrencyCodeService,
    CurrencyService
} from '../../../../services/services';

declare const _;

// TODO: this can be removed when refactor is complete
class CustomerOrderExt extends CustomerOrder {
    public _InvoiceAddress: Address;
    public _InvoiceAddresses: Array<Address>;
    public _ShippingAddress: Address;
    public _ShippingAddresses: Array<Address>;
    public _InvoiceAddressesID: number;
    public _ShippingAddressesID: number;
}

@Component({
    selector: 'order-details',
    templateUrl: 'app/components/sales/order/details/orderDetails.html'
})
export class OrderDetails {
    @ViewChild(OrderToInvoiceModal) private oti: OrderToInvoiceModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    @ViewChild(UniConfirmModal)
    private confirmModal: UniConfirmModal;

    @ViewChild(TofHead)
    private tofHead: TofHead;

    @ViewChild(TradeItemTable)
    private tradeItemTable: TradeItemTable;

    @Input()
    public orderID: any;

    private isDirty: boolean;
    private order: CustomerOrderExt;
    private orderItems: CustomerOrderItem[];
    private newOrderItem: CustomerOrderItem;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private companySettings: CompanySettings;
    private saveActions: IUniSaveAction[] = [];
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];

    private currencyCodes: Array<CurrencyCode>;
    private currencyCodeID: number;
    private currencyExchangeRate: number;

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department', 'Items.Account',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department'];

    // New
    private recalcDebouncer: EventEmitter<any> = new EventEmitter();
    private readonly: boolean;

    constructor(
        private customerService: CustomerService,
        private customerOrderService: CustomerOrderService,
        private customerOrderItemService: CustomerOrderItemService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private businessRelationService: BusinessRelationService,
        private companySettingsService: CompanySettingsService,
        private toastService: ToastService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private userService: UserService,
        private numberFormat: NumberFormat,
        private tradeItemHelper: TradeItemHelper,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService
    ) {}

    public ngOnInit() {
        this.setSums();
        this.contextMenuItems = [
            {
                label: 'Skriv ut',
                action: () => this.saveAndPrint(),
                disabled: () => !this.order.ID
            },
            {
                label: 'Send på epost',
                action: () => {
                    let sendemail = new SendEmail();
                    sendemail.EntityType = 'CustomerOrder';
                    sendemail.EntityID = this.order.ID;
                    sendemail.CustomerID = this.order.CustomerID;
                    sendemail.Subject = 'Ordre ' + (this.order.OrderNumber ? 'nr. ' + this.order.OrderNumber : 'kladd');
                    sendemail.Message = 'Vedlagt finner du Ordre ' + (this.order.OrderNumber ? 'nr. ' + this.order.OrderNumber : 'kladd');

                    this.sendEmailModal.openModal(sendemail);

                    if (this.sendEmailModal.Changed.observers.length === 0) {
                        this.sendEmailModal.Changed.subscribe((email) => {
                            this.reportDefinitionService.generateReportSendEmail('Ordre id', email);
                        });
                    }
                },
                disabled: () => !this.order.ID
            }
        ];

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((orderItems) => {
            if (orderItems.length) {
                this.recalcItemSums(orderItems);
            }
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.orderID = +params['id'];

            if (this.orderID) {
                Observable.forkJoin(
                    this.customerOrderService.Get(this.orderID, this.expandOptions),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null)
                ).subscribe(res => {
                    let order = <CustomerOrder> res[0];
                    this.companySettings = res[1];

                    if (!order.CurrencyCodeID) {
                        order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        order.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = order.CurrencyCodeID;
                    this.currencyExchangeRate = order.CurrencyExchangeRate;

                    this.currencyCodes = res[2];

                    this.refreshOrder(order);
                },
                err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.customerOrderService.GetNewEntity([], CustomerOrder.EntityType),
                    this.userService.getCurrentUser(),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null)
                ).subscribe(
                    (res) => {
                        let order = <CustomerOrder> res[0];
                        order.OurReference = res[1].DisplayName;
                        order.OrderDate = new LocalDate(Date());
                        order.DeliveryDate = new LocalDate(Date());

                        this.companySettings = res[2];

                        if (!order.CurrencyCodeID) {
                            order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                            order.CurrencyExchangeRate = 1;
                        }

                        this.currencyCodeID = order.CurrencyCodeID;
                        this.currencyExchangeRate = order.CurrencyExchangeRate;

                        this.currencyCodes = res[3];

                        this.refreshOrder(order);
                    },
                    err => this.errorService.handle(err)
                );
            }
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

    private handleSaveError(error, donehandler) {
        if (typeof(error) === 'string') {
            if (donehandler) {
                donehandler('Lagring avbrutt ' + error);
            }
        } else {
            if (donehandler) {
                donehandler('Lagring feilet');
            }
            this.errorService.handle(error);
        }
    }

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.confirmModal.confirm(
            'Ønsker du å lagre ordren før du fortsetter?',
            'Ulagrede endringer',
            true
        ).then((action) => {
            if (action === ConfirmActions.ACCEPT) {
                this.saveOrder().then(res => {
                    this.isDirty = false;
                    return true;
                }).catch(error => {
                    this.handleSaveError(error, null);
                    return false;
                });
            } else if (action === ConfirmActions.REJECT) {
                return true;
            } else {
                this.setTabTitle();
                return false;
            }
        });
    }

    public onOrderChange(order) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;

        // update quotes currencycodeid if the customer changed
        if (this.didCustomerChange(order)) {
            if (order.Customer.CurrencyCodeID) {
                order.CurrencyCodeID = order.Customer.CurrencyCodeID;
            } else {
                order.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            shouldGetCurrencyRate = true;
        }

        if ((!this.currencyCodeID && order.CurrencyCodeID)
            || this.currencyCodeID !== order.CurrencyCodeID) {
            this.currencyCodeID = order.CurrencyCodeID;
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

                        let haveUserDefinedPrices = this.orderItems && this.orderItems.filter(x => x.PriceSetByUser).length > 0;

                        if (haveUserDefinedPrices) {
                            // calculate how much the new currency will affect the amount for the base currency,
                            // if it doesnt cause a change larger than 5%, don't bother asking the user what
                            // to do, just use the set prices
                            newTotalExVatBaseCurrency = this.itemsSummaryData.SumTotalExVatCurrency * newCurrencyRate;
                            diffBaseCurrency = Math.abs(newTotalExVatBaseCurrency - this.itemsSummaryData.SumTotalExVat);

                            diffBaseCurrencyPercent =
                                this.tradeItemHelper.round((diffBaseCurrency * 100) / Math.abs(this.itemsSummaryData.SumTotalExVat), 1);

                            // 5% is set as a limit for asking the user now, but this might need to be reconsidered,
                            // or make it possible to override it either on companysettings, customer, or the TOF header
                            if (diffBaseCurrencyPercent > 5) {
                                askUserWhatToDo = true;
                            }
                        }

                        if (askUserWhatToDo) {
                            let baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);

                            this.confirmModal.confirm(
                                `Endringen førte til at en ny valutakurs ble hentet. Du har overstyrt en eller flere priser, ` +
                                `og dette fører derfor til at totalsum eks. mva ` +
                                `for ${baseCurrencyCode} endres med ${diffBaseCurrencyPercent}% ` +
                                `til ${baseCurrencyCode} ${this.numberFormat.asMoney(newTotalExVatBaseCurrency)}.\n\n` +
                                `Vil du heller rekalkulere valutaprisene basert på ny kurs og standardprisen på varene?`,
                                'Rekalkulere valutapriser for varer?',
                                false,
                                {accept: 'Ikke rekalkuler valutapriser', reject: 'Rekalkuler valutapriser'}
                            ).then((response: ConfirmActions) => {
                                if (response === ConfirmActions.ACCEPT) {
                                    // we need to calculate the base currency amount numbers if we are going
                                    // to keep the currency amounts - if not the data will be out of sync
                                    this.orderItems.forEach(item => {
                                        if (item.PriceSetByUser) {
                                            this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                        } else {
                                            this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                        }
                                    });
                                } else if (response === ConfirmActions.REJECT) {
                                    // we need to calculate the currency amounts based on the original prices
                                    // defined in the base currency
                                    this.orderItems.forEach(item => {
                                        this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
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

        if (!order.CreditDays) {
            if (order.Customer && order.Customer.CreditDays) {
                order.CreditDays = order.Customer.CreditDays;
            } else if (this.companySettings) {
                order.CreditDays = this.companySettings.CustomerCreditDays;
            }
        }

        this.readonly = order.StatusCode === StatusCodeCustomerOrder.TransferredToInvoice;
        this.newOrderItem = <any> this.tradeItemHelper.getDefaultTradeItemData(order);
        this.orderItems = order.Items;
        this.order = _.cloneDeep(order);
        this.isDirty = false;
        this.setTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
        this.recalcDebouncer.next(order.Items);
    }

    private didCustomerChange(order: CustomerOrder): boolean {
        return order.Customer
            && (!this.order
            || (order.Customer && !this.order.Customer)
            || (order.Customer && this.order.Customer && order.Customer.ID !== this.order.Customer.ID))
    }

    private getUpdatedCurrencyExchangeRate(order: CustomerOrder): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!order.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === order.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            let currencyDate: LocalDate = new LocalDate(order.OrderDate.toString());

            return this.currencyService.getCurrencyExchangeRate(order.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, currencyDate)
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

            statustrack.push({
                title: status.Text,
                state: _state,
                code: status.Code
            });
        });
        return statustrack;
    }

    public addOrder() {
        this.router.navigateByUrl('/sales/orders/0');
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
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat)}`;
            }
        } else {
            netSumText = `Netto ${selectedCurrencyCode} ${this.numberFormat.asMoney(this.order.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.order.TaxExclusiveAmount)}`;
            }
        }

        this.toolbarconfig = {
            title: orderText,
            subheads: [
                {title: customerText, link: this.order.Customer ? `#/sales/customer/${this.order.Customer.ID}` : ''},
                {title: netSumText},
                {title: GetPrintStatusText(this.order.PrintStatus)}
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
            main: !transitions || transitions['register']
        });

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
            main: true,
            disabled: !this.order.ID
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
        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(orderItems);
        this.updateToolbar();
        this.setSums();
    }

    private saveOrder(): Promise<CustomerOrder> {
        this.order.Items = this.orderItems;

        this.order.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerOrderService.getNewGuid();
            }
        });

        return new Promise((resolve, reject) => {
            // Save only lines with products from product list
            if (!TradeItemHelper.IsItemsValid(this.order.Items)) {
                const message = 'En eller flere varelinjer mangler produkt';
                reject(message);
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
                    this.confirmModal.confirm(
                        `Er du sikker på at du vil registrere linjer med MVA når det er brukt ${this.getCurrencyCode(this.order.CurrencyCodeID)} som valuta?`,
                        'Vennligst bekreft',
                        false,
                        {accept: 'Ja, jeg vil lagre med MVA', reject: 'Avbryt lagring'}
                    ).then(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            request.subscribe(res => resolve(res), err => reject(err));
                        } else {
                            const message = 'Endre MVA kode og lagre på ny';
                            reject(message);
                        }
                    });
                } else {
                    request.subscribe(res => resolve(res), err => reject(err));
                }
            } else {
                request.subscribe(res => resolve(res), err => reject(err));
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

                this.customerOrderService.ActionWithBody(order.ID, order, 'transfer-to-invoice').subscribe((invoice) => {
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

    private saveAndPrint() {
        if (this.isDirty) {
            this.saveOrder().then(order => {
                this.isDirty = false;
                this.print(order.ID);
            }).catch(error => {
                this.errorService.handle(error);
            });
        } else {
            this.print(this.order.ID);
        }
    }

    private print(id) {
        this.reportDefinitionService.getReportByName('Ordre id').subscribe((report) => {
            this.previewModal.openWithId(report, id);
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
                description: this.currencyExchangeRate ? 'Kurs: ' + this.numberFormat.asMoney(this.currencyExchangeRate) : ''
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasisCurrency) : null,
                title: 'Avgiftsfritt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasisCurrency) : null,
                title: 'Avgiftsgrunnlag',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDiscountCurrency) : null,
                title: 'Sum rabatt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency) : null,
                title: 'Nettosum',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVatCurrency) : null,
                title: 'Mva',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.DecimalRoundingCurrency) : null,
                title: 'Øreavrunding',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVatCurrency) : null,
                title: 'Totalsum',
            }];
    }
}
