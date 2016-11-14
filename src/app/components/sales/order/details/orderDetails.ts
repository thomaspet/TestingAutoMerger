import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {CustomerOrderService, CustomerOrderItemService, CustomerService, BusinessRelationService, UserService} from '../../../../services/services';
import {ProjectService, DepartmentService, AddressService, ReportDefinitionService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {Address, CustomerOrderItem, Customer, FieldType} from '../../../../unientities';
import {CustomerOrder, StatusCodeCustomerOrder, CompanySettings} from '../../../../unientities';
import {AddressModal} from '../../../common/modals/modals';
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
import {NumberFormat} from '../../../../services/common/NumberFormatService';
import {GetPrintStatusText} from '../../../../models/printStatus';

declare const _;

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

    @Input() public orderID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(OrderToInvoiceModal) private oti: OrderToInvoiceModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    public config: any = {autofocus: true};
    public fields: any[] = [];

    private order: CustomerOrderExt;
    private deletedItems: Array<CustomerOrderItem>;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;
    private addressChanged: any;

    private companySettings: CompanySettings;

    private actions: IUniSaveAction[];

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department'];

    private formIsInitialized: boolean = false;
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];

    constructor(private customerService: CustomerService,
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
                private tradeItemHelper: TradeItemHelper) {

        this.tabService.addTab({ url: '/sales/orders/', name: 'Ordre', active: true, moduleID: UniModules.Orders });

        this.route.params.subscribe(params => {
            this.orderID = +params['id'];
            this.setSums();
            this.setup();
        });

        this.contextMenuItems = [
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
    }

    private log(err) {
        this.toastService.addToast('En feil oppsto:', ToastType.bad, 0, this.toastService.parseErrorMessageFromError(err));
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

    public nextOrder() {
        this.customerOrderService.next(this.order.ID)
            .subscribe((data) => {
                    if (data) {
                        this.router.navigateByUrl('/sales/orders/' + data.ID);
                    }
                },
                (err) => {
                    console.log('Error getting next order: ', err);
                    this.toastService.addToast('Ikke flere ordre etter denne', ToastType.warn, 5);
                }
            );
    }

    public previousOrder() {
        this.customerOrderService.previous(this.order.ID)
            .subscribe((data) => {
                    if (data) {
                        this.router.navigateByUrl('/sales/orders/' + data.ID);
                    }
                },
                (err) => {
                    console.log('Error getting previous order: ', err);
                    this.toastService.addToast('Ikke flere ordre før denne', ToastType.warn, 5);
                }
            );
    }

    public addOrder() {
        this.router.navigateByUrl('/sales/orders/0');
    }

    public ready(event) {
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        Observable.merge(
            this.form.field('CustomerID')
                .changeEvent
                .map(uniField => uniField['CustomerID']),
            this.route.params
                .filter(params => !!params['customerID'])
                .map(params => +params['customerID'])
        )
            .subscribe(customerID => {
                if (customerID) {
                    this.customerService.Get(customerID, ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']).subscribe((customer: Customer) => {
                        this.order.CustomerID = customerID;
                        let keepEntityAddresses: boolean = true;
                        if (this.order.Customer && customerID !== this.order.Customer.ID) {
                            keepEntityAddresses = false;
                        }

                        this.order.Customer = customer;
                        this.addressService.setAddresses(this.order, null, keepEntityAddresses);

                        this.order.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.order.CreditDays = customer.CreditDays;
                        } else {
                            this.order.CreditDays = this.companySettings.CustomerCreditDays;
                        }

                        this.order = _.cloneDeep(this.order);
                        this.updateToolbar();
                    });
                }
            });
    }

    private setup() {
        this.deletedItems = [];

        this.companySettingsService.Get(1)
            .subscribe(settings => this.companySettings = settings,
                err => {
                    console.log('Error retrieving company settings data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av firmainnstillinger:', ToastType.bad, 0, this.toastService.parseErrorMessageFromError(err));
                });

        if (!this.formIsInitialized) {
            this.fields = this.getComponentLayout().Fields;

            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.orderID > 0 ?
                        this.customerOrderService.Get(this.orderID, this.expandOptions)
                        : this.customerOrderService.newCustomerOrder()
                ),
                this.customerService.GetAll(null, ['Info']),
                this.addressService.GetNewEntity(null, 'address'),
                this.orderID ? Observable.of(null) : this.userService.getCurrentUser()
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.order = response[2];
                this.customers = response[3];
                this.emptyAddress = response[4];
                const currentUser = response[5];

                if (!this.orderID) {
                    this.order.OurReference = currentUser.DisplayName;
                }

                // Add a blank item in the dropdown controls
                this.customers.unshift(null);

                this.addressService.setAddresses(this.order);
                this.setTabTitle();
                this.updateSaveActions();
                this.updateToolbar();
                this.extendFormConfig();

                this.formIsInitialized = true;
            }, (err) => {
                this.toastService.addToast('En feil oppsto ved henting av data:', ToastType.bad, 0, this.toastService.parseErrorMessageFromError(err));
            });
        } else {
            const source = this.orderID > 0 ?
                this.customerOrderService.Get(this.orderID, this.expandOptions)
                : Observable.fromPromise(this.customerOrderService.newCustomerOrder());

            source
                .subscribe((order) => {
                    this.order = order;
                    this.addressService.setAddresses(this.order);
                    this.setTabTitle();
                    this.updateToolbar();
                    this.updateSaveActions();
                } , (err) => {
                    console.log('Error retrieving data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av data:', ToastType.bad, 0, this.toastService.parseErrorMessageFromError(err));
                });
        }
    }

    private setTabTitle() {
        let tabTitle = this.order.OrderNumber ? 'Ordrenr. ' + this.order.OrderNumber : 'Ordre (kladd)';
        this.tabService.addTab({ url: '/sales/orders/' + this.order.ID, name: tabTitle, active: true, moduleID: UniModules.Orders });
    }

    private extendFormConfig() {
        let self = this;

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === '_InvoiceAddress');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: '_InvoiceAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value, !!!this.order.CustomerID);

                 if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe(address => {
                    if (address._question) { self.saveAddressOnCustomer(address, resolve); }
                    else { resolve(address); }
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var shippingaddress: UniFieldLayout = this.fields.find(x => x.Property === '_ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: '_ShippingAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) { self.saveAddressOnCustomer(address, resolve); }
                    else { resolve(address); }
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var customer: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerID');
        customer.Options = {
            source: this.customers,
            valueProperty: 'ID',
            displayProperty: 'Info.Name',
            debounceTime: 200
        };
    }

    private saveAddressOnCustomer(address: Address, resolve) {
        var idx = 0;

        if (!address.ID || address.ID === 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.order.Customer.Info.Addresses.push(address);
            idx = this.order.Customer.Info.Addresses.length - 1;
        } else {
            idx = this.order.Customer.Info.Addresses.findIndex((a) => a.ID === address.ID);
            this.order.Customer.Info.Addresses[idx] = address;
        }

        // remove entries with equal _createguid
        this.order.Customer.Info.Addresses = _.uniq(this.order.Customer.Info.Addresses, '_createguid');

        // this.quote.Customer.Info.ID
        this.businessRelationService.Put(this.order.Customer.Info.ID, this.order.Customer.Info).subscribe((info) => {
                this.order.Customer.Info = info;
                resolve(info.Addresses[idx]);
            });
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
        this.order.Items = orderItems;

        // do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }

        this.recalcTimeout = setTimeout(() => {
            this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(orderItems);
            this.updateToolbar();
            this.setSums();
        }, 500);
    }

    private deleteItem(item: CustomerOrderItem) {
        this.deletedItems.push(item);
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
                    console.log('== TRANSFER-TO-INVOICE FAILED ==');
                    done('Feilet i overføring til faktura');
                    this.log(err);
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
                    this.ready(null);
                });
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        });
    }

    private saveOrder(done: any, next: any = null) {
        // Transform addresses to flat
        this.addressService.addressToInvoice(this.order, this.order._InvoiceAddress);
        this.addressService.addressToShipping(this.order, this.order._ShippingAddress);

        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        this.order.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerOrderItemService.getNewGuid();
            }
        });

        // set deleted items as deleted on server as well, using soft delete / complex put
        this.deletedItems.forEach((item: CustomerOrderItem) => {
           // don't send deleted items that has not been saved previously,
           // because this can cause problems with validation
           if (item.ID > 0) {
               item.Deleted = true;
               this.order.Items.push(item);
           }
        });

        this.deletedItems = [];

        //Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.order.Items)) {
            console.log('Linjer uten produkt. Lagring avbrutt.');
            if (done) {
                done('Lagring feilet')
            }
            return;
        }

        if (this.orderID > 0) {
            this.customerOrderService.Put(this.order.ID, this.order)
                .subscribe(
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
                        console.log('Feil oppsto ved lagring', err);
                        done('Feil oppsto ved lagring');
                        this.log(err);
                    }
                );
        } else {
            this.customerOrderService.Post(this.order)
                .subscribe(
                    (orderSaved) => {
                        if (next) {
                            next(this.order);
                        } else {
                            done('Ordre lagret');
                        }

                        this.router.navigateByUrl('/sales/orders/' + orderSaved.ID);
                    },
                    (err) => {
                        console.log('Feil oppsto ved lagring', err);
                        done('Feil oppsto ved lagring');
                        this.log(err);
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
            });
        });
    }

    private getComponentLayout(): any {
        return {
            Name: 'CustomerOrder',
            BaseEntity: 'CustomerOrder',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerOrder',
                    Property: 'CustomerID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kunde',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerOrder',
                    Property: 'OrderDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Ordredato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerOrder',
                    Property: 'DeliveryDate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsdato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerOrder',
                    Property: 'CreditDays',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kredittdager',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Address',
                    Property: '_InvoiceAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturaadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Address',
                    Property: '_ShippingAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 6,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Vår referanse
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'OurReference',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Vår referanse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Deres referanse
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'YourReference',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Deres referanse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 11,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Rekvisisjon
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'Requisition',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Rekvisisjon',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 12,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerOrder',
                    Property: 'FreeTxt',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: '',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 1,
                    Sectionheader: 'Fritekst',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Fritekst',
                    StatusCode: 0,
                    ID: 30,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Classes: 'max-width'
                }
            ]
        };
    }
}
