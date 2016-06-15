import {Component, ComponentRef, Input, ViewChild, OnInit} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService} from '../../../../services/services';
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from '../../../../../framework/uniform';

import {ComponentLayout, Customer, Email, Phone, Address} from '../../../../unientities';

import {AddressModal} from '../modals/address/address';
import {EmailModal} from '../modals/email/email';
import {PhoneModal} from '../modals/phone/phone';

declare var _; // lodash

@Component({
    selector: 'customer-details',
    templateUrl: 'app/components/sales/customer/customerDetails/customerDetails.html',    
    directives: [RouterLink, AddressModal, EmailModal, PhoneModal, UniForm, ExternalSearch, UniSave],
    providers: [DepartementService, ProjectService, CustomerService, PhoneService, AddressService, EmailService, BusinessRelationService]
})
export class CustomerDetails implements OnInit {            
    @Input() public customerID: any;                  
    @ViewChild(UniForm) public form: UniForm; 
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    
    private config: any = {};
    private fields: any[] = [];
        
    public dropdownData: any;
    public customer: Customer;
    public searchText: string;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;
    
    private expandOptions: Array<string> = ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails', 'Info.ShippingAddress', 'Info.InvoiceAddress', 'Dimensions'];
    
    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveCustomer(completeEvent),
             main: true,
             disabled: false
         }
    ];

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
        this.customerService.NextCustomer(this.customer.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/customer/details/' + data.ID);
            });
    }
    
    public previousCustomer() {
        this.customerService.PreviousCustomer(this.customer.ID)
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
          
    private change(model) {
        
    }
    
    public ready() {
        if (this.customer.ID === 0) {                    
            this.form.field('Info.Name') 
                        .control
                        .valueChanges
                        .debounceTime(300)
                        .distinctUntilChanged()
                        .subscribe((data) => {                        
                            this.searchText = data;
                        });     
        }
    }
          
    public ngOnInit() {
        this.getLayoutAndData();          
    }

    public getLayoutAndData() {
        
        this.customerService.GetLayout('CustomerDetailsForm').subscribe((results: any) => {
            var layout: ComponentLayout = results;
            this.fields = layout.Fields;            
                    
            Observable.forkJoin(
                this.departementService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.customerID > 0 ? 
                        this.customerService.Get(this.customerID, this.expandOptions) 
                        : this.customerService.GetNewEntity(this.expandOptions)
                ),            
                this.phoneService.GetNewEntity(),
                this.emailService.GetNewEntity(),
                this.addressService.GetNewEntity(null, 'Address')
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.customer = response[2];
                this.emptyPhone = response[3];
                this.emptyEmail = response[4];
                this.emptyAddress = response[5];
                
                this.extendFormConfig();
                
                setTimeout(() => {
                   this.ready();                
                });
                
            }, (err) => {
                console.log('Error retrieving data: ', err);
                alert('En feil oppsto ved henting av data: ' + JSON.stringify(err));
            });         
        });
    }
         
    public addSearchInfo(selectedSearchInfo: SearchResultItem) {        
        if (this.customer !== null) {
            
            this.customer.Info.Name = selectedSearchInfo.navn;
            this.customer.OrgNumber = selectedSearchInfo.orgnr;
   
            this.customer.Info.Addresses = [];
            this.customer.Info.Phones = [];
            this.customer.Info.Emails = [];
            this.customer.Info.InvoiceAddress = null;
            this.customer.Info.ShippingAddress = null;
            this.customer.Info.DefaultPhone = null;
   
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
                    if (!this.customer.Info.Addresses.find(x => x === postaladdress)) {
                        this.customer.Info.Addresses.push(postaladdress);
                    }
                    this.customer.Info.InvoiceAddress = postaladdress;                    
                } 

                if (businessaddress) {
                    if (!this.customer.Info.Addresses.find(x => x === businessaddress)) {
                        this.customer.Info.Addresses.push(businessaddress);
                    }                    
                    this.customer.Info.ShippingAddress = businessaddress;
                } else if (postaladdress) {
                    this.customer.Info.ShippingAddress = postaladdress;
                }
                
                if (mobile) {
                    this.customer.Info.Phones.unshift(mobile);
                }

                if (phone) {
                    this.customer.Info.Phones.unshift(phone);
                    this.customer.Info.DefaultPhone = phone;
                } else if (mobile) {
                    this.customer.Info.DefaultPhone = mobile;
                }
                
                // set ID to make multivalue editors work with the new values...                
                this.customer.Info.DefaultPhoneID = 0;
                this.customer.Info.InvoiceAddressID = 0;
                this.customer.Info.ShippingAddressID = 0;
                
                this.customer = _.cloneDeep(this.customer);
            });
            
        } 
    }
    
    public extendFormConfig() {
        
        var departement: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.DepartementID');
        departement.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            displayProperty: 'Name',                        
            debounceTime: 200
        };
        
        var project: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            displayProperty: 'Name',                        
            debounceTime: 200
        };

        // MultiValue
        var phones: UniFieldLayout = this.fields.find(x => x.Property === 'Info.DefaultPhone');
        
        phones.Options = {            
            entity: Phone,
            listProperty: 'Info.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            foreignProperty: 'Info.DefaultPhoneID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Phone();
                    value.ID = 0;
                }
                                
                this.phoneModal.openModal(value);
                
                this.phoneModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                });               
            })
        };
                
        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === 'Info.InvoiceAddress');
        
        invoiceaddress.Options = {            
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'Info.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }
                                
                this.addressModal.openModal(value);
                
                this.addressModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                });               
            }),
            display: (address: Address) => {                
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;                  
            }         
        };
        
        var emails: UniFieldLayout = this.fields.find(x => x.Property === 'Info.DefaultEmail');
        
        emails.Options = {            
            entity: Email,
            listProperty: 'Info.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            foreignProperty: 'Info.DefaultEmailID',            
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Email();
                    value.ID = 0;
                }
                                
                this.emailModal.openModal(value);
                
                this.emailModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                });               
            })
        };
        
        var shippingaddress: UniFieldLayout = this.fields.find(x => x.Property === 'Info.ShippingAddress');
        shippingaddress.Options = {      
            entity: Address,      
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',            
            foreignProperty: 'Info.ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }
                                
                this.addressModal.openModal(value);
                
                this.addressModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                });               
            }),
            display: (address: Address) => {                
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;                  
            }                        
        };
    }    

    public saveCustomer(completeEvent: any) {
        
        //add createGuid for new entities and remove duplicate entities
        this.customer.Info.Emails.forEach(email => {
            if (email.ID === 0) {
                email['_createguid'] = this.customerService.getNewGuid();
            }
        });
        
        if (this.customer.Info.DefaultEmail) {
            this.customer.Info.Emails = this.customer.Info.Emails.filter(x => x !== this.customer.Info.DefaultEmail);
        }
        
        this.customer.Info.Phones.forEach(phone => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.customerService.getNewGuid();
            }
        });
        
        if (this.customer.Info.DefaultPhone) {
            this.customer.Info.Phones = this.customer.Info.Phones.filter(x => x !== this.customer.Info.DefaultPhone);
        }
        
        this.customer.Info.Addresses.forEach(address => {
            if (address.ID === 0) {
                address['_createguid'] = this.customerService.getNewGuid();
            }
        });
        
        if (this.customer.Info.ShippingAddress) {
            this.customer.Info.Addresses = this.customer.Info.Addresses.filter(x => x !== this.customer.Info.ShippingAddress);
        }
        
        if (this.customer.Info.InvoiceAddress) {
            this.customer.Info.Addresses = this.customer.Info.Addresses.filter(x => x !== this.customer.Info.InvoiceAddress);
        }
        
        if (this.customer.Info.DefaultPhone === null && this.customer.Info.DefaultPhoneID === 0) {
            this.customer.Info.DefaultPhoneID = null;
        }
        
        if (this.customer.Info.DefaultEmail === null && this.customer.Info.DefaultEmailID === 0) {
            this.customer.Info.DefaultEmailID = null;
        }
        
        if (this.customer.Info.ShippingAddress === null && this.customer.Info.ShippingAddressID === 0) {
            this.customer.Info.ShippingAddressID = null;
        }
        
        if (this.customer.Info.InvoiceAddress === null && this.customer.Info.InvoiceAddressID === 0) {
            this.customer.Info.InvoiceAddressID = null;
        }
        
        if (this.customer.Dimensions !== null && (!this.customer.Dimensions.ID || this.customer.Dimensions.ID === 0)) {
            this.customer.Dimensions['_createguid'] = this.customerService.getNewGuid();
        }        
                            
        if (this.customerID > 0) { 
            this.customerService.Put(this.customer.ID, this.customer)
                .subscribe(
                    (customer) => {
                        completeEvent('Kunde lagret');
                        this.customerService.Get(this.customer.ID, this.expandOptions).subscribe(customer => {                          
                            this.customer = customer;
                        });
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                        this.log(err);
                    }
                );
        } else {
            this.customerService.Post(this.customer)
                .subscribe(
                    (newCustomer) => {       
                        completeEvent('Kunde lagret');                 
                        this.router.navigateByUrl('/sales/customer/details/' + newCustomer.ID);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                        this.log(err);   
                    }
                );
        }
    }
}
