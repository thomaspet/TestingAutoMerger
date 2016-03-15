import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {DepartementService, ProjectService, CustomerService} from "../../../../services/services";

import {FieldType, FieldLayout, ComponentLayout, Customer, BusinessRelation} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

@Component({
    selector: "customer-details",
    templateUrl: "app/components/sales/customer/customerDetails/customerDetails.html",
    directives: [UniComponentLoader],
    providers: [DepartementService, ProjectService, CustomerService]
})
export class CustomerDetails {
            
    @Input() CustomerNo: any;
                  
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    DropdownData: any;
    Customer: Customer;
    
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
        
        this.CustomerNo = params.get("CustomerNo");
    }
    
    ngOnInit() {
        if (this.CustomerNo > 0) {
            Observable.forkJoin(
                this.departementService.GetAll(null),
                this.projectService.GetAll(null),
                this.customerService.Get(this.CustomerNo, ["Info"])
            ).subscribe(response => {
                this.DropdownData = [response[0], response[1]];
                this.Customer = response[2];
                console.log("RESPONSE");
                console.log(this.Customer);
                
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                  
            });            
        } else {
            Observable.forkJoin(
                this.departementService.GetAll(null),
                this.projectService.GetAll(null)
            ).subscribe(response => {
                this.DropdownData = [response[0], response[1]];
                this.Customer = { BusinessRelationID: 0, Info: new BusinessRelation(), Orgnumber: "", StatusID: 0, Deleted: false, ID: 0, CustomFields: null };
                
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();                  
            });                        
        }
        
        
    }
    
    createFormConfig() {   
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
                    StatusID: 0,
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
                    ComponentLayoutID: 3,
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
                    StatusID: 0,
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
                    StatusID: 0,
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
                    StatusID: 0,
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
                    Section: 1,
                    Legend: "Dimensjoner",
                    StatusID: 0,
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
                    Section: 1,
                    Legend: "",
                    StatusID: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Customer);
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
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           cmp.instance.getEventEmitter().subscribe(this.onSubmit(this));
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;
           });
        });
    }           

    onSubmit(context: CustomerDetails) {
        return () => {    
            var customer = this.formInstance.getValue();
            
            context.Customer.Orgnumber = customer["OrgNumber"];
            
            console.log("BEFORE SAVING");
            console.log(customer);
            
            if (context.Customer.ID > 0) {
                context.customerService.Put(context.Customer.ID, context.Customer).subscribe(
                        (data: Customer) => {
                            context.Customer = data;
                            context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.Customer));
                        },
                        (error: Error) => console.error('error in CustomerDetails.onSubmit - Put: ', error)
                    );       
            } else {
                context.customerService.Post(context.Customer).subscribe(
                        (data: Customer) => {
                            context.Customer = data;
                            this.router.navigateByUrl("/customer/" + context.Customer.ID);
                        },
                        (error: Error) => console.error('error in CustomerDetails.onSubmit - Post: ', error)
                    );    
            }
        }
    }
}