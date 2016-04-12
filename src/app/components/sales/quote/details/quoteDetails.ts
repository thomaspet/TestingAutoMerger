import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, SupplierService, ProjectService, DepartementService} from "../../../../services/services";
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
import {QuoteCalculationSummary} from '../../../../models/sales/QuoteCalculationSummary';
import {StatusCodeCustomerQuote} from '../../../../models/sales/StatusCodeCustomerQuote';

@Component({
    selector: "quote-details",
    templateUrl: "app/components/sales/quote/details/quoteDetails.html",    
    directives: [UniComponentLoader, RouterLink, QuoteItemList],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService, ProjectService, DepartementService]
})
export class QuoteDetails {
            
    @Input() QuoteID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    businessRelation: BusinessRelation;
    quote: CustomerQuote;
    lastSavedInfo: string;
    
    itemsSummaryData: QuoteCalculationSummary;
    
    customers: Customer[];
    dropdownData: any;
   
    formConfig: UniFormBuilder;
    formInstance: UniForm;
    
    whenFormInstance: Promise<UniForm>;
       
    constructor(private customerService: CustomerService, 
                private customerQuoteService: CustomerQuoteService, 
                private customerQuoteItemService: CustomerQuoteItemService,
                private departementService: DepartementService,
                private projectService: ProjectService, 
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
            this.customerQuoteService.Get(this.QuoteID, ['Dimensions','Items','Items.Product','Items.VatType']),
            this.customerService.GetAll(null, ['Info', 'Info.Addresses'])
        ).subscribe(response => { 
                this.dropdownData = [response[0], response[1]];
                this.quote = response[2];
                this.customers = response[3];
                
                this.customers.forEach(customer => {
                   if (customer.ID == this.quote.CustomerID) {
                       this.businessRelation = customer.Info;
                       console.log("=== ADDRESSES ===");
                       console.log(this.businessRelation);
                   } 
                });
                                                                                                   
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                
            });       
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
                        
        if (this.quote.StatusCode == null) {
            //set status if it is a draft
            this.quote.StatusCode = StatusCodeCustomerQuote.Draft;
        }            
        this.lastSavedInfo = 'Lagrer tilbud...';
    
        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
                (updatedValue) => {  
                    this.lastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();    
                },
                (err) => console.log('Feil oppsto ved lagring', err)
            );
    }       
    
    getStatusText() {
        if (this.quote) {
            if (!this.quote.StatusCode) {
                return 'Ikke satt';
            } else {
                return StatusCodeCustomerQuote[this.quote.StatusCode].toString();
            }
        }
        return 'Ikke satt';
    }
           
    nextQuote() {
        var self = this;
        this.customerQuoteService.Next(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });
    }
    
    previousQuote() {
        this.customerQuoteService.Previous(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });        
    }
    
    addQuote() {
        var q = new CustomerQuote();
        
        this.customerQuoteService.Post(q)
            .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/qupte/details/' + data.ID);        
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
            .setModel(this.businessRelation)
            .setModelField('Addresses')
            .setModelDefaultField("InvoiceAddressID")
          //  .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);     

        var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        shippingaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.businessRelation)
            .setModelField('Addresses')
            .setModelDefaultField("ShippingAddressID")
        //    .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);   
    
        var customer: UniFieldBuilder = this.formConfig.find('CustomerID');
        customer
            .setKendoOptions({
               dataTextField: 'Info.Name',
               dataValueField: 'ID',
               dataSource: this.customers
            });
            
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
                    Property: "DeliveryDate",
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
                    EntityType: "Address",
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
                    EntityType: "Address",
                    Property: "ShippingAddress",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
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
                    Label: "Prosjekt",
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
                    Label: "Avdeling",
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