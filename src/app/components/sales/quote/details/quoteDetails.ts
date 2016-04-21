import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, SupplierService, ProjectService, DepartementService, AddressService} from "../../../../services/services";
import {QuoteItemList} from './quoteItemList';

import {FieldType, FieldLayout, ComponentLayout, CustomerQuote, CustomerQuoteItem, Customer, Departement, Project, Address, BusinessRelation} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {AddressModal} from "../../customer/modals/address/address";
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

declare var _;
 
@Component({
    selector: "quote-details",
    templateUrl: "app/components/sales/quote/details/quoteDetails.html",    
    directives: [UniComponentLoader, RouterLink, QuoteItemList, AddressModal],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService, ProjectService, DepartementService, AddressService]
})
export class QuoteDetails {
            
    @Input() QuoteID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    businessRelationInvoice: BusinessRelation;
    businessRelationShipping: BusinessRelation;
    quote: CustomerQuote;
    lastSavedInfo: string;
    
    itemsSummaryData: TradeHeaderCalculationSummary;
    
    customers: Customer[];
    dropdownData: any;
   
    formConfig: UniFormBuilder;
    formInstance: UniForm;
    
    whenFormInstance: Promise<UniForm>;
    
    EmptyAddress: Address;
       
    constructor(private customerService: CustomerService, 
                private customerQuoteService: CustomerQuoteService, 
                private customerQuoteItemService: CustomerQuoteItemService,
                private departementService: DepartementService,
                private projectService: ProjectService,
                private addressService: AddressService, 
                private router: Router, private params: RouteParams) {                
        this.QuoteID = params.get("id");
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerQuoteService.Get(this.QuoteID, ['Dimensions','Items','Items.Product','Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']),
            this.customerService.GetAll(null, ['Info'])
        //    this.addressService.GetNewEntity()
        ).subscribe(response => { 
                this.dropdownData = [response[0], response[1]];
                this.quote = response[2];
                this.customers = response[3];
            //    this.EmptyAddress = response[4];                
                this.EmptyAddress = new Address();
                                    
                this.addAddresses();                                                                               
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                
            });       
    }
        
    addAddresses() {
        if (this.quote.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.quote.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.quote.Customer.Info);         
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
    
    recalcItemSums(quoteItems: any) {
        this.quote.Items = quoteItems;
        
        //do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }
        
        this.recalcTimeout = setTimeout(() => {
            
            quoteItems.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;  
            });
            
            this.customerQuoteService.calculateQuoteSummary(quoteItems)
            .subscribe((data) => this.itemsSummaryData = data,
                       (err) => console.log('Error when recalculating items:',err)); 
        }, 2000); 
        
    }
    
    saveQuoteManual(event: any) {        
        this.saveQuote();
    }

    saveQuote() {
        this.formInstance.sync();        
        this.lastSavedInfo = 'Lagrer tilbud...';
        this.quote.StatusCode = 40008;
                
        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
                (updatedValue) => {  
                    this.lastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();    
                },
                (err) => console.log('Feil oppsto ved lagring', err)
            );
    }       
    
    getStatusText() {     
        return this.customerQuoteService.getStatusText((this.quote.StatusCode || "").toString());
    }
           
    nextQuote() {
        var self = this;
        this.customerQuoteService.next(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });
    }
    
    previousQuote() {
        this.customerQuoteService.previous(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });        
    }
    
    addQuote() {
        var q = this.customerQuoteService.newCustomerQuote();          
        
        this.customerQuoteService.Post(q)
            .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);        
                },
                (err) => console.log('Error creating quote: ', err)
            );      
    }
        
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = this.getComponentLayout();
        
        this.formConfig = new UniFormLayoutBuilder().build(view, this.quote);
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
          //  .setModelDefaultField("InvoiceAddressID")           
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
        //    .setModelDefaultField("ShippingAddressID")
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
            self.customerService.Get(customerID, ['Info', 'Info.Addresses']).subscribe((customer) => {
                self.quote.Customer = customer;
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
        a.AddressLine1 = this.quote.InvoiceAddressLine1;
        a.AddressLine2 = this.quote.InvoiceAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.InvoicePostalCode;
        a.City = this.quote.InvoiceCity;
        a.Country = this.quote.InvoiceCountry;
        a.CountryCode = this.quote.InvoiceCountryCode;
                
        return a;
    }
    
    shippingtoAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.quote.ShippingAddressLine1;
        a.AddressLine2 = this.quote.ShippingAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.ShippingPostalCode;
        a.City = this.quote.ShippingCity;
        a.Country = this.quote.ShippingCountry;
        a.CountryCode = this.quote.ShippingCountryCode;
                
        return a;
    }

    addressToInvoice(a: Address) {
        this.quote.InvoiceAddressLine1 = a.AddressLine1;
        this.quote.InvoiceAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.InvoicePostalCode = a.PostalCode;
        this.quote.InvoiceCity = a.City;
        this.quote.InvoiceCountry = a.Country;
        this.quote.InvoiceCountryCode = a.CountryCode;     
    }    

    addressToShipping(a: Address) {
        this.quote.ShippingAddressLine1 = a.AddressLine1;
        this.quote.ShippingAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.ShippingPostalCode = a.PostalCode;
        this.quote.ShippingCity = a.City;
        this.quote.ShippingCountry = a.Country;
        this.quote.ShippingCountryCode = a.CountryCode;     
    } 
    
    getComponentLayout(): ComponentLayout {
        return {
            Name: "CustomerQuote",
            BaseEntity: "CustomerQuote",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerQuote",
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
                    EntityType: "CustomerQuote",
                    Property: "QuoteDate",
                    Placement: 3,
                    Hidden: false,
                    FieldType: 2,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Tilbudsdato",
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
                    EntityType: "CustomerQuote",
                    Property: "ValidUntilDate",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 2,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Gyldig til dato",
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
                    EntityType: "CustomerQuote",
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
                    EntityType: "CustomerQuote",
                    Property: "FreeTxt",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
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