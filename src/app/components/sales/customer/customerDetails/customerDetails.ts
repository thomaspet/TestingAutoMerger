import {Router, ActivatedRoute} from '@angular/router';
import {Component, Input, ViewChild, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {
    ComponentLayout,
    Customer,
    Contact,
    Email,
    Phone,
    Address,
    CustomerInvoiceReminderSettings,
    CurrencyCode,
    Terms,
    NumberSeries,
    Seller,
    SellerLink
} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IReference} from '../../../../models/iReference';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {IPosterWidget} from '../../../common/poster/poster';
import {LedgerAccountReconciliation} from '../../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {ReminderSettings} from '../../../common/reminder/settings/reminderSettings';
import {IToolbarConfig, ICommentsConfig} from '../../../common/toolbar/toolbar';
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
    CurrencyCodeService,
    TermsService,
    UniSearchCustomerConfig,
    NumberSeriesService,
    SellerLinkService,
    SellerService
} from '../../../../services/services';
import {
    UniModalService,
    UniAddressModal,
    UniEmailModal,
    UniPhoneModal,
    ConfirmActions
} from '../../../../../framework/uniModal/barrel';
import {UniHttp} from '../../../../../framework/core/http/http';
declare var _;

@Component({
    selector: 'customer-details',
    templateUrl: './customerDetails.html'
})
export class CustomerDetails {
    @Input() public modalMode: boolean;
    @Output() public customerUpdated: EventEmitter<Customer> = new EventEmitter<Customer>();
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(LedgerAccountReconciliation) private ledgerAccountReconciliation: LedgerAccountReconciliation;
    @ViewChild(ReminderSettings) public reminderSettings: ReminderSettings;

    private customerID: any;
    private allowSearchCustomer: boolean = true;
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public showReminderSection: boolean = false; // used in template
    public showContactSection: boolean = false; // used in template
    public showSellerSection: boolean = false; // used in template

    public currencyCodes: Array<CurrencyCode>;
    public paymentTerms: Terms[];
    public deliveryTerms: Terms[];
    public numberSeries: NumberSeries[];
    public dropdownData: any;
    public customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    public searchText: string;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;
    public reportLinks: IReference[];
    private activeTab: string = 'details';
    public showReportWithID: number;
    private isDisabled: boolean = true;
    private commentsConfig: ICommentsConfig;
    private isDirty: boolean = false;
    private selectConfig: any;
    private deletables: SellerLink[] = [];
    private sellers: Seller[];

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
            },
            {
                label: 'Slett kunde',
                action: () => this.deleteCustomer(this.customerID),
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

    private expandOptions: Array<string> = [
        'Info',
        'Info.Phones',
        'Info.DefaultPhone',
        'Info.Addresses',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Dimensions',
        'CustomerInvoiceReminderSettings',
        'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
        'Info.Contacts.Info',
        'Info.Contacts.Info.DefaultEmail',
        'Info.Contacts.Info.DefaultPhone',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller'
    ];

    private formIsInitialized: boolean = false;

    private saveactions: IUniSaveAction[];

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
        private currencyCodeService: CurrencyCodeService,
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private modalService: UniModalService,
        private http: UniHttp,
        private termsService: TermsService,
        private numberSeriesService: NumberSeriesService,
        private sellerLinkService: SellerLinkService,
        private sellerService: SellerService
    ) {}

    public ngOnInit() {
        this.setupSaveActions();
        if (!this.modalMode) {
            this.route.params.subscribe((params) => {
                if (params['id'] === 'new') {
                    this.customerID = 0;
                } else {
                    this.customerID = +params['id'];
                }

                this.commentsConfig = {
                    entityType: 'Customer',
                    entityID: this.customerID
                };

                this.selectConfig = this.numberSeriesService.getSelectConfig(
                    this.customerID, this.numberSeries, 'Customer number series'
                );
                this.setup();

                this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Customers)
                    .subscribe(links => this.reportLinks = links, err => this.errorService.handle(err));
            });
        }
    }

    private setupSaveActions() {
        this.saveactions = [
             {
                 label: 'Lagre',
                 action: (completeEvent) => this.saveCustomer(completeEvent),
                 main: true,
                 disabled: this.isDisabled
             }
        ];
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
        if (!this.customer$.value.ID) {
            return this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kunder før denne');
        }
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
        this.showTab('details');
        this.router.navigateByUrl('/sales/customer/new');
        this.isDisabled = true;
        this.setupSaveActions();
    }

    private deleteCustomer(id: number) {
        if (confirm('Vil du slette denne kunden?')) {
            this.customerService.deleteCustomer(id).subscribe(res => {
                this.router.navigateByUrl('/sales/customers/');
            }, err => this.errorService.handle(err));
        }
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

    public canDeactivate(): Observable<boolean> {
        return !this.isDirty && !(this.ledgerAccountReconciliation && this.ledgerAccountReconciliation.isDirty)
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveCustomer(() => {});
                    } else if (result === ConfirmActions.REJECT) {
                        this.isDirty = false;
                        if (this.ledgerAccountReconciliation) {
                            this.ledgerAccountReconciliation.isDirty = false;
                        }
                    }

                    return result !== ConfirmActions.CANCEL;
                });
    }

    public showTab(tab: string, reportid: number = null) {
        if (this.activeTab === 'reconciliation'
            && this.ledgerAccountReconciliation
            && this.ledgerAccountReconciliation.isDirty) {

            this.activeTab = tab;
            this.showReportWithID = reportid;
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
        this.customerID = id ? id : 0;
        this.allowSearchCustomer = false;
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
                this.currencyCodeService.GetAll(null),
                this.termsService.GetAction(null, 'get-payment-terms'),
                this.termsService.GetAction(null, 'get-delivery-terms'),
                this.numberSeriesService.GetAll(
                    `filter=NumberSeriesType.Name eq 'Customer Account number series'
                    and Empty eq false and Disabled eq false`,
                    ['NumberSeriesType']
                ),
                this.sellerService.GetAll(null)
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.emptyPhone = response[3];
                this.emptyEmail = response[4];
                this.emptyAddress = response[5];
                this.customerStatisticsData = response[6];
                this.currencyCodes = response[7];
                this.paymentTerms = response[8];
                this.deliveryTerms = response[9];
                this.numberSeries = response[10].map(x => this.numberSeriesService.translateSerie(x));
                this.sellers = response[11];

                let customer: Customer = response[2];
                customer.SubAccountNumberSeriesID =
                    this.numberSeries.find(x => x.Name === 'Customer number series').ID;
                this.isDisabled = !customer.Info.Name;
                this.setupSaveActions();
                this.setMainContact(customer);
                this.customer$.next(customer);

                if (customer.CustomerInvoiceReminderSettings === null) {
                    customer.CustomerInvoiceReminderSettings = new CustomerInvoiceReminderSettings();
                    customer.CustomerInvoiceReminderSettings['_createguid'] =
                        this.customerInvoiceReminderSettingsService.getNewGuid();
                }

                customer.DefaultSeller = customer.DefaultSeller;

                this.selectConfig = this.numberSeriesService.getSelectConfig(
                    this.customerID, this.numberSeries, 'Customer number series'
                );
                this.setTabTitle();
                this.extendFormConfig();
                this.showHideNameProperties();
                this.updateCustomerWidgets();

                this.formIsInitialized = true;
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
                let customer = response[0];
                this.setMainContact(customer);

                this.customer$.next(customer);

                this.customerStatisticsData = response[1];

                if (customer.CustomerInvoiceReminderSettings === null) {
                    customer.CustomerInvoiceReminderSettings = new CustomerInvoiceReminderSettings();
                    customer.CustomerInvoiceReminderSettings['_createguid'] =
                        this.customerInvoiceReminderSettingsService.getNewGuid();
                }

                this.setTabTitle();
                this.showHideNameProperties();
                this.updateCustomerWidgets();
            }, err => this.errorService.handle(err));
        }
    }

    public numberSeriesChange(selectedSerie) {
        let customer = this.customer$.getValue();
        customer.SubAccountNumberSeriesID = selectedSerie.ID;
        this.customer$.next(customer);
    }

    private setMainContact(customer: Customer) {
        if (customer && customer.Info && customer.Info.Contacts && customer.Info.DefaultContactID) {
            customer.Info.Contacts.forEach(x => {
                x['_maincontact'] = x.ID === customer.Info.DefaultContactID;
            });
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
                return item !== null ? (item.DepartmentNumber + ' - ' + item.Name) : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        let project: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ' - ' + item.Name) : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        let defaultSeller: UniFieldLayout = fields.find(field => field.Property === 'DefaultSeller.ID');
        defaultSeller.Options = {
            source: this.sellers,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200,
            addEmptyValue: true
        };

        let paymentTerm: UniFieldLayout = fields.find(x => x.Property === 'PaymentTermsID');
        paymentTerm.Options = {
            source: this.paymentTerms,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.CreditDays + ' kredittdager (' + item.Name + ')') : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        let deliveryTerm: UniFieldLayout = fields.find(x => x.Property === 'DeliveryTermsID');
        deliveryTerm.Options = {
            source: this.deliveryTerms,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.CreditDays + ' leveringsdager (' + item.Name + ')') : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        // MultiValue
        let phones: UniFieldLayout = fields.find(x => x.Property === 'Info.DefaultPhone');

        phones.Options = {
            entity: Phone,
            listProperty: 'Info.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultPhone',
            storeIdInProperty: 'Info.DefaultPhoneID',
            editor: (value) => {
                const modal = this.modalService.open(UniPhoneModal, {
                    data: value || new Phone()
                });

                return modal.onClose.take(1).toPromise();
            }
        };

        let invoiceaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.InvoiceAddress');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.InvoiceAddress',
            storeIdInProperty: 'Info.InvoiceAddressID',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    header: 'Fakturaadresse'
                });

                return modal.onClose.take(1).toPromise();
            },
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
            storeResultInProperty: 'Info.DefaultEmail',
            storeIdInProperty: 'Info.DefaultEmailID',
            editor: (value) => {
                const modal = this.modalService.open(UniEmailModal, {
                    data: value || new Email()
                });

                return modal.onClose.take(1).toPromise();
            }
        };

        let shippingaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeIdInProperty: 'Info.ShippingAddressID',
            storeResultInProperty: 'Info.ShippingAddress',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    header: 'Leveringsadresse'
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        this.fields$.next(fields);
    }

    public showHideNameProperties() {
        let fields: UniFieldLayout[] = this.fields$.getValue();

        let customer = this.customer$.getValue();
        let customerSearchResult: UniFieldLayout = fields.find(x => x.Property === '_CustomerSearchResult');
        let customerName: UniFieldLayout = fields.find(x => x.Property === 'Info.Name');

        if (
            !this.allowSearchCustomer ||
            this.customerID > 0 ||
            (customer && customer.Info.Name !== null && customer.Info.Name !== '')
        ) {
            customerSearchResult.Hidden = true;
            customerName.Hidden = false;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form.field('Info.Name')) {
                    this.form.field('Info.Name').focus();
                }
            }, 200);
        } else {
            customerSearchResult.Hidden = false;
            customerName.Hidden = true;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form.field('_CustomerSearchResult')) {
                    this.form.field('_CustomerSearchResult').focus();
                }
            }, 200);
        }
    }

    public saveCustomer(completeEvent: any) {
        // small timeout to allow uniform and unitable to update the sources before saving
        setTimeout(() => {
            let customer = this.customer$.getValue();

            // add createGuid for new entities and remove duplicate entities
            if (!customer.Info.Emails) {
                customer.Info.Emails = [];
            }

            customer.Info.Emails.forEach(email => {
                if (email.ID === 0 || !email.ID) {
                    email['_createguid'] = this.customerService.getNewGuid();
                }
            });

            if (customer.Info.DefaultEmail) {
                customer.Info.Emails = customer.Info.Emails.filter(x => x !== customer.Info.DefaultEmail);
            }

            if (!customer.Info.Phones) {
                customer.Info.Phones = [];
            }

            customer.Info.Phones.forEach(phone => {
                if (phone.ID === 0 || !phone.ID) {
                    phone['_createguid'] = this.customerService.getNewGuid();
                }
            });

            if (customer.Info.DefaultPhone) {
                customer.Info.Phones = customer.Info.Phones.filter(x => x !== customer.Info.DefaultPhone);
            }

            if (!customer.Info.Addresses) {
                customer.Info.Addresses = [];
            }

            customer.Info.Addresses.forEach(address => {
                if (address.ID === 0 || !address.ID) {
                    address['_createguid'] = this.customerService.getNewGuid();
                }
            });

            if (customer.Info.ShippingAddress) {
                customer.Info.Addresses = customer.Info.Addresses.filter(x => x !== customer.Info.ShippingAddress);
            }

            if (customer.Info.InvoiceAddress) {
                customer.Info.Addresses = customer.Info.Addresses.filter(x => x !== customer.Info.InvoiceAddress);
            }

            if (!customer.Info.DefaultPhone && customer.Info.DefaultPhoneID === 0) {
                customer.Info.DefaultPhoneID = null;
            }

            if (!customer.Info.DefaultEmail && customer.Info.DefaultEmailID === 0) {
                customer.Info.DefaultEmailID = null;
            }

            if (!customer.Info.ShippingAddress && customer.Info.ShippingAddressID === 0) {
                customer.Info.ShippingAddressID = null;
            }

            if (!customer.Info.InvoiceAddress && customer.Info.InvoiceAddressID === 0) {
                customer.Info.InvoiceAddressID = null;
            }

            if (customer.Dimensions && (!customer.Dimensions.ID || customer.Dimensions.ID === 0)) {
                customer.Dimensions['_createguid'] = this.customerService.getNewGuid();
            }

            if (!customer.Info.Contacts) {
                customer.Info.Contacts = [];
            }

            customer.Info.Contacts.forEach(contact => {
                if (contact.ID === 0 || !contact.ID) {
                    contact['_createguid'] = this.customerService.getNewGuid();
                }
            });

            if (customer.Info.Contacts.filter(x => !x.ID && x.Info.Name === '')) {
                // remove new contacts where name is not set, probably an empty row anyway
                customer.Info.Contacts = customer.Info.Contacts.filter(x => !(!x.ID && x.Info.Name === ''));
            }

            if ((customer.CustomerInvoiceReminderSettingsID === 0 ||
                !customer.CustomerInvoiceReminderSettingsID) &&
                (this.reminderSettings && !this.reminderSettings.isDirty)) {
                    customer.CustomerInvoiceReminderSettings = null;
            }

            customer['_CustomerSearchResult'] = undefined;


            // add deleted sellers back to 'Sellers' to delete with 'Deleted' property, was sliced locally/in view
            if (this.deletables) {
                this.deletables.forEach(sellerLink => customer.Sellers.push(sellerLink));
            }

            if (this.customerID > 0) {
                this.customerService.Put(customer.ID, customer).subscribe(
                    (updatedCustomer) => {
                        this.isDirty = false;
                        completeEvent('Kunde lagret');
                        if (this.modalMode) {
                            this.customerUpdated.next(updatedCustomer);
                        } else {
                            this.customerService.Get(updatedCustomer.ID, this.expandOptions)
                                .subscribe(retrievedCustomer => {
                                    this.setMainContact(retrievedCustomer);
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
                        this.isDirty = false;
                        completeEvent('Kunde lagret');
                        this.selectConfig = undefined;
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

        }, 100);
    }

    public onContactChanged(contact: Contact) {
        if (!contact) {
            return;
        }

        if (!contact.ID) {
            contact['_createguid'] = this.customerService.getNewGuid();
            contact.Info['_createguid'] = this.customerService.getNewGuid();
        }

        // prepare for save
        if (!contact.Info.DefaultEmail.ID) {
            contact.Info.DefaultEmail['_createguid'] = this.customerService.getNewGuid();
        }

        if (!contact.Info.DefaultPhone.ID) {
            contact.Info.DefaultPhone['_createguid'] = this.customerService.getNewGuid();
        }
    }

    private getCustomerLookupOptions() {
        let uniSearchConfig = this.uniSearchCustomerConfig.generate(
            this.expandOptions,
            (inputVal: string) => {
                let customer = this.customer$.getValue();
                customer.Info.Name = inputVal;
                if (!customer.Info.Name) {
                    customer.Info.Name = '';
                }
                this.customer$.next(customer);
                this.showHideNameProperties();
                return Observable.empty();
            });

        uniSearchConfig.unfinishedValueFn = (val: string) => this.customer$
            .asObservable()
            .take(1)
            .map(customer => {
                customer.Info.Name = val;
                this.showHideNameProperties();
                return customer;
            });

        uniSearchConfig.onSelect = (selectedItem: any) => {
            if (selectedItem.ID) {
                // If an existing customer is selected, navigate to that customer instead
                // of populating the fields for a new customer
                this.router.navigateByUrl(`/sales/customer/${selectedItem.ID}`);
                return Observable.empty();
            } else {
                let customerData =
                this.uniSearchCustomerConfig
                    .customStatisticsObjToCustomer(selectedItem, true, this.customer$.getValue());

                return Observable.from([customerData]);
            }
        };

        return uniSearchConfig;
    }

    public onChange(changes: SimpleChanges) {
        this.isDirty = true;

        if (changes['Info.Name']) {
            if (this.isDisabled === true && changes['Info.Name'].currentValue !== '') {
                this.isDisabled = false;
                this.setupSaveActions();
            } else if (this.isDisabled === false && changes['Info.Name'].currentValue === '') {
                this.toastService.addToast('Navn er påkrevd', ToastType.warn, ToastTime.short);
                this.isDisabled = true;
                this.setupSaveActions();
            }
        }
        let customer = this.customer$.getValue();

        if (changes['DefaultSellerID']) {
            if (customer.DefaultSellerID) {
                customer.DefaultSeller = this.sellers.find(seller => seller.ID === customer.DefaultSellerID);
            } else {
                customer.DefaultSeller = null;
                customer.DefaultSellerID = 0;
            }
        }

        if (changes['DefaultSeller.ID'] && customer.DefaultSeller.ID === null) {
           customer.DefaultSeller = null;
           customer.DefaultSellerID = 0;
        }

        if (changes['_CustomerSearchResult']) {
            let searchResult = changes['_CustomerSearchResult'].currentValue;

            if (searchResult === '') {
                this.toastService.addToast('Navn er påkrevd', ToastType.warn, ToastTime.short);
            }

            if (searchResult && searchResult.Info.Name) {
                let customer = this.customer$.value;
                customer = searchResult;
                this.customer$.next(customer);
                this.isDisabled = false;
                this.setupSaveActions();
                this.showHideNameProperties();
            }
        }
    }

    public onSellerLinkDeleted(sellerLink: SellerLink) {
        let customer = this.customer$.getValue();
        if (customer.DefaultSeller && sellerLink.SellerID === customer.DefaultSeller.ID) {
            customer.DefaultSeller = null;
            customer.DefaultSellerID = 0;
        }
        this.customer$.next(customer);
    }

    // TODO: remove later on when backend is fixed - Info.InvoiceAddress vs InvoiceAddress
    private getComponentLayout(): any {
        return {
            Name: 'Customer',
            BaseEntity: 'Customer',
            Fields: [
                // Fieldset 1 (Kunde)
                {
                    FieldSet: 1,
                    Legend: 'Kunde',
                    EntityType: 'BusinessRelation',
                    Property: 'Info.Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                    Section: 0
                },
                {
                    FieldSet: 1,
                    Legend: 'Kunde',
                    EntityType: 'Customer',
                    Property: '_CustomerSearchResult',
                    FieldType: FieldType.UNI_SEARCH,
                    Label: 'Navn',
                    Section: 0,
                    Options: {
                        uniSearchConfig: this.getCustomerLookupOptions()
                    }
                },
                {
                    FieldSet: 1,
                    EntityType: 'Customer',
                    Property: 'OrgNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Organisasjonsnummer',
                    Section: 0
                },
                {
                    FieldSet: 1,
                    EntityType: 'Customer',
                    Property: 'WebUrl',
                    FieldType: FieldType.URL,
                    Label: 'Webadresse',
                    Section: 0
                },

                // Fieldset 2 (Kontaktinformasjon)
                {
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    EntityType: 'Customer',
                    Property: 'Info.InvoiceAddress',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Fakturaadresse',
                    Section: 0
                },
                {
                    FieldSet: 2,
                    EntityType: 'Customer',
                    Property: 'Info.ShippingAddress',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Leveringsadresse',
                    Section: 0
                },
                {
                    FieldSet: 2,
                    EntityType: 'Customer',
                    Property: 'Info.DefaultEmail',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'E-post adresser',
                    Section: 0
                },
                {
                    FieldSet: 2,
                    EntityType: 'Customer',
                    Property: 'Info.DefaultPhone',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Telefonnumre',
                    Section: 0
                },

                // Fieldset 3 (Betingelser)
                {
                    FieldSet: 3,
                    Legend: 'Betingelser',
                    EntityType: 'Customer',
                    Property: 'PaymentTermsID',
                    FieldType: FieldType.DROPDOWN,
                    Sectionheader: 'Betingelser',
                    Label: 'Betalingsbetingelse',
                    Section: 0
                },
                {
                    FieldSet: 3,
                    EntityType: 'Customer',
                    Property: 'DeliveryTermsID',
                    FieldType: FieldType.DROPDOWN,
                    Sectionheader: 'Betingelser',
                    Label: 'Leveringsbetingelse',
                    Section: 0
                },
                {
                    FieldSet: 3,
                    EntityType: 'Customer',
                    Property: 'CurrencyCodeID',
                    FieldType: FieldType.DROPDOWN,
                    Sectionheader: 'Betingelser',
                    Label: 'Foretrukket valuta',
                    Section: 0
                },

                // Fieldset 4 (Dimensjoner)
                {
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prosjekt',
                    Section: 0,
                    Sectionheader: 'Dimensjoner'
                },
                {
                    FieldSet: 4,
                    EntityType: 'Department',
                    Property: 'Dimensions.DepartmentID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avdeling',
                    Section: 0
                },
                {
                    FieldSet: 4,
                    EntityType: 'Seller',
                    Property: 'DefaultSeller.ID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Hovedselger',
                    Section: 0
                },

                // Fieldset 5 (EHF)
                {
                    FieldSet: 5,
                    Legend: 'EHF',
                    Sectionheader: 'EHF',
                    Section: 0,
                    EntityType: 'Customer',
                    Property: 'PeppolAddress',
                    Label: 'Peppoladresse',
                    FieldType: FieldType.TEXT
                },
                {
                    FieldSet: 5,
                    Sectionheader: 'EHF',
                    Section: 0,
                    EntityType: 'Customer',
                    Property: 'GLN',
                    Label: 'GLN-nummer',
                    FieldType: FieldType.TEXT
                },

                // Hidden field
                {
                    EntityType: 'Customer',
                    Property: 'DefaultBankAccountID',
                    Hidden: true, // false, // TODO: > 30.6
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Bankkonto',
                    FieldSet: 0,
                    Section: 0, // 3, // TODO: > 30.6
                    Sectionheader: 'Konto & bank',
                    Legend: 'Konto & bank',
                }
            ]
        };
    }

}
