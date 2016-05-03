import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService} from "../../../../services/services";
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {FieldType, FieldLayout, ComponentLayout, Customer, BusinessRelation, Email, Phone, Address, PhoneTypeEnum} from "../../../../unientities";
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
    providers: [DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService]
})
export class CustomerDetails {
            
    @Input() CustomerID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    DropdownData: any;
    Customer: Customer;
    LastSavedInfo: string;
    searchText: string;
    EmptyPhone: Phone;
    EmptyEmail: Email;
    EmptyAddress: Address;
    
    whenFormInstance: Promise<UniForm>;

    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private customerService: CustomerService,
                private router: Router,
                private params: RouteParams,
                private phoneService: PhoneService,
                private emailService: EmailService,
                private addressService: AddressService,
                private businessRealtionService: BusinessRelationService
                ) {
                
        var self = this;        
        this.CustomerID = params.get("id");            
    }
    
    log(err) {
        alert(err._body);
    }
    
    nextCustomer() {
        var self = this;
        this.customerService.NextCustomer(this.Customer.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/customer/details/' + data.ID);
            });
    }
    
    previousCustomer() {
        this.customerService.PreviousCustomer(this.Customer.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/customer/details/' + data.ID);
            });        
    }
    
    addCustomer() {
        this.router.navigateByUrl('/sales/customer/details/0');
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        
        let expandOptions = ["Info", "Info.Phones", "Info.Addresses", "Info.Emails"];
        
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            (
                this.CustomerID > 0 ? 
                    this.customerService.Get(this.CustomerID, expandOptions) 
                    : this.customerService.GetNewEntity(expandOptions)
            ),            
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity(null, 'Address')
        ).subscribe(response => {
            this.DropdownData = [response[0], response[1]];
            this.Customer = response[2];
            this.EmptyPhone = response[3];
            this.EmptyEmail = response[4];
            this.EmptyAddress = response[5];
            
            this.createFormConfig();
            this.extendFormConfig();
            this.loadForm();                  
        });       
    }
    
    addSearchInfo(selectedSearchInfo: SearchResultItem) {
        var self = this;
        
        if (this.Customer != null) {
            console.log(selectedSearchInfo);
            this.Customer.Info.Name = selectedSearchInfo.navn;
            this.Customer.OrgNumber = selectedSearchInfo.orgnr;
      
            //KE: Uten denne virker adresse/telefon/email, men da virker ikke navn/orgnr. Samme motsatt - får exception hvis den tas med nå
            //this.formInstance.Model = this.Customer;  
   
            var businessaddress = this.addressService.businessAddressFromSearch(selectedSearchInfo);
            var postaladdress = this.addressService.postalAddressFromSearch(selectedSearchInfo);
            var phone = this.phoneService.phoneFromSearch(selectedSearchInfo);
            var mobile = this.phoneService.mobileFromSearch(selectedSearchInfo);
            
            Promise.all([businessaddress, postaladdress, phone, mobile]).then(results => {
                var businessaddress = results[0];
                var postaladdress = results[1];
                var phone = results[2];
                var mobile = results[3];
                            
                if (postaladdress) {
                    this.Customer.Info.Addresses.unshift(postaladdress);
                    this.Customer.Info.InvoiceAddress = postaladdress;
                } 

                if (businessaddress) {
                    this.Customer.Info.Addresses.unshift(businessaddress);
                    this.Customer.Info.ShippingAddress = businessaddress;
                } else if (postaladdress) {
                    this.Customer.Info.ShippingAddress = postaladdress;
                }

                if (mobile) {
                    this.Customer.Info.Phones.unshift(mobile);
                }

                if (phone) {
                    this.Customer.Info.Phones.unshift(phone);
                    this.Customer.Info.DefaultPhone = phone;
                } else if (mobile) {
                    this.Customer.Info.DefaultPhone = mobile;
                }
            });
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
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Customer",
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
                    ID: 2,
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
                    ID: 3,
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
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "BusinessRelation",
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
                    EntityType: "BusinessRelation",
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
                    EntityType: "Customer",
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
                    ID: 8,
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
                    ID: 9,
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
                    ID: 10,
                    Deleted: false,
                    CustomFields: null
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.Customer);
        this.FormConfig.hideSubmitButton();
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
            .setModel(this.Customer.Info)
            .setModelField('Phones')
            .setModelDefaultField('DefaultPhoneID')
            .setPlaceholder(this.EmptyPhone)
            .setEditor(PhoneModal);     
        phones.onSelect = (phone: Phone) => {
            this.Customer.Info.DefaultPhone = phone;
            this.Customer.Info.DefaultPhoneID = null;
        };

        var emails: UniFieldBuilder = this.FormConfig.find('Emails');
        emails
            .setKendoOptions({
                dataTextField: 'EmailAddress',
                dataValueField: 'ID'
            })
            .setModel(this.Customer.Info)
            .setModelField('Emails')
            .setModelDefaultField('DefaultEmailID')
            .setPlaceholder(this.EmptyEmail)
            .setEditor(EmailModal);  
        emails.onSelect = (email: Email) => {
            this.Customer.Info.DefaultEmail = email;
            this.Customer.Info.DefaultEmailID = null;
        };
   
            
        var invoiceaddress: UniFieldBuilder = this.FormConfig.find('InvoiceAddress');
        invoiceaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Customer.Info)
            .setModelField('Addresses')
            .setModelDefaultField('InvoiceAddressID') 
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);     
        invoiceaddress.onSelect = (address: Address) => {
            this.Customer.Info.InvoiceAddress = address;
            this.Customer.Info.InvoiceAddressID = null;
        };

        var shippingaddress: UniFieldBuilder = this.FormConfig.find('ShippingAddress');
        shippingaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.Customer.Info)
            .setModelField('Addresses')
            .setModelDefaultField('ShippingAddressID') 
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);           
        shippingaddress.onSelect = (address: Address) => {
            this.Customer.Info.ShippingAddress = address;
            this.Customer.Info.ShippingAddressID = null;
        };
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;   
                
                //subscribe to valueChanges of Name input to autosearch external registries 
                self.formInstance.controls["Info.Name"]
                    .valueChanges
                    .debounceTime(300)
                    .distinctUntilChanged()
                    .subscribe((data) => {                        
                        self.searchText = data;
                    });            
           });           
        });
    }           

    saveCustomerManual(event: any) {        
        this.saveCustomer();
    }

    saveCustomer() {
        //this.formInstance.sync(); // TODO: this one caues multivalue to break, missing parts of model after calling it
        
        this.LastSavedInfo = 'Lagrer kundeinformasjon...';                        
                            
        if (this.CustomerID > 0) { 
            this.customerService.Put(this.Customer.ID, this.Customer)
                .subscribe(
                    (customer) => {  
                        this.LastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                        this.customerService.Get(this.Customer.ID, ["Info", "Info.Phones", "Info.Addresses", "Info.Emails"]).subscribe(customer => {                          
                            this.Customer = customer;
                        });
                    },
                    (err) => {
                        console.log('Feil oppsto ved lagring', err);
                        this.log(err);
                    }
                );
        } else {
            this.customerService.Post(this.Customer)
                .subscribe(
                    (newCustomer) => {                        
                        this.router.navigateByUrl('/sales/customer/details/' + newCustomer.ID);
                    },
                    (err) => {
                        console.log('Feil oppsto ved lagring', err);
                        this.log(err);   
                    }
                );
        }
    }
}