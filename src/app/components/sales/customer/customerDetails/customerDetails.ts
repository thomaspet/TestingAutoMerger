import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, FieldLayout, ComponentLayout, Customer} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

@Component({
    selector: "customer-details",
    templateUrl: "app/components/sales/customer/customerDetails/customerDetails.html",
    directives: [UniComponentLoader]
})
export class CustomerDetails {
            
    @Input()
    Customer: Customer;
               
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;

    constructor() {
        this.Customer = new Customer();
        this.Customer.Orgnumber = "912849627";
    }
    
    ngOnInit() {
    }
    
    ngAfterViewInit() {        
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Customer",
            BaseEntity: "Customer",
            StatusID: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "CustomerNo",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kundenummer",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
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
                    StatusID: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "Orgnumber",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Organisasjonsnummer",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "Address",
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
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "Address2",
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
                    StatusID: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "Address",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "E-post adresser",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "Address3",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Telefonnumre",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 6,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
                    Property: "WebUrl",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Webadresse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 7,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
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
                    StatusID: 0,
                    ID: 8,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Customer",
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
                    StatusID: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null 
                },
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Customer);
        //this.FormConfig.hideSubmitButton();  
        this.extendFormConfig();
        this.loadForm();                      
    }
    
    extendFormConfig() {
/*
        var journalEntryNo: UniFieldBuilder = this.FormConfig.find('JournalEntryNo');       
        journalEntryNo.setKendoOptions({
           format: "n0",
           min: 1
        });
        journalEntryNo.addClass('small-field');
        
        var departement: UniFieldBuilder = this.FormConfig.find('Dimensions.DepartementID');       
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.departements
        });
        departement.addClass('large-field');

        var project: UniFieldBuilder = this.FormConfig.find('Dimensions.ProjectID');
        project.setKendoOptions({
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: this.projects 
        });      
        project.addClass('large-field');
        
        var vattype: UniFieldBuilder = this.FormConfig.find('DebitVatTypeID');
        vattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });      

        var debitaccount: UniFieldBuilder = this.FormConfig.find('DebitAccountID');
        debitaccount.setKendoOptions({
           dataTextField: 'AccountNumber',
           dataValueField: 'ID',
           //template: "${data.AccountNumber} - ${data.AccountName}",
           dataSource: this.accounts
        });      
        
        var creditaccount: UniFieldBuilder = this.FormConfig.find('CreditAccountID');
        creditaccount.setKendoOptions({
           dataTextField: 'AccountNumber',
           dataValueField: 'ID',
           //template: "${data.AccountNumber} - ${data.AccountName}",
           dataSource: this.accounts
        }); 
        
        var description: UniFieldBuilder = this.FormConfig.find('Description');
        description.addClass('large-field');  
*/   
    }    
    
    private buildFormConfig(layout: ComponentLayout, model: Customer) {
        this.FormConfig = new UniFormLayoutBuilder().build(layout, model);
    }
       
    loadForm() {       
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           setTimeout(() => {
                self.formInstance = cmp.instance;
           });
        });
    }           
}