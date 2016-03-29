import {Component, ComponentRef, ViewChild, ViewChildren, Input, Output, EventEmitter} from 'angular2/core';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {ExternalSearch} from '../../../common/externalSearch/externalSearch';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';

import {FieldType, FieldLayout, ComponentLayout, Customer, BusinessRelation} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

@Component({
    selector: 'customer-add',
    templateUrl: 'app/components/sales/customer/add/customerAdd.html',
    directives: [ExternalSearch, UniComponentLoader]    
})
export class CustomerAdd {
    @Input() searchText;
    @Output() Created = new EventEmitter<any>();
                   
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    
    FormConfig: UniFormBuilder;
    formInstance: UniForm;
   
    private customer: any; 
       
    constructor(private http: UniHttp, private router: Router) {
        
    }    
    
    ngOnInit() {
        this.searchText = "testfirma"
        this.customer = {Name: "testfirma"};
    }   
    
    ngAfterViewInit() {        
        // TODO get it from the API and move these to backend migrations   
        var view = this.setupFormConfig();           
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.customer);
        this.FormConfig.hideSubmitButton();        
        this.extendFormConfig();
        this.loadForm();   
    }   
    
    addSearchInfo(searchResultItem: any){
        this.customer.Name = searchResultItem.Name;
        this.customer.Orgnumber = searchResultItem.OrgNo;
        this.customer.City = searchResultItem.City;
        this.customer.Phone = searchResultItem.Phone;
        this.customer.Email = searchResultItem.Email;
        
        //this.formInstance.form.value = this.customer;
        this.formInstance.refresh(this.customer);
    }
    
    createCustomer() {        
        //TODO: send request for å opprette kunde + evt adresse, telefon og epost
        
        //redirect to detail for new customer
        this.router.navigateByUrl('/customer/details/1'); // + newCustomer.ID);
    }
    
    extendFormConfig() {
        var orgnumber: UniFieldBuilder = this.FormConfig.find('Orgnumber');
        orgnumber.setKendoOptions({
            mask: '000 000 000',
            promptChar: '_'
        });                
    }    
       
    loadForm() {       
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           setTimeout(() => {
                self.formInstance = cmp.instance;
                self.formInstance.controls["Name"]
                    .valueChanges
                    .debounceTime(300)
                    .distinctUntilChanged()
                    .subscribe((data) => self.searchText = data);
           });
        });       
        
    }  
    
    setupFormConfig(): ComponentLayout {
        return {
            Name: "Customer",
            BaseEntity: "Customer",
            StatusID: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [                
                {
                    ComponentLayoutID: 3,
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
                    ComponentLayoutID: 3,
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
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
                    Property: "Address",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresselinje 1",
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
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
                    Property: "Address2",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresselinje 2",
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
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
                    Property: "City",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Poststed",
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
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
                    Property: "Email",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "E-post adresse",
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
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
                    Property: "Phone",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Telefonnummer",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 6,
                    Deleted: false,
                    CustomFields: null 
                }
            ]               
        }; 
    }
}