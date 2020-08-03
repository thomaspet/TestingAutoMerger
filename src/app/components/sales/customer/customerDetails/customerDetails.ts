import {Router, ActivatedRoute} from '@angular/router';
import {Component, ViewChild, SimpleChanges, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout, FieldType, UniFormError} from '../../../../../framework/ui/uniform/index';
import {NavbarLinkService} from '../../../layout/navbar/navbar-link-service';
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
    SellerLink,
    BankAccount,
    Distributions
} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IReference} from '../../../../models/iReference';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {LedgerAccountReconciliation} from '../../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {ReminderSettings} from '../../../common/reminder/settings/reminderSettings';
import {IToolbarConfig, ICommentsConfig, IToolbarSubhead, IToolbarValidation} from '../../../common/toolbar/toolbar';
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
    SellerService,
    BankAccountService,
    ModulusService,
    JournalEntryLineService,
    DistributionPlanService,
    PageStateService,
    CustomDimensionService,
    UniSearchDimensionConfig,
    CompanySettingsService,
    UniTranslationService
} from '../../../../services/services';
import {
    UniModalService,
    UniAddressModal,
    UniEmailModal,
    UniPhoneModal,
    ConfirmActions,
    UniBankAccountModal,
    UniConfirmModalV2,
    IModalOptions,
} from '../../../../../framework/uni-modal';
import {AuthService} from '@app/authService';

import {StatusCode} from '../../../sales/salesHelper/salesEnums';
import {IUniTab} from '@uni-framework/uni-tabs';
import * as _ from 'lodash';
import { KidModalComponent } from '@app/components/sales/customer/kid-modal/kid-modal.component';
import { ReportTypeEnum } from '@uni-models/reportTypeEnum';
import { ReportTypeService } from '@app/services/reports/reportTypeService';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AvtaleGiroModal } from '../avtalegiro-modal/avtalegiro-modal';
import {SelectDistributionPlanModal} from '@app/components/common/modals/select-distribution-plan-modal/select-distribution-plan-modal';

const isNumber = (value) => _.reduce(value, (res, letter) => {
    if (res === false) {
        return false;
    } else {
        if (letter >= '0' && letter <= '9') {
            return true;
        } else {
            return false;
        }
    }
}, true);

@Component({
    selector: 'customer-details',
    templateUrl: './customerDetails.html'
})
export class CustomerDetails implements OnInit {
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(LedgerAccountReconciliation) private postpost: LedgerAccountReconciliation;
    @ViewChild(ReminderSettings) public reminderSettings: ReminderSettings;

    private customerID: any;
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public showReminderSection: boolean = false; // used in template
    public showContactSection: boolean = false; // used in template
    public showSellerSection: boolean = false; // used in template

    public companySettings: any;
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
    private customDimensions: any[] = [];

    public showReportWithID: number;
    public commentsConfig: ICommentsConfig;
    public selectConfig: any;
    private sellers: Seller[];
    private distributionPlans: any[] = [];

    private isDirty: boolean = false;
    private hasErrors: boolean = false;

    public toolbarSubheads: IToolbarSubhead[];
    public toolbarStatusValidation: IToolbarValidation[];

    public tabs: IUniTab[];
    public activeTabIndex: number = 0;

    entityTypes = [
        {
            value: 'Models.Sales.CustomerInvoice',
            label: 'Faktura',
            defaultPlan: null,
            keyValue: 'CustomerInvoiceDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerOrder',
            label: 'Ordre',
            defaultPlan: null,
            keyValue: 'CustomerOrderDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerQuote',
            label: 'Tilbud',
            defaultPlan: null,
            keyValue: 'CustomerQuoteDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerInvoiceReminder',
            label: 'Purring',
            defaultPlan: null,
            keyValue: 'CustomerInvoiceReminderDistributionPlanID',
            plans: []
        }
    ];

    public toolbarconfig: IToolbarConfig = {
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
                label: 'Aktiver kunde',
                action: () => this.activateCustomer(this.customerID),
                disabled: () => !this.customerID
            },
            {
                label: 'Deaktiver kunde',
                action: () => this.deactivateCustomer(this.customerID),
                disabled: () => !this.customerID
            },
            {
                label: 'Slett kunde',
                action: () => this.deleteCustomer(this.customerID),
                disabled: () => !this.customerID
            }
        ]
    };

    private expandOptions: string[] = [
        'Info',
        'Info.Phones',
        'Info.DefaultPhone',
        'Info.Addresses',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Dimensions',
        'Info.DefaultBankAccount',
        'Info.BankAccounts.Bank',
        'CustomerInvoiceReminderSettings',
        'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
        'CustomerInvoiceReminderSettings.DebtCollectionSettings',
        'Info.Contacts.Info',
        'Info.Contacts.Info.DefaultEmail',
        'Info.Contacts.Info.DefaultPhone',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'Distributions',
        'Companies',
    ];

    private newEntityExpandOptions: string[] = [
        'Info',
        'Info.Phones',
        'Info.Addresses',
        'Info.Emails',
        'Info.Contacts',
        'Dimensions',
        'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
        'Sellers',
        'Distributions'
    ];

    private formIsInitialized: boolean = false;

    public saveactions: IUniSaveAction[];

    private localizationOptions: {Culture: string, Label: string}[] = [
        {Culture: 'no', Label: 'Norsk bokmål'},
        {Culture: 'en', Label: 'Engelsk'},
    ];

    public postposttabs: IUniTab[] = [
        {name: 'Åpne poster', value: 'OPEN'},
        {name: 'Lukkede poster', value: 'MARKED'},
        {name: 'Alle poster', value: 'ALL'}
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
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private numberFormat: NumberFormat,
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private currencyCodeService: CurrencyCodeService,
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private modalService: UniModalService,
        private termsService: TermsService,
        private numberSeriesService: NumberSeriesService,
        private sellerService: SellerService,
        private bankaccountService: BankAccountService,
        private modulusService: ModulusService,
        private journalEntryLineService: JournalEntryLineService,
        private authService: AuthService,
        private distributionPlanService: DistributionPlanService,
        private navbarLinkService: NavbarLinkService,
        private reportTypeService: ReportTypeService,
        private pageStateService: PageStateService,
        private customDimensionService: CustomDimensionService,
        private uniSearchDimensionConfig: UniSearchDimensionConfig,
        private companySettingsService: CompanySettingsService,
        private translationService: UniTranslationService
    ) {}

    public ngOnInit() {
        this.modulusService.orgNrValidationUniForm(null, null, false);

        this.setupSaveActions();
        combineLatest(this.route.params, this.route.queryParams)
            .pipe(map(results => ({params: results[0], query: results[1]})))
            .subscribe(results => {
                this.isDirty = false;
                this.customerID = +results.params['id'];
                const index = +results.query['tabIndex']  || 0;

                this.tabs = [
                    {name: 'Detaljer'},
                    {name: 'Utsendelse'},
                    {name: 'Åpne poster'},
                    {name: 'Produkter solgt'},
                    {name: 'Dokumenter'},
                    {name: 'Selskap'},
                ];

                this.commentsConfig = {
                    entityType: 'Customer',
                    entityID: this.customerID
                };

                this.selectConfig = this.numberSeriesService.getSelectConfig(
                    this.customerID, this.numberSeries, 'Customer number series'
                );
                this.setup();

                if (!!this.customerID) {
                    // Add check to see if user has access to the TOF-modules before adding the tabs
                    this.navbarLinkService.linkSections$.subscribe(linkSections => {
                        const mySections = linkSections.filter(sec => sec.name === 'NAVBAR.SALES');
                        if (mySections.length) {
                            this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Customers).subscribe(
                                links => {
                                    this.reportLinks = links;
                                    const addLinks = [];
                                    links.forEach((link) => {
                                        mySections[0].linkGroups.forEach((group) => {
                                            group.links.forEach( (li) => {
                                                if (this.translationService.translate(li.name) === link.name) {
                                                    addLinks.push(link);
                                                }
                                            });
                                        });
                                    });

                                    if (this.tabs.length === 6) {
                                        this.tabs = this.tabs.concat([], ...addLinks);
                                    }
                                    this.activeTabIndex = index < this.tabs.length ? index : 0;
                                },
                                err => {
                                    this.errorService.handle(err);
                                    this.activeTabIndex = index < this.tabs.length ? index : 0;
                                }
                            );
                        } else {
                            this.activeTabIndex = index < this.tabs.length ? index : 0;
                        }
                    });
                } else {
                    this.activeTabIndex = index < this.tabs.length ? index : 0;
                }
        });
    }

    private activateCustomer(customerID: number) {
        const customer = this.customer$.value;
        const field = this.fields$.value.find(x => x.Property === 'OrgNumber');
        const error = this.modulusService.orgNrValidationUniForm(customer.OrgNumber, field, false);
        if (error && (customer.StatusCode === StatusCode.Pending || !customer.StatusCode)) {
            return this.modalService.open(UniConfirmModalV2, {
                header: 'Aktivere leverandør?',
                message: `Aktivere kunde med ugyldig org.nr. '${customer.OrgNumber}'?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.customerService.activateCustomer(customerID).subscribe(
                        res => this.setCustomerStatusOnToolbar(StatusCode.Active),
                        err => this.errorService.handle(err)
                    );
                }
            });
        }
        this.customerService.activateCustomer(customerID).subscribe(
            res => this.setCustomerStatusOnToolbar(StatusCode.Active),
            err => this.errorService.handle(err)
        );
    }

    private deactivateCustomer(customerID: number) {
        this.customerService.deactivateCustomer(customerID).subscribe(
            res => this.setCustomerStatusOnToolbar(StatusCode.InActive),
            err => this.errorService.handle(err)
        );
    }

    private setupSaveActions() {
        this.saveactions = [
             {
                 label: 'Lagre',
                 action: (completeEvent) => this.saveAction(completeEvent),
                 main: true,
                 disabled: !this.isDirty || this.hasErrors
             },
             {
                 label: 'Lagre som potensiell kunde',
                 action: (completeEvent) => this.saveAction(completeEvent, true),
                 main: false,
                 disabled: !this.isDirty || this.hasErrors
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

    public onSubCompanyChange(customer: Customer) {
        this.customer$.next(customer);
        if (customer.Companies && customer.Companies[0]) {
            this.isDirty = true;
            this.setupSaveActions();
        }
    }

    public addCustomer() {
        this.formIsInitialized = false;
        this.activeTabIndex = 0;
        if (this.customerID) {
            this.router.navigateByUrl('/sales/customer/0');
        } else {
            this.setup();
        }
    }

    private deleteCustomer(id: number) {
        return this.journalEntryLineService.getJournalEntryLinePostPostData(true, true, id, null, null, null).subscribe(res => {
            if (res.length > 0) {
                this.modalService.open(UniConfirmModalV2, {
                    header: 'Posteringer på kunde',
                    message: 'Denne kunden har bokførte transaksjoner og kan ikke slettes.',
                    buttonLabels: {
                        accept: 'Deaktiver',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(action => {
                    if (action === ConfirmActions.ACCEPT) {
                        return this.deactivateCustomer(id);
                    }
                    return;
                });
            } else {
                if (confirm('Vil du slette denne kunden?')) {
                    this.customerService.deleteCustomer(id).subscribe(response => {
                        this.router.navigateByUrl('/sales/customer/');
                    }, err => this.errorService.handle(err));
                }
            }
        });
    }

    public addTab() {
        this.pageStateService.setPageState('tabIndex', this.activeTabIndex + '');

        const customer = this.customer$.getValue();
        const tabTitle = customer && customer.CustomerNumber ? 'Kundenr. ' + customer.CustomerNumber : 'Ny kunde';
        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            name: tabTitle,
            active: true,
            moduleID: UniModules.Customers
        });
    }

    private setTabTitle() {
        const customer = this.customer$.getValue();
        this.toolbarconfig.title = customer.ID
            ? [customer.CustomerNumber, customer.Info.Name].join(' - ')
            : 'Ny kunde';

        this.showTab();
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        const customer = this.customer$.value;
        const invoiceAddress = customer.Info && customer.Info.InvoiceAddress;

        const isForeign = invoiceAddress
            && invoiceAddress.CountryCode
            && invoiceAddress.CountryCode !== 'NO';

        const validOrgNumber = !!isForeign
            || !customer.OrgNumber
            || this.modulusService.isValidOrgNr(customer.OrgNumber);

        const modalOptions: IModalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har ulagrede endringer. Ønsker du å lagre disse før vi fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        if (!validOrgNumber) {
            modalOptions.warning = 'Advarsel: Organisasjonsnummer er ikke gyldig';
        }

        return this.modalService.confirm(modalOptions).onClose.switchMap(modalResult => {
            if (modalResult === ConfirmActions.ACCEPT) {
                return this.save()
                    .catch(err => Observable.of(false))
                    .map(res => !!res);
            }

            return Observable.of(modalResult !== ConfirmActions.CANCEL);
        });
    }

    public showTab() {
        const tab = this.tabs[this.activeTabIndex];

        if (!tab) {
            return;
        }
        this.showReportWithID = tab['id'];

        this.addTab();
    }

    public setup() {
        this.showReportWithID = null;
        if (!this.formIsInitialized) {
            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.customerID > 0 ?
                        this.customerService.Get(this.customerID, this.expandOptions)
                        : this.customerService.GetNewEntity(this.newEntityExpandOptions)
                ),
                this.phoneService.GetNewEntity(),
                this.emailService.GetNewEntity(),
                this.addressService.GetNewEntity(null, 'Address'),
                this.currencyCodeService.GetAll(null),
                this.termsService.GetAction(null, 'get-payment-terms'),
                this.termsService.GetAction(null, 'get-delivery-terms'),
                this.numberSeriesService.GetAll(
                    `filter=NumberSeriesType.Name eq 'Customer Account number series'
                    and Empty eq false and Disabled eq false`,
                    ['NumberSeriesType']
                ),
                this.sellerService.GetAll(null),
                this.distributionPlanService.GetAll(null, ['Elements', 'Elements.ElementType']),
                this.customDimensionService.getMetadata(),
                this.companySettingsService.Get(1, ['Distributions'])
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.emptyPhone = response[3];
                this.emptyEmail = response[4];
                this.emptyAddress = response[5];
                this.currencyCodes = response[6];
                this.paymentTerms = response[7];
                this.deliveryTerms = response[8];
                this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(response[9]);
                this.sellers = response[10];
                this.distributionPlans = response[11];
                this.customDimensions = response[12];
                this.companySettings = response[13];

                const layout: ComponentLayout = this.getComponentLayout(); // results
                this.fields$.next(layout.Fields);

                const customer: Customer = response[2];

                const numberSerie = this.numberSeries.find(x => x.Name === 'Customer number series');
                if (numberSerie) {
                    customer.SubAccountNumberSeriesID = numberSerie.ID;
                }

                if (this.customerID > 0) {
                    this.getDataAndUpdateToolbarSubheads();
                }

                if (!customer.CustomerInvoiceReminderSettings) {
                    customer.CustomerInvoiceReminderSettings = <CustomerInvoiceReminderSettings>{
                        _createguid: this.customerInvoiceReminderSettingsService.getNewGuid()
                    };
                }

                this.setMainContact(customer);
                this.customer$.next(customer);
                this.setCustomerStatusOnToolbar();
                this.mapDistibutionPlans();

                this.selectConfig = this.numberSeriesService.getSelectConfig(
                    this.customerID, this.numberSeries, 'Customer number series'
                );

                this.setTabTitle();
                this.extendFormConfig();
                this.showHideNameProperties();

                this.formIsInitialized = true;
            }, err => this.errorService.handle(err));
        } else {
            const query = this.customerID > 0
                ? this.customerService.Get(this.customerID, this.expandOptions)
                : this.customerService.GetNewEntity(this.newEntityExpandOptions);

            query.subscribe(response => {
                const customer = response;
                this.setMainContact(customer);

                if (customer.CustomerInvoiceReminderSettings === null) {
                    customer.CustomerInvoiceReminderSettings = new CustomerInvoiceReminderSettings();
                    customer.CustomerInvoiceReminderSettings['_createguid'] =
                        this.customerInvoiceReminderSettingsService.getNewGuid();
                }

                this.customer$.next(customer);
                if (this.customerID > 0) {
                    this.getDataAndUpdateToolbarSubheads();
                }
                this.mapDistibutionPlans();
                this.setTabTitle();
                this.showHideNameProperties();
                this.setCustomerStatusOnToolbar();
            }, err => this.errorService.handle(err));
        }
    }

    private mapDistibutionPlans() {
        const customer = this.customer$.getValue();
        this.entityTypes.map((ent) => {
            ent.plans = this.distributionPlans.filter(plan => plan.EntityType === ent.value);
            ent.defaultPlan = this.distributionPlans.find(plan => {
                return plan.EntityType === ent.value && (customer && customer.Distributions
                    && plan.ID === customer.Distributions[ent.keyValue]);
            });
            return ent;
        });
    }

    public getDataAndUpdateToolbarSubheads() {
        this.authService.authentication$.take(1).subscribe(auth => {
            const user = auth.user;

            const invoiceRequest = this.authService.hasUIPermission(user, 'ui_sales_invoices')
                ? this.customerService.getCustomerInvoiceStatistics(this.customerID)
                : Observable.of(null);

            const orderRequest = this.authService.hasUIPermission(user, 'ui_sales_orders')
                ? this.customerService.getCustomerOrderStatistics(this.customerID)
                : Observable.of(null);

            Observable.forkJoin(orderRequest, invoiceRequest).subscribe(
                res => {
                    const subheads = [];

                    if (res[0]) {
                        subheads.push({
                            label: 'Ordre',
                            title: this.numberFormat.asMoney(res[0].SumOpenOrdersExVat)
                        });
                    }

                    if (res[1]) {
                        subheads.push({
                            label: 'Fakturert',
                            title: this.numberFormat.asMoney(res[1].SumInvoicedExVat)
                        });
                        subheads.push({
                            label: 'Utestående',
                            title: this.numberFormat.asMoney(res[1].SumDueInvoicesRestAmount),
                            classname: res[1].SumDueInvoicesRestAmount > 0 ? 'bad' : ''
                        });
                    }

                    this.toolbarSubheads = subheads;
                },
                err => {
                    this.errorService.handle(err);
                    this.toolbarSubheads = [];
                }
            );
        });
    }

    public onPostpostFilterClick(event: any) {
        this.postpost.showHideEntries(event.value);
    }

    public goToPostpost() {
        this.router.navigateByUrl('/accounting/postpost?name=' + this.customer$.value.Info.Name + '&register=customer');
    }

    public numberSeriesChange(selectedSerie) {
        const customer = this.customer$.getValue();
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

    private setCustomerStatusOnToolbar(statusCode?: number) {
        const activeStatusCode = statusCode || this.customer$.value.StatusCode;

        let type: 'good' | 'bad' | 'warn';
        let label: string;

        switch (activeStatusCode) {
            case StatusCode.Pending:
                type = 'warn';
                label = 'Potensiell kunde';
            break;
            case StatusCode.Active:
                type = 'good';
                label = 'Aktiv';
            break;
            case StatusCode.InActive:
                type = 'bad';
                label = 'Inaktiv';
            break;
            case StatusCode.Deleted:
                type = 'bad';
                label = 'Slettet';
            break;
        }

        if (type && label) {
            this.toolbarStatusValidation = [{
                label: label,
                type: type
            }];
        }
    }

    public extendFormConfig() {
        const fields: UniFieldLayout[] = this.fields$.getValue();

        const currencyCode: UniFieldLayout = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        const localization: UniFieldLayout = fields.find(x => x.Property === 'Localization');
        localization.Options = {
            source: this.localizationOptions,
            valueProperty: 'Culture',
            displayProperty: 'Label',
            searchable: false,
        };

        const department: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ' - ' + item.Name) : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        const project: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ' - ' + item.Name) : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        const defaultSeller: UniFieldLayout = fields.find(field => field.Property === 'DefaultSellerID');
        defaultSeller.Options = {
            source: this.sellers,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200,
            addEmptyValue: true
        };

        const paymentTerm: UniFieldLayout = fields.find(x => x.Property === 'PaymentTermsID');
        paymentTerm.Options = {
            source: this.paymentTerms,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.CreditDays + ' kredittdager (' + item.Name + ')') : '';
            },
            debounceTime: 200,
            addEmptyValue: true
        };

        const deliveryTerm: UniFieldLayout = fields.find(x => x.Property === 'DeliveryTermsID');
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
        const phones: UniFieldLayout = fields.find(x => x.Property === 'Info.DefaultPhone');

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

        const invoiceaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.InvoiceAddress');

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

        const emails: UniFieldLayout = fields.find(x => x.Property === 'Info.DefaultEmail');
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

        const shippingaddress: UniFieldLayout = fields.find(x => x.Property === 'Info.ShippingAddress');
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

    public showHideNameProperties(customer?: Customer) {
        customer = customer || this.customer$.getValue();
        const fields: UniFieldLayout[] = this.fields$.getValue();
        const customerSearchResult: UniFieldLayout = fields.find(x => x.Property === '_CustomerSearchResult');
        const customerName: UniFieldLayout = fields.find(x => x.Property === 'Info.Name');

        if (
            this.customerID > 0 ||
            (customer && customer.Info.Name !== null && customer.Info.Name !== '')
        ) {
            customerSearchResult.Hidden = true;
            customerName.Hidden = false;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form && this.form.field('Info.Name')) {
                    this.form.field('Info.Name').focus();
                }
            });
        } else {
            customerSearchResult.Hidden = false;
            customerName.Hidden = true;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form && this.form.field('_CustomerSearchResult')) {
                    this.form.field('_CustomerSearchResult').focus();
                }
            });
        }
    }

    preSave(customer): Customer {
        // Copy paste from old save routine. Don't have time to refactor due to exedra deadline..
        // Most of this stuff should be unnecessary, and is fixing bad practices elsewhere.
        // If anyone feel like deleting useless code this is a good place to start :)

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
            ((this.reminderSettings && !this.reminderSettings.isDirty)) || !this.reminderSettings) {
                customer.CustomerInvoiceReminderSettings = null;
        }

        customer['_CustomerSearchResult'] = undefined;
        return customer;
    }

    private save(saveAsLead?: boolean): Observable<Customer> {
        const customer = this.preSave(this.customer$.getValue());
        if (customer.Sellers) {
            customer.Sellers = customer.Sellers.filter(x => !x['_isEmpty']);
        }

        if (saveAsLead) {
            customer.StatusCode = StatusCode.Pending;
        }

        return customer.ID > 0
            ? this.customerService.Put(customer.ID, customer)
            : this.customerService.Post(customer);
    }

    private saveAction(doneCallback, saveAsLead?: boolean) {
        this.save(saveAsLead).subscribe(
            res => {
                this.isDirty = false;
                this.hasErrors = false;
                this.selectConfig = undefined;
                doneCallback('Kunde lagret');

                // Reload if customer already existed, navigate if not
                if (this.customerID) {
                    this.setupSaveActions();
                    this.customerService.Get(res.ID, this.expandOptions).subscribe(updatedCustomer => {
                        this.setMainContact(updatedCustomer);
                        this.customer$.next(updatedCustomer);

                        this.mapDistibutionPlans();
                        this.setTabTitle();
                    });
                } else {
                    this.router.navigateByUrl('/sales/customer/' + res.ID);
                }
            },
            err => {
                this.errorService.handle(err);
                doneCallback('Lagring feilet');
            }
        );
    }

    onContactsChange() {
        // Main entity updated by reference
        this.isDirty = true;
        this.setupSaveActions();
    }

    private getCustomerLookupOptions() {
        const uniSearchConfig = this.uniSearchCustomerConfig.generate(
            this.expandOptions,
            (inputVal: string) => {
                const customer = this.customer$.getValue();
                customer.Info.Name = inputVal;
                return Observable.of(customer);
            });

        uniSearchConfig.unfinishedValueFn = (val: string) => this.customer$
            .asObservable()
            .take(1)
            .map(customer => {
                customer.Info.Name = val;
                return customer;
            });

        uniSearchConfig.onSelect = (selectedItem: any) => {
            if (selectedItem.ID) {
                // If an existing customer is selected, navigate to that customer instead
                // of populating the fields for a new customer
                this.router.navigateByUrl(`/sales/customer/${selectedItem.ID}`);
                return Observable.empty();
            } else {
                const customerData = this.uniSearchCustomerConfig
                    .customStatisticsObjToCustomer(selectedItem, true, selectedItem);

                return Observable.of(customerData);
            }
        };

        return uniSearchConfig;
    }

    public onError(errorsInfo) {
        this.hasErrors = !errorsInfo.isFormValid;
        this.setupSaveActions();
    }

    onSellersChange(customer) {
        this.customer$.next(customer);
        this.isDirty = true;
        this.setupSaveActions();
    }

    public onChange(changes: SimpleChanges) {
        let customer = this.customer$.getValue();

        this.isDirty = true;
        if (changes['OrgNumber'] && customer.OrgNumber) {
            customer.OrgNumber = customer.OrgNumber.replace(/ /g, '');
            this.customerService.getCustomers(customer.OrgNumber).subscribe(
                res => {
                    if (res.Data.length > 0) {
                        let orgNumberUses = 'Dette org.nummeret er i bruk hos kunde: <br><br>';
                        res.Data.forEach(function (ba) {
                            orgNumberUses += ba.CustomerNumber + ' ' + ba.Name + ' <br>';
                        });
                        this.toastService.addToast('', ToastType.warn, 60, orgNumberUses);
                    }

                },
                // Don't toast this error to the user, they dont care
                err => console.error(err)
            );
        }

        if (changes['Info.InvoiceAddress']
            && changes['Info.InvoiceAddress'].currentValue
            && changes['Info.InvoiceAddress'].currentValue.length === 0
        ) {
                const field = this.fields$.value.find(x => x.Property === 'OrgNumber');
                this.modulusService.orgNrValidationUniForm(customer.OrgNumber, field, false);
        }

        if (changes['Info.Name']) {
            if (this.isDirty && changes['Info.Name'].currentValue === '') {
                this.toastService.addToast('Navn er påkrevd', ToastType.warn, ToastTime.short);
            }
        }

        if (changes['DefaultSellerID']) {
            if (customer.DefaultSellerID > 0) {
                customer.DefaultSeller = this.sellers.find(seller => seller.ID === customer.DefaultSellerID) || null;
            } else {
                customer.DefaultSeller = null;
                customer.DefaultSellerID = 0;
            }
        }

        if (changes['_CustomerSearchResult']) {
            const searchResult = changes['_CustomerSearchResult'].currentValue;

            if (searchResult === '') {
                this.toastService.addToast('Navn er påkrevd', ToastType.warn, ToastTime.short);
            }

            if (searchResult && searchResult.Info.Name) {
                customer = searchResult;
                this.showHideNameProperties(customer);
            }
        }

        if (changes['CustomerNumberKidAlias']) {
            const kidSimpleChange = changes['CustomerNumberKidAlias'];
            this.modalService.open(KidModalComponent).onClose.subscribe(value => {
                if (!value) {
                    const currentCustomer = this.customer$.getValue();
                    _.set(currentCustomer, 'CustomerNumberKidAlias', kidSimpleChange.previousValue);
                    this.customer$.next(currentCustomer);
                    this.form.forceValidation();
                    this.setupSaveActions();
                }
            });
        }

        this.setupSaveActions();
        this.customer$.next(customer);
    }

    public orgNrValidator(orgNr: string, field: UniFieldLayout) {
        const customer = this.customer$.getValue();
        let isInternationalCustomer: boolean;
        try {
            // Try/catch to avoid having to null guard everything here
            // Consider empty contry code norwegian
            isInternationalCustomer = customer.Info.Addresses[0].CountryCode
                && customer.Info.Addresses[0].CountryCode !== 'NO';
        } catch (e) {}

        return this.modulusService.orgNrValidationUniForm(orgNr, field, isInternationalCustomer);
    }

    private ssnValidator(ssn: string, field: UniFieldLayout) {
        const customer = this.customer$.getValue();
        let isInternationalCustomer: boolean;

        try {
            // Try/catch to avoid having to null guard everything here
            // Consider empty contry code norwegian
            isInternationalCustomer = customer.Info.Addresses[0].CountryCode
                && customer.Info.Addresses[0].CountryCode !== 'NO';
        } catch (e) {}

        if (isInternationalCustomer) {
            return;
        }

        return this.modulusService.ssnValidationUniForm(ssn, field);
    }

    private getComponentLayout(): any {
        const layout = {
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
                    Validations: [
                        (value, validatedField) => this.orgNrValidator(value, validatedField)
                    ],
                    Section: 0
                },
                {
                    FieldSet: 1,
                    EntityType: 'Customer',
                    Property: 'SocialSecurityNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Fødselsnummer',
                    Options: {
                        mask: '000000 00000'
                    },
                    Validations: [
                        (value: number, validatedField: UniFieldLayout) => {
                            if (!value) {
                                return;
                            }

                            if (!isNaN(+value)) {
                                return;
                            }

                            return {
                                field: validatedField,
                                value: value,
                                errorMessage: 'Fødselsnummer skal bare inneholde tall',
                                isWarning: false
                            };
                        },
                        (value, validatedField) => this.ssnValidator(value, validatedField)
                    ],
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
                {
                    FieldSet: 1,
                    EntityType: 'Customer',
                    Property: 'ReminderEmailAddress',
                    FieldType: FieldType.EMAIL,
                    Label: 'Purre-e-postadresse',
                    Section: 0,
                    Validations: [
                        (value: string, fieldLayout: UniFieldLayout) => this.emailService.emailUniFormValidation(value, fieldLayout)
                    ]
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
                    Label: 'E-postadresser',
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
                {
                    FieldSet: 3,
                    EntityType: 'Customer',
                    Property: 'Localization',
                    FieldType: FieldType.DROPDOWN,
                    Sectionheader: 'Betingelser',
                    Label: 'Språk tilbud/ordre/faktura',
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
                    Property: 'DefaultSellerID',
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
                {
                    FieldSet: 6,
                    Legend: 'Bank',
                    Section: 0,
                    EntityType: 'Customer',
                    Property: 'Info.BankAccounts',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Bankkonto'
                },
                {
                    FieldSet: 6,
                    Legend: 'Bank',
                    Section: 0,
                    EntityType: 'Customer',
                    Property: 'CustomerNumberKidAlias',
                    FieldType: FieldType.TEXT,
                    Label: 'KID-Identifikator',
                    Tooltip: {
                        Text: 'Fyll kun ut verdi i dette feltet dersom du ønsker at ' +
                        'kundenummer-del av KID skal erstattes av dette nummeret.'
                    },
                    Validations: [
                        // check if value is a valid number
                        (value: string, fieldToValidate) => {
                            if (isNumber(value)) {
                                return null;
                            } else {
                                return {
                                    value: value,
                                    errorMessage: 'KID-Identifikator må være et heltall',
                                    field: fieldToValidate,
                                    isWarning: false
                                };
                            }
                        },

                        // check if KID is valid
                        (value: string, fieldToValidate) => {
                            const errorMessage = {
                                value: value,
                                errorMessage: 'KID-identifikator er ugyldig og  det må ligge utenfor debitor-serien',
                                field: fieldToValidate,
                                isWarning: false
                            };
                            if (!isNumber(value)) {
                                return null;
                            }
                            return this.customerService.validateKID(value)
                                .switchMap(response => {
                                    const body = response.body;
                                    const result = body === true ? null : errorMessage;
                                    return Observable.of(result);
                               })
                                .catch(response => {
                                    return Observable.of(errorMessage);
                                });
                        }
                    ]
                },
                {
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Standard blankett faktura',
                    Property: 'DefaultCustomerInvoiceReportID',
                    Options: {
                        source: this.reportTypeService.getFormType(ReportTypeEnum.INVOICE),
                        valueProperty: 'ID',
                        displayProperty: 'Description',
                        hideDeleteButton: false,
                        searchable: false,
                    },
                    Section: 0,
                    FieldSet: 7,
                },
                {
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Standard blankett ordre',
                    Legend: 'Blanketter',
                    Property: 'DefaultCustomerOrderReportID',
                    Options: {
                        source: this.reportTypeService.getFormType(ReportTypeEnum.ORDER),
                        valueProperty: 'ID',
                        displayProperty: 'Description',
                        hideDeleteButton: false,
                        searchable: false,
                    },
                    FieldSet: 7,
                    Section: 0,
                },
                {
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Standard blankett tilbud',
                    Property: 'DefaultCustomerQuoteReportID',
                    Options: {
                        source: this.reportTypeService.getFormType(ReportTypeEnum.QUOTE),
                        valueProperty: 'ID',
                        displayProperty: 'Description',
                        hideDeleteButton: false,
                        searchable: false,
                    },
                    Section: 0,
                    FieldSet: 7,
                },
                {
                    EntityType: 'Customer',
                    Property: 'FactoringNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Factoring kundenr.',
                    FieldSet: 8,
                    Legend: 'Avtaler faktura',
                    Section: 0,
                    Hidden: false
                },
                {
                    EntityType: 'Customer',
                    Property: 'AvtaleGiro',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Påmeldt AvtaleGiro',
                    FieldSet: 8,
                    Legend: 'Avtaler faktura',
                    Section: 0,
                    Tooltip: {
                        Text: (!this.companySettings.AllowAvtalegiroRegularInvoice ?
                            'Kun repeterende fakturaer vil sendes som AvtaleGiro. ' :
                            '') +
                         'Husk at utsendelsesplanen for faktura (enten på Innstillinger eller evt denne kunden) ' +
                         'må settes opp med AvtaleGiro som prioritet 1 og alternativ utsendelse som prioritet 2. ' +
                        (!this.companySettings.AllowAvtalegiroRegularInvoice ?
                            'Da vil alle repeterende faktura sendes som AvtaleGiro og alle andre fakturaer ' +
                            'sendes med valget i prioritet 2' :
                            ''
                        )
                    }
                },
                {
                    EntityType: 'Customer',
                    FieldType: FieldType.BUTTON,
                    FieldSet: 8,
                    Legend: 'Avtaler faktura',
                    Section: 0,
                    Label: 'Detaljer',
                    Options: {
                        click: () => this.openAvtaleGiroModal(),
                    }
                },
                {
                    EntityType: 'Customer',
                    Property: 'AvtaleGiroNotification',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Varsel AvtaleGiro',
                    FieldSet: 8,
                    Legend: 'Avtaler faktura',
                    Section: 0,
                    Tooltip: {
                        Text: 'Skal det sendes varsel på e-post om AvtaleGiro?'
                    }
                }
            ]
        };

        const field: any = layout.Fields.find(x => x.Property === 'Info.BankAccounts');
        field.Options = {
            entity: BankAccount,
            listProperty: 'Info.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultBankAccount',
            storeIdInProperty: 'Info.DefaultBankAccountID',
            editor: (bankaccount: BankAccount) => {
                if ((bankaccount && !bankaccount.ID) || !bankaccount) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = 'customer';
                    bankaccount.ID = 0;
                }
                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount
                });

                return modal.onClose.take(1).toPromise();
            }
        };

        const dims = [];
        this.customDimensions.forEach((dim) => {
            dims.push(
                <any>{
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    Section: 0,
                    EntityType: 'Project',
                    Property: `Dimensions.Dimension${dim.Dimension}ID`,
                    FieldType: FieldType.UNI_SEARCH,
                    ReadOnly: !dim.IsActive,
                    Options: {
                        uniSearchConfig: this.uniSearchDimensionConfig.generateDimensionConfig(dim.Dimension, this.customDimensionService),
                        valueProperty: 'ID'
                    },
                    Label: dim.Label
                }
            );
        });

        layout.Fields.splice.apply(layout.Fields, [15, 0].concat(dims));

        return layout;
    }

    public removeDistributionPlan(type) {
        const customer = this.customer$.getValue();
        customer.Distributions[type.keyValue] = null;
        this.customer$.next(customer);
        this.onContactsChange();
        this.mapDistibutionPlans();
    }

    public changeDistributionPlan(type) {
        const customer = this.customer$.getValue();
        const options: IModalOptions = {
            data: {
                type: type,
                distribution: this.customer$.getValue().Distributions
            }
        };

        this.modalService.open(SelectDistributionPlanModal, options).onClose.subscribe((distribution: Distributions) => {
            if (distribution) {
                // Update customer distribution element
                customer.Distributions = distribution;
                this.customer$.next(customer);
                // Set as dirty
                this.onContactsChange();
                // Refresh distribution view
                this.mapDistibutionPlans();
            }
        });
    }

    public openAvtaleGiroModal() {
        const customer = this.customer$.value;
        this.modalService.open(AvtaleGiroModal, { data: customer.ID });
    }

}
