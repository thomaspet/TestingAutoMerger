import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {Component, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SearchResultItem} from '../../../common/externalSearch/externalSearch';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {ComponentLayout, Customer, Email, Phone, Address, CustomerInvoiceReminderSettings, CurrencyCode} from '../../../../unientities';
import {AddressModal, EmailModal, PhoneModal} from '../../../common/modals/modals';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IReference} from '../../../../models/iReference';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {IPosterWidget} from '../../../common/poster/poster';
import {LedgerAccountReconciliation} from '../../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {ReminderSettings} from '../../../common/reminder/settings/reminderSettings';
import {
    DepartmentService,
    ProjectService,
    CustomerService,
    PhoneService,
    AddressService,
    EmailService,
    BusinessRelationService,
    UniQueryDefinitionService,
    ErrorService,
    NumberFormat,
    CustomerInvoiceReminderSettingsService,
    CurrencyCodeService
} from '../../../../services/services';
declare var _;

@Component({
    selector: 'customer-details',
    templateUrl: './customerDetails.html'
})
export class CustomerDetails {
    @Input() public customerID: any;
    @Input() public modalMode: boolean;
    @Output() public customerUpdated: EventEmitter<Customer> = new EventEmitter<Customer>();
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(LedgerAccountReconciliation) private ledgerAccountReconciliation: LedgerAccountReconciliation;
    @ViewChild(ReminderSettings) public reminderSettings: ReminderSettings;

    private config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private addressChanged: any;
    private emailChanged: any;
    private phoneChanged: any;
    private showReminderSection: boolean = false; // used in template

    public currencyCodes: Array<CurrencyCode>;
    public dropdownData: any;
    public customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    public searchText: string;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;
    public reportLinks: IReference[];
    private activeTab: string = 'details';
    public showReportWithID: number;

    private toolbarconfig: IToolbarConfig = {
        title: 'Kunde',
        navigation: {
            prev: this.previousCustomer.bind(this),
            next: this.nextCustomer.bind(this),
            add: this.addCustomer.bind(this)
        },
        contextmenu: [
            {
                label: 'Nytt tilbud',
                action: () => this.router.navigateByUrl(`/sales/quotes/0;customerID=${this.customerID}`),
                disabled: () => !this.customerID
            },
            {
                label: 'Ny ordre',
                action: () => this.router.navigateByUrl(`/sales/orders/0;customerID=${this.customerID}`),
                disabled: () => !this.customerID
            },
            {
                label: 'Ny faktura',
                action: () => this.router.navigateByUrl(`/sales/invoices/0;customerID=${this.customerID}`),
                disabled: () => !this.customerID
            }
        ]
    };

    private customerWidgets: IPosterWidget[] = [
        {
            type: 'text',
            size: 'small',
            config: {
                mainText: { text: '-' },
                topText: [
                    { text: 'Totalt fakturert', class: 'large' },
                    { text: '(eks. mva)', class: 'small'}
                ]
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                mainText: { text: '-' },
                topText: [
                    { text: 'Åpne ordre', class: 'large' },
                    { text: '(eks. mva)', class: 'small'}
                ]
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                mainText: { text: '-', class: '' },
                topText: [
                    { text: 'Utestående', class: 'large' },
                    { text: '', class: 'small' }
                ]
            }
        }
    ];
    private customerStatisticsData: any;

    private expandOptions: Array<string> = ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails', 'Info.ShippingAddress', 'Info.InvoiceAddress', 'Dimensions', 'CustomerInvoiceReminderSettings', 'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules'];


    private formIsInitialized: boolean = false;

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveCustomer(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private customerService: CustomerService,
        private router: Router,
        private route: ActivatedRoute,
        private phoneService: PhoneService,
        private emailService: EmailService,
        private addressService: AddressService,
        private businessRealtionService: BusinessRelationService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private numberFormat: NumberFormat,
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private currencyCodeService: CurrencyCodeService
    ) {}

    public ngOnInit() {
        if (!this.modalMode) {
            this.route.params.subscribe((params) => {
                this.customerID = +params['id'];
                this.setup();

                this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Customers)
                    .subscribe(links => this.reportLinks = links, err => this.errorService.handle(err));
            });
        }
    }

    public ready() {
        if (this.customer$.getValue().ID === 0) {
            this.form.field('Info.Name')
                .Component
                .control
                .valueChanges
                .debounceTime(300)
                .distinctUntilChanged()
                .subscribe(data => this.searchText = data);
        }
    }

    public nextCustomer() {
        this.customerService.getNextID(this.customerID ? this.customerID : 0)
            .subscribe(id => {
                    if (id) {
                        this.router.navigateByUrl('/sales/customer/' + id);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kunder etter denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public previousCustomer() {
        this.customerService.getPreviousID(this.customerID ? this.customerID : 0)
            .subscribe(id => {
                    if (id) {
                        this.router.navigateByUrl('/sales/customer/' + id);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kunder før denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public addCustomer() {
        this.router.navigateByUrl('/sales/customer/new');
    }

    private setTabTitle() {
        if (this.modalMode) {
            return;
        }
        const customer = this.customer$.getValue();
        let tabTitle = customer.CustomerNumber ? 'Kundenr. ' + customer.CustomerNumber : 'Ny kunde';
        this.tabService.addTab({
            url: '/sales/customer/' + (customer.ID || 'new'),
            name: tabTitle,
            active: true,
            moduleID: UniModules.Customers
        });

        this.toolbarconfig.title = customer.ID ? customer.Info.Name : 'Ny kunde';
        this.toolbarconfig.subheads = customer.ID ? [{title: 'Kundenr. ' + customer.CustomerNumber}] : [];
    }

    public canDeactivate(): boolean|Promise<boolean> {

        // Check if ledgeraccountdetails is dirty - if so, warn user before we continue
        if (!this.ledgerAccountReconciliation || !this.ledgerAccountReconciliation.isDirty) {
           return true;
        }

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
    }

    public showTab(tab: string, reportid: number = null) {
        if (this.activeTab === 'reconciliation'
            && this.ledgerAccountReconciliation
            && this.ledgerAccountReconciliation.isDirty) {

            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter',
                'Vennligst bekreft',
                false,
                {accept: 'Fortsett uten å lagre', reject: 'Avbryt'})
                .then(confirmDialogResponse => {
                    if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                        this.activeTab = tab;
                        this.showReportWithID = reportid;
                    }
                });
        } else {
            this.activeTab = tab;
            this.showReportWithID = reportid;
        }
    }

    public reset() {
        this.customerID = null;
        this.setup();
    }

    public openInModalMode(id?: number) {
        this.customerID = id;
        this.setup();
    }

    public showSearch(customerID): boolean {
        return isNaN(customerID);
    }

    public setup() {
        this.showReportWithID = null;

        if (!this.formIsInitialized) {
            var layout: ComponentLayout = this.getComponentLayout(); // results
            this.fields$.next(layout.Fields);

            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.customerID > 0 ?
                        this.customerService.Get(this.customerID, this.expandOptions)
                        : this.customerService.GetNewEntity(this.expandOptions)
                ),
                this.phoneService.GetNewEntity(),
                this.emailService.GetNewEntity(),
                this.addressService.GetNewEntity(null, 'Address'),
                (
                    this.customerID > 0 ?
                        this.customerService.getCustomerStatistics(this.customerID) :
                        Observable.of(null)
                ),
                this.currencyCodeService.GetAll(null)
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.customer$.next(response[2]);
                this.emptyPhone = response[3];
                this.emptyEmail = response[4];
                this.emptyAddress = response[5];

                this.customerStatisticsData = response[6];

                let customer = this.customer$.getValue();
                if (customer.CustomerInvoiceReminderSettings === null) {
                    customer.CustomerInvoiceReminderSettings = new CustomerInvoiceReminderSettings();
                    customer.CustomerInvoiceReminderSettings['_createguid'] = this.customerInvoiceReminderSettingsService.getNewGuid();
                }

                this.currencyCodes = response[7];

                this.setTabTitle();
                this.extendFormConfig();
                this.updateCustomerWidgets();

                this.formIsInitialized = true;

                setTimeout(() => {
                   this.ready();
                });

            }, err => this.errorService.handle(err));
        } else {
            Observable.forkJoin(
                (
                    this.customerID > 0 ?
                        this.customerService.Get(this.customerID, this.expandOptions) :
                        this.customerService.GetNewEntity(this.expandOptions)
                ),
                (
                    this.customerID > 0 ?
                        this.customerService.getCustomerStatistics(this.customerID) :
                        Observable.of(null)
                )
            ).subscribe(response => {
                this.customer$.next(response[0]);
                this.customerStatisticsData = response[1];
                this.setTabTitle();
                this.updateCustomerWidgets();

                setTimeout(() => {
                    this.ready();
                });
            }, err => this.errorService.handle(err));
        }
    }

    public updateCustomerWidgets() {
        if (this.customerStatisticsData) {
            this.customerWidgets[0].config.mainText.text =
                'kr. ' + this.numberFormat.asMoney(this.customerStatisticsData.SumInvoicedExVat);

            this.customerWidgets[1].config.mainText.text =
                'kr. ' + this.numberFormat.asMoney(this.customerStatisticsData.SumOpenOrdersExVat);

            this.customerWidgets[2].config.mainText.text =
                'kr. ' + this.numberFormat.asMoney(this.customerStatisticsData.SumDueInvoicesRestAmount);
            this.customerWidgets[2].config.topText[1].text =
                this.customerStatisticsData.NumberOfDueInvoices + ' forfalte fakturaer';

            if (this.customerStatisticsData.NumberOfDueInvoices > 0) {
                this.customerWidgets[2].config.mainText.class = 'bad';
                this.customerWidgets[2].config.topText[1].class = 'small bad';
            } else {
                this.customerWidgets[2].config.mainText.class = '';
                this.customerWidgets[2].config.topText[1].class = 'small';
            }
        }
    }

    public addSearchInfo(selectedSearchInfo: SearchResultItem) {
        let customer = this.customer$.getValue();
        if (customer !== null) {

            customer.Info.Name = selectedSearchInfo.navn;
            customer.OrgNumber = selectedSearchInfo.orgnr;

            customer.Info.Addresses = [];
            customer.Info.Phones = [];
            customer.Info.Emails = [];
            customer.Info.InvoiceAddress = null;
            customer.Info.ShippingAddress = null;
            customer.Info.DefaultPhone = null;

            var businessaddressPromise = this.addressService.businessAddressFromSearch(selectedSearchInfo);
            var postaladdressPromise = this.addressService.postalAddressFromSearch(selectedSearchInfo);
            var phonePromise = this.phoneService.phoneFromSearch(selectedSearchInfo);
            var mobilePromise = this.phoneService.mobileFromSearch(selectedSearchInfo);

            Promise.all([businessaddressPromise, postaladdressPromise, phonePromise, mobilePromise]).then(results => {
                let businessaddress: any = results[0];
                let postaladdress: any = results[1];
                let phone: any = results[2];
                let mobile: any = results[3];

                if (postaladdress) {
                    if (!customer.Info.Addresses.find(x => x === postaladdress)) {
                        customer.Info.Addresses.push(postaladdress);
                    }
                    customer.Info.InvoiceAddress = postaladdress;
                }

                if (businessaddress) {
                    if (!customer.Info.Addresses.find(x => x === businessaddress)) {
                        customer.Info.Addresses.push(businessaddress);
                    }
                    customer.Info.ShippingAddress = businessaddress;
                } else if (postaladdress) {
                    customer.Info.ShippingAddress = postaladdress;
                }

                if (mobile) {
                    customer.Info.Phones.unshift(mobile);
                }

                if (phone) {
                    customer.Info.Phones.unshift(phone);
                    customer.Info.DefaultPhone = phone;
                } else if (mobile) {
                    customer.Info.DefaultPhone = mobile;
                }

                // set ID to make multivalue editors work with the new values...
                customer.Info.DefaultPhoneID = 0;
                customer.Info.InvoiceAddressID = 0;
                customer.Info.ShippingAddressID = 0;

                this.customer$.next(customer);
                setTimeout(() => {
                   this.ready();
                });
            });
        }
    }

    public extendFormConfig() {
        let fields: UniFieldLayout[] = this.fields$.getValue();

        let currencyCode: UniFieldLayout = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let department: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let project: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

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

    public saveCustomer(completeEvent: any) {
        let customer = this.customer$.getValue();
        //add createGuid for new entities and remove duplicate entities
        customer.Info.Emails.forEach(email => {
            if (email.ID === 0) {
                email['_createguid'] = this.customerService.getNewGuid();
            }
        });

        if (customer.Info.DefaultEmail) {
            customer.Info.Emails = customer.Info.Emails.filter(x => x !== customer.Info.DefaultEmail);
        }

        customer.Info.Phones.forEach(phone => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.customerService.getNewGuid();
            }
        });

        if (customer.Info.DefaultPhone) {
            customer.Info.Phones = customer.Info.Phones.filter(x => x !== customer.Info.DefaultPhone);
        }

        customer.Info.Addresses.forEach(address => {
            if (address.ID === 0) {
                address['_createguid'] = this.customerService.getNewGuid();
            }
        });

        if (customer.Info.ShippingAddress) {
            customer.Info.Addresses = customer.Info.Addresses.filter(x => x !== customer.Info.ShippingAddress);
        }

        if (customer.Info.InvoiceAddress) {
            customer.Info.Addresses = customer.Info.Addresses.filter(x => x !== customer.Info.InvoiceAddress);
        }

        if (customer.Info.DefaultPhone === null && customer.Info.DefaultPhoneID === 0) {
            customer.Info.DefaultPhoneID = null;
        }

        if (customer.Info.DefaultEmail === null && customer.Info.DefaultEmailID === 0) {
            customer.Info.DefaultEmailID = null;
        }

        if (customer.Info.ShippingAddress === null && customer.Info.ShippingAddressID === 0) {
            customer.Info.ShippingAddressID = null;
        }

        if (customer.Info.InvoiceAddress === null && customer.Info.InvoiceAddressID === 0) {
            customer.Info.InvoiceAddressID = null;
        }

        if (customer.Dimensions !== null && (!customer.Dimensions.ID || customer.Dimensions.ID === 0)) {
            customer.Dimensions['_createguid'] = this.customerService.getNewGuid();
        }

        if ((customer.CustomerInvoiceReminderSettingsID === 0 ||
            !customer.CustomerInvoiceReminderSettingsID) &&
            !this.reminderSettings.isDirty) {
                customer.CustomerInvoiceReminderSettings = null;
        }

        if (this.customerID > 0) {
            this.customerService.Put(customer.ID, customer).subscribe(
                (updatedCustomer) => {
                    completeEvent('Kunde lagret');
                    if (this.modalMode) {
                        this.customerUpdated.next(updatedCustomer);
                    } else {
                        this.customerService.Get(updatedCustomer.ID, this.expandOptions).subscribe(retrievedCustomer => {
                            this.customer$.next(retrievedCustomer);
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
            this.customerService.Post(customer).subscribe(
                (newCustomer) => {
                    completeEvent('Kunde lagret');
                    if (this.modalMode) {
                        this.customerUpdated.next(newCustomer);
                    } else {
                        this.router.navigateByUrl('/sales/customer/' + newCustomer.ID);
                    }
                },
                (err) => {
                    completeEvent('Feil ved lagring');
                    this.errorService.handle(err);
                }
            );
        }
    }

    // TODO: remove later on when backend is fixed - Info.InvoiceAddress vs InvoiceAddress
    private getComponentLayout(): any {
        return {
            Name: 'Customer',
            BaseEntity: 'Customer',
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
                    EntityType: 'Customer',
                    Property: 'OrgNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    EntityType: 'Customer',
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
                    EntityType: 'Customer',
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
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Customer',
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
                    EntityType: 'Customer',
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
                    EntityType: 'Customer',
                    Property: 'WebUrl',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.URL,
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
                    Url: 'customers',
                    Validations: [

                    ],
                    LookupEntityType: null,
                    ValueList: null,
                    ComponentLayoutID: 1,
                    EntityType: 'Customer',
                    Property: 'CreditDays',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    DisplayField: null,
                    Width: null,
                    Sectionheader: 'Betingelser',
                    Alignment: 0,
                    Label: 'Kredittdager',
                    Description: null,
                    HelpText: null,
                    Placeholder: null,
                    FieldSet: 0,
                    Section: 1,
                    Options: null,
                    LineBreak: false,
                    Combo: null,
                    Legend: 'Betingelser',
                    StatusCode: null,
                    CustomValues: {

                    },
                    ID: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null
                },
                {
                    LookupEntityType: null,
                    ValueList: null,
                    ComponentLayoutID: 1,
                    EntityType: 'Customer',
                    Property: 'CurrencyCodeID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    DisplayField: null,
                    Width: null,
                    Sectionheader: 'Betingelser',
                    Alignment: 0,
                    Label: 'Foretrukket valuta',
                    Description: null,
                    HelpText: null,
                    Placeholder: null,
                    FieldSet: 0,
                    Section: 1,
                    Options: null,
                    LineBreak: false,
                    Combo: null,
                    Legend: 'Betingelser',
                    StatusCode: null,
                    ID: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Prosjekt',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 2,
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
                    EntityType: 'Department',
                    Property: 'Dimensions.DepartmentID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avdeling',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 2,
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
                    Sectionheader: 'EHF',
                    Legend: 'EHF',
                    Section: 3,
                    EntityType: 'Customer',
                    Property: 'PeppolAddress',
                    Label: 'Peppoladresse',
                    FieldType: FieldType.TEXT
                },
                {
                    Sectionheader: 'EHF',
                    Legend: 'EHF',
                    Section: 3,
                    EntityType: 'Customer',
                    Property: 'GLN',
                    Label: 'GLN-nummer',
                    FieldType: FieldType.TEXT
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Customer',
                    Property: 'DefaultBankAccountID',
                    Placement: 4,
                    Hidden: true, // false, // TODO: > 30.6
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Bankkonto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0, //3, // TODO: > 30.6
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
