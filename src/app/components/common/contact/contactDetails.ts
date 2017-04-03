import {Component, Input, ViewChild, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {ComponentLayout, Contact, Email, Phone, Address, BusinessRelation} from '../../../unientities';
import {AddressModal, EmailModal, PhoneModal} from '../../common/modals/modals';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {
    ContactService,
    PhoneService,
    AddressService,
    EmailService,
    BusinessRelationService,
    StatisticsService,
    ErrorService,
    NumberFormat
} from '../../../services/services';
declare var _;

@Component({
    selector: 'contact-details',
    templateUrl: './contactDetails.html'
})
export class ContactDetails {
    @Input() public contactID: any;
    @Input() public modalMode: boolean;
    @Output() public contactUpdated: EventEmitter<Contact> = new EventEmitter<Contact>();
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private addressChanged: any;
    private emailChanged: any;
    private phoneChanged: any;

    public contact$: BehaviorSubject<Contact> = new BehaviorSubject(null);
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;

    private canChangeParentBusinessRelation: boolean = false;

    private toolbarconfig: IToolbarConfig = {
        title: 'Kontakt',
        navigation: {
            prev: this.previousContact.bind(this),
            next: this.nextContact.bind(this),
            add: this.addContact.bind(this)
        },
        contextmenu: []
    };

    private expandOptions: Array<string> = [
        'Info',
        'Info.Phones',
        'Info.Addresses',
        'Info.Emails',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'ParentBusinessRelation'
    ];

    private expandOptionsNewEntity: Array<string> = [
        'Info',
        'Info.Phones',
        'Info.Addresses',
        'Info.Emails',
        'Info.ShippingAddress',
        'Info.InvoiceAddress'
    ];

    private formIsInitialized: boolean = false;
    private isDirty: boolean = false;

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveContact(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(
        private contactService: ContactService,
        private router: Router,
        private route: ActivatedRoute,
        private phoneService: PhoneService,
        private emailService: EmailService,
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private numberFormat: NumberFormat,
        private statisticsService: StatisticsService
    ) {}

    public ngOnInit() {
        if (!this.modalMode) {
            this.route.params.subscribe((params) => {
                this.contactID = +params['id'];
                this.setup();
            });
        }
    }

    public nextContact() {
        this.contactService.getNextID(this.contactID ? this.contactID : 0)
            .subscribe(id => {
                    if (id) {
                        this.router.navigateByUrl('/contacts/' + id);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontakter etter denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public previousContact() {
        this.contactService.getPreviousID(this.contactID ? this.contactID : 0)
            .subscribe(id => {
                    if (id) {
                        this.router.navigateByUrl('/contacts/' + id);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontakter før denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public addContact() {
        this.router.navigateByUrl('/contacts/new');
    }

    private setTabTitle() {
        if (this.modalMode) {
            return;
        }
        const contact = this.contact$.getValue();
        let tabTitle = contact.ID ? contact.Info.Name : 'Ny kontakt';
        this.tabService.addTab({
            url: '/contacts/' + (contact.ID || 'new'),
            name: tabTitle,
            active: true,
            moduleID: UniModules.Contacts
        });

        this.toolbarconfig.title = contact.ID ? contact.Info.Name : 'Ny kontakt';
        this.toolbarconfig.subheads = contact.ID ?
            [{title: contact.ParentBusinessRelation ? contact.ParentBusinessRelation.Name : ''}] :
            [];
    }

    public onFormChange(change: SimpleChanges) {
        this.isDirty = true;
    }

    public canDeactivate(): boolean|Promise<boolean> {
        if (this.isDirty) {
            return new Promise<boolean>((resolve, reject) => {
                this.confirmModal.confirm(
                    'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter?',
                    'Vennligst bekreft',
                    false,
                    {accept: 'Fortsett uten å lagre', reject: 'Avbryt'}
                ).then((confirmDialogResponse) => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                        resolve(true);
                } else {
                        resolve(false);
                    }
                });
            });
        } else {
            return true;
        }
    }

    public reset() {
        this.contactID = null;
        this.setup();
    }

    public setup() {
        if (!this.formIsInitialized) {
            this.isDirty = false;

            let layout: ComponentLayout = this.getComponentLayout();
            this.fields$.next(layout.Fields);

            Observable.forkJoin(
                (
                    this.contactID > 0 ?
                        this.contactService.Get(this.contactID, this.expandOptions)
                        : this.contactService.GetNewEntity(this.expandOptionsNewEntity)
                ),
                this.phoneService.GetNewEntity(),
                this.emailService.GetNewEntity(),
                this.addressService.GetNewEntity(null, 'Address')
            ).subscribe(response => {
                let contact: Contact = response[0];
                this.contact$.next(contact);

                // only allow user to change parent if it is not already set
                this.canChangeParentBusinessRelation =
                    (contact.ParentBusinessRelation && contact.ParentBusinessRelation.ID !== 0 ? false : true);

                this.emptyPhone = response[1];
                this.emptyEmail = response[2];
                this.emptyAddress = response[3];

                this.setTabTitle();

                this.extendFormConfig();

                this.formIsInitialized = true;
            }, err => this.errorService.handle(err));
        } else {
            Observable.forkJoin(
                (
                     this.contactID > 0 ?
                        this.contactService.Get(this.contactID, this.expandOptions)
                        : this.contactService.GetNewEntity(this.expandOptionsNewEntity)
                )
            ).subscribe(response => {
                let contact: Contact = response[0];
                this.contact$.next(contact);

                // only allow user to change parent if it is not already set
                this.canChangeParentBusinessRelation =
                    (contact.ParentBusinessRelation && contact.ParentBusinessRelation.ID !== 0 ? false : true);

                this.extendFormConfig();
                this.setTabTitle();
            }, err => this.errorService.handle(err));
        }
    }

    public extendFormConfig() {
        let fields: UniFieldLayout[] = this.fields$.getValue();

        let parent: UniFieldLayout = fields.find(x => x.Property === 'ParentBusinessRelationID');
        parent.Options = {
            getDefaultData: () => this.getDefaultParentData(),
            displayProperty: 'Name',
            valueProperty: 'ID',
            debounceTime: 200,
            search: (searchValue: string) => this.businessRelationSearch(searchValue),
            template: (br: any) => {
                if (br) {
                    return (br.CustomerID ? 'Kunde: ' : br.SupplierID ? 'Leverandør: ' : '') + br.Name;
                }
                return '';
            }
        };

        parent.ReadOnly = !this.canChangeParentBusinessRelation;

        // MultiValue
        let phones: UniFieldLayout = fields.find(x => x.Property === 'Info.DefaultPhone');

        phones.Options = {
            entity: Phone,
            listProperty: 'Info.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultPhoneID',
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

        let invoiceaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.InvoiceAddress');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        let emails: UniFieldLayout = fields.find(x => x.Property === 'Info.DefaultEmail');

        emails.Options = {
            entity: Email,
            listProperty: 'Info.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultEmailID',
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

        let shippingaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        this.fields$.next(fields);
    }

    public saveContact(completeEvent: any) {
        let contact = this.contact$.getValue();
        //add createGuid for new entities and remove duplicate entities
        contact.Info.Emails.forEach(email => {
            if (email.ID === 0) {
                email['_createguid'] = this.contactService.getNewGuid();
            }
        });

        if (contact.Info.DefaultEmail) {
            contact.Info.Emails = contact.Info.Emails.filter(x => x !== contact.Info.DefaultEmail);
        }

        contact.Info.Phones.forEach(phone => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.contactService.getNewGuid();
            }
        });

        if (contact.Info.DefaultPhone) {
            contact.Info.Phones = contact.Info.Phones.filter(x => x !== contact.Info.DefaultPhone);
        }

        contact.Info.Addresses.forEach(address => {
            if (address.ID === 0) {
                address['_createguid'] = this.contactService.getNewGuid();
            }
        });

        if (contact.Info.ShippingAddress) {
            contact.Info.Addresses = contact.Info.Addresses.filter(x => x !== contact.Info.ShippingAddress);
        }

        if (contact.Info.InvoiceAddress) {
            contact.Info.Addresses = contact.Info.Addresses.filter(x => x !== contact.Info.InvoiceAddress);
        }

        if (contact.Info.DefaultPhone === null && contact.Info.DefaultPhoneID === 0) {
            contact.Info.DefaultPhoneID = null;
        }

        if (contact.Info.DefaultEmail === null && contact.Info.DefaultEmailID === 0) {
            contact.Info.DefaultEmailID = null;
        }

        if (contact.Info.ShippingAddress === null && contact.Info.ShippingAddressID === 0) {
            contact.Info.ShippingAddressID = null;
        }

        if (contact.Info.InvoiceAddress === null && contact.Info.InvoiceAddressID === 0) {
            contact.Info.InvoiceAddressID = null;
        }

        contact.ParentBusinessRelation = null;

        if (this.contactID > 0) {
            this.contactService.Put(contact.ID, contact).subscribe(
                (updatedContact) => {
                    this.isDirty = false;

                    completeEvent('Kontakt lagret');
                    if (this.modalMode) {
                        this.contactUpdated.next(updatedContact);
                    } else {
                        this.contactService.Get(updatedContact.ID, this.expandOptions)
                            .subscribe(retrievedContact => {
                                this.contact$.next(retrievedContact);
                                this.setTabTitle();
                            });
                    }
                },
                (err) => {
                    completeEvent('Feil ved lagring');
                    this.errorService.handle(err);
                }
            );
        } else {
            this.contactService.Post(contact).subscribe(
                (newContact) => {
                    this.isDirty = false;

                    completeEvent('Kontakt lagret');
                    if (this.modalMode) {
                        this.contactUpdated.next(newContact);
                    } else {
                        this.router.navigateByUrl('/contacts/' + newContact.ID);
                    }
                },
                (err) => {
                    completeEvent('Feil ved lagring');
                    this.errorService.handle(err);
                }
            );
        }
    }

    private getDefaultParentData() {
        let contact = this.contact$.getValue();

        if (contact && contact.ParentBusinessRelation) {
            return Observable.of([contact.ParentBusinessRelation]);
        }

        return Observable.of([{Name: ''}]);
    }

    private businessRelationSearch(query: string): Observable<any> {
         return this.statisticsService.GetAll(
            `model=BusinessRelation&select=BusinessRelation.ID as ID,BusinessRelation.Name as Name,Customer.ID,Supplier.ID&join=Customer on BusinessRelation.ID eq Customer.BusinessRelationID Supplier on BusinessRelation.ID eq Supplier.BusinessRelationID&filter=contains(BusinessRelation.Name,'${query}') and (isnull(Customer.ID,0) ne 0 or isnull(Supplier.ID,0) ne 0)&top=20&orderby=BusinessRelation.Name`
        ).map(x => x.Data ? x.Data : []);
    }

    // TODO: remove later on when backend is fixed - Info.InvoiceAddress vs InvoiceAddress
    private getComponentLayout(): any {
        return {
            Name: 'Contact',
            BaseEntity: 'Contact',
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
                    FieldType: FieldType.TEXT,
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
                    EntityType: 'Contact',
                    Property: 'Role',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Rolle',
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
                    ComponentLayoutID: 1,
                    EntityType: 'Contact',
                    Property: 'ParentBusinessRelationID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Tilknyttet',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: true,
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
                    EntityType: 'Contact',
                    Property: 'Info.DefaultPhone',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
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
                    EntityType: 'Contact',
                    Property: 'Info.DefaultEmail',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'E-post adresser',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: true,
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
                    EntityType: 'Contact',
                    Property: 'Info.InvoiceAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
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
                    EntityType: 'Contact',
                    Property: 'Info.ShippingAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
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
                }
            ]
        };
    }
}
