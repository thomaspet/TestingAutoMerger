import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {DepartementService, ProjectService, SupplierService, PhoneService, AddressService, EmailService, BankAccountService} from '../../../../services/services';
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {Supplier, Email, Phone, Address} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {AddressModal, EmailModal, PhoneModal} from '../../../common/modals/modals';

declare var _; // lodash

@Component({
    selector: 'supplier-details',
    templateUrl: 'app/components/sales/supplier/details/supplierDetails.html',
    directives: [ExternalSearch, AddressModal, EmailModal, PhoneModal, UniSave, UniForm],
    providers: [DepartementService, ProjectService, SupplierService, PhoneService, AddressService, EmailService, BankAccountService]
})
export class SupplierDetails {            
    @Input() public supplierID: any;                      
    @ViewChild(UniForm) public form: UniForm; 
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    
    private config: any = {};
    private fields: any[] = [];
    private addressChanged: any;
    private phoneChanged: any;
    private emailChanged: any;
        
    private dropdownData: any;
    private supplier: Supplier;    
    private searchText: string;
    
    private emptyPhone: Phone;
    private emptyEmail: Email;
    private emptyAddress: Address;
    private bankAccounts: any;
    
    private expandOptions: Array<string> = ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails', 'Info.ShippingAddress', 'Info.InvoiceAddress', 'Dimensions'];
        
    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveSupplier(completeEvent),
             main: true,
             disabled: false
         }
    ];
    
    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private supplierService: SupplierService,
                private router: Router,
                private route: ActivatedRoute,
                private phoneService: PhoneService,
                private emailService: EmailService,
                private addressService: AddressService,
                private bankaccountService: BankAccountService,
                private tabService: TabService
                ) {
                
        this.route.params.subscribe(params => this.supplierID = +params['id']);                 
    }
    
    public nextSupplier() {
        this.supplierService.NextSupplier(this.supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/suppliers/' + data.ID);
            },
            (err) => {
                console.log('Error getting next supplier: ', err);
                alert('Ikke flere leverandører etter denne');
            });
    }
    
    public previousSupplier() {
        this.supplierService.PreviousSupplier(this.supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/suppliers/' + data.ID);
            },
            (err) => {
                console.log('Error getting previous supplier: ', err);
                alert('Ikke flere leverandører før denne');
            });        
    }
    
    public addSupplier() {   
        this.router.navigateByUrl('/sales/suppliers/0');
    }
    
    private change(model) {
        
    }
    
    public ready() {
        if (this.supplier.ID === 0) {                    
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

    private setTabTitle() {
        let tabTitle = this.supplier.SupplierNumber ? 'Leverandørnr. ' + this.supplier.SupplierNumber : 'Leverandør (kladd)'; 
        this.tabService.addTab({ url: '/sales/suppliers/' + this.supplier.ID, name: tabTitle, active: true, moduleID: 2 });
    }

    private getLayoutAndData() {        
        this.fields = this.getComponentLayout().Fields;            
        
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            (
                this.supplierID > 0 ? 
                    this.supplierService.Get(this.supplierID, this.expandOptions) 
                    : this.supplierService.GetNewEntity(this.expandOptions)
            ),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.bankaccountService.GetAll(''),
            this.addressService.GetNewEntity(null, 'Address')
        ).subscribe(response => {
            this.dropdownData = [response[0], response[1]];
            this.supplier = response[2];
            this.emptyPhone = response[3];
            this.emptyEmail = response[4];
            this.bankAccounts = response[5];
            this.emptyAddress = response[5];
         
            this.setTabTitle();
            this.extendFormConfig();
                
            setTimeout(() => {
                this.ready();                
            });          
        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av data: ' + JSON.stringify(err));
        });       
    }
    
    public addSearchInfo(selectedSearchInfo: SearchResultItem) {        
        if (this.supplier !== null) {
            
            this.supplier.Info.Name = selectedSearchInfo.navn;
            this.supplier.OrgNumber = selectedSearchInfo.orgnr;
   
            this.supplier.Info.Addresses = [];
            this.supplier.Info.Phones = [];
            this.supplier.Info.Emails = [];
            this.supplier.Info.InvoiceAddress = null;
            this.supplier.Info.ShippingAddress = null;
            this.supplier.Info.DefaultPhone = null;
   
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
                    if (!this.supplier.Info.Addresses.find(x => x === postaladdress)) {
                        this.supplier.Info.Addresses.push(postaladdress);
                    }
                    this.supplier.Info.InvoiceAddress = postaladdress;                    
                } 

                if (businessaddress) {
                    if (!this.supplier.Info.Addresses.find(x => x === businessaddress)) {
                        this.supplier.Info.Addresses.push(businessaddress);
                    }                    
                    this.supplier.Info.ShippingAddress = businessaddress;
                } else if (postaladdress) {
                    this.supplier.Info.ShippingAddress = postaladdress;
                }
                
                if (mobile) {
                    this.supplier.Info.Phones.unshift(mobile);
                }

                if (phone) {
                    this.supplier.Info.Phones.unshift(phone);
                    this.supplier.Info.DefaultPhone = phone;
                } else if (mobile) {
                    this.supplier.Info.DefaultPhone = mobile;
                }
                
                // set ID to make multivalue editors work with the new values...                
                this.supplier.Info.DefaultPhoneID = 0;
                this.supplier.Info.InvoiceAddressID = 0;
                this.supplier.Info.ShippingAddressID = 0;
                
                this.supplier = _.cloneDeep(this.supplier);

                setTimeout(() => {
                   this.ready();                
                });
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
                
                this.phoneChanged = this.phoneModal.Changed.subscribe(modalval => { 
                    this.phoneChanged.unsubscribe();                                      
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
                
                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {   
                    this.addressChanged.unsubscribe();                                    
                    resolve(modalval);    
                });               
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);                              
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
                
                this.emailChanged = this.emailModal.Changed.subscribe(modalval => {  
                    this.emailChanged.unsubscribe();                                     
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
                
                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {       
                    this.addressChanged.unsubscribe();                                
                    resolve(modalval);    
                });               
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);                               
            }          
        };
    }   
    
    private saveSupplier(completeEvent: any) {
        //add createGuid for new entities and remove duplicate entities
        this.supplier.Info.Emails.forEach(email => {
            if (email.ID === 0) {
                email['_createguid'] = this.supplierService.getNewGuid();
            }
        });
        
        if (this.supplier.Info.DefaultEmail) {
            this.supplier.Info.Emails = this.supplier.Info.Emails.filter(x => x !== this.supplier.Info.DefaultEmail);
        }
        
        this.supplier.Info.Phones.forEach(phone => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.supplierService.getNewGuid();
            }
        });
        
        if (this.supplier.Info.DefaultPhone) {
            this.supplier.Info.Phones = this.supplier.Info.Phones.filter(x => x !== this.supplier.Info.DefaultPhone);
        }
        
        this.supplier.Info.Addresses.forEach(address => {
            if (address.ID === 0) {
                address['_createguid'] = this.supplierService.getNewGuid();
            }
        });
        
        if (this.supplier.Info.ShippingAddress) {
            this.supplier.Info.Addresses = this.supplier.Info.Addresses.filter(x => x !== this.supplier.Info.ShippingAddress);
        }
        
        if (this.supplier.Info.InvoiceAddress) {
            this.supplier.Info.Addresses = this.supplier.Info.Addresses.filter(x => x !== this.supplier.Info.InvoiceAddress);
        }
        
        if (this.supplier.Info.DefaultPhone === null && this.supplier.Info.DefaultPhoneID === 0) {
            this.supplier.Info.DefaultPhoneID = null;
        }
        
        if (this.supplier.Info.DefaultEmail === null && this.supplier.Info.DefaultEmailID === 0) {
            this.supplier.Info.DefaultEmailID = null;
        }
        
        if (this.supplier.Info.ShippingAddress === null && this.supplier.Info.ShippingAddressID === 0) {
            this.supplier.Info.ShippingAddressID = null;
        }
        
        if (this.supplier.Info.InvoiceAddress === null && this.supplier.Info.InvoiceAddressID === 0) {
            this.supplier.Info.InvoiceAddressID = null;
        }
        
        if (this.supplier.Dimensions !== null && (!this.supplier.Dimensions.ID || this.supplier.Dimensions.ID === 0)) {
            this.supplier.Dimensions['_createguid'] = this.supplierService.getNewGuid();
        }
        
        if (this.supplierID > 0) { 
            this.supplierService.Put(this.supplier.ID, this.supplier)
                .subscribe(
                    (updatedValue) => {  
                        completeEvent('Leverandør lagret'); 
                        
                        this.supplierService.Get(this.supplier.ID, this.expandOptions).subscribe(supplier => {                          
                            this.supplier = supplier;
                            this.setTabTitle();
                        });                        
                    },
                    (err) => { 
                        completeEvent('Feil ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                    }
                );
        } else {
            this.supplierService.Post(this.supplier)
                .subscribe(
                    (newSupplier) => {                        
                        this.router.navigateByUrl('/sales/suppliers/' + newSupplier.ID);
                        this.supplier = newSupplier;
                        this.setTabTitle();
                        completeEvent('Ny leverandør lagret');
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                    }
                );
        }
    }
    
    // TODO: change to 'ComponentLayout' when object respects the interface
    private getComponentLayout(): any {
        return {
            Name: 'Supplier',
            BaseEntity: 'Supplier',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: 'BusinessRelation',
                    Property: 'Info.Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'OrgNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Organisasjonsnummer',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.InvoiceAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturaadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.ShippingAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.DefaultEmail',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'E-post adresser',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.DefaultPhone',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Telefonnumre',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 6,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'WebUrl',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 15,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Webadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 7,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    Placement: 4,
                    Hidden: true, // false, // TODO: > 30.6
                    FieldType: 3,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Prosjekt',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0, //1, // TODO: > 30.6
                    Sectionheader: 'Dimensjoner',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Dimensjoner',
                    StatusCode: 0,
                    ID: 8,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Departement',
                    Property: 'Dimensions.DepartementID',
                    Placement: 4,
                    Hidden: true, // false, // TODO: > 30.6
                    FieldType: 3,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avdeling',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0, //1, // TODO: > 30.6
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'DefaultBankAccountID',
                    Placement: 4,
                    Hidden: true, // false, // TODO: > 30.6
                    FieldType: 3,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Bankkonto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0, //2, // TODO: > 30.6
                    Sectionheader: 'Konto & bank',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Konto & bank',
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null  
                }
            ]               
        };   
    }
}
