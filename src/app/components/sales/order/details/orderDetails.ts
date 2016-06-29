import {Component, Input, ViewChild} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerOrderService, CustomerOrderItemService, CustomerService, BusinessRelationService} from '../../../../services/services';
import {ProjectService, DepartementService, AddressService, ReportDefinitionService} from '../../../../services/services';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {OrderItemList} from './orderItemList';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

import {FieldType, CustomerOrder, CustomerOrderItem, Customer} from '../../../../unientities';
import {Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerOrder} from '../../../../unientities';
import {AddressModal} from '../../../common/modals/modals';
import {OrderToInvoiceModal} from '../modals/ordertoinvoice';

import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var _;

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
    templateUrl: 'app/components/sales/order/details/orderDetails.html',
    directives: [RouterLink, OrderItemList, AddressModal, UniForm, OrderToInvoiceModal, UniSave, PreviewModal],
    providers: [CustomerOrderService, CustomerOrderItemService, CustomerService, BusinessRelationService,
        ProjectService, DepartementService, AddressService, ReportDefinitionService]
})
export class OrderDetails {

    @Input() public orderID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(OrderToInvoiceModal) private oti: OrderToInvoiceModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    public config: any = {};
    public fields: any[] = [];

    private order: CustomerOrderExt;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;

    private actions: IUniSaveAction[];

    private expandOptions: Array<string> = ['Dimensions', 'Items', 'Items.Product', 'Items.VatType',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses'];

    constructor(private customerService: CustomerService,
        private customerOrderService: CustomerOrderService,
        private customerOrderItemService: CustomerOrderItemService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private businessRelationService: BusinessRelationService,
        private router: Router,
        private params: RouteParams,
        private tabService: TabService) {

        this.orderID = params.get('id');         
    }

    private log(err) {
        alert(err._body);
    }

    public nextOrder() {
        this.customerOrderService.next(this.order.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/order/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting next order: ', err);
                alert('Ikke flere ordre etter denne');
            }
            );
    }

    public previousOrder() {
        this.customerOrderService.previous(this.order.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/order/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting previous order: ', err);
                alert('Ikke flere ordre før denne');
            }
            );
    }

    public addOrder() {
        this.customerOrderService.newCustomerOrder().then(order => {
            this.customerOrderService.Post(order)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/order/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating order: ', err);
                    this.log(err);
                }
                );
        });
    }

    public isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

    public change(value: CustomerOrder) { }

    public ready(event) {
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.order.CustomerID, ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress']).subscribe((customer: Customer) => {
                        let previousAddresses = this.order.Customer ? this.order.Customer.Info.Addresses : null;
                        this.order.Customer = customer;
                        this.addressService.setAddresses(this.order, previousAddresses);
                  
                        this.order.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.order.CreditDays = customer.CreditDays;
                        }

                        this.order = _.cloneDeep(this.order);
                    });
                }
            });
    }

    public ngOnInit() {
        this.getLayoutAndData();

    }

    private getLayoutAndData() {
        this.fields = this.getComponentLayout().Fields;

        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerOrderService.Get(this.orderID, this.expandOptions),
            this.customerService.GetAll(null, ['Info']),
            this.addressService.GetNewEntity(null, 'address')
        ).subscribe(response => {
            this.dropdownData = [response[0], response[1]];
            this.order = response[2];
            this.customers = response[3];
            this.emptyAddress = response[4];

            // Add a blank item in the dropdown controls
            this.dropdownData[0].unshift(null);
            this.dropdownData[1].unshift(null);
            this.customers.unshift(null);

            this.updateStatusText();
            this.addressService.setAddresses(this.order);
            this.setTabTitle();
            this.updateSaveActions();
            this.extendFormConfig();

        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av ordre-data: ' + JSON.stringify(err));
        });
    }

    private setTabTitle() {
        let tabTitle = this.order.OrderNumber ? 'Ordrenr. ' + this.order.OrderNumber : 'Ordre (kladd)'; 
        this.tabService.addTab({ url: '/sales/order/details/' + this.order.ID, name: tabTitle, active: true, moduleID: 4 });
    }

    private extendFormConfig() {
        let self = this;

        var departement: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.DepartementID');
        departement.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        var project: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === '_InvoiceAddress');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: '_InvoiceAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: '_InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value, !!!this.order.CustomerID);

                this.addressModal.Changed.subscribe(address => {
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
            foreignProperty: '_ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe((address) => {
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

    private saveAddressOnCustomer(address: Address, resolve: any) {
        var idx = 0;

        if (!address.ID || address.ID == 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.order.Customer.Info.Addresses.push(address);
            idx = this.order.Customer.Info.Addresses.length - 1;
        } else {
            idx = this.order.Customer.Info.Addresses.findIndex((a) => a.ID === address.ID);
            this.order.Customer.Info.Addresses[idx] = address;
        }

        this.businessRelationService.Put(this.order.Customer.Info.ID, this.order.Customer.Info).subscribe((info) => {
            this.order.Customer.Info = info;
            resolve(info.Addresses[idx]);
        });
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
        if (this.order.StatusCode === StatusCodeCustomerOrder.Draft ||
            this.order.StatusCode === StatusCodeCustomerOrder.Registered ||
            this.order.StatusCode === StatusCodeCustomerOrder.PartlyTransferredToInvoice) {
            return false;
        }
        return true;
    }

    private deleteOrder(done) {
        alert('Slett  - Under construction');
        done('Slett ordre avbrutt');
    }

    private recalcItemSums(orderItems: any) {
        this.order.Items = orderItems;

        // do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }

        this.recalcTimeout = setTimeout(() => {

            orderItems.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;
            });

            this.customerOrderService.calculateOrderSummary(orderItems)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    this.updateSaveActions();
                },
                (err) => {
                    console.log('Error when recalculating items:', err);
                    this.log(err);
                });
        }, 2000);
    }

    private saveOrderManual(done: any) {
        this.saveOrder((order) => {
            done('Lagret');
        });
    }

    private saveAndTransferToInvoice(done: any) {
        this.oti.changed.subscribe(items => {
            // Do not transfer to invoice if no items 
            if (items.length === 0) {
                alert('Kan ikke overføre en ordre uten linjer');
                return;
            }

            var order: CustomerOrder = _.cloneDeep(this.order);
            order.Items = items;

            this.customerOrderService.ActionWithBody(order.ID, order, 'transfer-to-invoice').subscribe((invoice) => {
                this.router.navigateByUrl('/sales/invoice/details/' + invoice.ID);
                done('Lagret og overført til faktura');
            }, (err) => {
                console.log('== TRANSFER-TO-INVOICE FAILED ==');
                done('Feilet i overføring til faktura');
                this.log(err);
            });
        });

        this.saveOrder(order => {
            this.oti.openModal(this.order);
            done('Lagret');
        });
    }

    private saveOrderTransition(done: any, transition: string, doneText: string) {
        this.saveOrder((order) => {
            this.customerOrderService.Transition(this.order.ID, this.order, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                done(doneText);

                this.customerOrderService.Get(order.ID, this.expandOptions).subscribe((data) => {
                    this.order = data;
                    this.addressService.setAddresses(this.order);
                    this.updateStatusText();
                    this.updateSaveActions();
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

    private saveOrder(cb = null) {
        // Transform addresses to flat
        this.addressService.addressToInvoice(this.order, this.order._InvoiceAddress);
        this.addressService.addressToShipping(this.order, this.order._ShippingAddress);

        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        if (this.order.DimensionsID === 0) {
            this.order.Dimensions = new Dimensions();
            this.order.Dimensions['_createguid'] = this.customerOrderService.getNewGuid();
        }

        //Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.order.Items)) {
            console.log('Linjer uten produkt. Lagring avbrutt.');
//            done('Lagring feilet');
            return;
        }

        this.customerOrderService.Put(this.order.ID, this.order)
            .subscribe(
            (orderSaved) => {
                this.customerOrderService.Get(this.orderID, this.expandOptions).subscribe((orderGet) => {
                    this.order = orderGet;
                    this.addressService.setAddresses(this.order);
                    this.updateStatusText();
                    this.updateSaveActions();
                    this.setTabTitle();

                    if (cb) {
                        cb(orderGet);
                    }
                });
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
            }
            );
    }

    private updateStatusText() {
        this.statusText = this.customerOrderService.getStatusText((this.order.StatusCode || '').toString());
    }

    private saveAndPrint(done) {
        this.saveOrder((order) => {
            this.reportDefinitionService.getReportByName('Ordre').subscribe((report) => {
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
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    Placement: 4,
                    Hidden: true, //false, // TODO: > 30.6
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Std. prosjekt på linje',
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
                    ID: 20,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Departement',
                    Property: 'Dimensions.DepartementID',
                    Placement: 4,
                    Hidden: true, //false, // TODO: > 30.6
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Std. avdeling på linje',
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
                    ID: 21,
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
