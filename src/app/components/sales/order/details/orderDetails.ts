import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from 'angular2/core';
import {Router, RouteParams, RouterLink} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';

import {CustomerOrderService, CustomerOrderItemService, CustomerService, SupplierService, ProjectService, DepartementService, AddressService} from '../../../../services/services';
import {OrderItemList} from './orderItemList';
import {OrderToInvoiceModal} from '../modals/ordertoinvoice';

import {FieldType, FieldLayout, ComponentLayout, CustomerOrder, CustomerOrderItem, Customer, Departement, Project, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerOrder} from '../../../../unientities';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UniFormBuilder} from '../../../../../framework/forms/builders/uniFormBuilder';
import {UniFormLayoutBuilder} from '../../../../../framework/forms/builders/uniFormLayoutBuilder';
import {UniSectionBuilder} from '../../../../../framework/forms';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFieldBuilder} from '../../../../../framework/forms/builders/uniFieldBuilder';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {AddressModal} from '../../customer/modals/address/address';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

declare var _;
     
@Component({
    selector: 'order-details',
    templateUrl: 'app/components/sales/order/details/orderDetails.html',    
    directives: [UniComponentLoader, RouterLink, OrderItemList, AddressModal, OrderToInvoiceModal],
    providers: [CustomerOrderService, CustomerOrderItemService, CustomerService, ProjectService, DepartementService, AddressService]
})
export class OrderDetails {
            
    @Input() OrderID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    @ViewChild(OrderToInvoiceModal)
    oti: OrderToInvoiceModal;
    
    businessRelationInvoice: BusinessRelation;
    businessRelationShipping: BusinessRelation;
    order: CustomerOrder;
    lastSavedInfo: string;
    statusText: string;
    
    itemsSummaryData: TradeHeaderCalculationSummary;
    
    customers: Customer[];
    dropdownData: any;
   
    formConfig: UniFormBuilder;
    formInstance: UniForm;
    
    whenFormInstance: Promise<UniForm>;
    
    EmptyAddress: Address;
       
    constructor(private customerService: CustomerService, 
                private customerOrderService: CustomerOrderService, 
                private customerOrderItemService: CustomerOrderItemService,
                private departementService: DepartementService,
                private projectService: ProjectService,
                private addressService: AddressService, 
                private router: Router, private params: RouteParams) {                
        this.OrderID = params.get('id');
    }
    
    log(err) {
        alert(err._body);
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerOrderService.Get(this.OrderID, ['Dimensions','Items','Items.Product','Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']),
            this.customerService.GetAll(null, ['Info'])
        //    this.addressService.GetNewEntity()
        ).subscribe(response => { 
                this.dropdownData = [response[0], response[1]];
                this.order = response[2];
                this.customers = response[3];
            //    this.EmptyAddress = response[4];                
                this.EmptyAddress = new Address();
                                                                   
                this.updateStatusText();
                this.addAddresses();                                                                               
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                
            });       
    }
        
    addAddresses() {
       
        if (this.order.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.order.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.order.Customer.Info);         
        } else {
            this.businessRelationInvoice = new BusinessRelation();
            this.businessRelationShipping = new BusinessRelation();
            
            this.businessRelationInvoice.Addresses = [];
            this.businessRelationShipping.Addresses = [];
        }           
                                    
        this.businessRelationInvoice.Addresses.unshift(this.invoiceToAddress());
        this.businessRelationShipping.Addresses.unshift(this.shippingtoAddress());
                           
    }    
        
    recalcTimeout: any;
    
    recalcItemSums(orderItems: any) {
        this.order.Items = orderItems;
    
        //do recalc after 2 second to avoid to much requests
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
            .subscribe((data) => this.itemsSummaryData = data,
                       (err) => { 
                           console.log('Error when recalculating items:',err);
                           this.log(err);
                       })
        }, 2000); 
    }
    
    saveOrderManual(event: any) {        
        this.saveOrder();
    }
    
    saveAndTransferToInvoice(event: any) {
        this.oti.Changed.subscribe(items => {
            var order : CustomerOrder = _.cloneDeep(this.order);
            order.Items = items;
            
            this.customerOrderService.ActionWithBody(order.ID, order, "transfer-to-invoice").subscribe((invoice) => {
                this.router.navigateByUrl('/sales/invoice/details/' + invoice.ID);
            }, (err) => {
                console.log("== TRANSFER-TO-INVOICE FAILED ==");
                this.log(err);
            });
        });

        this.saveOrder(order => {
            this.oti.openModal(this.order);            
        });        
    }
    
    saveOrderTransition(event: any, transition: string) {
        this.saveOrder((order) => {
            this.customerOrderService.Transition(this.order.ID, this.order, transition).subscribe((x) => {
              console.log("== TRANSITION OK " + transition + " ==");
              
              this.customerOrderService.Get(order.ID, ['Dimensions','Items','Items.Product','Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']).subscribe((order) => {
                this.order = order;
                this.updateStatusText();
              });
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                this.log(err);
            });
        });          
    }

    saveOrder(cb = null) {
        this.formInstance.sync();        
        this.lastSavedInfo = 'Lagrer ordre...';
        this.order.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed
                
        this.customerOrderService.Put(this.order.ID, this.order)
            .subscribe(
                (order) => {  
                    this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                    this.order = order;
                    this.updateStatusText();
                    if (cb) cb(order);    
                },
                (err) => { 
                    console.log('Feil oppsto ved lagring', err);
                    this.log(err);
                }
            );
    }
             
    updateStatusText() {     
        this.statusText = this.customerOrderService.getStatusText((this.order.StatusCode || '').toString());
    }
           
    nextOrder() {
        var self = this;
        this.customerOrderService.next(this.order.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/order/details/' + data.ID);
            });
    }
    
    previousOrder() {
        this.customerOrderService.previous(this.order.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/order/details/' + data.ID);
            });        
    }
    
    addOrder() {
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
        
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = this.getComponentLayout();
        
        this.formConfig = new UniFormLayoutBuilder().build(view, this.order);
        this.formConfig.hideSubmitButton();        
    }
    
    extendFormConfig() {  
        
        var self = this; 
        var departement: UniFieldBuilder = this.formConfig.find('Dimensions.DepartementID');         
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.dropdownData[0]
        });
        departement.addClass('large-field');

        var project: UniFieldBuilder = this.formConfig.find('Dimensions.ProjectID');
        project.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.dropdownData[1]
        });      
        project.addClass('large-field');  
       
        var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
        invoiceaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.businessRelationInvoice)
            .setModelField('Addresses')
          //  .setModelDefaultField('InvoiceAddressID')           
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);
        invoiceaddress.onSelect = (address: Address) => {
            this.addressToInvoice(address);
            this.businessRelationInvoice.Addresses[0] = address;            
        };

        var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        shippingaddress
            .hasLineBreak(true)
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.businessRelationShipping)
            .setModelField('Addresses')
        //    .setModelDefaultField('ShippingAddressID')
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);   
        shippingaddress.onSelect = (address: Address) => {
            this.addressToShipping(address);
            this.businessRelationShipping.Addresses[0] = address;   
        };
    
        var customer: UniFieldBuilder = this.formConfig.find('CustomerID');
        customer
            .setKendoOptions({
               dataTextField: 'Info.Name',
               dataValueField: 'ID',
               dataSource: this.customers
            });
        customer.onSelect = function (customerID) {
            console.log('Customer changed');
            
            self.customerService.Get(customerID, ['Info', 'Info.Addresses']).subscribe((customer) => {
                self.order.Customer = customer;
                self.order.CustomerName = customer.Info.Name;
                self.addAddresses();           
                invoiceaddress.refresh(self.businessRelationInvoice);
                shippingaddress.refresh(self.businessRelationShipping);
            });
        };
            
        var freeTextField: UniFieldBuilder = this.formConfig.find('FreeTxt');
        freeTextField.addClass('max-width'); 
        
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.formConfig;
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;             
           });           
        });
    } 
    
    
    invoiceToAddress(): Address {
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
    
    shippingtoAddress(): Address {
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

    addressToInvoice(a: Address) {
        this.order.InvoiceAddressLine1 = a.AddressLine1;
        this.order.InvoiceAddressLine2 = a.AddressLine2;
        this.order.ShippingAddressLine3 = a.AddressLine3;
        this.order.InvoicePostalCode = a.PostalCode;
        this.order.InvoiceCity = a.City;
        this.order.InvoiceCountry = a.Country;
        this.order.InvoiceCountryCode = a.CountryCode;     
    }    

    addressToShipping(a: Address) {
        this.order.ShippingAddressLine1 = a.AddressLine1;
        this.order.ShippingAddressLine2 = a.AddressLine2;
        this.order.ShippingAddressLine3 = a.AddressLine3;
        this.order.ShippingPostalCode = a.PostalCode;
        this.order.ShippingCity = a.City;
        this.order.ShippingCountry = a.Country;
        this.order.ShippingCountryCode = a.CountryCode;     
    } 
    
    getComponentLayout(): ComponentLayout {
        return {
            Name: "CustomerOrder",
            BaseEntity: "CustomerOrder",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerOrder",
                    Property: "CustomerID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kunde",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerOrder",
                    Property: "OrderDate",
                    Placement: 3,
                    Hidden: false,
                    FieldType: 2,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Ordredato",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerOrder",
                    Property: "DeliveryDate",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 2,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Leveringsdato",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerOrder",
                    Property: "CreditDays",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kredittdager",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "BusinessRelation",
                    Property: "InvoiceAddress",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fakturaadresse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "BusinessRelation",
                    Property: "ShippingAddress",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Leveringsadresse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 6,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Project",
                    Property: "Dimensions.ProjectID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Std. prosjekt på linje",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 7,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Departement",
                    Property: "Dimensions.DepartementID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Std. avdeling på linje",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 8,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerOrder",
                    Property: "FreeTxt",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 16,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 1,
                    Legend: "Fritekst",
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null
                }
            ]
        };
    }
}