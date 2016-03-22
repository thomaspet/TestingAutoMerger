import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {DepartementService, ProjectService, CustomerService} from "../../../../services/services";
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {FieldType, FieldLayout, ComponentLayout, Customer, BusinessRelation} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

import {AddressModal} from "../modals/address/address";
import {EmailModal} from "../modals/email/email";
import {PhoneModal} from "../modals/phone/phone";

@Component({
    selector: "customer-details",
    templateUrl: "app/components/sales/customer/customerDetails/customerDetails.html",    
    directives: [UniComponentLoader, RouterLink, AddressModal, EmailModal, PhoneModal, ExternalSearch],
    providers: [DepartementService, ProjectService, CustomerService]
})
export class CustomerDetails {
            
    @Input() CustomerNo: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    DropdownData: any;
    Customer: Customer;
    LastSavedInfo: string;
    searchText: string;
    
    whenFormInstance: Promise<UniForm>;
        
    // TEST MULTI
    private email = [
        {
            id: 0,
            value: "audhild@unimicro.no",
            main: false,

        },
        {
            id: 1,
            value: "audhild.grieg@gmail.com",
            main: true
        },
        {
            id: 2,
            value: "nsync4eva@hotmail.com",
            main: false
        }
    ];

    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private customerService: CustomerService,
                private router: Router,
                private params: RouteParams
                ) {
                
        this.CustomerNo = params.get("id");
        
        console.log(params.get("action"));
        
        this.router.subscribe((val) => {
            console.log("val");
            console.log(val);
          //  if (this.isActive(['../CustomerPrevious'])) {
          //      console.log("PREVIOUS==");
          //  } else if(this.isActive(['../CustomerNext'])) {
          //      console.log("NEXT==");
          //  }
        });
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerService.Get(this.CustomerNo, ["Info"])
        ).subscribe(response => {
            this.DropdownData = [response[0], response[1]];
            this.Customer = response[2];
                            
            this.createFormConfig();
            this.extendFormConfig();
            this.loadForm();                  
        });       
    }
    
    addSearchInfo(selectedSearchInfo: SearchResultItem) {
        if (this.Customer != null) {
            this.Customer.Info.Name = selectedSearchInfo.navn;
            this.Customer.Orgnumber = selectedSearchInfo.orgnr;
            
            this.formInstance.refresh(this.Customer); 
        } 
    }
    
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Customer",
            BaseEntity: "Customer",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
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
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "BusinessRelation",
                    Property: "Info.Name",
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
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Address",
                    Property: "Info.InvoiceAddress.AddressLine1",
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
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Address",
                    Property: "Info.ShippingAddress.AddressLine1",
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
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
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
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
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
                    StatusCode: 0,
                    ID: 6,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
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
                    StatusCode: 0,
                    ID: 7,
                    Deleted: false,
                    CustomFields: null 
                },
                                {
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
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
                    Section: 1,
                    Legend: "Betingelser",
                    StatusCode: 0,
                    ID: 7,
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
                    Section: 2,
                    Legend: "Dimensjoner",
                    StatusCode: 0,
                    ID: 8,
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
                    Section: 2,
                    Legend: "",
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Customer);
        this.FormConfig.hideSubmitButton();
    }
    
    extendFormConfig() {
        var orgnumber: UniFieldBuilder = this.FormConfig.find('Orgnumber');
        orgnumber.setKendoOptions({
            mask: '000 000 000',
            promptChar: '_'
        });
                   
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
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           //cmp.instance.getEventEmitter().subscribe(this.onSubmit(this));
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;   
                
                //subscribe to valueChanges of form to autosave data after X seconds
                self.formInstance.form
                    .valueChanges
                    .debounceTime(3000)
                    .subscribe(
                        (value) =>  {                                                                                
                            self.saveCustomer(true);                            
                        },
                        (err) => { 
                            console.log('Feil oppsto:', err);
                        }
                    ); 
                
                //subscribe to valueChanges of Name input to autosearch external registries 
                self.formInstance.controls["Info.Name"]
                    .valueChanges
                    .debounceTime(300)
                    .distinctUntilChanged()
                    .subscribe((data) => self.searchText = data);            
           });           
        });
    }           

    saveCustomerManual(event: any) {        
        this.saveCustomer(false);
    }

    saveCustomer(autosave: boolean) {
        this.formInstance.updateModel();
                        
        if (!autosave) {            
            if (this.Customer.StatusCode == null) {
                //set status if it is a draft
                this.Customer.StatusCode = 1;
            }            
            this.LastSavedInfo = 'Lagrer kundeinformasjon...';                
        } else {
           this.LastSavedInfo = 'Autolagrer kundeinformasjon...';
        }                
                            
        this.customerService.Put(this.Customer.ID, this.Customer)
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
}