import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, SupplierService, ProductService} from "../../../../services/services";
import {QuoteItemList} from './quoteItemList';

import {FieldType, FieldLayout, ComponentLayout, CustomerQuote, CustomerQuoteItem, Customer} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

@Component({
    selector: "quote-details",
    templateUrl: "app/components/sales/quote/details/quoteDetails.html",    
    directives: [UniComponentLoader, RouterLink, QuoteItemList],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService]
})
export class QuoteDetails {
            
    @Input() quoteId: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    quote: CustomerQuote;
    LastSavedInfo: string;
    
    ItemsSummaryData: any;
    
    customers: Customer[];
   
    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    
    whenFormInstance: Promise<UniForm>;
       
    constructor(private customerService: CustomerService, private customerQuoteService: CustomerQuoteService, private customerQuoteItemService: CustomerQuoteItemService, private router: Router, private params: RouteParams) {                
        this.quoteId = params.get("id");
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.customerQuoteService.Get(this.quoteId),
            this.customerService.GetAll(null, ["Info"])
        ).subscribe(response => { 
                this.quote = response[0];
                this.customers = response[1];
                                               
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                
            });       
    }
    
    recalcItemSums(quoteItems: any) {        
        console.log('rekalkulerer summer i parent - data: ', quoteItems);
        
        this.ItemsSummaryData = {
            NumberOfItems: 0,
            SumDiscount: 0,
            SumIncVat: 0    
        };
        
        quoteItems.forEach ((x) => {
            this.ItemsSummaryData.SumDiscount += x.Discount;
            this.ItemsSummaryData.SumIncVat += x.SumTotalIncVat;    
        }); 
        
        
        this.ItemsSummaryData.NumberOfItems = quoteItems.length;
                
    }
    
    saveQuoteManual(event: any) {        
        this.saveQuote(false);
    }

    saveQuote(autosave: boolean) {
        this.formInstance.updateModel();
                        
        if (!autosave) {            
            if (this.quote.StatusCode == null) {
                //set status if it is a draft
                this.quote.StatusCode = 1;
            }            
            this.LastSavedInfo = 'Lagrer tilbud...';                
        } else {
           this.LastSavedInfo = 'Autolagrer tilbud...';
        }                
                            
        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
                (updatedValue) => {                    
                    if (autosave) {
                        this.LastSavedInfo = "Sist autolagret: " + (new Date()).toLocaleTimeString();
                    } else {
                        //redirect back to list?
                        this.LastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();                         
                    }                                       
                },
                (err) => console.log('Feil oppsto ved lagring', err)
            );
    }       
           
    previousProduct() {
        
    }
    
    nextProduct() {
        
    }
    
    addProduct() {
        
    }
        
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = this.getComponentLayout();
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.quote);
        this.FormConfig.hideSubmitButton();        
    }
    
    extendFormConfig() {
        /*
        var typeField: UniFieldBuilder = this.FormConfig.find('Customer');       
        typeField.setKendoOptions({
            dataTextField: 'TypeName',
            dataValueField: 'ID',
            dataSource: this.customers
        });
        
                   
        var descriptionField: UniFieldBuilder = this.FormConfig.find('Description');
        descriptionField.addClass('max-width');   
        */    
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;   
                
                //subscribe to valueChanges of form to autosave data after X seconds
                self.formInstance.form
                    .valueChanges
                    .debounceTime(5000)
                    .subscribe(
                        (value) =>  {                                                                                
                            self.saveQuote(true);                            
                        },
                        (err) => { 
                            console.log('Feil oppsto:', err);
                        }
                    );                    
               
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
                /*{
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "PartName",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false, 
                    LookupField: false,
                    Label: "Produktnr",
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
                    EntityType: "Product",
                    Property: "Name",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Navn",
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
                    EntityType: "Product",
                    Property: "Type",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Produkttype",
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
                    EntityType: "Product",
                    Property: "Unit",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Enhet",
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
                    EntityType: "Product",
                    Property: "CostPrice",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Innpris eks. mva",
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
                    ComponentLayoutID: 1,
                    EntityType: "Product",
                    Property: "VatTypeID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Mvakode",
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
                    EntityType: "Product",
                    Property: "CalculateGrossPriceBasedOnNetPrice",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 8,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kalkuler utpris eks mva basert på utpris inkl. mva",
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
                    EntityType: "Product",
                    Property: "PriceExVat",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Utpris eks. mva",
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
                    EntityType: "Product",
                    Property: "PriceIncVat",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Utpris inkl. mva",
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
                    ComponentLayoutID: 1,
                    EntityType: "Product",
                    Property: "AccountID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Hovedbokskonto",
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
                    EntityType: "Product",
                    Property: "Description",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beskrivelse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 1,
                    Legend: "Beskrivelse",
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null
                }  */              
            ]
        };
    }
}