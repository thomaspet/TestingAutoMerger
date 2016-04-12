import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {DepartementService, ProjectService, SupplierService, PhoneService, AddressService, EmailService, BankAccountService} from "../../../../services/services";
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {FieldType, FieldLayout, ComponentLayout, Supplier, BusinessRelation, Email, Phone, Address, BankAccount} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

import {AddressModal} from "../../customer/modals/address/address";
import {EmailModal} from "../../customer/modals/email/email";
import {PhoneModal} from "../../customer/modals/phone/phone";

@Component({
    selector: "supplier-details",
    templateUrl: "app/components/sales/supplier/details/supplierDetails.html",    
    directives: [UniComponentLoader, RouterLink, ExternalSearch, AddressModal, EmailModal, PhoneModal],
    providers: [DepartementService, ProjectService, SupplierService, PhoneService, AddressService, EmailService, BankAccountService]
})
export class SupplierDetails {
            
    @Input() SupplierID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    DropdownData: any;
    Supplier: Supplier;
    LastSavedInfo: string;
    searchText: string;
    
    EmptyPhone: Phone;
    EmptyEmail: Email;
    EmptyAddress: Address;
    BankAccounts: any;
    
    whenFormInstance: Promise<UniForm>;

    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private supplierService: SupplierService,
                private router: Router,
                private params: RouteParams,
                private phoneService: PhoneService,
                private emailService: EmailService,
                private addressService: AddressService,
                private bankaccountService: BankAccountService
                ) {
                
        this.SupplierID = params.get("id");        
    }
    
    nextSupplier() {
        this.supplierService.NextSupplier(this.Supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/supplier/details/' + data.ID);
            });
    }
    
    previousSupplier() {
        this.supplierService.PreviousSupplier(this.Supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/supplier/details/' + data.ID);
            });        
    }
    
    addSupplier() {   
        var c = new Supplier();
        c.Info = new BusinessRelation(); 
        
        this.supplierService.Post(c)
            .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/supplier/details/' + data.ID);        
                },
                (err) => console.log('Error creating supplier: ', err)
            );      

        /* Using GetNewEntity not working        
        this.customerService.setRelativeUrl("customer"); // TODO: remove when its fixed
        this.customerService.GetNewEntity(["Info"]).subscribe((c)=> {
            this.customerService.Post(c)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/sales/customer/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating customer: ', err)
                );        
        });
        */
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.supplierService.Get(this.SupplierID, ["Info", "Info.Phones", "Info.Addresses", "Info.Emails"]),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.bankaccountService.GetAll("")
          //  this.addressService.GetNewEntity()
        ).subscribe(response => {
            this.DropdownData = [response[0], response[1]];
            this.Supplier = response[2];
            this.EmptyPhone = response[3];
            this.EmptyEmail = response[4];
            this.BankAccounts = response[5];
         //   this.EmptyAddress = response[5];
         
            console.log("==SUPPLIER==");
            console.log(this.Supplier);
                       
            this.createFormConfig();
            this.extendFormConfig();
            this.loadForm();                  
        });       
    }
    
    addSearchInfo(selectedSearchInfo: SearchResultItem) {
        if (this.Supplier != null) {
            this.Supplier.Info.Name = selectedSearchInfo.navn;
            this.Supplier.OrgNumber = selectedSearchInfo.orgnr;
            
            this.formInstance.Model = this.Supplier;
        } 
    }
    
    saveSupplierManual(event: any) {        
        this.saveSupplier(false);
    }

    saveSupplier(autosave: boolean) {
        this.formInstance.sync();
                        
        if (!autosave) {            
            if (this.Supplier.StatusCode == null) {
                //set status if it is a draft
                this.Supplier.StatusCode = 1;
            }
               
            this.LastSavedInfo = 'Lagrer informasjon...';                
        } else {
           this.LastSavedInfo = 'Autolagrer informasjon...';
        }                
                            
        this.supplierService.Put(this.Supplier.ID, this.Supplier)
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
                            self.saveSupplier(true);                            
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
    
    extendFormConfig() {
        var orgnumber: UniFieldBuilder = this.FormConfig.find('OrgNumber');
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
        
        // MultiValue
        var phones: UniFieldBuilder = this.FormConfig.find('Phones');
        phones
            .setKendoOptions({
                dataTextField: 'Number',
                dataValueField: 'ID'
            })
            .setModel(this.Supplier.Info)
            .setModelField('Phones')
            .setModelDefaultField("DefaultPhoneID")
            .setPlaceholder(this.EmptyPhone)
            .setEditor(PhoneModal);     

        var emails: UniFieldBuilder = this.FormConfig.find('Emails');
        emails
            .setKendoOptions({
                dataTextField: 'EmailAddress',
                dataValueField: 'ID'
            })
            .setModel(this.Supplier.Info)
            .setModelField('Emails')
            .setModelDefaultField("DefaultEmailID")
            .setPlaceholder(this.EmptyEmail)
            .setEditor(EmailModal);     

        var invoiceaddresses: UniFieldBuilder = this.FormConfig.find('InvoiceAddress');
        invoiceaddresses
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Supplier.Info)
            .setModelField('Addresses')
            .setModelDefaultField("InvoiceAddressID")
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);     

        var shippingaddress: UniFieldBuilder = this.FormConfig.find('ShippingAddress');
        shippingaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Supplier.Info)
            .setModelField('Addresses')
            .setModelDefaultField("ShippingAddressID")
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);      
            
        var bankaccount: UniFieldBuilder = this.FormConfig.find('DefaultBankAccountID');
        bankaccount
            .setKendoOptions({dataSource: this.BankAccounts, dataValueField: "ID", dataTextField: "AccountNumber"});
   
    }      
    
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Supplier",
            BaseEntity: "Supplier",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
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
                    EntityType: "Supplier",
                    Property: "OrgNumber",
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
                    EntityType: "Supplier",
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
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Supplier",
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
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Supplier",
                    Property: "Emails",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
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
                    EntityType: "Supplier",
                    Property: "Phones",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
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
                    EntityType: "Supplier",
                    Property: "WebUrl",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 15,
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
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Supplier",
                    Property: "DefaultBankAccountID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Bankkonto",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 3,
                    Legend: "Konto & bank",
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CustomFields: null  
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Supplier);
        this.FormConfig.hideSubmitButton();
    }
}