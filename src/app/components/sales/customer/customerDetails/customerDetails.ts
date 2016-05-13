import {Component, ComponentRef, Input, ViewChild, OnInit} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';

import {DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService} from '../../../../services/services';
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {ComponentLayout, Customer, Email, Phone, Address} from '../../../../unientities';
import {UniFormBuilder} from '../../../../../framework/forms/builders/uniFormBuilder';
import {UniFormLayoutBuilder} from '../../../../../framework/forms/builders/uniFormLayoutBuilder';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFieldBuilder} from '../../../../../framework/forms/builders/uniFieldBuilder';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';

import {AddressModal} from '../modals/address/address';
import {EmailModal} from '../modals/email/email';
import {PhoneModal} from '../modals/phone/phone';

@Component({
    selector: 'customer-details',
    templateUrl: 'app/components/sales/customer/customerDetails/customerDetails.html',    
    directives: [UniComponentLoader, RouterLink, AddressModal, EmailModal, PhoneModal, ExternalSearch],
    providers: [DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService]
})
export class CustomerDetails implements OnInit {
            
    @Input() 
    public customerID: any;
                  
    @ViewChild(UniComponentLoader)
    public ucl: UniComponentLoader;    

    public formConfig: UniFormBuilder;
    public formInstance: UniForm;
    public DropdownData: any;
    public Customer: Customer;
    public LastSavedInfo: string;
    public searchText: string;
    public EmptyPhone: Phone;
    public EmptyEmail: Email;
    public EmptyAddress: Address;
    public whenFormInstance: Promise<UniForm>;

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
        this.customerID = params.get('id');            
    }
    
    public log(err) {
        alert(err._body);
    }
    
    public nextCustomer() {
        var self = this;
        this.customerService.NextCustomer(this.Customer.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/customer/details/' + data.ID);
            });
    }
    
    public previousCustomer() {
        this.customerService.PreviousCustomer(this.Customer.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/customer/details/' + data.ID);
            });        
    }
    
    public addCustomer() {
        this.router.navigateByUrl('/sales/customer/details/0');
    }
    
    public isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    public ngOnInit() {
        
        let expandOptions = ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails'];
        
         Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            (
                this.customerID > 0 ? 
                    this.customerService.Get(this.customerID, expandOptions) 
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
            
            this.getLayout();
        });       
    }

    public getLayout() {
        var self = this;
        this.customerService.GetLayout('CustomerDetailsForm').subscribe((results: any) => {
            var layout: ComponentLayout = results;

            this.formConfig = new UniFormLayoutBuilder().build(layout, this.Customer);
            this.formConfig.hideSubmitButton();

            this.extendFormConfig();
            this.loadForm();   
        });
    }
         
    public addSearchInfo(selectedSearchInfo: SearchResultItem) {
        var self = this;
        
        if (this.Customer != null) {
            console.log(selectedSearchInfo);
            this.Customer.Info.Name = selectedSearchInfo.navn;
            this.Customer.OrgNumber = selectedSearchInfo.orgnr;
      
            // KE: Uten denne virker adresse/telefon/email, men da virker ikke navn/orgnr. Samme motsatt - får exception hvis den tas med nå
            // this.formInstance.Model = this.Customer;  
   
            var businessaddress = this.addressService.businessAddressFromSearch(selectedSearchInfo);
            var postaladdress = this.addressService.postalAddressFromSearch(selectedSearchInfo);
            var phone = this.phoneService.phoneFromSearch(selectedSearchInfo);
            var mobile = this.phoneService.mobileFromSearch(selectedSearchInfo);
            
            Promise.all([businessaddress, postaladdress, phone, mobile]).then(results => {
                var businessaddress: any = results[0];
                var postaladdress: any = results[1];
                var phone: any = results[2];
                var mobile: any = results[3];
                            
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
    
    public extendFormConfig() {
        var orgnumber: UniFieldBuilder = this.formConfig.find('OrgNumber');
        orgnumber.setKendoOptions({
            mask: '000 000 000',
            promptChar: '_'
        });
                   
        var departement: UniFieldBuilder = this.formConfig.find('Dimensions.DepartementID');         
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.DropdownData[0]
        });
        departement.addClass('large-field');

        var project: UniFieldBuilder = this.formConfig.find('Dimensions.ProjectID');
        project.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.DropdownData[1]
        });      
        project.addClass('large-field');
        
        // MultiValue       
        var phones: UniFieldBuilder = this.formConfig.find('Phones');
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

        var emails: UniFieldBuilder = this.formConfig.find('Emails');
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
   
            
        var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
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

        var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
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
       
    public loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef<any>) => {
           cmp.instance.config = self.formConfig;
           
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;   
                
                // subscribe to valueChanges of Name input to autosearch external registries 
                self.formInstance.controls['Info.Name']
                    .valueChanges
                    .debounceTime(300)
                    .distinctUntilChanged()
                    .subscribe((data) => {                        
                        self.searchText = data;
                    });            
           });           
        });
    }           

    public saveCustomerManual(event: any) {        
        this.saveCustomer();
    }

    public saveCustomer() {
        // this.formInstance.sync(); // TODO: this one caues multivalue to break, missing parts of model after calling it
        
        this.LastSavedInfo = 'Lagrer kundeinformasjon...';                        
                            
        if (this.customerID > 0) { 
            this.customerService.Put(this.Customer.ID, this.Customer)
                .subscribe(
                    (customer) => {  
                        this.LastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                        this.customerService.Get(this.Customer.ID, ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails']).subscribe(customer => {                          
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
