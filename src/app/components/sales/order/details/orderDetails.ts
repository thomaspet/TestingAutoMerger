import {Component, Input, ViewChild} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerOrderService, CustomerOrderItemService, CustomerService} from '../../../../services/services';
import {ProjectService, DepartementService, AddressService, ReportDefinitionService} from '../../../../services/services';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {OrderItemList} from './orderItemList';

import {FieldType, CustomerOrder, Customer} from '../../../../unientities';
import {Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerOrder} from '../../../../unientities';

import {AddressModal} from '../../customer/modals/address/address';
import {OrderToInvoiceModal} from '../modals/ordertoinvoice';

import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var _;

@Component({
    selector: 'order-details',
    templateUrl: 'app/components/sales/order/details/orderDetails.html',
    directives: [RouterLink, OrderItemList, AddressModal, UniForm, OrderToInvoiceModal, UniSave, PreviewModal],
    providers: [CustomerOrderService, CustomerOrderItemService, CustomerService,
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

    private businessRelationInvoice: BusinessRelation = new BusinessRelation();
    private businessRelationShipping: BusinessRelation = new BusinessRelation();
    private lastCustomerInfo: BusinessRelation;

    private order: CustomerOrder;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;

    private actions: IUniSaveAction[];


    constructor(private customerService: CustomerService,
        private customerOrderService: CustomerOrderService,
        private customerOrderItemService: CustomerOrderItemService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private router: Router,
        private params: RouteParams,
        private tabService: TabService) {

        this.orderID = params.get('id');
        this.businessRelationInvoice.Addresses = [];
        this.businessRelationShipping.Addresses = [];
        this.tabService.addTab({ url: '/sales/order/details/' + this.orderID, name: 'Ordrenr. ' + this.orderID, active: true, moduleID: 4 }); 
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
        this.form.field('FreeTxt').addClass('max-width', true);
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.order.CustomerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
                        this.order.Customer = customer;
                        this.addAddresses();
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
            this.customerOrderService.Get(this.orderID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType',
                'Customer', 'Customer.Info', 'Customer.Info.Addresses']),
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
            this.addAddresses();
            this.updateSaveActions();
            this.extendFormConfig();

        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av ordre-data: ' + JSON.stringify(err));
        });
    }

    private extendFormConfig() {

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

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === 'InvoiceAddress');
        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'Customer.Info.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;
            }
        };


        // var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
        // invoiceaddress
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationInvoice)
        //    .setModelField('Addresses')
        //    //  .setModelDefaultField('InvoiceAddressID')           
        //    .setPlaceholder(this.emptyAddress)
        //    .setEditor(AddressModal);
        // invoiceaddress.onSelect = (address: Address) => {
        //    this.addressToInvoice(address);
        //    this.businessRelationInvoice.Addresses[0] = address;
        // };

        var shippingaddress: UniFieldLayout = this.fields.find(x => x.Property === 'ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'Customer.Info.ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;
            }
        };

        // var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        // shippingaddress
        //    .hasLineBreak(true)
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationShipping)
        //    .setModelField('Addresses')
        //    //    .setModelDefaultField('ShippingAddressID')
        //    .setPlaceholder(this.emptyAddress)
        //    .setEditor(AddressModal);
        // shippingaddress.onSelect = (address: Address) => {
        //    this.addressToShipping(address);
        //    this.businessRelationShipping.Addresses[0] = address;
        // };

        var customer: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerID');
        customer.Options = {
            source: this.customers,
            valueProperty: 'ID',
            displayProperty: 'Info.Name',
            debounceTime: 200
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
            action: (done) => this.saveOrderTransition(done, 'register'),
            disabled: (this.order.StatusCode !== StatusCodeCustomerOrder.Draft)
        });
        this.actions.push({
            label: 'Avslutt ordre',
            action: (done) => this.saveOrderTransition(done, 'complete'),
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

    private addAddresses() {
        var invoiceaddresses = this.businessRelationInvoice.Addresses ? this.businessRelationInvoice.Addresses : [];
        var shippingaddresses = this.businessRelationShipping.Addresses ? this.businessRelationShipping.Addresses : [];
        var firstinvoiceaddress = null;
        var firstshippingaddress = null;

        // remove addresses from last customer
        if (this.lastCustomerInfo) {
            this.lastCustomerInfo.Addresses.forEach(a => {
                invoiceaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete invoiceaddresses[i];
                        return;
                    }
                });
                shippingaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete shippingaddresses[i];
                        return;
                    }
                });
            });
        }

        // Add address from order if no addresses
        if (invoiceaddresses.length == 0) {
            var invoiceaddress = this.invoiceToAddress();
            if (!this.isEmptyAddress(invoiceaddress)) {
                firstinvoiceaddress = invoiceaddress;
            }
        } else {
            firstinvoiceaddress = invoiceaddresses.shift();
        }

        if (shippingaddresses.length == 0) {
            var shippingaddress = this.shippingToAddress();
            if (!this.isEmptyAddress(shippingaddress)) {
                firstshippingaddress = shippingaddress;
            }
        } else {
            firstshippingaddress = shippingaddresses.shift();
        }

        // Add addresses from current customer
        if (this.order.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.order.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.order.Customer.Info);
            this.lastCustomerInfo = this.order.Customer.Info;
        }

        if (!this.isEmptyAddress(firstinvoiceaddress)) {
            this.businessRelationInvoice.Addresses.unshift(firstinvoiceaddress);
        }

        if (!this.isEmptyAddress(firstshippingaddress)) {
            this.businessRelationShipping.Addresses.unshift(firstshippingaddress);
        }

        this.businessRelationInvoice.Addresses = this.businessRelationInvoice.Addresses.concat(invoiceaddresses);
        this.businessRelationShipping.Addresses = this.businessRelationShipping.Addresses.concat(shippingaddresses);
    }

    public recalcItemSums(orderItems: any) {
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
        this.saveOrder((order => {
            done('Lagret');
        }));
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

    private saveOrderTransition(done: any, transition: string) {
        this.saveOrder((order) => {
            this.customerOrderService.Transition(this.order.ID, this.order, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                done('Lagret');

                this.customerOrderService.Get(order.ID, ['Dimensions', 'Items', 'Items.Product',
                    'Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']).subscribe((data) => {
                        this.order = data;
                        this.updateStatusText();
                        this.updateSaveActions();
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
        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        if (this.order.DimensionsID === 0) {
            this.order.Dimensions = new Dimensions();
            this.order.Dimensions['_createguid'] = this.customerOrderService.getNewGuid();
        }

        this.customerOrderService.Put(this.order.ID, this.order)
            .subscribe(
            (order) => {
                this.order = order;
                this.updateStatusText();
                this.updateSaveActions();

                if (cb) {
                    cb(order);
                }
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

    private isEmptyAddress(address: Address): boolean {
        if (address == null) {
            return true;
        }
        return (address.AddressLine1 == null &&
            address.AddressLine2 == null &&
            address.AddressLine3 == null &&
            address.PostalCode == null &&
            address.City == null &&
            address.Country == null &&
            address.CountryCode == null);
    }

    private invoiceToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.order.InvoiceAddressLine1;
        a.AddressLine2 = this.order.InvoiceAddressLine2;
        a.AddressLine3 = this.order.ShippingAddressLine3;
        a.PostalCode = this.order.InvoicePostalCode;
        a.City = this.order.InvoiceCity;
        a.Country = this.order.InvoiceCountry;
        a.CountryCode = this.order.InvoiceCountryCode;

        return a;
    }

    private shippingToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.order.ShippingAddressLine1;
        a.AddressLine2 = this.order.ShippingAddressLine2;
        a.AddressLine3 = this.order.ShippingAddressLine3;
        a.PostalCode = this.order.ShippingPostalCode;
        a.City = this.order.ShippingCity;
        a.Country = this.order.ShippingCountry;
        a.CountryCode = this.order.ShippingCountryCode;

        return a;
    }

    public addressToInvoice(a: Address) {
        this.order.InvoiceAddressLine1 = a.AddressLine1;
        this.order.InvoiceAddressLine2 = a.AddressLine2;
        this.order.ShippingAddressLine3 = a.AddressLine3;
        this.order.InvoicePostalCode = a.PostalCode;
        this.order.InvoiceCity = a.City;
        this.order.InvoiceCountry = a.Country;
        this.order.InvoiceCountryCode = a.CountryCode;
    }

    public addressToShipping(a: Address) {
        this.order.ShippingAddressLine1 = a.AddressLine1;
        this.order.ShippingAddressLine2 = a.AddressLine2;
        this.order.ShippingAddressLine3 = a.AddressLine3;
        this.order.ShippingPostalCode = a.PostalCode;
        this.order.ShippingCity = a.City;
        this.order.ShippingCountry = a.Country;
        this.order.ShippingCountryCode = a.CountryCode;
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
                    EntityType: 'BusinessRelation',
                    Property: 'InvoiceAddress',
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
                    EntityType: 'BusinessRelation',
                    Property: 'ShippingAddress',
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
                    Hidden: false,
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
                    Hidden: false,
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
                    CustomFields: null
                }
            ]
        };
    }
}
