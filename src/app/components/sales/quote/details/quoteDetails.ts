import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, SupplierService, ProjectService, DepartementService} from "../../../../services/services";
import {QuoteItemList} from './quoteItemList';

import {FieldType, FieldLayout, ComponentLayout, CustomerQuote, CustomerQuoteItem, Customer, Departement, Project} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {AddressModal} from "../../customer/modals/address/address";

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
    
    Quote: CustomerQuote;
    LastSavedInfo: string;
    
    Customers: Customer[];
    DropdownData: any;
   
    FormConfig: UniFormBuilder;
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
            this.customerQuoteService.Get(this.QuoteID, ["Dimensions"]),
            this.customerService.GetAll(null, ["Info"])
        ).subscribe(response => { 
                this.DropdownData = [response[0], response[1]];
                this.Quote = response[2];
                this.Customers = response[3];
                                             
                console.log("== QUOTE ==");
                console.log(this.Quote);                             
                                                               
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                
            });       
    }
    
    saveQuoteManual(event: any) {        
        this.saveQuote(false);
    }

    saveQuote(autosave: boolean) {
        this.formInstance.updateModel();
                        
        if (!autosave) {            
            if (this.Quote.StatusCode == null) {
                //set status if it is a draft
                this.Quote.StatusCode = 1;
            }            
            this.LastSavedInfo = 'Lagrer tilbud...';                
        } else {
           this.LastSavedInfo = 'Autolagrer tilbud...';
        }                
                            
        this.customerQuoteService.Put(this.Quote.ID, this.Quote)
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
           
    nextQuote() {
        var self = this;
        this.customerQuoteService.NextQuote(this.Quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });
    }
    
    previousQuote() {
        this.customerQuoteService.PreviousQuote(this.Quote.ID)
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
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Quote);
        this.FormConfig.hideSubmitButton();        
    }
    
    extendFormConfig() {   
        var departement: UniFieldBuilder = this.FormConfig.find('Dimensions.DepartementID');         
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.DropdownData[0]
        });
        departement.addClass('large-field');

        var project: UniFieldBuilder = this.FormConfig.find('Dimensions.ProjectID');
        project.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.DropdownData[1]
        });      
        project.addClass('large-field');  
       
        var invoiceaddress: UniFieldBuilder = this.FormConfig.find('InvoiceAddress');
        invoiceaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Quote.Dimensions)
            .setModelField('Addresses')
            .setModelDefaultField("InvoiceAddressID")
          //  .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);     

        var shippingaddress: UniFieldBuilder = this.FormConfig.find('ShippingAddress');
        shippingaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Quote.Dimensions)
            .setModelField('Addresses')
            .setModelDefaultField("ShippingAddressID")
        //    .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);   
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
                {
                    ComponentLayoutID: 3,
                    EntityType: "CustomerQuote",
                    Property: "Customer",
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
                    FieldType: 1,
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