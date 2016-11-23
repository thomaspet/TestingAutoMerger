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
import {
    Address,
    CustomerOrder,
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

    @ViewChild(TofHead)
    private tofHead: TofHead;

    @ViewChild(TradeItemTable)
    private tradeItemTable: TradeItemTable;

    @Input()
    public orderID: any;

    private order: CustomerOrderExt;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private companySettings: CompanySettings;
    private actions: IUniSaveAction[];
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department'];

    // New
    private recalcDeboucer: EventEmitter<any> = new EventEmitter();
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
    ) {

        // this.tabService.addTab({ url: '/sales/orders/', name: 'Ordre', active: true, moduleID: UniModules.Orders });

    }

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
        this.recalcDeboucer.debounceTime(500).subscribe((orderItems) => {
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
                    this.errorService.handle
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
                    this.errorService.handle
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
            this.tofHead.focus();
        }
    }

    private refreshOrder(order: CustomerOrder) {
        if (!order.CreditDays) {
            if (order.Customer && order.Customer.CreditDays) {
                order.CreditDays = order.Customer.CreditDays;
            } else if (this.companySettings) {
                order.CreditDays = this.companySettings.CustomerCreditDays;
            }
        }

        this.readonly = order.StatusCode === StatusCodeCustomerOrder.TransferredToInvoice;

        this.order = _.cloneDeep(order);
        this.setTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
        this.recalcDeboucer.next(order.Items);
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
            this.errorService.handle
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
            this.errorService.handle
        );
    }

    private setTabTitle() {
        let tabTitle = this.order.OrderNumber ? 'Ordrenr. ' + this.order.OrderNumber : 'Ordre (kladd)';
        this.tabService.addTab({ url: '/sales/orders/' + this.order.ID, name: tabTitle, active: true, moduleID: UniModules.Orders });
    }

    private updateToolbar() {
        this.toolbarconfig = {
            title: this.order.Customer ? (this.order.Customer.CustomerNumber + ' - ' + this.order.Customer.Info.Name) : this.order.CustomerName,
            subheads: [
                {title: this.order.OrderNumber ? 'Ordrenr. ' + this.order.OrderNumber + '.' : ''},
                {title: !this.itemsSummaryData ? 'Netto kr ' + this.order.TaxExclusiveAmount + '.' : 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.'},
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
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveOrderManual(done),
            main: true,
            disabled: this.IsSaveDisabled()
        });

        this.actions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.actions.push({
            label: 'Lagre og overfør til faktura',
            action: (done) => this.saveAndTransferToInvoice(done),
            disabled: this.IsTransferToInvoiceDisabled()
        });
        this.actions.push({
            label: 'Registrer',
            action: (done) => this.saveOrderTransition(done, 'register', 'Registrert'),
            disabled: (this.order.StatusCode !== StatusCodeCustomerOrder.Draft)
        });
        this.actions.push({
            label: 'Avslutt ordre',
            action: (done) => this.saveOrderTransition(done, 'complete', 'Ordre avsluttet'),
            disabled: this.IsTransferToCompleteDisabled()
        });

        this.actions.push({
            label: 'Slett',
            action: (done) => this.deleteOrder(done),
            disabled: true
        });
    }

    private IsTransferToInvoiceDisabled() {
        if (this.order.StatusCode === StatusCodeCustomerOrder.Registered ||
            this.order.StatusCode === StatusCodeCustomerOrder.PartlyTransferredToInvoice) {
            return false;
        }
        return true;
    }

    private IsTransferToCompleteDisabled() {
        if (this.order.StatusCode === StatusCodeCustomerOrder.Registered ||
            this.order.StatusCode === StatusCodeCustomerOrder.PartlyTransferredToInvoice) {
            return false;
        }
        return true;
    }
    private IsSaveDisabled() {
        if (!this.order.StatusCode ||
            this.order.StatusCode === StatusCodeCustomerOrder.Draft ||
            this.order.StatusCode === StatusCodeCustomerOrder.Registered ||
            this.order.StatusCode === StatusCodeCustomerOrder.PartlyTransferredToInvoice) {
            return false;
        }
        return true;
    }

    private deleteOrder(done) {
        this.toastService.addToast('Slett  - Under construction', ToastType.warn, 5);
        done('Slett ordre avbrutt');
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

    private saveOrderManual(done: any) {
        this.saveOrder(done);
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
        this.saveOrder(done, order => {
            this.oti.openModal(this.order);
            done('Ordre lagret');
        });
    }

    private saveOrderTransition(done: any, transition: string, doneText: string) {
        this.saveOrder(done, (order) => {
            this.customerOrderService.Transition(this.order.ID, this.order, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                done(doneText);

                this.customerOrderService.Get(order.ID, this.expandOptions).subscribe((data) => {
                    this.order = data;
                    this.addressService.setAddresses(this.order);
                    this.updateSaveActions();
                    this.updateToolbar();
                    this.setTabTitle();
                });
            }, (err) => {
                this.errorService.handle(err);
                done('Feilet');
            });
        });
    }

    private saveOrder(done: any, next: any = null) {
        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        this.order.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerOrderItemService.getNewGuid();
            }
        });


        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.order.Items)) {
            if (done) {
                done('Lagring feilet. En eller flere varelinjer mangler produkt.');
            }
            return;
        }

        if (this.orderID > 0) {
            this.customerOrderService.Put(this.order.ID, this.order).subscribe(
                (orderSaved) => {
                    this.customerOrderService.Get(this.orderID, this.expandOptions).subscribe((orderGet) => {
                        this.order = orderGet;
                        this.addressService.setAddresses(this.order);
                        this.updateSaveActions();
                        this.updateToolbar();
                        this.setTabTitle();

                        if (next) {
                            next(this.order);
                        } else {
                            done('Ordre lagret');
                        }
                    });
                },
                (err) => {
                    this.errorService.handle(err);
                    done('Feil oppsto ved lagring');
                }
            );
        } else {
            this.customerOrderService.Post(this.order).subscribe(
                (orderSaved) => {
                    if (next) {
                        next(this.order);
                    } else {
                        done('Ordre lagret');
                    }

                    this.router.navigateByUrl('/sales/orders/' + orderSaved.ID);
                },
                (err) => {
                    this.errorService.handle(err);
                    done('Feil oppsto ved lagring');
                }
            );
        }
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

    private saveAndPrint(done) {
        this.saveOrder(done, (order) => {
            this.reportDefinitionService.getReportByName('Ordre id').subscribe((report) => {
                if (report) {
                    this.previewModal.openWithId(report, order.ID);
                    done('Utskrift startet');
                } else {
                    done('Rapport mangler');
                }
            }, this.errorService.handle);
        });
    }
}
