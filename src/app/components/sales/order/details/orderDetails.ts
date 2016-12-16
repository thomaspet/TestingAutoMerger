import {Component, Input, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {OrderToInvoiceModal} from '../modals/ordertoinvoice';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
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
    CompanySettings
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
    ReportDefinitionService
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

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
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
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.setSums();
        this.contextMenuItems = [{
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
        }];

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
                this.customerOrderService.Get(this.orderID, this.expandOptions).subscribe(
                    res => this.refreshOrder(res),
                    err => this.errorService.handle(err)
                );
            } else {
                Observable.forkJoin(
                    this.customerOrderService.GetNewEntity([], CustomerOrder.EntityType),
                    this.userService.getCurrentUser()
                ).subscribe(
                    (dataset) => {
                        let order = <CustomerOrder> dataset[0];
                        order.OurReference = dataset[1].DisplayName;
                        order.OrderDate = new Date();
                        order.DeliveryDate = new Date();
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

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Ønsker du å lagre ordren før du fortsetter?',
                'Ulagrede endringer',
                true
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    this.saveOrder().subscribe(
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
                    this.setTabTitle();
                }
            });
        });
    }


    public onOrderChange(order) {
        this.isDirty = true;
        this.order = _.cloneDeep(order);
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

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.order.StatusCode;

        this.customerOrderService.statusTypes.forEach((s, i) => {
            let _state: UniStatusTrack.States;

            if (s.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (s.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (s.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: s.Text,
                state: _state
            };
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

        let netSumText = (this.itemsSummaryData)
            ? 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.'
            : 'Netto kr ' + this.order.TaxExclusiveAmount + '.';

        this.toolbarconfig = {
            title: orderText,
            subheads: [
                {title: customerText},
                {title: netSumText},
                {title: GetPrintStatusText(this.order.PrintStatus)}
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousOrder.bind(this),
                next: this.nextOrder.bind(this),
                add: this.addOrder.bind(this)
            },
            contextmenu: this.contextMenuItems
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
                    this.saveOrder().subscribe(
                        (res) => {
                            done('Ordre registrert');
                            this.isDirty = false;
                            this.router.navigateByUrl('/sales/orders/' + res.ID);
                        },
                        err => this.errorService.handle(err)
                    );
                }


            },
            disabled: transitions && !transitions['register'],
            main: !transitions || transitions['register']
        });

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                this.saveOrder().subscribe(
                    (res) => {
                        done('Lagring fullført');
                        this.orderID = res.ID;
                        this.refreshOrder();
                    },
                    (err) => {
                        done('Lagring feilet');
                        this.errorService.handle(err);
                    }
                );
            },
            main: true,
            disabled: !this.order.ID
        });

        if (!this.order.ID) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: (done) => {
                    this.order.StatusCode = StatusCode.Draft;
                    this.saveOrder().subscribe(
                        (res) => {
                            done('Lagring fullført');
                            this.isDirty = false;
                            this.router.navigateByUrl('/sales/orders/' + res.ID);
                        },
                        (err) => {
                            done('Lagring feilet');
                            this.errorService.handle(err);
                        }
                    );
                },
                disabled: false
            });
        }


        this.saveActions.push({
            label: 'Skriv ut',
            action: (done) => this.saveAndPrint(done),
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
        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(orderItems);
        this.updateToolbar();
        this.setSums();
    }

    private saveOrder(): Observable<CustomerOrder> {
        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed
        this.order.Items = this.orderItems;

        this.order.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerOrderService.getNewGuid();
            }
        });

        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.order.Items)) {
            const message = 'En eller flere varelinjer mangler produkt';
            return Observable.throw(message);
        }

        return (this.order.ID > 0)
            ? this.customerOrderService.Put(this.order.ID, this.order)
            : this.customerOrderService.Post(this.order);
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
        this.saveOrder().subscribe(
            (res) => {
                done('Ordre lagret');
                this.isDirty = false;
                this.oti.openModal(this.order);
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveOrderTransition(done: any, transition: string, doneText: string) {
        this.saveOrder().subscribe(
            (order) => {
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
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveAndPrint(done) {
        this.saveOrder().subscribe(
            (res) => {
                this.isDirty = false;
                this.reportDefinitionService.getReportByName('Ordre id').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, res.ID);
                        done('Viser utskrift');
                    } else {
                        done('Rapport mangler');
                    }
                });
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
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

    private setSums() {
        this.summary = [{
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasis) : null,
                title: 'Avgiftsfritt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasis) : null,
                title: 'Avgiftsgrunnlag',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDiscount) : null,
                title: 'Sum rabatt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat) : null,
                title: 'Nettosum',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVat) : null,
                title: 'Mva',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.DecimalRounding) : null,
                title: 'Øreavrunding',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVat) : null,
                title: 'Totalsum',
            }];
    }
}
