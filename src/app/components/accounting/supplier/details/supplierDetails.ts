import {Component, Input, ViewChild, Output, EventEmitter, OnInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {IReference} from '../../../../models/iReference';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig, ICommentsConfig, IToolbarValidation} from '../../../common/toolbar/toolbar';
import {LedgerAccountReconciliation} from '../../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {BehaviorSubject} from 'rxjs';
import {
    Supplier,
    Contact,
    Email,
    Phone,
    Address,
    BankAccount,
    CurrencyCode,
    NumberSeries,
    BusinessRelation
} from '../../../../unientities';

import {
    DepartmentService,
    ProjectService,
    SupplierService,
    PhoneService,
    AddressService,
    BankAccountService,
    ErrorService,
    UniQueryDefinitionService,
    CurrencyCodeService,
    UniSearchSupplierConfig,
    NumberSeriesService,
    ModulusService,
    JournalEntryLineService,
    CostAllocationService,
    PageStateService
} from '../../../../services/services';

import {
    UniModalService,
    UniAddressModal,
    UniEmailModal,
    UniPhoneModal,
    UniBankAccountModal,
    ConfirmActions,
    UniConfirmModalV2,
    IModalOptions
} from '../../../../../framework/uni-modal';

import {StatusCode} from '../../../sales/salesHelper/salesEnums';
import {IUniTab} from '@uni-framework/uni-tabs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'supplier-details',
    templateUrl: './supplierDetails.html',
    styleUrls: ['./supplierDetails.sass']
})
export class SupplierDetails implements OnInit {
    @Input()
    public modalMode: boolean = false;

    @Output()
    public createdNewSupplier: EventEmitter<Supplier> = new EventEmitter<Supplier>();

    @ViewChild(UniForm, { static: false })
    public form: UniForm;

    @ViewChild(LedgerAccountReconciliation, { static: false })
    private postpost: LedgerAccountReconciliation;

    public supplierID: number;
    public supplierNameFromUniSearch: string;
    public allowSearchSupplier: boolean = true;
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true, labelWidth: '15rem'});
    public addressChanged: any;
    public phoneChanged: any;
    public emailChanged: any;
    public bankAccountChanged: any;
    public bankAccountCanceled: any;
    public searchText: string;
    public showContactSection: boolean = true; // used in template
    public reportLinks: IReference[];
    public showReportWithID: number;
    public tabs: IUniTab[];
    public activeTabIndex: number = 0;
    public saveactions: IUniSaveAction[];
    public supplierStatusValidation: IToolbarValidation[];
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private emptyBankAccount: BankAccount;
    private currencyCodes: Array<CurrencyCode>;
    private numberSeries: NumberSeries[];
    private dropdownData: any;
    public supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(new Supplier());
    public commentsConfig: ICommentsConfig;
    private isDirty: boolean = false;
    public selectConfig: any;
    private formIsInitialized: boolean = false;
    private activeTab: string = 'details';

    private expandOptions: Array<string> = [
        'Info',
        'Info.Phones',
        'Info.Addresses',
        'Info.Emails',
        'Info.DefaultPhone',
        'Info.DefaultEmail',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Dimensions',
        'Info.DefaultBankAccount',
        'Info.BankAccounts',
        'Info.BankAccounts.Bank',
        'Info.Contacts.Info',
        'Info.Contacts.Info.DefaultEmail',
        'Info.Contacts.Info.DefaultPhone',
    ];

    public postposttabs: IUniTab[] = [
        {name: 'Åpne poster', value: 'OPEN'},
        {name: 'Lukkede poster', value: 'MARKED'},
        {name: 'Alle poster', value: 'ALL'}
    ];


    public toolbarconfig: IToolbarConfig = {
        title: 'Leverandør',
        navigation: {
            prev: this.previousSupplier.bind(this),
            next: this.nextSupplier.bind(this),
            add: this.addSupplier.bind(this)
        },
        contextmenu: [
            {
                label: 'Aktiver leverandør',
                action: () => this.activateSupplier(this.supplierID),
                disabled: () => !this.supplierID
            },
            {
                label: 'Deaktiver leverandør',
                action: () => this.deactivateSupplier(this.supplierID),
                disabled: () => !this.supplierID
            },
            {
                label: 'Blokker leverandør',
                action: () => this.blockSupplier(this.supplierID),
                disabled: () => !this.supplierID
            },
            {
                label: 'Slett leverandør',
                action: () => this.deleteSupplier(this.supplierID),
                disabled: () => !this.supplierID
            }
        ]
    };

    private localizationOptions: {Culture: string, Label: string}[] = [
        {Culture: 'no', Label: 'Norsk bokmål'},
        {Culture: 'en', Label: 'Engelsk'},
    ];

    constructor(
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private supplierService: SupplierService,
        private router: Router,
        private route: ActivatedRoute,
        private phoneService: PhoneService,
        private pageStateService: PageStateService,
        private addressService: AddressService,
        private bankaccountService: BankAccountService,
        private tabService: TabService,
        private toastService: ToastService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
        private uniSearchSupplierConfig: UniSearchSupplierConfig,
        private modalService: UniModalService,
        private numberSeriesService: NumberSeriesService,
        private modulusService: ModulusService,
        private journalEntryLineService: JournalEntryLineService,
        private costAllocationService: CostAllocationService,
    ) {}

    public ngOnInit() {
        if (!this.modalMode) {
            combineLatest(this.route.params, this.route.queryParams)
                .pipe(map(results => ({params: results[0], query: results[1]})))
                .subscribe(results => {

                this.tabs = [
                    {name: 'Detaljer'},
                    {name: 'Åpne poster'},
                    {name: 'Dokumenter'}
                ];

                this.supplierID = +results.params['id'];
                this.supplier$.getValue().ID = 0;

                const index = +results.query['tabIndex']  || 0;

                this.commentsConfig = {
                    entityType: 'Supplier',
                    entityID: this.supplierID
                };

                this.setup();
                if (this.supplierID) {
                    this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Suppliers).subscribe(
                        links => {
                            this.reportLinks = links;
                            this.tabs = [
                                {name: 'Detaljer'},
                                {name: 'Åpne poster'},
                                {name: 'Dokumenter'},
                                ...links
                            ];
                            this.activeTabIndex = index;
                        }, err => this.errorService.handle(err) );
                }
            });
        }
        this.setupSaveActions();
    }

    private activateSupplier(supplierID: number) {
        const supplier = this.supplier$.value;
        const validOrgNumber = this.modulusService.isValidOrgNr(supplier.OrgNumber);

        // Confirm activation if organization number is invalid
        if (!validOrgNumber) {
            return this.modalService.open(UniConfirmModalV2, {
                header: 'Aktivere leverandør?',
                message: `Aktivere leverandør med ugyldig org.nr. '${supplier.OrgNumber}'?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.supplierService.activateSupplier(supplierID).subscribe(
                        res => this.setSupplierStatusInToolbar(StatusCode.Active),
                        err => this.errorService.handle(err)
                    );
                }
            });
        } else {
            this.supplierService.activateSupplier(supplierID).subscribe(
                res => this.setSupplierStatusInToolbar(StatusCode.Active),
                err => this.errorService.handle(err)
            );
        }
    }

    private deactivateSupplier(supplierID: number) {
        this.supplierService.deactivateSupplier(supplierID).subscribe(
            res => this.setSupplierStatusInToolbar(StatusCode.InActive),
            err => this.errorService.handle(err)
        );
    }

    private blockSupplier(supplierID: number) {
        const supplierIsBeingBlocked = this.supplier$.getValue().StatusCode !== StatusCode.Error;
        this.supplierService.blockSupplier(supplierID, supplierIsBeingBlocked).subscribe((res) => {
            const supplier = this.supplier$.getValue();
            if (supplierIsBeingBlocked) {
                this.setSupplierStatusInToolbar(StatusCode.Error);
                this.updateToolbarContextMenuLabel(StatusCode.Error);
                supplier.StatusCode = StatusCode.Error;
            } else {
                this.setSupplierStatusInToolbar(StatusCode.Active);
                this.updateToolbarContextMenuLabel(StatusCode.Active);
                supplier.StatusCode = StatusCode.Active;
            }
            this.supplier$.next(supplier);
        });
    }

    private updateToolbarContextMenuLabel(code) {
        this.toolbarconfig.contextmenu[2].label = code === 70001 ? 'Lås opp leverandør' : 'Blokker leverandør';
    }

    public supplierDetailsChange(changes: SimpleChanges) {
        this.isDirty = true;
        this.setupSaveActions();

        if (changes['Info.DefaultBankAccountID']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['Info.DefaultBankAccountID']);
        }

        if (changes['OrgNumber']) {
            this.supplierService.getSuppliers(changes['OrgNumber'].currentValue).subscribe(res => {
                if (res.Data.length > 0) {
                    let orgNumberUses = 'Dette org.nummeret er i bruk hos leverandør: <br><br>';
                    res.Data.forEach(function (ba) {
                        orgNumberUses += ba.SupplierNumber + ' ' + ba.Name + ' <br>';
                    });
                    this.toastService.addToast('', ToastType.warn, 60, orgNumberUses);
                }

            }, err => this.errorService.handle(err));
        }

        if (changes['_SupplierSearchResult']) {
            const supplier = changes['_SupplierSearchResult'].currentValue;

            if (supplier && supplier.Info && supplier.Info.Name) {
                this.supplier$.next(supplier);
                this.showHideNameProperties(supplier);
            }
        }
        this.form.validateForm();
    }

    public resetViewToNewSupplierState() {
        this.supplierID = 0;
        this.allowSearchSupplier = false;

        this.setup();
    }

    public onPostpostFilterClick(event: any) {
        this.postpost.showHideEntries(event.value);
    }

    public goToPostpost() {
        this.router.navigateByUrl('/accounting/postpost?name=' + this.supplier$.value.Info.Name + '&register=supplier');
    }

    public nextSupplier() {
        this.supplierService.getNextID(this.supplier$.getValue().ID)
            .subscribe((ID) => {
                    if (ID) {
                        this.router.navigateByUrl('/accounting/suppliers/' + ID);
                    } else {
                        this.toastService.addToast(
                            'Warning',
                            ToastType.warn,
                            0,
                            'Ikke flere leverandører etter denne'
                        );
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public previousSupplier() {
        if (!this.supplier$.value.ID) {
            return this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere leverandører før denne');
        }
        this.supplierService.getPreviousID(this.supplier$.getValue().ID)
            .subscribe((ID) => {
                    if (ID) {
                        this.router.navigateByUrl('/accounting/suppliers/' + ID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere leverandører før denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public addSupplier() {
        this.router.navigateByUrl('/accounting/suppliers/0');
    }

    private deleteSupplier(id: number) {
        return this.journalEntryLineService.getJournalEntryLinePostPostData(true, true, null, id, null, null).subscribe(res => {
            if (res.length > 0) {
                this.modalService.open(UniConfirmModalV2, {
                    header: 'Posteringer på leverandør',
                    message: 'Denne leverandøren har bokførte transaksjoner og kan ikke slettes.',
                    buttonLabels: {
                        accept: 'Deaktiver',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(action => {
                    if (action === ConfirmActions.ACCEPT) {
                        return this.deactivateSupplier(id);
                    }
                    return;
                });
            } else {
                if (confirm('Vil du slette denne leverandøren?')) {
                    this.supplierService.deleteSupplier(id).subscribe(response => {
                        this.router.navigateByUrl('/accounting/suppliers');
                    }, err => this.errorService.handle(err));
                }
            }
        });
    }

    public numberSeriesChange(selectedSerie) {
        const supplier = this.supplier$.getValue();
        supplier.SubAccountNumberSeriesID = selectedSerie.ID;
        this.supplier$.next(supplier);
    }

    private setTabTitle() {
        const supplier = this.supplier$.getValue();
        if (this.modalMode) {
            return;
        }
        this.toolbarconfig.title = supplier.ID ? supplier.Info.Name : 'Ny leverandør';
        this.toolbarconfig.subheads = supplier.ID ? [{title: 'Leverandørnr. ' + supplier.SupplierNumber}] : [];

        this.addTab();
    }

    public addTab() {
        const supplier = this.supplier$.getValue();
        const tabTitle = supplier && supplier.SupplierNumber ? 'Leverandørnr. ' + supplier.SupplierNumber : 'Ny leverandør';

        this.showReportWithID =
            this.tabs && this.tabs[this.activeTabIndex] && this.tabs[this.activeTabIndex]['id'] && this.tabs[this.activeTabIndex]['id'];

        this.pageStateService.setPageState('tabIndex', this.activeTabIndex + '');

        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            name: tabTitle,
            active: true,
            moduleID: UniModules.Suppliers
        });
    }

    public canDeactivate(): Observable<boolean> | boolean {
        if (!this.isDirty) {
            return true;
        }

        const supplier = this.supplier$.value;
        const invoiceAddress = supplier.Info && supplier.Info.InvoiceAddress;

        const isForeign = invoiceAddress
            && invoiceAddress.CountryCode
            && invoiceAddress.CountryCode !== 'NO';

        const validOrgNumber = !!isForeign
            || !supplier.OrgNumber
            || this.modulusService.isValidOrgNr(supplier.OrgNumber);

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

        return this.modalService.confirm(modalOptions).onClose.map(modalResult => {
            if (modalResult === ConfirmActions.ACCEPT) {
                this.saveSupplier(() => {});
            } else if (modalResult === ConfirmActions.REJECT) {
                this.isDirty = false;
                this.setupSaveActions();

                if (this.postpost) {
                    this.postpost.isDirty = false;
                }
            }

            return modalResult !== ConfirmActions.CANCEL;
        });
    }

    public openInModalMode(id?: number, inputValue?: string) {
        this.supplierID = id ? id : 0;
        this.supplierNameFromUniSearch = inputValue ? inputValue : '';
        this.allowSearchSupplier = false;
        this.setup();
    }

    private setup() {
        this.showReportWithID = null;

        const supplierRequest = this.supplierID > 0
            ? this.supplierService.Get(this.supplierID, this.expandOptions)
            : this.supplierService.GetNewEntity(['Info']);

        if (!this.formIsInitialized) {
            this.fields$.next(this.getComponentLayout().Fields);

            Observable.forkJoin(
                supplierRequest,
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                this.bankaccountService.GetNewEntity(),
                this.currencyCodeService.GetAll(null),
                this.numberSeriesService.GetAll(
                    `filter=NumberSeriesType.Name eq 'Supplier Account number series' `
                        + `and Empty eq false and Disabled eq false`,
                    ['NumberSeriesType']
                )
            ).subscribe(response => {

                const supplier: Supplier = response[0];
                this.updateToolbarContextMenuLabel(supplier.StatusCode);

                this.dropdownData = [response[1], response[2]];
                this.emptyBankAccount = response[3];
                this.currencyCodes = response[4];
                this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(response[5]);

                // to pass value to newSupplierModal - Supplier.Info.Name field from unisearch
                if (this.supplierNameFromUniSearch) {
                    supplier.Info = <BusinessRelation>{'Name': this.supplierNameFromUniSearch};
                }

                const subAccount = this.numberSeries.find(x => x.Name === 'Supplier number series') || this.numberSeries[0];

                if (subAccount) {
                    supplier.SubAccountNumberSeriesID = subAccount.ID;
                }

                this.setDefaultContact(supplier);
                this.supplier$.next(supplier);
                this.setSupplierStatusInToolbar();
                this.selectConfig = this.numberSeriesService.getSelectConfig(
                    this.supplierID, this.numberSeries, subAccount.Name
                );
                this.setTabTitle();
                this.extendFormConfig();
                this.showHideNameProperties();
                this.formIsInitialized = true;
            }, err => this.errorService.handle(err));

        } else {
            supplierRequest.subscribe(supplier => {
                this.setDefaultContact(supplier);
                this.supplier$.next(supplier);
                this.setTabTitle();
                this.extendFormConfig();
                this.showHideNameProperties();
                this.setSupplierStatusInToolbar();
            }, err => this.errorService.handle(err));
        }
    }

    private setDefaultContact(supplier: Supplier) {
        if (supplier && supplier.Info && supplier.Info.Contacts && supplier.Info.DefaultContactID) {
            supplier.Info.Contacts.forEach(x => {
                x['_maincontact'] = x.ID === supplier.Info.DefaultContactID;
            });
        }
    }

    public showHideNameProperties(supplier?: Supplier) {
        supplier = supplier || this.supplier$.getValue();
        const fields: UniFieldLayout[] = this.fields$.getValue();
        const supplierSearchResult: UniFieldLayout = fields.find(x => x.Property === '_SupplierSearchResult');
        const supplierName: UniFieldLayout = fields.find(x => x.Property === 'Info.Name');

        if (!this.allowSearchSupplier
            || this.supplierID > 0
            || (supplier && supplier.Info && supplier.Info.Name !== null && supplier.Info.Name !== '')
        ) {
            supplierSearchResult.Hidden = true;
            supplierName.Hidden = false;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form && this.form.field('Info.Name')) {
                    this.form.field('Info.Name').focus();
                }
           });
        } else {
            supplierSearchResult.Hidden = false;
            supplierName.Hidden = true;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form && this.form.field('_SupplierSearchResult')) {
                    this.form.field('_SupplierSearchResult').focus();
                }
            });
        }
    }

    public extendFormConfig() {
        const fields = this.fields$.getValue();

        const supplier = this.supplier$.getValue();
        const costAllocation: UniFieldLayout = fields.find(x => x.Property === 'CostAllocationID');
        costAllocation.Options = this.costAllocationService.getCostAllocationOptions(this.supplier$.asObservable());

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
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        const project: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        // MultiValue
        const phones: UniFieldLayout = fields.find(x => x.Property === 'Info.Phones');

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
            },
        };

        const invoiceaddress: UniFieldLayout = fields.find(x => x.Label === 'Fakturaadresse');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.InvoiceAddress',
            storeIdInProperty: 'Info.InvoiceAddressID',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address()
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        const emails: UniFieldLayout = fields.find(x => x.Property === 'Info.Emails');

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
            },
        };

        const shippingaddress: UniFieldLayout = fields.find(x => x.Label === 'Leveringsadresse');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.ShippingAddress',
            storeIdInProperty: 'Info.ShippingAddressID',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address()
                });

                return modal.onClose.take(1).toPromise();
            },

            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        const defaultBankAccount: UniFieldLayout = fields.find(x => x.Property === 'Info.BankAccounts');
        defaultBankAccount.Options = {
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
                    bankaccount.BankAccountType = 'supplier';
                    bankaccount.BusinessRelationID = this.getCurrentSupplier().BusinessRelationID;
                    bankaccount.ID = 0;
                }
                const modal = this.modalService.open(UniBankAccountModal, {
                    data: {
                        bankAccount: bankaccount,
                        bankAccounts: supplier.Info.BankAccounts
                    }
                }
                );

                return modal.onClose.take(1).toPromise();
            }
        };

        this.fields$.next(fields);
    }

    public getCurrentSupplier() {
        return this.supplier$.value;
    }

    public saveSupplier(completeEvent?: any, saveAsDraft?: boolean) {
        const supplier = this.supplier$.getValue();

        // if the user has typed something in Name for a new supplier, but has not
        // selected something from the list or clicked F3, the searchbox is still active,
        // so we need to get the value from there
        if (!supplier.ID || supplier.ID === 0) {
            if (!supplier.Info.Name || supplier.Info.Name === '') {
                const searchInfo = <any>this.form.field('_SupplierSearchResult');
                if (searchInfo) {
                    if (searchInfo.component && searchInfo.component.input) {
                        supplier.Info.Name = searchInfo.component.input.value;
                    }
                }
            }
        }

        // add createGuid for new entities and remove duplicate entities
        if (!supplier.Info.Emails) {
            supplier.Info.Emails = [];
        }

        supplier.Info.Emails.forEach(email => {
            if (email.ID === 0 || !email.ID) {
                email['_createguid'] = this.supplierService.getNewGuid();
            }
        });

        if (supplier.Info.DefaultEmail) {
            supplier.Info.Emails = supplier.Info.Emails.filter(x => x !== supplier.Info.DefaultEmail);
        }

        if (!supplier.Info.Phones) {
            supplier.Info.Phones = [];
        }
        supplier.Info.Phones.forEach(phone => {
            if (phone.ID === 0 || !phone.ID) {
                phone['_createguid'] = this.supplierService.getNewGuid();
            }
        });

        if (supplier.Info.DefaultPhone) {
            supplier.Info.Phones = supplier.Info.Phones.filter(x => x !== supplier.Info.DefaultPhone);
        }

        if (!supplier.Info.Addresses) {
            supplier.Info.Addresses = [];
        }
        supplier.Info.Addresses.forEach(address => {
            if (address.ID === 0 || !address.ID) {
                address['_createguid'] = this.supplierService.getNewGuid();
            }
        });

        if (supplier.Info.ShippingAddress) {
            supplier.Info.Addresses = supplier.Info.Addresses.filter(x => x !== supplier.Info.ShippingAddress);
        }

        if (supplier.Info.InvoiceAddress) {
            supplier.Info.Addresses = supplier.Info.Addresses.filter(x => x !== supplier.Info.InvoiceAddress);
        }

        if (!supplier.Info.DefaultPhone && supplier.Info.DefaultPhoneID === 0) {
            supplier.Info.DefaultPhoneID = null;
        }

        if (!supplier.Info.DefaultEmail && supplier.Info.DefaultEmailID === 0) {
            supplier.Info.DefaultEmailID = null;
        }

        if (!supplier.Info.ShippingAddress && supplier.Info.ShippingAddressID === 0) {
            supplier.Info.ShippingAddressID = null;
        }

        if (!supplier.Info.InvoiceAddress && supplier.Info.InvoiceAddressID === 0) {
            supplier.Info.InvoiceAddressID = null;
        }

        if (supplier.Dimensions && (!supplier.Dimensions.ID || supplier.Dimensions.ID === 0)) {
            supplier.Dimensions['_createguid'] = this.supplierService.getNewGuid();
        }

        if (supplier.Info.DefaultBankAccount
            && (!supplier.Info.DefaultBankAccount.AccountNumber
                || supplier.Info.DefaultBankAccount.AccountNumber === '')
        ) {
            supplier.Info.DefaultBankAccount = null;
        }

        if (supplier.Info.DefaultBankAccount
            && (!supplier.Info.DefaultBankAccount.ID || supplier.Info.DefaultBankAccount.ID === 0)
        ) {
            supplier.Info.DefaultBankAccount['_createguid'] = this.supplierService.getNewGuid();
        }

        if (supplier.Info.BankAccounts) {
            supplier.Info.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 || !bankaccount.ID) {
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                }
            });

            if (supplier.Info.DefaultBankAccount) {
                supplier.Info.BankAccounts = supplier.Info.BankAccounts
                    .filter(x => x !== supplier.Info.DefaultBankAccount);
            }
        }

        if (supplier.Info.DefaultBankAccount) {
            supplier.Info.DefaultBankAccount.BankAccountType = 'supplier';
        }

        if (!supplier.Info.Contacts) {
            supplier.Info.Contacts = [];
        }

        supplier.Info.Contacts.forEach(contact => {
            if (contact.ID === 0 || !contact.ID) {
                contact['_createguid'] = this.supplierService.getNewGuid();
            }
        });

        if (supplier.Info.Contacts.filter(x => !x.ID && x.Info.Name === '')) {
            // remove new contacts where name is not set, probably an empty row anyway
            supplier.Info.Contacts = supplier.Info.Contacts.filter(x => !(!x.ID && x.Info.Name === ''));
        }

        if (this.modalMode) {
            return this.supplierService.Post(supplier);
        }

        if (this.supplierID > 0) {
            this.supplierService.Put(supplier.ID, supplier)
                .subscribe(
                    (updatedValue) => {
                        this.isDirty = false;
                        this.setupSaveActions();
                        completeEvent('Leverandør lagret');

                        this.supplierService.Get(supplier.ID, this.expandOptions).subscribe(updatedSupplier => {
                            updatedSupplier['BankAccounts'] = [updatedSupplier.DefaultBankAccount || this.emptyBankAccount];
                            this.setDefaultContact(updatedSupplier);
                            this.supplier$.next(updatedSupplier);
                            this.setTabTitle();
                        });
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        if (supplier.Info.DefaultBankAccount && supplier.Info.DefaultBankAccount._createguid) {
                            supplier.Info.BankAccounts.push(supplier.Info.DefaultBankAccount);
                            this.supplier$.next(supplier);
                        }
                        this.errorService.handle(err);
                    }
                );
        } else {
            if (saveAsDraft) {
                supplier.StatusCode = StatusCode.Pending;
            }
            this.supplierService.Post(supplier)
                .subscribe(
                    (newSupplier) => {
                        this.isDirty = false;
                        this.setupSaveActions();
                        if (!this.modalMode) {
                            this.router.navigateByUrl('/accounting/suppliers/' + newSupplier.ID);
                            this.setTabTitle();
                        }
                        completeEvent('Ny leverandør lagret');
                        this.createdNewSupplier.emit(newSupplier);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        this.errorService.handle(err);
                    }
                );
        }
    }

    private setupSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre',
                action: (completeEvent) => this.saveSupplier(completeEvent),
                main: true,
                disabled: !this.isDirty
            },
            {
                label: 'Lagre som kladd',
                action: (completeEvent) => this.saveSupplier(completeEvent, true),
                main: true,
                disabled: !this.isDirty
            }
        ];
    }

    public onContactsChange() {
        // Main entity updated by reference
        this.isDirty = true;
        this.setupSaveActions();
    }

    private getSupplierLookupOptions() {
        const uniSearchConfig = this.uniSearchSupplierConfig.generate(
            this.expandOptions,
            (supplierName: string) => {
                const supplier = this.supplier$.getValue();
                supplier.Info.Name = supplierName || '';

                return Observable.of(supplier);
            }
        );

        uniSearchConfig.unfinishedValueFn = (val: string) => this.supplier$
            .asObservable()
            .take(1)
            .map(supplier => {
                supplier.Info.Name = val;
                return supplier;
            });

        uniSearchConfig.onSelect = (selectedItem: any) => {
            if (selectedItem.ID) {
                // If an existing supplier is selected, navigate to that supplier instead
                // of populating the fields for a new supplier
                this.router.navigateByUrl(`/accounting/suppliers/${selectedItem.ID}`);
                return Observable.empty();
            } else {
                const supplierData = this.uniSearchSupplierConfig
                    .customStatisticsObjToSupplier(selectedItem);

                return Observable.of(supplierData);
            }
        };

        return uniSearchConfig;
    }

    private setSupplierStatusInToolbar(statusCode?: number) {
        const activeStatusCode = statusCode || this.supplier$.value.StatusCode;
        let type, label;

        switch (activeStatusCode) {
            case StatusCode.Active:
                label = 'Aktiv';
                type = 'good';
                break;
            case StatusCode.InActive:
                label = 'Inaktiv';
                type = 'bad';
                break;
            case StatusCode.Error:
                label = 'Blokkert';
                type = 'bad';
                break;
            case StatusCode.Deleted:
                label = 'Slettet';
                type = 'bad';
                break;
            default:
                label = 'Ny';
                type = 'good';
                break;
        }

        if (label && type) {
            this.supplierStatusValidation = [{
                label: label,
                type: type
            }];
        }
    }

    public orgNrValidator(orgNr: string, field: UniFieldLayout) {
        const supplier = this.supplier$.value;
        let isInternational: boolean;
        try {
            // Try/catch to avoid having to null guard everything here
            isInternational = supplier.Info.Addresses[0].CountryCode
                && supplier.Info.Addresses[0].CountryCode !== 'NO';
        } catch (e) { }

        return this.modulusService.orgNrValidationUniForm(orgNr, field, isInternational);
    }

    private getComponentLayout(): any {
        return {
            Name: 'Supplier',
            BaseEntity: 'Supplier',
            ID: 1,
            Fields: [
                // Fieldset 1 (supplier)
                {
                    FieldSet: 1,
                    Legend: 'Leverandør',
                    EntityType: 'Supplier',
                    Property: '_SupplierSearchResult',
                    FieldType: FieldType.UNI_SEARCH,
                    Label: 'Navn',
                    Options: {
                        uniSearchConfig: this.getSupplierLookupOptions()
                    }
                },
                {
                    FieldSet: 1,
                    Legend: 'Leverandør',
                    EntityType: 'BusinessRelation',
                    Property: 'Info.Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                },
                {
                    FieldSet: 1,
                    Legend: 'Leverandør',
                    EntityType: 'Supplier',
                    Property: 'OrgNumber',
                    FieldType: FieldType.TEXT,
                    Validations: [
                        (value, validatedField) => this.orgNrValidator(value, validatedField)
                    ],
                    Label: 'Organisasjonsnummer',
                },
                {
                    FieldSet: 1,
                    Legend: 'Leverandør',
                    EntityType: 'Supplier',
                    Property: 'Info.BankAccounts',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Bankkonto',
                },
                {
                    FieldSet: 1,
                    Legend: 'Leverandør',
                    EntityType: 'Supplier',
                    Property: 'WebUrl',
                    FieldType: FieldType.URL,
                    Label: 'Webadresse',
                },

                // Fieldset 2 (contact)
                {
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    EntityType: 'Supplier',
                    Property: 'Info.Addresses',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Fakturaadresse',
                },
                {
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    EntityType: 'Supplier',
                    Property: 'Info.Addresses',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Leveringsadresse',
                },
                {
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    EntityType: 'Supplier',
                    Property: 'Info.Emails',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'E-postadresser',
                },
                {
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    EntityType: 'Supplier',
                    Property: 'Info.Phones',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Telefonnumre',
                },

                // Fieldset 3 (terms)
                {
                    FieldSet: 3,
                    Legend: 'Betingelser',
                    EntityType: 'Supplier',
                    Property: 'CreditDays',
                    FieldType: FieldType.TEXT,
                    Label: 'Kredittdager',
                },
                {
                    FieldSet: 3,
                    Legend: 'Betingelser',
                    EntityType: 'Supplier',
                    Property: 'CurrencyCodeID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Foretrukket valuta',
                },
                {
                    FieldSet: 3,
                    Legend: 'Betingelser',
                    EntityType: 'Supplier',
                    Property: 'Localization',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Språk tilbud/ordre/faktura',
                },
                {
                    FieldSet: 3,
                    Legend: 'Betingelser',
                    EntityType: 'Supplier',
                    Property: 'CostAllocationID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Fordelingsnøkkel'
                },

                // Fieldset 4 (dimensions)
                {
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prosjekt',
                },
                {
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    EntityType: 'Department',
                    Property: 'Dimensions.DepartmentID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avdeling',
                },

                // Fieldset 5 (EHF)
                {
                    FieldSet: 5,
                    Legend: 'EHF',
                    EntityType: 'Supplier',
                    Property: 'PeppolAddress',
                    Label: 'Peppoladresse',
                    FieldType: FieldType.TEXT,
                },
                {
                    FieldSet: 5,
                    Legend: 'EHF',
                    EntityType: 'Supplier',
                    Property: 'GLN',
                    Label: 'GLN-nummer',
                    FieldType: FieldType.TEXT
                },
                // Fieldset 6 (self-employed)
                {
                    FieldSet: 6,
                    Classes: 'selfEmployed',
                    Legend: 'Innrapportering selvstendig næringsdrivende',
                    EntityType: 'Supplier',
                    Property: 'SelfEmployed',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Selvstendig næringsdrivende uten fast kontoradresse',
                    Tooltip: {
                        Text: 'Marker dersom leverandøren skal innrapporteres i RF-1301, Selvstendig næringsdrivende uten fast kontoradresse. Innrapportering vil fungere fra og med inntektsår 2019.'
                    },
                },
            ]
        };
    }
}
