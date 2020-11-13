import {Component, OnInit, SimpleChanges, ViewChild, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {ICommentsConfig, IToolbarConfig, StatusIndicator} from '../../../common/toolbar/toolbar';
import {filterInput, getNewGuid, roundTo, safeDec, safeInt, trimLength} from '../../../common/utils/utils';
import {
    Approval,
    ApprovalStatus,
    BankAccount,
    CompanySettings,
    CurrencyCode,
    Dimensions,
    InvoicePaymentData,
    JournalEntry,
    JournalEntryLineDraft,
    LocalDate,
    Payment,
    StatusCodeSupplierInvoice,
    Supplier,
    SupplierInvoice,
    SupplierInvoiceItem,
    Task,
    User,
    UserRole,
    ValidationLevel,
    VatDeduction
} from '@uni-entities';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';
import {StatusCode} from '../../../sales/salesHelper/salesEnums';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IContextMenuItem} from '@uni-framework/ui/unitable/index';
import {FieldType, UniFieldLayout, UniForm} from '@uni-framework/ui/uniform/index';
import {IOcrServiceResult, OcrPropertyType, OcrValuables} from '@app/models/accounting/ocr';
import {billStatusflowLabels as workflowLabels} from './lang';
import {UniImage} from '@uni-framework/uniImage/uniImage';
import {BillAssignmentModal} from '../assignment-modal/assignment-modal';
import {UniMath} from '@uni-framework/core/uniMath';
import {CommentService} from '@uni-framework/comments/commentService';
import {AccountingCostSuggestion, CostAllocationData, JournalEntryData, NumberSeriesTaskIds} from '@app/models';
import {JournalEntryManual} from '../../journalentry/journalentrymanual/journalentrymanual';
import {
    ConfirmActions,
    IConfirmModalWithListReturnValue,
    IModalOptions,
    InvoiceApprovalModal,
    UniBankAccountModal,
    UniConfirmModalV2,
    UniConfirmModalWithCheckbox,
    UniConfirmModalWithList,
    UniModalService,
    UniRegisterPaymentModal,
    UniReinvoiceModal,
    FileFromInboxModal
} from '@uni-framework/uni-modal';
import {
    AccountService, AssetsService,
    AssignmentDetails,
    BankAccountService,
    BankService,
    BrowserStorageService,
    checkGuid,
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    CustomDimensionService,
    DepartmentService,
    EHFService,
    ErrorService,
    FileService,
    JournalEntryService,
    ModulusService,
    PageStateService,
    PaymentService,
    ProjectService,
    ReInvoicingService,
    StatisticsService,
    SupplierInvoiceService,
    SupplierService,
    UniFilesService,
    UniSearchDimensionConfig,
    UserService,
    ValidationService,
    VatDeductionService
} from '@app/services/services';
import * as moment from 'moment';
import {IUniTab} from '@uni-framework/uni-tabs';
import {JournalEntryMode} from '../../../../services/accounting/journalEntryService';
import {EditSupplierInvoicePayments} from '../../modals/editSupplierInvoicePayments';
import {UniSmartBookingSettingsModal} from './smartBookingSettingsModal';
import {AccountMandatoryDimensionService} from '@app/services/accounting/accountMandatoryDimensionService';
import {ValidationMessage} from '@app/models/validationResult';
import {BillInitModal} from '../bill-init-modal/bill-init-modal';
import {SupplierEditModal} from '../../../common/modals/edit-supplier-modal/edit-supplier-modal';
import {Autocomplete} from '@uni-framework/ui/autocomplete/autocomplete';
import {PaymentStatus} from '@app/models/printStatus';
import {finalize, map, tap, catchError} from 'rxjs/operators';
import { O } from '@angular/cdk/keycodes';


interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    isHidden?: boolean;
}

enum actionBar {
    save = 0,
    saveWithNewDocument = 1,
    delete = 2,
    ocr = 3,
    runSmartBooking = 4
}

interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
    cancelled?: boolean;
}

@Component({
    selector: 'uni-bill',
    templateUrl: './bill.html'
})
export class BillView implements OnInit, AfterViewInit {
    @ViewChild(Autocomplete) autocomplete: Autocomplete;
    @ViewChild(UniForm) uniForm: UniForm;
    @ViewChild(UniImage, { static: true }) uniImage: UniImage;
    @ViewChild(JournalEntryManual) journalEntryManualIn: JournalEntryManual;

    uploadStepActive: boolean;

    public busy: boolean = true;
    public toolbarConfig: IToolbarConfig;
    public paymentStatusIndicator: StatusIndicator;
    public fields$: BehaviorSubject<Partial<UniFieldLayout>[]>;
    public current = new BehaviorSubject(new SupplierInvoice());
    public costAllocationData$ = new BehaviorSubject(new CostAllocationData());
    public currentSupplierID: number = 0;
    public collapseSimpleJournal: boolean = false;
    public hasUnsavedChanges: boolean = false;
    public ocrData: any;
    public ocrWords: Array<any>;
    public startUpFileID: Array<number> = [];
    // Stores a boolean value per document, true if document is from client pc, not inbox
    private hasUploaded: boolean = false;
    private numberOfDocuments: number = 0;

    private myUser: User;
    private myUserRoles: UserRole[] = [];
    public files: Array<any> = [];
    private unlinkedFiles: Array<number> = [];
    private documentsInUse: number[] = [];
    private invoicePayments: Array<Payment> = [];
    // Sum of amount and amount currency
    private sumOfPayments: any;
    public supplierIsReadOnly: boolean = false;
    public commentsConfig: ICommentsConfig;
    private formReady: boolean;
    private vatDeductions: Array<VatDeduction>;

    private currencyCodes: Array<CurrencyCode>;
    private companySettings: CompanySettings;

    private sumRemainder: number = null;
    private sumVat: number = null;
    private customDimensions: any;
    public loadingForm: boolean = false;
    public hasLoadedCustomDimensions: boolean = false;
    public isBlockedSupplier: boolean = false;
    public orgNumber: string;
    autocompleteOptions: any;
    public journalEntryManual: JournalEntryManual;

    public loadingFiles: boolean;

    private supplierExpandOptions: Array<string> = [
        'Info',
        'Info.BankAccounts',
        'Info.DefaultBankAccount',
        'CurrencyCode',
        'CostAllocation',
        'Dimensions'
    ];

    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'Kontering'},
        {name: 'Forrige faktura'},
        {name: 'Leverandørhistorikk'}
    ];

    currentFreeTxt: string = '';

    public detailsTabIndex: number = 0;
    public detailsTabs: IUniTab[] = [
        {name: 'Detaljer', value: 0},
        {name: 'Fritekst', tooltip: '', value: 1 }
    ];

    public actions: IUniSaveAction[];
    public contextMenuItems: IContextMenuItem[] = [];

    private rootActions: IUniSaveAction[] = [
        {
            label: 'Lagre endringer',
            action: (done) => this.save(done).catch(() => {}),
            main: true,
            disabled: true
        },
        {
            label: 'Lagre og start ny fra innboks',
            action: (done) => this.saveAndGetNewDocument(done),
            main: true,
            disabled: false
        },
        {
            label: 'Slett',
            action: (done) => this.tryDelete(done),
            main: false,
            disabled: true
        }
    ];

    public smartBookingSettings = {
        showNotification: true,
        addNotifcationAsComment: false,
        turnOnSmartBooking: true
    };

    validationMessage: ValidationMessage = null;
    accountsWithMandatoryDimensionsIsUsed = false;
    lastJournalEntryData: JournalEntryData[];
    projects = [];
    departments = [];
    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private route: ActivatedRoute,
        private supplierService: SupplierService,
        private router: Router,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private bankAccountService: BankAccountService,
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private ehfService: EHFService,
        private uniSearchDimensionConfig: UniSearchDimensionConfig,
        private modulusService: ModulusService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private modalService: UniModalService,
        private userService: UserService,
        private commentService: CommentService,
        private journalEntryService: JournalEntryService,
        private validationService: ValidationService,
        private uniFilesService: UniFilesService,
        private bankService: BankService,
        private customDimensionService: CustomDimensionService,
        private vatDeductionService: VatDeductionService,
        private fileService: FileService,
        private paymentService: PaymentService,
        private browserStorageService: BrowserStorageService,
        private reinvoicingService: ReInvoicingService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private statisticsService: StatisticsService,
        private accountService: AccountService,
        private assetsService: AssetsService,
    ) {
        this.actions = this.rootActions;

        this.autocompleteOptions = {
            placeholder: 'Velg leverandør',
            autofocus: true,
            canClearValue: false,
            lookup: query => this.supplierLookup(query),
            displayFunction: item => {
                if (item) {
                    const name = item.Info ? item.Info.Name : item.Name;
                    return item.SupplierNumber ? `${item.SupplierNumber} - ${name}` : name;
                }

                return '';
            },
            resultTableColumns: [
                { header: 'Leverandørnr', field: 'SupplierNumber' },
                { header: 'Navn', field: 'Name' },
                { header: 'Adresse', field: 'AddressLine1' },
                {
                    header: 'Poststed',
                    template: item => {
                        if (item.PostalCode || item.City) {
                            return `${item.PostalCode} - ${item.City}`;
                        }
                    }
                },
                { header: 'Orgnummer', field: 'OrgNumber' },
            ],
            createLabel: 'Opprett ny leverandør',
            createHandler: (value) => {
                return this.modalService.open(SupplierEditModal, {listkey: !!value.trim() ? value : '' }).onClose;
            }
        };

        // Get settings from localstorage or use default
        const settings = this.browserStorageService.getSpecificViewSettings('SUPPLIERINVOICE');
        this.smartBookingSettings = settings ? settings : this.smartBookingSettings;

        userService.getCurrentUser().subscribe( usr => {
            this.myUser = usr;
            this.userService.getRolesByUserId(this.myUser.ID).subscribe(roles => {
                this.myUserRoles = roles;
            });
        });

        this.current.subscribe((invoice) => {
            this.tryUpdateCostAllocationData(invoice);
        });

        forkJoin([this.projectService.GetAll(null), this.departmentService.GetAll(null)])
            .subscribe(([projects, departments]) => {
                this.projects = projects;
                this.departments = departments;
            });
    }
    ngAfterViewInit(): void {
        if (this.journalEntryManualIn && !this.journalEntryManual) {
            this.journalEntryManual = this.journalEntryManualIn;
        }
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.costAllocationData$.complete();
        this.current.complete();
    }

    supplierLookup(query: string) {
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress';
        const select = [
            'Supplier.ID as ID',
            'Info.Name as Name',
            'Supplier.OrgNumber as OrgNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'Supplier.SupplierNumber as SupplierNumber',
            'Supplier.StatusCode as StatusCode',
        ].join(',');

        let filter = `(Supplier.Statuscode ne 50001 and Supplier.Statuscode ne 70001)`;

        if (query && query.length) {
            const queryFilter = ['Supplier.OrgNumber', 'Supplier.SupplierNumber', 'Info.Name']
                .map(field => `contains(${field},'${query}')`)
                .join(' or ');

            filter += ` and ( ${queryFilter} )`;
        }

        const odata = `model=Supplier`
            + `&expand=${expand}`
            + `&select=${select}`
            + `&filter=${filter}`
            + `&orderby=Info.Name&top=50&distinct=true`;

        return this.statisticsService.GetAllUnwrapped(odata);
    }

    public ngOnInit() {
        this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe((result) => {
            this.accountsWithMandatoryDimensionsIsUsed = result > 0;
        });
        this.initForm();
        this.initFromRoute();
    }

    public canDeactivate() {
        return this.checkSave();
    }

    private get currentID(): number {
        const current = this.current.getValue();
        return (current ? current.ID : 0);
    }

    private set currentID(value: number) {
        const current = this.current.getValue();
        if (current) {
            current.ID = value;
            this.current.next(Object.assign({}, current));
        }
    }

    private initFromRoute() {
        this.route.params.subscribe((params: any) => {
            const id = safeInt(params.id);
            const projectID = safeInt(params['projectID']);
            const pageParams = this.pageStateService.getPageState();
            this.currentFreeTxt = '';

            if (id === this.currentID) { return; } // no-reload-required
            Observable.forkJoin(
                this.companySettingsService.Get(1),
                this.currencyCodeService.GetAll(null),
                this.customDimensionService.getMetadata(),
                this.fileService.getLinkedEntityID(pageParams.fileid, 'SupplierInvoice'),
                this.vatDeductionService.GetAll(null),
            ).subscribe((res) => {
                this.companySettings = res[0];
                this.currencyCodes = res[1];
                this.customDimensions = res[2];
                const links = res[3];

                if (this.current.getValue()) {
                    const val = this.current.getValue();
                    this.current.next(Object.assign({}, val));
                }

                if (links.length > 0) {
                    this.loadingFiles = true;
                    if (links.length > 1) {
                        this.toast.addToast('ACCOUNTING.SUPPLIER_INVOICE.MULTIPLE_USE_MSG1', ToastType.warn, ToastTime.medium);
                    } else  {
                        this.toast.addToast('ACCOUNTING.SUPPLIER_INVOICE.MULTIPLE_USE_MSG2', ToastType.warn, ToastTime.medium);
                    }
                    this.currentID = links[0].entityID;
                    this.router.navigateByUrl('/accounting/bills/' + this.currentID);
                } else if (id > 0) {
                    this.fetchInvoice(id, true);
                } else {
                    const getSupplier = +params['supplierID']
                        ? this.supplierService.Get(+params['supplierID'], this.supplierExpandOptions)
                        : Observable.of(null);

                    getSupplier.subscribe(supplier => {
                        this.newInvoice(true, supplier);
                        this.checkPath();
                    });
                }

                this.vatDeductions = res[4];
                this.extendFormConfig();
            }, err => this.errorService.handle(err));

            this.commentsConfig = {
                entityType: 'SupplierInvoice',
                entityID: id
            };
        });
    }

    public extendFormConfig() {
        let fields = this.fields$.getValue();
        this.loadingForm = true;

        const currencyCode = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200,
            hideDeleteButton: true
        };

        const queries = [];
        const customDimensionsFields = [];

        if (this.customDimensions && this.customDimensions.length > 0 && !this.hasLoadedCustomDimensions) {
            this.customDimensions.forEach((dim) => {

                customDimensionsFields.push({
                    Label: dim.Label,
                    Dimension: dim.Dimension,
                    Property: 'DefaultDimensions.Dimension' + dim.Dimension + 'ID',
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: !dim.IsActive,
                    Data: [],
                    Section: 1,
                    Sectionheader: 'Egendefinerte dimensjoner',
                    Classes: 'bill-small-field',
                });
                queries.push(this.customDimensionService.getCustomDimensionList(dim.Dimension));
            });

            Observable.forkJoin(queries).subscribe((res) => {
                res.forEach((list, index) => {
                    this.customDimensions[index].Data = res[index];
                    customDimensionsFields[index].Options = {
                        source: res[index],
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        debounceTime: 200
                    };
                });
                fields = fields.concat(customDimensionsFields);

                this.fields$.next(fields);
                this.hasLoadedCustomDimensions = true;
                this.checkLockStatus();
                this.loadingForm = false;
            }, (err) => {
                this.toast.addToast('Kunne ikke hente egendefinerte dimensjoner. Prøv å laste inn bilde på nytt', ToastType.bad);
                this.fields$.next(fields);
                this.checkLockStatus();
                this.loadingForm = false;
            });

            // fields = fields.concat(customDimensionsFields);
        } else {
            this.fields$.next(fields);
            this.checkLockStatus();
            this.loadingForm = false;
        }
    }

    private updateInvoicePayments() {
        return Observable.forkJoin([
            this.bankService.getBankPayments(this.currentID),
            this.bankService.getRegisteredPayments(this.currentID),
            this.bankService.getSumOfPayments(this.currentID)
        ]).subscribe(res => {
            let bankPayments = res[0];
            let registeredPayments = res[1];
            this.invoicePayments = bankPayments.concat(registeredPayments.filter(
                payment => !bankPayments.some(bankpayment => bankpayment.ID === payment.PaymentID)
            ));
            this.sumOfPayments = res[2][0];
            this.fetchInvoice(this.currentID, false);
        });
    }

    private addTab(id: number = 0) {
        this.tabService.addTab({
            name: 'NAVBAR.SUPPLIER_INVOICE',
            url : '/accounting/bills/' + id,
            moduleID: UniModules.Bills,
            active: true
        });
    }

    onAutocompleteTab() {
        if (this.uniForm) {
            setTimeout(() => this.uniForm.focus());
        }
    }

    private initForm() {
        const fields: Partial<UniFieldLayout>[] = [
            {
                Property: 'BankAccountID',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Betal til bankkonto',
                Classes: 'bill-small-field right',
                Section: 0
            },
            {
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato',
                Classes: 'bill-small-field',
                Section: 0,
                Options: {
                    useSmartYear: true,
                    useFinancialYear: true
                }
            },
            {
                Property: 'PaymentDueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato',
                Classes: 'bill-small-field right',
                Section: 0,
                Options: {
                    useSmartYear: true,
                    useFinancialYear: true
                }
            },
            {
                Property: 'DeliveryDate',
                FeaturePermission: 'ui.accounting.bill.delivery_date',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Leveringsdato',
                Classes: 'bill-small-field',
                Section: 0,
                Options: {
                    useSmartYear: true,
                    useFinancialYear: true
                }
            },
            {
                Property: 'InvoiceNumber',
                FieldType: FieldType.TEXT,
                Label: 'Fakturanummer',
                Classes: 'bill-small-field right',
                Section: 0
            },
            {
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID/Melding',
                Classes: 'bill-small-field right',
                Section: 0,
                Tooltip: {
                    Text: 'Skriv inn KID-nummer eller melding til mottaker. Dersom feltet inneholder tekst vil det tolkes som en melding.',
                }
            },
            {
                Property: 'TaxInclusiveAmountCurrency',
                FieldType: FieldType.NUMERIC,
                Label: 'Fakturabeløp',
                Classes: 'bill-small-field',
                Section: 0
            },
            {
                Property: 'CurrencyCodeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Valuta',
                Classes: 'bill-small-field right',
                Section: 0
            },
            {
                Property: 'DefaultDimensions.DepartmentID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Avdeling',
                Classes: 'bill-small-field',
                Section: 0,
                Options: {
                    uniSearchConfig: this.uniSearchDimensionConfig.generateDepartmentConfig(this.departmentService),
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'DefaultDimensions.ProjectID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Prosjekt',
                Classes: 'bill-small-field',
                Section: 0,
                Options: {
                    uniSearchConfig: this.uniSearchDimensionConfig.generateProjectConfig(this.projectService),
                    valueProperty: 'ID'
                }
            }
        ];

        const sumField = fields.find(f => f.Property === 'TaxInclusiveAmountCurrency');
        sumField.Options = {
            decimalLength: 2,
            decimalSeparator: ','
        };

        const currencyField = fields.find(f => f.Property === 'CurrencyCodeID');
        currencyField.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayValue: 'Code',
            debounceTime: 200,
            hideDeleteButton: true
        };

        const bankAccountField = fields.find(f => f.Property === 'BankAccountID');
        bankAccountField.Options = {
            entity: BankAccount,
            listProperty: 'Supplier.Info.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'BankAccount',
            storeIdInProperty: 'BankAccountID',
            editor: (bankAccount: BankAccount) => new Promise((resolve, reject) => {
                const invoice: SupplierInvoice = this.current.getValue();
                if (!bankAccount.ID) {
                    bankAccount['_createguid'] = this.bankAccountService.getNewGuid();
                    bankAccount.BankAccountType = 'supplier';
                    bankAccount.BusinessRelationID = invoice.Supplier
                        ? invoice.Supplier.BusinessRelationID
                        : null;

                    bankAccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankAccount
                });

                modal.onClose.subscribe(account => {
                    if (!account) {
                        reject();
                        return;
                    }

                    const request = account.ID > 0
                        ? this.bankAccountService.Put(account.ID, account)
                        : this.bankAccountService.Post(account);

                    request.subscribe(
                        res => resolve(res),
                        err => {
                            this.errorService.handle(err);
                            reject();
                        }
                    );
                });
            }),
            display: (bankAccount: BankAccount) => {
                let ret = bankAccount.AccountNumber ? (bankAccount.AccountNumber.substr(0, 4) + ' '
                + bankAccount.AccountNumber.substr(4, 2) + ' ' + bankAccount.AccountNumber.substr(6)) : '';
                if (bankAccount['Label']) {
                    ret = bankAccount['Label'] + '-' + ret;
                }
                return ret;
            }
        };

        this.fields$ = new BehaviorSubject(fields);
    }

    /// =============================

    ///     OCR AND EHF

    /// =============================

    private runConverter(files: Array<any>, force: boolean) {

        if (this.companySettings.UseOcrInterpretation) {
            // user has accepted license/agreement for ocr
            this.runOcrOrEHF(files);
        } else {
            // check for undefined or null, because this is a "tristate", so null != false here,
            // false means that the user has rejected the agreement, while null means he/she has
            // neither accepted or rejected it yet
            if (this.companySettings.UseOcrInterpretation === undefined || this.companySettings.UseOcrInterpretation === null) {
                // user has not accepted license/agreement for ocr
                this.uniFilesService.getOcrStatistics()
                    .subscribe(res => {
                            const countUsed = res.CountOcrDataUsed;

                            if (countUsed <= 10) {
                                // allow running OCR the first 10 times for free
                                this.runOcrOrEHF(files);
                            } else {
                                this.companySettingsService.PostAction(1, 'ocr-trial-used')
                                    .subscribe(success => {
                                            // this is set through the ocr-trial-used, but set it in the local object as well to
                                            // avoid displaying the same message multiple times
                                            this.companySettings.UseOcrInterpretation = false;

                                            const modal = this.modalService.open(UniConfirmModalV2, {
                                                header: 'Fakturatolkning er ikke aktivert',
                                                message: 'Du har nå fått prøve vår tjeneste for å tolke fakturaer maskinelt'
                                                + ' 10 ganger gratis. For å bruke tjenesten'
                                                + ' videre må du aktivere Fakturatolk under firmainnstillinger i menyen.',
                                                buttonLabels: {
                                                    accept: 'Ok',
                                                    cancel: 'Avbryt'
                                                }
                                            });
                                        }, err => this.errorService.handle(err)
                                    );
                            }
                        },
                        err => this.errorService.handle(err)
                    );
            } else if (force) {
                // user has deactivated license/agreement for ocr
                const modal = this.modalService.open(UniConfirmModalV2, {
                    header: 'Fakturatolkning er deaktivert',
                    message: 'Vennligst aktiver fakturatolkning under firmainnstillinger i menyen for å benytte tolkning av fakturaer',
                    buttonLabels: {
                        accept: 'Ok',
                        cancel: 'Avbryt'
                    }
                });
            }
        }
    }

    private runOcrOrEHF(files: Array<any>) {
        if (files && files.length > 0) {
            const file = this.uniImage.getCurrentFile() || files[0];
            if (this.supplierInvoiceService.isOCR(file)) {
                this.runOcr(file);
            } else if (this.supplierInvoiceService.isEHF(file)) {
                this.runEHF(file);
            }
        }
    }

    /// =============================

    ///     FILES AND EHF

    /// =============================

    private runEHF(file: any) {
        this.userMsg('Kjører EHF-tolkning av dokumentet. Vent litt..', null, null, true);
        this.ehfService.GetAction(null, 'parse', `fileID=${file.ID}`)
            .subscribe((invoice: SupplierInvoice) => {
                invoice.ID = this.currentID;
                this.updateSummary([]);
                const current = this.current.getValue();
                if (current.TaxExclusiveAmountCurrency) {
                    current.TaxExclusiveAmountCurrency = current.TaxInclusiveAmountCurrency - this.sumVat;
                }
                this.current.next(current);
                this.toast.clear();
                this.handleEHFResult(invoice);
                this.flagUnsavedChanged();
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private updateInvoice(invoice: SupplierInvoice, removeSupplier: boolean = false) {
        if (removeSupplier) {
            invoice.Supplier = undefined;
            invoice.BankAccountID = invoice.BankAccountID || undefined;
        }
        this.current.next(invoice);
    }

    private handleEHFResult(invoice: SupplierInvoice) {
        const handler = invoice.BankAccount && !invoice.BankAccount.AccountNumber && invoice.BankAccount.IBAN
            ? this.bankService.validateIBANUpsertBank(invoice.BankAccount.IBAN)
            : Observable.of(null);

        handler.subscribe((bankaccount: BankAccount) => {
            // Handle IBAN only bankaccount from EHF
            if (bankaccount) {
                invoice.BankAccount.AccountNumber = bankaccount.AccountNumber;
                invoice.BankAccount.BankID = bankaccount.Bank.ID;
                invoice.Supplier.Info.BankAccounts.forEach(b => {
                    if (b.IBAN === bankaccount.IBAN) {
                        b = invoice.BankAccount;
                        if (
                            invoice.Supplier.Info.DefaultBankAccount
                            && invoice.Supplier.Info.DefaultBankAccount.IBAN === bankaccount.IBAN
                        ) {
                            invoice.Supplier.Info.DefaultBankAccount = b;
                        }
                    }
                });

                this.current.next(invoice);
            }

            // New supplier?
            if (!invoice.SupplierID && invoice.Supplier) {
                const title = `Opprette ny leverandør '${invoice.InvoiceReceiverName}' ?`;
                const msg = `${invoice.InvoiceAddressLine1 || ''} ${invoice.InvoicePostalCode || ''} ${invoice.InvoiceCity || ''}.`
                    + ` Organisasjonsnr: ${invoice.Supplier.OrgNumber}`;
                this.toast.clear();
                const modal = this.modalService.open(UniConfirmModalV2, {
                    header: title,
                    message: msg,
                    buttonLabels: {
                        accept: 'Opprett leverandør',
                        cancel: 'Avbryt'
                    }
                });

                modal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        if (
                            invoice.Supplier.Info
                            && invoice.Supplier.Info.BankAccounts
                            && invoice.Supplier.Info.DefaultBankAccount
                        ) {
                            invoice.Supplier.Info.BankAccounts = invoice.Supplier.Info.BankAccounts.filter(b =>
                                (b.AccountNumber && b.AccountNumber !== invoice.Supplier.Info.DefaultBankAccount.AccountNumber) ||
                                (b.IBAN && b.IBAN !== invoice.Supplier.Info.DefaultBankAccount.IBAN)
                            );
                        }

                        this.supplierService.Post(invoice.Supplier).subscribe(
                            res => { this.updateInvoice(invoice); this.fetchNewSupplier(res.ID, true); },
                            err => { this.errorService.handle(err); this.updateInvoice(invoice, true); }
                        );
                    } else {
                        this.updateInvoice(invoice, true);
                    }
                });

                // Existing supplier and new bankaccount?
            } else if (invoice.SupplierID && !invoice.BankAccountID && invoice.BankAccount) {
                this.orgNumber = invoice.Supplier.OrgNumber;
                const bbanoriban = invoice.BankAccount.AccountNumber
                    ? `BBAN ${invoice.BankAccount.AccountNumber}`
                    : `IBAN ${invoice.BankAccount.IBAN}`;
                const modal = this.modalService.open(UniConfirmModalV2, {
                    header: `Vil du opprette bankkonto ${bbanoriban}?`,
                    message: `Kontonr er ikke registrert på leverandøren ${invoice.InvoiceReceiverName}`,
                    buttonLabels: {
                        accept: 'Opprett konto',
                        cancel: 'Avbryt'
                    }
                });

                modal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.saveBankAccount(invoice.Supplier, invoice.BankAccount);
                    }
                });

            } else {
                this.current.next(invoice);
            }

            if (invoice.Supplier) {
                this.orgNumber = invoice.Supplier.OrgNumber;
            }

            if (invoice.CurrencyCodeID) {
                const currencyDate: LocalDate = invoice.InvoiceDate ? invoice.InvoiceDate : new LocalDate();
                this.currencyService.getCurrencyExchangeRate(
                    invoice.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, currencyDate
                ).subscribe(res => {
                    invoice.CurrencyExchangeRate = res.ExchangeRate;
                    this.current.next(invoice);
                }, err => this.errorService.handle(err));
            }

            this.addEHFAccountingCostLines(invoice.Items).then((costAllocationRunned) => {
                this.tryAddCostAllocation('EHF', !costAllocationRunned);
            });

            // CHECK IF CUSTOMER IS BLOCKED!!
            // Should check here for customer status, and suggest to reject when status is BLOCKED!
            if (invoice && invoice.Supplier && invoice.Supplier.StatusCode === 70001) {
                this.blockedSupplier(invoice);
            }
        });
    }

    private saveBankAccount(supplier: Supplier, bankAccount: BankAccount) {
        bankAccount.BusinessRelationID = supplier.BusinessRelationID;
        this.bankAccountService.Post(bankAccount).subscribe(
            res => {
                const invoice = this.current.getValue();
                invoice.BankAccount = res;
                invoice.BankAccountID = res.ID;
                this.current.next(invoice);

                // supplier
                const idx = supplier.Info.BankAccounts.findIndex(ba => ba.ID == 0 && ba.AccountNumber == res.AccountNumber);
                idx != undefined
                    ? supplier.Info.BankAccounts[idx] = res
                    : supplier.Info.BankAccounts.push(res);

                this.setSupplier(supplier);
            },
            err => this.errorService.handle(err)
        );
    }

    private addComment(comment: string) {
        this.commentService.post(this.commentsConfig.entityType, this.commentsConfig.entityID, comment)
            .subscribe(() => {
                this.commentService.loadComments(this.commentsConfig.entityType, this.commentsConfig.entityID);
            });
    }

    /// =============================

    ///     FILES AND OCR

    /// =============================

    public onImageDeleted(file: any) {
        const index = this.files.findIndex(f => f.ID === file.ID);
        if (index >= 0) {
            // Remove file from all arrays holding it
            this.files.splice(index, 1);
            if (this.files.length === 0) {
                this.resetDocuments();
            } else {
                this.unlinkedFiles = this.files.map(f => f.ID);
                this.documentsInUse = this.unlinkedFiles;
                this.numberOfDocuments--;
            }
        }
    }

    public imageUnlinked(file: any) {
        this.tagFileStatus(file.ID, 0);
    }

    onBusyLoadingFiles(busyLoadingFiles: boolean) {
        this.loadingFiles = busyLoadingFiles;
    }

    private hasChangedFiles(files: Array<any>) {
        if ((!this.files) && (!files)) { return false; }
        if ((!this.files) || (!files)) { return true; }
        if (this.files.length !== files.length) { return true; }
        for (let i = 0; i < files.length; i++) {
            if (files[i].ID !== this.files[i].ID) { return true; }
        }
        return false;
    }


    public onFileListReady(files: Array<any>) {
        const current = this.current.value;
        if (!this.hasChangedFiles(files)) { return; }

        // use concat to get a new reference, otherwise the changes made by
        // the uni image component will not be detected by hasChangedFiles
        this.files = files.concat();

        if (files && files.length) {
            if (this.files.length !== this.numberOfDocuments) {
                this.hasUploaded = true;
            }
            if (!this.hasValidSupplier()) {
                this.runConverter(files, false);
            }
            if (!current.ID) {
                this.unlinkedFiles = files.map(file => file.ID);
                this.rootActions[actionBar.save].disabled = false;
                this.rootActions[actionBar.saveWithNewDocument].disabled = false;
                // Check what ID's in unlinkedfiles have not been tagged
                this.unlinkedFiles.forEach((id: number) => {
                    // If ID is not tagged, tag it with status 30 = inUse
                    if (this.documentsInUse.indexOf(id) === -1) {
                        this.tagFileStatus(id, 30);
                    }
                });

                // Set documentsinuse to match unlinkedfiles
                this.documentsInUse = this.unlinkedFiles;
            }
        }
        this.loadingFiles = false;
    }

    public onJournalEntryManualDataLoaded(data) {
        setTimeout(() => {
            if (this.journalEntryManual) {
                this.updateSummary(this.journalEntryManual.getJournalEntryData());
                this.lastJournalEntryData = this.journalEntryManual.getJournalEntryData();
                const current = this.current.getValue();
                if (current.TaxExclusiveAmountCurrency) {
                    current.TaxExclusiveAmountCurrency = current.TaxInclusiveAmountCurrency - this.sumVat;
                }
                this.current.next(current);
            }
        });
    }

    private hasValidSupplier() {
        const current = this.current.getValue();
        return (current && current.SupplierID) ? true : false;
    }

    private runOcr(file: any) {
        this.userMsg('Kjører fakturatolkning av dokumentet og leter etter gjenkjennbare verdier. Vent litt..', null, null, true);
        this.uniFilesService.runOcr(file.StorageReference)
            .subscribe((result: IOcrServiceResult) => {
                this.updateSummary([]);
                const current = this.current.getValue();
                if (current.TaxExclusiveAmountCurrency) {
                    current.TaxExclusiveAmountCurrency = current.TaxInclusiveAmountCurrency - this.sumVat;
                }
                this.current.next(current);
                this.toast.clear();

                const oldModel = this.current.value;

                this.handleOcrResult(new OcrValuables(result));

                const model = this.current.value;
                this.updateJournalEntryManualDates(model.InvoiceDate, model.InvoiceDate);

                this.flagUnsavedChanged();
                this.ocrData = result;
                this.uniImage.setOcrData(this.ocrData);
                this.tryAddCostAllocation();
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private setSupplierBasedOnOrgno(orgNo: string, ocr) {
        this.supplierService.GetAll(`filter=contains(OrgNumber,'${orgNo}')`, this.supplierExpandOptions)
            .subscribe((result: Supplier[]) => {
                    if (!result || !result.length) {
                        this.findSupplierViaPhonebook(
                            orgNo,
                            true,
                            ocr.BankAccountCandidates.length > 0
                                ? ocr.BankAccountCandidates[0]
                                : null
                        );

                        return;
                    }

                    const supplier = result[0];

                    if (ocr.BankAccountCandidates.length > 0) {
                        let bankAccount: BankAccount;

                        for (let i = 0; i < ocr.BankAccountCandidates.length && !bankAccount; i++) {
                            const candidate = ocr.BankAccountCandidates[i];

                            const existingAccount = supplier.Info.BankAccounts
                                .find(x => x.AccountNumber === candidate);

                            if (existingAccount) {
                                bankAccount = existingAccount;
                            }
                        }

                        this.setOrCreateBankAccount(bankAccount, supplier, ocr.BankAccount);
                    }

                    this.setSupplier(supplier);
                },
                err => this.errorService.handle(err));
    }

    private handleOcrResult(ocr: OcrValuables) {
        if (ocr.Orgno) {
            if (!this.hasValidSupplier()) {
                const orgNo = filterInput(ocr.Orgno);
                this.setSupplierBasedOnOrgno(orgNo, ocr);
            }
        }

        const current = this.current.getValue();

        current.PaymentID = ocr.PaymentID;
        current.InvoiceNumber = ocr.InvoiceNumber;
        current.TaxInclusiveAmountCurrency = +safeDec(ocr.TaxInclusiveAmount).toFixed(2);
        if (ocr.InvoiceDate) {
            current.InvoiceDate = new LocalDate(moment(ocr.InvoiceDate).toDate());
            current.DeliveryDate = new LocalDate(moment(ocr.InvoiceDate).toDate());
        }
        if (ocr.PaymentDueDate) {
            current.PaymentDueDate = new LocalDate(moment(ocr.PaymentDueDate).toDate());
        }

        this.current.next(current);

        // TODO: Implement OCR currency
    }

    private setOrCreateBankAccount(bankAccount: BankAccount, supplier: Supplier, bankAccountNumber: string) {
        if (bankAccount) {
            const current = this.current.getValue();
            current.BankAccountID = bankAccount.ID;
            current.BankAccount = bankAccount;
            this.current.next(current);
        } else {


            const modal = this.modalService.open(UniConfirmModalV2, {
                header: `Vil du opprette bankkonto ${bankAccountNumber}?`,
                message: `Kontonr er ikke registrert på leverandøren ${supplier.Info.Name}`,
                buttonLabels: {
                    accept: 'Opprett konto',
                    cancel: 'Ikke opprett konto'
                }
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    const newBankAccount = new BankAccount();
                    newBankAccount.AccountNumber = bankAccountNumber;
                    newBankAccount.BusinessRelationID = supplier.BusinessRelationID;
                    newBankAccount.BankAccountType = 'supplier';

                    this.bankAccountService.Post(newBankAccount).subscribe(
                        (res: BankAccount) => {
                            supplier.Info.BankAccounts.push(res);

                            const current = this.current.getValue();
                            current.BankAccountID = res.ID;
                            current.BankAccount = res;
                            this.current.next(current);

                            this.setSupplier(supplier);
                        },
                        err => this.errorService.handle(err)
                    );
                }
            });
        }
    }


    private findSupplierViaPhonebook(orgNo: string, askUser: boolean, bankAccount?: string) {
        this.supplierInvoiceService.fetch(
            'business-relations/?action=search-data-hotel&searchText=' + orgNo
        ).subscribe(x => {
            if (x.Data && x.Data.entries && x.Data.entries.length > 0) {
                const item = x.Data.entries[0];
                const title = `Opprette ny leverandør '${item.navn}' ?`;
                const msg = `${item.forretningsadr || ''} ${item.forradrpostnr || ''} `
                    + `${item.forradrpoststed || ''}. Organisasjonsnr: ${item.orgnr}`;
                this.toast.clear();
                if (askUser) {
                    const modal = this.modalService.open(UniConfirmModalV2, {
                        header: title,
                        message: msg,
                        buttonLabels: {
                            accept: 'Opprett leverandør',
                            cancel: 'Avbryt'
                        }
                    });

                    modal.onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            this.createSupplier(
                                item.orgnr,
                                item.navn,
                                item.forretningsadr,
                                item.forradrpostnr,
                                item.forradrpoststed,
                                bankAccount
                            );
                        }
                    });
                } else {
                    this.createSupplier(
                        item.orgnr, item.navn, item.forretningsadr,
                        item.forradrpostnr, item.forradrpoststed, bankAccount
                    );
                }
            } else {
                this.toast.addToast(
                    'Ingen leverandør funnet',
                    ToastType.warn,
                    ToastTime.long,
                    'Det finnes ikke noen leverandør med orgnr ' + orgNo + ' ' +
                    'blant registrerte leverandører eller hos 1881. ' +
                    'Vennligst velg leverandør eller legg til en ny manuelt'
                );

                this.setSupplier(null, true);
            }
        }, err => this.errorService.handle(err));
    }

    private createSupplier(
        orgNo: string, name: string, address: string, postalCode: string, city: string, bankAccount?: string
    ) {
        const sup = new Supplier();
        sup.OrgNumber = orgNo;
        sup.Info = <any>{
            Name: name,
            ShippingAddress: {
                AddressLine1: address || '',
                City: city || '',
                PostalCode: postalCode || '',
                Country: 'NORGE',
                CountryCode: 'NO'
            }
        };

        if (bankAccount) {
            if (isNaN(Number(bankAccount))) {
                // We are dealing with a IBAN
                this.bankService.validateIBANUpsertBank(bankAccount).subscribe(bankData => {
                    sup.Info.DefaultBankAccount = <BankAccount> {
                        AccountNumber: bankData.IBAN, // only use iban in this case, since returned accountnumber unreliable
                        IBAN: bankData.IBAN,
                        BankAccountType: 'supplier',
                        BankID: bankData.Bank.ID
                    };
                    this.postSupplier(sup);
                });
            } else {
                // We are dealing with a Norwegian bankaccount
                this.bankService.getIBANUpsertBank(bankAccount).subscribe(bankData => {
                    sup.Info.DefaultBankAccount = <BankAccount> {
                        AccountNumber: bankAccount,
                        IBAN: bankData.IBAN,
                        BankAccountType: 'supplier',
                        BankID: bankData.Bank.ID
                    };
                    this.postSupplier(sup);
                });
            }
        } else {
            this.postSupplier(sup);
        }
    }

    private postSupplier(sup) {
        this.supplierService.Post(sup).subscribe(x => {
            this.fetchNewSupplier(x.ID, true);
        }, err => this.errorService.handle(err));
    }

    public onFormInput(event) {
        this.flagUnsavedChanged();
        if (this.current.value.ID
            && this.current.value.SupplierID
            && this.current.value.StatusCode !== StatusCodeSupplierInvoice.Journaled
        ) {
            this.getValidationMessage(
                this.current.value.SupplierID,
                this.current.value.DefaultDimensionsID,
                this.current.value.DefaultDimensions
            );
        }
    }

    public onFocusEvent(event) {
        if ((this.uniImage && !this.uniImage.getCurrentFile()) || !this.ocrData) { return; }

        this.uniImage.removeHighlight();

        let property = null;

        switch (event.field.Property) {
            case 'Supplier':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.OfficialNumber
                );
                break;
            case 'InvoiceDate':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.InvoiceDate
                );
                break;
            case 'PaymentDueDate':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.DueDate
                );
                break;
            case 'InvoiceNumber':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.InvoiceNumber
                );
                break;
            case 'BankAccountID':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.BankAccountNumber
                );
                break;
            case 'PaymentID':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.CustomerIdentificationNumber
                );
                break;
            case 'TaxInclusiveAmountCurrency':
                property = this.ocrData.InterpretedProperties.find(
                    x => x.OcrProperty.PropertyType === OcrPropertyType.TotalAmount
                );
                break;
        }

        const candidate =
            property ?
                property.SelectedCandidate ?
                    property.SelectedCandidate :
                    property.ProposedCandidate ?
                        property.ProposedCandidate : null
                : null;

        if (candidate) {
            this.uniImage.highlight(
                [candidate.Left, candidate.Top, candidate.Width, candidate.Height],
                this.ocrData.ImageWidth,
                this.ocrData.ImageHeight
            );
        }

        if (this.current.value.ID
            && this.current.value.SupplierID
            && this.current.value.StatusCode !== StatusCodeSupplierInvoice.Journaled
        ) {
            this.getValidationMessage(
                this.current.value.SupplierID,
                this.current.value.DefaultDimensionsID,
                this.current.value.DefaultDimensions
            );
        }
    }

    public onUseWord(event) {
        const invoice = this.current.getValue();
        if (invoice.StatusCode && invoice.StatusCode > StatusCodeSupplierInvoice.ForApproval) {
            return;
        }

        let property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === event.propertyType);

        if (!property) {
            property = {
                OcrProperty: {
                    PropertyType: event.propertyType
                },
                ActualValue: event.word.text
            };

            this.ocrData.InterpretedProperties.push(property);
        }

        let isValid = true;
        let value = event.word.text;

        switch (event.propertyType) {
            case OcrPropertyType.OfficialNumber:
                if (this.validationService.isStringWithOnlyNumbers(value) && value.length === 9) {
                    const orgNo = filterInput(value);
                    const ocrData = new OcrValuables(this.ocrData);
                    this.setSupplierBasedOnOrgno(orgNo, ocrData);
                } else {
                    isValid = false;
                }
                break;
            case OcrPropertyType.CustomerIdentificationNumber:
                if (this.validationService.isKidNumber(value)) {
                    invoice.PaymentID = value;
                } else {
                    isValid = false;
                }
                break;
            case OcrPropertyType.InvoiceNumber:
                invoice.InvoiceNumber = value;
                break;
            case OcrPropertyType.TotalAmount:
                if (this.validationService.isNumber(value)) {
                    value = this.validationService.getSanitizedNumber(value);
                    invoice.TaxInclusiveAmountCurrency = value;
                } else {
                    isValid = false;
                }
                break;
            case OcrPropertyType.InvoiceDate:
                if (this.validationService.isDate(value)) {
                    value = this.validationService.getSanitizedDate(value);
                    invoice.InvoiceDate = new LocalDate(value);
                } else {
                    isValid = false;
                }
                break;
            case OcrPropertyType.DueDate:
                if (this.validationService.isDate(value)) {
                    value = this.validationService.getSanitizedDate(value);
                    invoice.PaymentDueDate = new LocalDate(value);
                } else {
                    isValid = false;
                }
                break;
            case OcrPropertyType.BankAccountNumber:
                if (this.validationService.isBankAccountNumber(value)) {
                    value = this.validationService.getSanitizedBankAccount(value);
                    const supplier = invoice.Supplier;
                    const bankAccount = supplier.Info.BankAccounts.find(x => x.AccountNumber === value);
                    this.setOrCreateBankAccount(bankAccount, supplier, value);
                } else {
                    isValid = false;
                }
                break;
        }

        if (isValid) {
            this.current.next(invoice);
            if (property.InterpretationCandidates) {
                const existingCandiate =
                    property.InterpretationCandidates.find(x =>
                    x.Top === event.word.Top
                    && x.Left === event.word.Left
                    && x.Width === event.word.Width
                    && x.Height === event.word.Height);

                if (existingCandiate) {
                    property.SelectedCandidate = existingCandiate;
                } else {
                    property.SelectedCandidate = null;
                }
            }

            if (!property.SelectedCandidate) {
                const newCandidate = {
                    Height: event.word.Height,
                    Left: event.word.Left,
                    Top: event.word.Top,
                    Width: event.word.Width,
                    Value: value.toString(),
                    HitWord: null,
                    HitWordId: null,
                    Id: 0,
                    InterpretedPropertyId: property.Id,
                    ProbabilityFactor: 1
                };

                property.SelectedCandidate = newCandidate;
            }

            // highlight the word that was used
            this.uniImage.highlight(
                [
                    property.SelectedCandidate.Left,
                    property.SelectedCandidate.Top,
                    property.SelectedCandidate.Width,
                    property.SelectedCandidate.Height
                ],
                this.ocrData.ImageWidth,
                this.ocrData.ImageHeight
            );
        } else {
            this.toast.addToast('Ugyldig verdi', ToastType.warn, ToastTime.short);
        }
    }

    public onFormChange(change: SimpleChanges) {
        try {
            this.onFormChanged(change);
            if (this.current.value.SupplierID && this.current.value.StatusCode !== StatusCodeSupplierInvoice.Journaled) {
                this.getValidationMessage(
                    this.current.value.SupplierID,
                    this.current.value.DefaultDimensionsID,
                    this.current.value.DefaultDimensions
                );
            }
        } catch (err) {
            this.errorService.handle(err);
        }
    }

    public onFormChanged(change: SimpleChanges) {

        const model = this.current.getValue();
        let lines = this.journalEntryManual.getJournalEntryData() || [];

        lines = lines.map(line => {
            line.Dimensions = line.Dimensions || new Dimensions;
            return line;
        });

        if (!model) { return; }

        this.customDimensions.forEach((dim) => {
            if (change['DefaultDimensions.Dimension' + dim.Dimension + 'ID']) {
                model.DefaultDimensions['Dimension' + dim.Dimension] =
                    dim.Data.find(x => x.ID === model.DefaultDimensions['Dimension' + dim.Dimension + 'ID']);

                if (!change['DefaultDimensions.Dimension' + dim.Dimension + 'ID'].currentValue) {
                    this.modalService.open(UniConfirmModalV2, {
                        buttonLabels: {
                            accept: 'Fjern fra linjene',
                            reject: 'La stå'
                        },
                        header: 'Dimensjon',
                        message: 'Ønsker du å fjerne dimensjonen fra kontreringslinjene også?'
                    }).onClose.subscribe((res) => {
                        if (res === ConfirmActions.ACCEPT) {
                            lines.forEach((line: any) => {
                                line.Dimensions['Dimension' + dim.Dimension] = null;
                                line.Dimensions['Dimension' + dim.Dimension + 'ID'] = null;
                            });
                            this.journalEntryManual.setJournalEntryData(lines);
                        }
                    });
                } else {
                    if (lines.filter(line => line.Dimensions && line.Dimensions['Dimension' + dim.Dimension] &&
                            line.Dimensions['Dimension' + dim.Dimension + 'ID']
                            !== model.DefaultDimensions['Dimension' + dim.Dimension + 'ID']
                        ).length) {
                        this.modalService.open(UniConfirmModalV2, {
                            buttonLabels: {
                                accept: 'Oppdater alle linjer',
                                reject: 'Ikke oppdater'
                            },
                            header: 'Dimensjon',
                            message: 'Det finnes linjer med ulik dimensjon. Vil du oppdatere dimensjon på alle linjene?'
                        }).onClose.subscribe((res) => {
                            if (res === ConfirmActions.ACCEPT) {
                                lines.forEach((line: any) => {
                                    line.Dimensions['Dimension' + dim.Dimension]
                                        = model.DefaultDimensions['Dimension' + dim.Dimension];
                                    line.Dimensions['Dimension' + dim.Dimension + 'ID']
                                        = model.DefaultDimensions['Dimension' + dim.Dimension].ID;
                                });
                                this.journalEntryManual.setJournalEntryData(lines);
                            }
                        });
                    } else {
                        lines.forEach((line: any) => {
                            line.Dimensions['Dimension' + dim.Dimension] = model.DefaultDimensions['Dimension' + dim.Dimension];
                            line.Dimensions['Dimension' + dim.Dimension + 'ID'] = model.DefaultDimensions['Dimension' + dim.Dimension].ID;
                        });
                        this.journalEntryManual.setJournalEntryData(lines);
                    }
                }
            }
        });

        if (change['SupplierID']) {
            this.fetchNewSupplier(model.SupplierID);
        }

        if (change['Supplier'])  {
            const supplier = change['Supplier'].currentValue;

            if (supplier === null) {
                model.SupplierID = null;
            }

            if (model.Supplier && model.Supplier.StatusCode === StatusCode.InActive) {
                const options: IModalOptions = {message: 'Vil du aktivere leverandøren?'};
                this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                    if (res === ConfirmActions.ACCEPT) {
                        this.supplierService.activateSupplier(model.SupplierID).subscribe(
                            response => {
                                model.Supplier.StatusCode = StatusCode.Active;
                                this.toast.addToast('Leverandør aktivert', ToastType.good);
                            },
                            err => this.errorService.handle(err)
                        );
                    }
                    return;
                });
            }

            if (supplier && (supplier.ID === 0 || !supplier.ID)) {
                this.supplierService.getSuppliers(supplier.OrgNumber).subscribe(res => {
                    if (res.Data.length > 0) {
                        let orgNumberUses = 'Det finnes allerede leverandør med dette organisasjonsnummeret registrert i UE: <br><br>';
                        res.Data.forEach(function (ba) {
                            orgNumberUses += ba.SupplierNumber + ' ' + ba.Name + ' <br>';
                        });
                        this.toast.addToast('', ToastType.warn, 60, orgNumberUses);
                    }
                }, err => this.errorService.handle(err));
            }

            if (supplier && supplier.ID) {
                if (!this.modulusService.isValidOrgNr(supplier.OrgNumber)
                    && (!supplier.StatusCode || supplier.StatusCode === StatusCode.Pending)
                ) {
                    return this.modalService.open(UniConfirmModalV2, {
                        header: 'Bekreft leverandør',
                        message: `Ugyldig org.nr. '${supplier.OrgNumber}' på leverandør. Vil du fortsette?`,
                        buttonLabels: {
                            accept: 'Ja',
                            cancel: 'Forkast'
                        }
                    }).onClose.subscribe(
                        res => {
                            if (res === ConfirmActions.ACCEPT) {
                                this.fetchNewSupplier(supplier.ID);
                                if (this.detailsTabIndex === 0) {
                                    this.uniForm.field('InvoiceDate').focus();
                                    return;
                                }
                            }
                            const current = this.current.value;
                            current.SupplierID = null;
                            current.Supplier = null;
                            this.current.next(current);
                            if (this.detailsTabIndex === 0) {
                                this.uniForm.field('Supplier').focus();
                                return;
                            }
                        }
                    );
                }
                this.fetchNewSupplier(supplier.ID);
                if (this.accountsWithMandatoryDimensionsIsUsed) {
                    this.getValidationMessage(supplier.ID);
                }
            }
            return;
        }

        if (change['InvoiceDate']) {
            let creditdays = model.Supplier ? model.Supplier.CreditDays : null;
            if (!creditdays) { creditdays = this.companySettings.CustomerCreditDays; }
            if (creditdays && model.InvoiceDate) {
                model.PaymentDueDate = <any>new LocalDate(
                    moment(model.InvoiceDate).add(creditdays, 'days').toDate());
                this.current.next(model);
            }

            if (model.CurrencyCodeID && model.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
                const currencyDate: LocalDate = model.InvoiceDate ? model.InvoiceDate : new LocalDate();
                this.currencyService.getCurrencyExchangeRate(model.CurrencyCodeID,
                    this.companySettings.BaseCurrencyCodeID, currencyDate)
                    .subscribe(res => {
                            model.CurrencyExchangeRate = res.ExchangeRate;

                            this.updateJournalEntryAmountsWhenCurrencyChanges(lines);

                            this.current.next(model);
                            this.flagUnsavedChanged();
                        }, err => this.errorService.handle(err)
                    );
            }

            // if invoicedate has the same value as deliverydate, update deliverydate also
            // when invoicedate is changed
            if ((!model.DeliveryDate && model.InvoiceDate)
                || (change['InvoiceDate'].previousValue
                && model.DeliveryDate.toString() === change['InvoiceDate'].previousValue.toString())) {
                // deliverydate is default value for financialdate in the journalentry draftlines, so
                // if any of the lines have the same value as the old deliverydate, update them to the
                // new delivery date
                model.DeliveryDate = model.InvoiceDate;
            }

            const fd = this.companySettings.BookCustomerInvoiceOnDeliveryDate ? model.DeliveryDate : model.InvoiceDate;
            const vd = model.InvoiceDate;

            this.updateJournalEntryManualDates(fd, vd);

        }

        if (change['DeliveryDate']) {
            // deliverydate is default value for financialdate in the journalentry draftlines, so
            // if any of the lines have the same value as the old deliverydate, update them to the
            // new delivery date

            if (this.companySettings.BookCustomerInvoiceOnDeliveryDate) {
                this.updateJournalEntryManualDates(change['DeliveryDate'].currentValue, model['InvoiceDate']);
            }
        }



        if (change['CurrencyCodeID']) {
            if (model.CurrencyCodeID) {
                this.currencyCodeService.Get(model.CurrencyCodeID)
                    .subscribe(res => {
                            model.CurrencyCode = res;
                            this.current.next(model);
                            this.flagUnsavedChanged();
                        }, err => this.errorService.handle(err)
                    );
            }

            if (model.InvoiceDate) {
                this.currencyService.getCurrencyExchangeRate(
                    model.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, model.InvoiceDate
                ).subscribe(res => {
                    model.CurrencyExchangeRate = res.ExchangeRate;
                    this.updateJournalEntryAmountsWhenCurrencyChanges(lines);

                    this.current.next(model);
                    this.flagUnsavedChanged();
                }, err => this.errorService.handle(err));
            } else {
                this.updateJournalEntryAmountsWhenCurrencyChanges(lines);
                this.current.next(model);
            }
        }

        if ( change['TaxInclusiveAmountCurrency'] || change['TaxInclusiveAmount'] ) {
            if ( model.ReInvoiceID != null ) {
                this.reinvoicingService.Get(model.ReInvoiceID).subscribe( reInv => {
                    if (  reInv.StatusCode === 30203 ) {
                        this.toast.addToast('', ToastType.bad, 10,
                        'Du har knyttet en viderefakturering som er gjennomført til denne leverandørfakturaen. '
                        + 'Viderefaktureringen må slettes og settes opp på nytt igjen for å viderefakturere med korrekt beløp.');
                    }
                });
            }
        }


        if (change['TaxInclusiveAmountCurrency']) {

            this.updateJournalEntryAmountsWhenCurrencyChanges(lines);
            if (this.journalEntryManual) {
                this.updateSummary(this.journalEntryManual.getJournalEntryData());
                const current = this.current.getValue();
                if (current.TaxExclusiveAmountCurrency) {
                    current.TaxExclusiveAmountCurrency = current.TaxInclusiveAmountCurrency - this.sumVat;
                }
                this.current.next(current);
            }

            if (this.orgNumber && !change['TaxInclusiveAmountCurrency'].previousValue && !model.Supplier.CostAllocation) {
                this.runSmartBooking(this.orgNumber);
            }
        }

        // need to push an update if other fields changes to make the journal entry grid update itself
        if (change['TaxInclusiveAmountCurrency'] || change['InvoiceNumber']
            || change['PaymentID'] || change['BankAccount']
        ) {
            if (change['TaxInclusiveAmountCurrency']) {
                model.TaxInclusiveAmountCurrency = roundTo(
                    safeDec(change['TaxInclusiveAmountCurrency'].currentValue), 2
                );
                change['TaxInclusiveAmountCurrency'].currentValue = model.TaxInclusiveAmountCurrency;
            }
            this.current.next(model);
        }

        if (change['TaxInclusiveAmountCurrency'] && this.journalEntryManual.isEmpty()) {
            this.tryAddCostAllocation();
        }

        if (change['DefaultDimensions.ProjectID']) {
            if (!model.DefaultDimensionsID) {
                model.DefaultDimensions['_createguid'] = model.DefaultDimensions['_createguid'] || this.projectService.getNewGuid();
            }
            if (!change['DefaultDimensions.ProjectID'].currentValue) {
                model.DefaultDimensions.Project = null;
                model.DefaultDimensions.ProjectID = null;
                this.current.next(model);
                const linesWithProject = lines.filter(line => line.Dimensions && line.Dimensions.ProjectID && line.Dimensions.ProjectID);
                if (linesWithProject.length) {
                    this.modalService.open(UniConfirmModalV2, {
                        buttonLabels: {
                            accept: 'Oppdater alle linjer',
                            reject: 'Ikke oppdater'
                        },
                        header: 'Prosjekt',
                        message: 'Det finnes linjer med ulikt prosjekt. Vil du oppdatere prosjekt på alle linjene?'
                    }).onClose.subscribe((res) => {
                        if (res === ConfirmActions.ACCEPT) {
                            lines.forEach((line: any) => {
                                line.Dimensions.Project = null;
                                line.Dimensions.ProjectID = null;
                            });
                            this.journalEntryManual.setJournalEntryData(lines);
                        }
                    });
                } else {
                    lines.forEach((line: any) => {
                        line.Dimensions.Project = null;
                        line.Dimensions.ProjectID = null;
                    });
                    this.journalEntryManual.setJournalEntryData(lines);
                }
            } else {
                this.projectService.Get(change['DefaultDimensions.ProjectID'].currentValue).subscribe((project) => {
                    model.DefaultDimensions.Project = project;
                    this.current.next(model);

                    // Check if the journalentrylines have a different project..
                    if (lines.filter(line => line.Dimensions && line.Dimensions.ProjectID &&
                        line.Dimensions.ProjectID !== project.ID).length) {
                        this.modalService.open(UniConfirmModalV2, {
                            buttonLabels: {
                                accept: 'Oppdater alle linjer',
                                reject: 'Ikke oppdater'
                            },
                            header: 'Prosjekt',
                            message: 'Det finnes linjer med ulikt prosjekt. Vil du oppdatere prosjekt på alle linjene?'
                        }).onClose.subscribe((res) => {
                            if (res === ConfirmActions.ACCEPT) {
                                lines.forEach((line: any) => {
                                    line.Dimensions.Project = project;
                                    line.Dimensions.ProjectID = change['DefaultDimensions.ProjectID'].currentValue;
                                });
                                this.journalEntryManual.setJournalEntryData(lines);
                            }
                        });
                    } else {
                        lines.forEach((line: any) => {
                            line.Dimensions.Project = project;
                            line.Dimensions.ProjectID = change['DefaultDimensions.ProjectID'].currentValue;
                        });
                        this.journalEntryManual.setJournalEntryData(lines);
                    }
                });
            }
        }

        if (change['DefaultDimensions.DepartmentID']) {
            if (!model.DefaultDimensionsID) {
                model.DefaultDimensions['_createguid'] = model.DefaultDimensions['_createguid'] || this.projectService.getNewGuid();
            }
            if (!change['DefaultDimensions.DepartmentID'].currentValue) {
                model.DefaultDimensions.Department = null;
                model.DefaultDimensions.DepartmentID = null;
                this.current.next(model);
                const linesWithDepartment = lines.filter(line =>
                line.Dimensions && line.Dimensions.DepartmentID && line.Dimensions.DepartmentID);
                if (linesWithDepartment.length) {
                    this.modalService.open(UniConfirmModalV2, {
                        buttonLabels: {
                            accept: 'Oppdater alle linjer',
                            reject: 'Ikke oppdater'
                        },
                        header: 'Avdeling',
                        message: 'Det finnes linjer med ulik avdeling. Vil du oppdatere avdeling på alle linjene?'
                    }).onClose.subscribe((res) => {
                        if (res === ConfirmActions.ACCEPT) {
                            lines.forEach((line: any) => {
                                line.Dimensions.Department = null;
                                line.Dimensions.DepartmentID = null;
                            });
                            this.journalEntryManual.setJournalEntryData(lines);
                        }
                    });
                } else {
                    lines.forEach((line: any) => {
                        line.Dimensions.Department = null;
                        line.Dimensions.DepartmentID = null;
                    });
                    this.journalEntryManual.setJournalEntryData(lines);
                }
            } else {
                this.departmentService.Get(change['DefaultDimensions.DepartmentID'].currentValue).subscribe((department) => {
                    model.DefaultDimensions.Department = department;
                    this.current.next(model);

                    // Check if the journalentrylines have a different department..
                    if (lines.filter(line => line.Dimensions && line.Dimensions.DepartmentID &&
                        line.Dimensions.DepartmentID !== department.ID).length) {
                        this.modalService.open(UniConfirmModalV2, {
                            buttonLabels: {
                                accept: 'Oppdater alle linjer',
                                reject: 'Ikke oppdater'
                            },
                            header: 'Avdeling',
                            message: 'Det finnes linjer med ulik avdeling. Vil du oppdatere avdeling på alle linjene?'
                        }).onClose.subscribe((res) => {
                            if (res === ConfirmActions.ACCEPT) {
                                lines.forEach((line: any) => {
                                    line.Dimensions.Department = department;
                                    line.Dimensions.DepartmentID = change['DefaultDimensions.DepartmentID'].currentValue;
                                });
                                this.journalEntryManual.setJournalEntryData(lines);
                            }
                        });
                    } else {
                        lines.forEach((line: any) => {
                            line.Dimensions.Department = department;
                            line.Dimensions.DepartmentID = change['DefaultDimensions.DepartmentID'].currentValue;
                        });
                        this.journalEntryManual.setJournalEntryData(lines);
                    }
                });
            }
        }

        this.flagUnsavedChanged();
    }

    private updateJournalEntryAmountsWhenCurrencyChanges(lines: any[]) {
        const current = this.current.getValue();

        if (lines && lines.length) {
            lines.forEach(line => {
                line.CurrencyCodeID = current.CurrencyCodeID;
                line.CurrencyCode = this.currencyCodes.find(code => code.ID === current.CurrencyCodeID);
                if (!line.CurrencyCodeID || line.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID) {
                    line.CurrencyExchangeRate = 1;
                } else {
                    line.CurrencyExchangeRate = current.CurrencyExchangeRate;
                }

                line.Amount = UniMath.round(line.AmountCurrency * line.CurrencyExchangeRate);
            });
            this.journalEntryManual.setJournalEntryData(lines);
        }
    }

    public newSupplierSelected(supplier) {
        if (supplier) {
            this.fetchNewSupplier(supplier.ID);
        }
    }

    private fetchNewSupplier(id: number, updateCombo = false) {
        if (id) {
            this.supplierService.clearCache();
            this.supplierService.Get(id, this.supplierExpandOptions)
                .subscribe((result: Supplier) => this.setSupplier(result, updateCombo));
        }
    }

    private setSupplier(result: Supplier, updateCombo = true) {
        const current: SupplierInvoice = this.current.value;
        this.currentSupplierID = result ? result.ID : null;
        current.Supplier = result;

        if (!result) {
            current.SupplierID = null;
            current.BankAccount = null;
            current.BankAccountID = null;
        } else if (current.SupplierID !== result.ID) {
            current.SupplierID = result.ID;
        }

        if (result) {
            if (!current.BankAccountID && result.Info.DefaultBankAccountID ||
                (current.BankAccount && current.BankAccount.BusinessRelationID !== result.BusinessRelationID)) {
                current.BankAccountID = result.Info.DefaultBankAccountID;
                current.BankAccount = result.Info.DefaultBankAccount;
            }

            if (result.CurrencyCodeID) {
                current.CurrencyCodeID = result.CurrencyCodeID;
                const currencyDate: LocalDate = current.InvoiceDate ? current.InvoiceDate : new LocalDate();
                this.currencyService.getCurrencyExchangeRate(
                    current.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, currencyDate
                ).subscribe(res => {
                    current.CurrencyExchangeRate = res.ExchangeRate;
                    this.current.next(current);
                }, err => this.errorService.handle(err));
            } else {
                current.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            this.orgNumber = result.OrgNumber;

            if (!current.Supplier.CostAllocation) {
                // Add orgnumber as params, not input.. Only run if not costallocation
                this.runSmartBooking(this.orgNumber);
            }

            if (current.TaxInclusiveAmountCurrency && this.journalEntryManual.isEmpty()) {
                this.tryAddCostAllocation();
            }
        }

        // make uniform update itself to show correct values for bankaccount/currency
        if (!current.DefaultDimensions) {
            current.DefaultDimensions = <Dimensions> {};
        }

        current.DefaultDimensions.ProjectID = result?.Dimensions?.ProjectID;
        current.DefaultDimensions.DepartmentID = result?.Dimensions?.DepartmentID;
        for (let i = 5; i <= 10; i++) {
            const dimensions = result?.Dimensions || {};
            current.DefaultDimensions[`Dimension${i}ID`] = dimensions[`Dimension${i}ID`] ||  null;
        }
        this.current.next(current);

        this.setupToolbar();
    }

    private runSmartBooking(orgNumber, showToastIfNotRan: boolean = false) {

        if (!this.current.getValue().TaxInclusiveAmountCurrency || (!this.smartBookingSettings.turnOnSmartBooking && !showToastIfNotRan)) {
            if (this.smartBookingSettings.showNotification && showToastIfNotRan) {
                this.toast.toast({
                    title: 'Smart bokføring',
                    type: ToastType.warn,
                    duration: 10,
                    message: 'ACCOUNTING.SUPPLIER_INVOICE.SMART_BOOKING_ERROR_MSG'
                });
            } else {
                const financialDate = this.companySettings.BookCustomerInvoiceOnDeliveryDate
                    ? this.current.getValue().DeliveryDate
                    : this.current.getValue().InvoiceDate;

                const vatDate = this.current.getValue().InvoiceDate;

                this.updateJournalEntryManualDates(financialDate, vatDate);
            }
            return;
        }

        this.journalEntryManual.journalEntryProfessional.startSmartBooking(orgNumber, showToastIfNotRan,
            this.current.getValue().TaxInclusiveAmountCurrency).then((value: any) => {
            if (value.msg) {
                if (this.smartBookingSettings.showNotification) {
                    this.toast.addToast('Smart bokføring', value.type, 10, value.msg);
                }

                if (this.smartBookingSettings.addNotifcationAsComment) {
                    this.addComment(value.msg);
                }
            }
        });

    }

    private openSmartBookingSettingsModal() {
        const options = { data: { settings: this.smartBookingSettings } };
        this.modalService.open(UniSmartBookingSettingsModal, options).onClose.subscribe((res) => {
            if (res) {
                this.smartBookingSettings = res;
                this.browserStorageService.setSpecificViewSettings('SUPPLIERINVOICE', res);
            }
        });
    }

    private blockedSupplier(current) {
        this.toast.addToast('Blokkert kunde!', ToastType.bad, 5, 'Denne kunden er blokkert');
        this.isBlockedSupplier = true;

        const opt: IModalOptions = {
            buttonLabels: {
                accept: 'Forstått',
                reject: 'Gå til leverandørkort'
            },
            header: 'Blokkert kunde',
            message: 'OBS! Denne leverandøren er markert som blokkert. ' +
            'Alle faktura fra denne leverandøren kan bare avvises! Gå til leverandørkortet for å låse opp.'
        };

        this.modalService.open(UniConfirmModalV2, opt).onClose.subscribe((res) => {
            if (res === ConfirmActions.REJECT) {
                if (this.documentsInUse.length > 0) {
                    this.openDocumentsInUseModal().onClose.subscribe((response: IConfirmModalWithListReturnValue) => {
                        if (response.action === ConfirmActions.ACCEPT) {
                            response.list.forEach((bool: boolean, index: number) => {
                                if (bool) {
                                    this.tagFileStatus(this.documentsInUse[index], 0);
                                    this.router.navigateByUrl('/accounting/suppliers/' + current.SupplierID);
                                } else {
                                    this.supplierInvoiceService
                                        .send('files/' + this.documentsInUse[index], undefined, 'DELETE')
                                        .subscribe(() => {
                                            this.router.navigateByUrl('/accounting/suppliers/' + current.SupplierID);
                                        }, err => this.errorService.handle(err));
                                }
                            });
                        } else {
                            this.router.navigateByUrl('/accounting/suppliers/' + current.SupplierID);
                        }
                    });
                } else {
                    this.router.navigateByUrl('/accounting/suppliers/' + current.SupplierID);
                }
            } else {
                this.actions = [
                    {
                        label: 'Lagre og avvis',
                        action: (done) => this.saveAndReject(done),
                        main: true,
                        disabled: false
                    }
                ];
            }

        });
    }

    private newInvoice(isInitial: boolean, supplier?: Supplier) {
        const current = new SupplierInvoice();
        this.orgNumber = null;
        current.StatusCode = 0;
        current.SupplierID = null;
        current.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
        current.CurrencyExchangeRate = 1;
        current.DefaultDimensions = new Dimensions();
        this.currentFreeTxt = '';

        if (supplier) {
            current.SupplierID = supplier.ID;
            current.Supplier = supplier;
            if (supplier.Info.DefaultBankAccountID) {
                current.BankAccountID = supplier.Info.DefaultBankAccountID;
                current.BankAccount = supplier.Info.DefaultBankAccount;
            }
        }
        this.current.next(current);

        this.currentSupplierID = 0;
        this.sumRemainder = 0;
        this.sumVat = 0;
        this.journalEntryService.setSessionData(JournalEntryMode.SupplierInvoice, null);
        this.setupToolbar();
        this.addTab(0);
        this.flagUnsavedChanged(true);
        this.initDefaultActions();
        this.flagActionBar(actionBar.delete, false);
        this.flagActionBar(actionBar.runSmartBooking, true);
        this.supplierIsReadOnly = false;
        this.hasUnsavedChanges = false;
        this.resetDocuments();
        this.files = [];
        this.startUpFileID = [];
        this.busy = false;

        setTimeout(() => {
            if (this.journalEntryManual) { this.journalEntryManual.setJournalEntryData([]); }
        });

        try {
            if (this.uniForm) {
                this.uniForm.editMode();
            }
        } catch (err) {}
    }

    private flagUnsavedChanged(reset = false) {

        this.flagActionBar(actionBar.save, !reset);
        this.detailsTabs[1].tooltip = this.currentFreeTxt;

        if (!reset && !this.isBlockedSupplier) {
            this.actions.forEach(x => x.main = false);
            this.actions[actionBar.save].main = true;
            this.actions[actionBar.saveWithNewDocument].main = true;

            this.actions = this.actions.concat();
        }

        this.hasUnsavedChanges = !reset;
    }

    private flagActionBar(index: actionBar, enable = true) {
        if (this.actions.length > index) {
            this.actions[index].disabled = !enable;
        }
    }

    private resetDocuments() {
        this.unlinkedFiles = [];
        this.documentsInUse = [];
        this.numberOfDocuments = 0;
        this.hasUploaded = false;
    }

    private loadActionsFromEntity() {
        const it: any = this.current.getValue();
        if (it && it._links) {
            const list: IUniSaveAction[] = [];
            this.rootActions.forEach(x => list.push(x));
            const hasJournalEntry = (!!(it.JournalEntry && it.JournalEntry.JournalEntryNumber));
            const filter = [];
            let mainFirst = true;

            if (this.invoicePayments.length > 0) {
                filter.push('sendForPayment');
                mainFirst = false;
                list.forEach(x => x.main = false);
            }

            if (hasJournalEntry) {
                filter.push('journal');
            }

            this.addActions(it._links.transitions, list, mainFirst, ['journal', 'assign', 'approve', 'sendForPayment'], filter);

            // Reassign as admin
            if (!it._links.transitions.hasOwnProperty('reAssign')
                && it.StatusCode === StatusCodeSupplierInvoice.ForApproval
            ) {
                if (this.myUserRoles.find(
                        x => x.SharedRoleName === 'Accounting.Admin' || x.SharedRoleName === 'Administrator' || x.SharedRoleName === 'Accounting.Approval')
                ) {
                    const reassign = this.newAction(
                        'Tildel på nytt',
                        'reAssign',
                        `api/biz/supplierinvoices?action=reAssign`
                    );

                    list.push(reassign);
                }
            }

            if (this.CurrentTask) {
                const task = this.CurrentTask;
                const hasActiveApproval = task.Approvals && task.Approvals.findIndex( t => t.StatusCode === ApprovalStatus.Active ) >= 0;
                if (hasActiveApproval ) {

                    list.forEach( x => x.main = false );
                    const approval = task.Approvals.find(a => a.UserID === this.myUser.ID);
                    const approvalID = approval ? approval.ID : task.Approvals[0].ID;

                    list.push(this.newAction('Godkjenning', 'task_approval', '', true));
                    list.push(this.newAction('Avvis', 'task_reject', '', false));

                    // Godkjenn og Bokfør, Godkjenn, Bokfør og Til betaling
                    if (it.StatusCode === StatusCodeSupplierInvoice.ForApproval) {
                        const toJournalAction = this.newAction(
                            'Godkjenn og bokfør',
                            'task_approve_and_journal',
                            `api/biz/approvals/${approvalID}?action=approve`,
                            false, approval === undefined);
                        list.push(toJournalAction);

                        const topaymentaction = this.newAction(
                            'Godkjenn, bokfør og til betaling',
                            'task_approve_and_journal_and_topayment',
                            `api/biz/approvals/${approvalID}?action=approve`,
                            false, approval === undefined);
                        list.push(topaymentaction);
                    }
                }
            }

            if (it.StatusCode === StatusCodeSupplierInvoice.Journaled) {
                list.push(
                    {
                        label: 'Krediter',
                        action: (done) => setTimeout(() => this.creditSupplierInvoice(done)),
                        main: false,
                        disabled: false
                    }
                );
            }

            // Legg til delbetaling
            if (it.StatusCode === StatusCodeSupplierInvoice.Journaled
                || it.StatusCode === StatusCodeSupplierInvoice.Draft
                || it.StatusCode === StatusCodeSupplierInvoice.Approved
            ) {
                if (it.PaymentStatus !== 30112) {
                    if (it.PaymentStatus !== 30110 && it.PaymentStatus !== 30113) {
                        if (hasJournalEntry) {
                            list.forEach(action => action.main = false);
                        }

                        list.push({
                                label: 'Legg til betaling',
                                action: (done) => this.sendForPayment()
                                    .subscribe((done2) => {
                                        this.fetchInvoice(this.currentID, true);
                                        this.updateInvoicePayments().add(done());
                                }),
                                main: true,
                                disabled: false
                            });

                        list.push(
                            {
                                label: 'Tilpasset betaling',
                                action: (done) => this.addPayment(done),
                                main: roundTo(this.current.getValue().RestAmount) > this.sumOfPayments.Amount,
                                disabled: false
                            }
                        );
                    }

                    if (it.StatusCode === StatusCodeSupplierInvoice.Journaled) {
                        list.push(
                            {
                                label: 'Registrer betaling',
                                action: (done) => this.registerPayment(done),
                                main: roundTo(this.current.getValue().RestAmount) > this.sumOfPayments.Amount,
                                disabled: false
                            }
                        );
                    }
                }
            }

            // Vis betalinger
            if (this.invoicePayments.length > 0) {
                list.push(
                    {
                        label: 'Vis betalinger',
                        action: (done) => this.viewPayments(done),
                        main: true,
                        disabled: false,
                    }
                );
            }

            // Bokfør og Til betaling
            if (it.StatusCode === StatusCodeSupplierInvoice.Approved) {
                const toPaymentAction =
                    this.newAction('Bokfør og til betaling', 'task_journal_and_topayment', '');
                list.push(toPaymentAction);
            }
            this.actions = list;
        } else {
            this.initDefaultActions();
        }
    }

    private initDefaultActions() {
        this.actions = this.rootActions;
    }

    public creditSupplierInvoice(done: any) {
        const paymentsSentToBank = this.invoicePayments.find(payment =>
            payment.StatusCode === 44002
            || payment.StatusCode === 44007
            || payment.StatusCode === 44008
            || payment.StatusCode === 44009
            || payment.StatusCode === 44011) !== undefined;

        const paymentsThatWillBeDeleted = this.invoicePayments.find(payment =>
            payment.StatusCode === 44001
            || payment.StatusCode === 44003
            || payment.StatusCode === 44005
            || payment.StatusCode === 44012
            || payment.StatusCode === 44014) !== undefined;

        const options = {
            header: 'Kreditere faktura?',
            message: 'Vil du kreditere bokføringen for fakturaen? Fakturaen vil settes tilbake til opprettet.',
            closeOnClickOutside: false,
            checkboxLabel: '',
            warning: paymentsSentToBank ?
                'Leverandørfakturaen har en eller flere betalinger som er sendt til banken. ' +
                'Dersom du krediterer bør denne betalingen stoppes manuelt i banken.'
                : paymentsThatWillBeDeleted
                    ? 'Leverandørfakturaen har en eller flere betalinger som vil bli slettet viss du krediterer.'
                    : ''
        };

        if (options.warning !== '') {
            options.checkboxLabel = 'Jeg har forstått hva som skjer hvis jeg krediterer fakturaen.';
        }

        this.modalService.open(UniConfirmModalWithCheckbox, options).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.supplierInvoiceService.creditInvoiceJournalEntry(this.currentID)
                    .subscribe(
                        res => {
                            this.fetchInvoice(this.currentID, (!!done)).then(() => {
                                done();
                            });
                        },
                        err => this.errorService.handle(err));
            } else {
                done();
            }
        });
    }

    private viewPayments(done: any) {

        const modal = this.modalService.open(EditSupplierInvoicePayments, {
            data: this.currentID,
            buttonLabels: {
                cancel: 'Lukk'
            },
            header: 'Betalinger'
        });

        modal.onClose.subscribe(() => {
            this.updateInvoicePayments().add(done());
        });
    }

    private newAction(label: string, itemKey: string, href: string, asMain = false, asDisabled = false): any {
        return {
            label: label,
            action: (done) => {
                this.handleAction(itemKey, label, href, done);
            },
            main: asMain,
            disabled: asDisabled
        };
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[], filters?: string[]) {
        let ix = 0, setAsMain = false, isFiltered = false, key: string;
        let ixFound = -1;
        if (!linkNode) { return; }
        for (key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {
                isFiltered = filters ? (filters.findIndex(x => x === key) >= 0) : false;
                if (!isFiltered) {
                    ix++;
                    setAsMain = mainFirst ? ix <= 1 : false;
                    // prioritized main?
                    if (priorities) {
                        const ixPri = priorities.findIndex(x => x === key);
                        if (ixPri >= 0 && (ixPri < ixFound || ixFound < 0)) {
                            ixFound = ixPri;
                            setAsMain = true;
                        }
                    }
                    // reset main?
                    if (setAsMain) { list.forEach(x => x.main = false); }

                    const itemKey = key;
                    const label = this.mapActionLabel(itemKey);
                    const href = linkNode[key].href;

                    // Should be controlled backend, remove from _links when statuscode === 30108
                    if (!(this.current.getValue().StatusCode === 30108 && label === 'Tildel')) {
                        list.push(this.newAction(label, itemKey, href, setAsMain));
                    }
                }
            }
        }
    }

    private handleAction(key: string, label: string, href: string, done: any) {
        this.checkSave().then(x => {
            if (x) {
                this.handleActionAfterCheckSave(key, label, href, done);
            } else {
                done();
            }
        });
    }

    assignInvoice(details: AssignmentDetails, isReAssign?: boolean) {
        const id = this.currentID;
        if (id && details) {
            const request = isReAssign
                ? this.supplierInvoiceService.reAssign(id, details)
                : this.supplierInvoiceService.assign(id, details);

            request.subscribe(
                () => {
                    this.fetchInvoice(id, true);
                    if (details.Message) {
                        this.addComment(details.Message);
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public openAddFileModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if ((!file) || this.files.filter(x => x.StorageReference === file.StorageReference).length) {
                return;
            }
            this.loadingFiles = true;
            const invoice = this.current.getValue();
            if (invoice.ID) {
                this.linkFiles(invoice.ID, [file.ID], StatusCode.Completed).subscribe(() => {
                    this.numberOfDocuments++;
                    this.uniImage.refreshFiles();
                });
            } else {
                if (this.files.length) {
                    this.uniImage.fetchDocumentWithID(safeInt(file.ID));
                } else {
                    this.startUpFileID = [safeInt(file.ID)];
                }

                this.numberOfDocuments++;
                this.hasUnsavedChanges = true;
            }
        });
    }

    public openReinvoiceModal() {
        this.checkSave().then((res: boolean) => {
            if (res) {
                this.modalService.open(UniReinvoiceModal, {
                    data: {
                        supplierInvoice: this.current.getValue()
                    }
                }).onClose.subscribe((result) => {
                    if (result) {
                        this.fetchInvoice(this.currentID, true);
                    }
                });
            }
        });
    }

    private handleActionAfterCheckSave(key: string, label: string, href: string, done: any): boolean {
        const current = this.current.getValue();
        switch (key) {
            case 'reAssign':
            case 'assign':
                this.modalService.open(BillAssignmentModal, {
                    closeOnClickOutside: false
                }).onClose.subscribe(details => {
                    if (details) {
                        this.assignInvoice(details, key === 'reAssign');
                    }
                });
                done();
            break;
            case 'journal':
                this.journal(true, href).subscribe((result: ILocalValidation) => {
                    if (result.success) {
                        this.itCanBeAnAsset(current).pipe(
                            finalize(() => done('Bokført'))
                        ).subscribe(canBeAnAsset => {
                            if (canBeAnAsset) {
                                this.assetsService.openRegisterModal(current).take(1).subscribe();
                            }
                        });
                    } else {
                        done(!result.cancelled ? 'Bokføring feilet' : '');
                    }
                });

                return true;

            case 'smartbooking':
                this.supplierInvoiceService.Action(current.ID, key).subscribe((result) => {
                    this.userMsg(JSON.stringify(result));
                    this.itCanBeAnAsset(current)
                        .pipe(finalize(() => done('ok')))
                        .subscribe(canBeAnAsset => {
                            if (canBeAnAsset) {
                                this.assetsService.openRegisterModal(current).take(1).subscribe();
                            }
                        });
                }, (err) => {
                    this.errorService.handle(err);
                    done(err);
                });
                return true;

            case 'sendForPayment':
                this.sendForPayment()
                    .subscribe(() => {
                        this.updateInvoicePayments().add(done());
                    });
                return true;

            case 'pay':
            case 'payInvoice':
                this.registerPayment(done);
                return true;

            case 'task_approval':
            case 'task_reject':
                this.modalService.open(InvoiceApprovalModal, {
                    data: {
                        task: current['_task'],
                        entityType: 'SupplierInvoice',
                        action: key === 'task_approval' ? 'approve' : 'reject'
                    }
                }).onClose.subscribe(approvedOrRejected => {
                    if (approvedOrRejected) {
                        this.supplierInvoiceService.invalidateCache();
                        this.fetchInvoice(this.currentID, true);
                    }
                });

                done();
                return true;

            case 'task_approve_and_journal':
                this.readyToApprove().subscribe(myApproval => {
                    if (myApproval) {
                        this.askApproveAndJournal()
                            .switchMap(response => {
                                return response === ConfirmActions.ACCEPT
                                    ? this.approve(myApproval)
                                    : Observable.of(false);
                            })
                            .switchMap(approved => {
                                return approved
                                    ? this.journal(false, href)
                                    : Observable.of({ success: false });
                            })
                            .subscribe((result: ILocalValidation) => {
                                if (result.success) {
                                    this.fetchInvoice(current.ID, false);
                                    this.itCanBeAnAsset(current)
                                        .pipe(finalize(() => done('ok')))
                                        .subscribe(canBeAnAsset => {
                                            if (canBeAnAsset) {
                                                this.assetsService.openRegisterModal(current).take(1).subscribe();
                                            }
                                        });
                                } else {
                                    done(!result.cancelled ? 'Godkjent og bokført' : '');
                                }
                            });
                    } else {
                        done('Ikke mulig å godkjenne');
                    }
                });

                return true;

            case 'task_approve_and_journal_and_topayment':
                this.readyToApprove().subscribe(myApproval => {
                    if (myApproval) {
                        this.askApproveAndJournalAndToPayment()
                            .switchMap(response => {
                                return response === ConfirmActions.ACCEPT
                                    ? this.approve(myApproval)
                                    : Observable.of(false);
                            })
                            .switchMap(approved => {
                                return approved
                                    ? this.journal(false, href)
                                    : Observable.of({ success: false });
                            })
                            .switchMap((journaled: ILocalValidation) => {
                                return journaled.success
                                    ? this.sendForPayment()
                                    : Observable.of(false);
                            })
                            .subscribe(result => {
                                this.updateInvoicePayments()
                                    .add(() => {
                                        this.itCanBeAnAsset(current)
                                            .pipe(finalize(() => done(result ? 'Godkjent, bokført og til betaling' : '')))
                                            .subscribe(canBeAnAsset => {
                                                if (canBeAnAsset) {
                                                    this.assetsService.openRegisterModal(current).take(1).subscribe();
                                                }
                                            });
                                    });
                            });
                    } else {
                        done('Ikke mulig å godkjenne');
                    }
                });

                return true;

            case 'task_journal_and_topayment':
                this.askJournalAndToPayment()
                    .switchMap(response => {
                        return response === ConfirmActions.ACCEPT
                            ? this.journal(false, href)
                            : Observable.of({ success: false });
                    })
                    .switchMap((journaled: ILocalValidation) => {
                        return journaled.success
                            ? this.sendForPayment()
                            : Observable.of(false);
                    })
                    .subscribe(result => {
                        this.updateInvoicePayments().add(
                            () => {
                                done(result ? 'Bokført og til betaling' : '');
                                this.itCanBeAnAsset(current).subscribe(canBeAnAsset => {
                                    if (canBeAnAsset) {
                                        this.assetsService.openRegisterModal(current).take(1).subscribe();
                                    }
                                });
                            }
                        );
                    });

                return true;

            default:
                return this.RunActionOnCurrent(key, done, undefined, true);
        }
    }

    private sendForPayment(): Observable<boolean> {
        const current = this.current.getValue();

        if (current.RestAmount == 0) {
            this.toast.addToast('Legg til betaling', ToastType.bad, 5, 'Kan ikke legge en faktura med 0 i restbeløp til betaling',);
            return Observable.of(false);
        }

        return this.supplierInvoiceService.sendForPayment(current.ID)
            .switchMap(() => Observable.of(true))
            .catch(() => Observable.of(false));
    }

    private addPayment(done: any) {
        const bill = this.current.getValue();
        const today = new LocalDate(Date());
        const dueDate = this.current.getValue().PaymentDueDate;

        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(bill.RestAmount),
            AmountCurrency: roundTo(bill.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: bill.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: dueDate > today ? dueDate : today,
            AgioAccountID: 0,
            BankChargeAccountID: 0,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: null
        };

        if (this.sumOfPayments && this.sumOfPayments.Amount && this.sumOfPayments.AmountCurrency) {
            paymentData.AmountCurrency = Math.max(paymentData.AmountCurrency -= this.sumOfPayments.AmountCurrency, 0);
            paymentData.Amount = Math.max(paymentData.Amount -= this.sumOfPayments.Amount, 0);
        }

        paymentData['_accounts'] = this.companySettings.BankAccounts
            .filter(acc => acc.BankAccountType.toLowerCase() === 'company' || acc.BankAccountType.toLowerCase() === 'companysettings');
        paymentData['FromBankAccountID'] = this.companySettings.CompanyBankAccountID;

        const modal = this.modalService.open(UniRegisterPaymentModal, {
            header: 'Legg til i betalingsliste for leverandør-faktura: ' + (bill.InvoiceNumber || ''),
            data: paymentData,
            modalConfig: {
                entityName: 'SupplierInvoice',
                supplierID: bill.SupplierID,
                currencyCode: this.currencyCodes.find(code => code.ID === bill.CurrencyCodeID).Code,
                currencyExchangeRate: bill.CurrencyExchangeRate,
                isSendForPayment: true
            }
        });

        modal.onClose.subscribe((payment: InvoicePaymentData) => {
            if (payment) {
                this.supplierInvoiceService.sendForPaymentWithData(this.currentID, payment)
                    .finally(() => this.busy = false)
                    .subscribe(() => {
                        this.updateInvoicePayments().add(() => {
                            done();
                        });
                    }, err => {
                        this.errorService.handle(err);
                        done();
                });

            }
            done();
        });
    }

    private journal(ask: boolean, href: string): Observable<ILocalValidation> {

        // Call update summary to make sure sums and remainders are up to date
        this.updateSummary(this.journalEntryManual.getJournalEntryData());
        const current = this.current.getValue();

        if (this.sumRemainder !== 0) {
            this.toast.addToast('Beløp i bilag går ikke i balanse med fakturabeløp', ToastType.bad, 7);
            return Observable.of({ success: false });
        }

        if (current.ReInvoice && current.ReInvoice.ReInvoicingType === 0
            && (current.ReInvoice.StatusCode === 30201 || current.ReInvoice.StatusCode === null)) {
            this.toast.addToast('Kostnadsdelingen må settes opp før fakturaen kan bokføres.', ToastType.bad, 7);
            return Observable.of({ success: false });
        }

        const fd = this.companySettings.BookCustomerInvoiceOnDeliveryDate ? current.DeliveryDate : current.InvoiceDate;
        const vd = current.InvoiceDate;

        this.updateJournalEntryManualDates(fd, vd);

        // Hadde det vært bedre å disable aksjon Bokføring? Eller tar det for lang tid når man bygger menyen?
        if (this.validationMessage && this.validationMessage.Level === ValidationLevel.Error) {
            this.toast.addToast('Fakturaen kan ikke bokføres', ToastType.bad, 7, this.validationMessage.Message);
            return Observable.of({ success: false });
        }
        if (this.journalEntryManual.validationResult
            && this.journalEntryManual.validationResult.Messages
            && this.journalEntryManual.validationResult.Messages.filter(msg => msg.Level !== ValidationLevel.Info).length > 0
        ) {
            let validationMessage = '';
            this.journalEntryManual.validationResult.Messages.forEach((msg) => {
                validationMessage += msg.Message + '<br>';
            });
            this.toast.addToast('Fakturaen kan ikke bokføres', ToastType.bad, 7, validationMessage);
            return Observable.of({ success: false });
        }

        const obs = ask
            ? this.modalService.open(UniConfirmModalV2, {
                header: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_SUPPLIER_NAME~' + current.Supplier.Info.Name,
                message: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_AMOUNT~' + current.TaxInclusiveAmountCurrency.toFixed(2),
                buttonLabels: {
                    accept: 'Bokfør',
                    cancel: 'Avbryt'
                }
            }).onClose.map(response => response === ConfirmActions.ACCEPT)
            : Observable.of(true);

        return obs.switchMap(response => {
            if (!response) {
                return Observable.of({ success: false, cancelled: true });
            }

            this.busy = true;
            return Observable.fromPromise(
                this.tryJournal(href).then((status: ILocalValidation) => {
                    if (!status.success) return status;

                    this.busy = false;
                    this.hasUnsavedChanges = false;
                    this.journalEntryManual.clearJournalEntryInfo();
                    this.fetchInvoice(current.ID, false);
                    return { success: true };
                }).catch((err: ILocalValidation) => {
                    this.busy = false;
                    this.userMsg(err.errorMessage, 'Advarsel', 10);
                    return { success: false };
                })
            );
        });
    }

    // Begin Ask modal
    private askApproveAndJournal(): Observable<any> {
        const current = this.current.getValue();
        return this.modalService.open(UniConfirmModalV2, {
            header: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_AND_APPROVE_WITH_SUPPLIER_NAME~' + current.Supplier.Info.Name,
            message: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_AMOUNT~' + current.TaxInclusiveAmountCurrency.toFixed(2),
            warning: 'Merk! Dette steget er det ikke mulig å reversere.',
            buttonLabels: {
                accept: 'Godkjenn og bokfør',
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    private askApproveAndJournalAndToPayment(): Observable<any> {
        const current = this.current.getValue();
        return this.modalService.open(UniConfirmModalV2, {
            header: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_TO_PAYMENT_WITH_SUPPLIER_NAME~' + current.Supplier.Info.Name,
            message: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_AMOUNT~' + current.TaxInclusiveAmountCurrency.toFixed(2),
            warning: 'Merk! Dette steget er det ikke mulig å reversere.',
            buttonLabels: {
                accept: 'Godkjenn, bokfør og til betaling',
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    private askJournalAndToPayment(): Observable<any> {
        return this.askWithLabel('ACCOUNTING.SUPPLIER_INVOICE.BOOK_TO_PAYMENT_WITH_SUPPLIER_NAME~', 'Bokfør og til betaling');
    }

    private askWithLabel(header: string, accept: string): Observable<any> {
        const current = this.current.value;
        return this.modalService.open(UniConfirmModalV2, {
            header: header + current.Supplier.Info.Name,
            message: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_AMOUNT~' + current.TaxInclusiveAmountCurrency.toFixed(2),
            warning: 'Merk! Dette steget er det ikke mulig å reversere.',
            buttonLabels: {
                accept: accept,
                cancel: 'Avbryt'
            }
        }).onClose;
    }
    // End Ask modal

    private readyToApprove(): Observable<any> {
        if (this.CurrentTask) {
            const approvals = this.CurrentTask.Approvals;
            if (approvals) {
                const myApproval = approvals.find(x =>
                x.UserID === this.myUser.ID &&
                x.StatusCode === ApprovalStatus.Active);

                if (myApproval) {
                    return Observable.of(myApproval);
                }
            }
        }

        return Observable.of(null);
    }

    private approve(myApproval: Approval): Observable<boolean> {
        return this.supplierInvoiceService.send(`approvals/${myApproval.ID}?action=approve`)
            .switchMap(result => {
                return Observable.of(true);
            })
            .catch(err => {
                this.errorService.handle(err);
                return Observable.of(false);
            });
    }

    private RunActionOnCurrent(action: string, done?: (msg) => {}, successMsg?: string, reload = false): boolean {
        const current = this.current.getValue();
        this.busy = true;
        this.supplierInvoiceService.PostAction(current.ID, action)
            .finally(() => this.busy = false)
            .subscribe(() => {
                if (done) {
                    done(successMsg);
                    if (reload) {
                        this.fetchInvoice(current.ID, false);
                    }
                }
            }, (err) => {
                this.errorService.handle(err);
                done(trimLength(err, 100, true));
            });
        return true;
    }

    private tryJournal(url: string): Promise<ILocalValidation> {

        this.preSave();
        return new Promise((resolve, reject) => {
            let current = this.current.value;
            this.UpdateSuppliersJournalEntry().then(result => {
                if (!result.success) {
                    resolve(result);
                    return;
                }

                current = this.current.value;

                this.supplierInvoiceService.journal(current.ID).subscribe(
                    () => {
                        this.fetchInvoice(current.ID, false);
                        resolve(result);
                    },
                    (err) => {
                        this.errorService.handle(err);
                        // Slett draftline opprettet i UpdateSuppliersJournalEntry. Skal ikke opprettes dersom bokføring feiler
                        const autoCreatedDraftLines = current.JournalEntry.DraftLines.filter(line => {
                            return line.Account
                                && line.Account.AccountNumber === current.Supplier.SupplierNumber
                                && line.Description === 'fakturanr. ' + current.InvoiceNumber;
                        });

                        if (autoCreatedDraftLines && autoCreatedDraftLines.length > 0) {
                            autoCreatedDraftLines.forEach(line => line.Deleted = true);
                            this.supplierInvoiceService.Put(current.ID, current).subscribe(() => {
                                this.fetchInvoice(this.currentID, false);
                            });
                        }
                        reject(err);
                    }
                );

            }, (err) => {
                reject(err);
            });
        });
    }

    private mapActionLabel(key: string): string {
        const label = workflowLabels[key];
        if (!label) {
            return key;
        }
        return label;
    }

    private fetchInvoice(id: number, flagBusy: boolean): Promise<any> {
        if (flagBusy) { this.busy = true; }

        this.journalEntryService.setSessionData(JournalEntryMode.SupplierInvoice, null);

        if (this.current?.value?.ID !== id) {
            this.files = undefined;

            // set diff to null until the journalentry is loaded, the data is calculated correctly
            // through the onJournalEntryManualDataLoaded event
            this.sumVat = null;
            this.sumRemainder = null;
        }

        return new Promise((resolve, reject) => {
            const invoiceGET = this.supplierInvoiceService.Get(id, [
                'Supplier.Info.BankAccounts',
                'BankAccount',
                'DefaultDimensions.Info',
                'ReInvoice'
            ], true);

            forkJoin([
                invoiceGET,
                this.bankService.getBankPayments(id),
                this.bankService.getRegisteredPayments(id),
                this.bankService.getSumOfPayments(id)
            ]).pipe(
                finalize(() => this.flagUnsavedChanged(true))
            ).subscribe(
                ([invoice, bankPayments, registeredPayments, sumOfPayments]) => {
                    if (flagBusy) { this.busy = false; }
                    if (!invoice.Supplier) { invoice.Supplier = new Supplier(); }

                    let obs = Observable.of(null);

                    if (invoice.JournalEntryID) {
                        obs = this.journalEntryService.Get(invoice.JournalEntryID,
                            ['DraftLines.Account', 'DraftLines.VatType', 'DraftLines.Accrual.Periods', 'Lines']);
                    }

                    const setupInvoice = () => {
                        this.invoicePayments = (bankPayments || []).concat(
                            (registeredPayments || []).filter(
                                payment => !bankPayments.some(bankpayment => bankpayment.ID === payment.PaymentID)
                            )
                        );
                        this.sumOfPayments = sumOfPayments[0];

                        this.current.next(invoice);
                        this.currentFreeTxt = invoice.FreeTxt;
                        this.detailsTabs[1].tooltip = this.currentFreeTxt;

                        if (invoice.Supplier) {
                            this.orgNumber = invoice.Supplier.OrgNumber;
                        }
                        this.setupToolbar();
                        this.addTab(+id);
                        this.flagActionBar(actionBar.delete, invoice.StatusCode < StatusCodeSupplierInvoice.Journaled);
                        this.flagActionBar(actionBar.ocr, invoice.StatusCode <= StatusCodeSupplierInvoice.Draft);
                        this.flagActionBar(actionBar.runSmartBooking, invoice.StatusCode < StatusCodeSupplierInvoice.Journaled);
                        this.loadActionsFromEntity();
                        this.checkLockStatus();

                        resolve('');
                    };

                    obs.subscribe((response) => {
                        if (response) {
                            invoice.JournalEntry = response;
                        }
                        setupInvoice();
                    }, err => {
                        this.toast.addToast('Klarte ikke hente bilagslinjer', ToastType.warn, 5,
                        'Noe gikk galt ved henting av bilagslinjer. Det kan være lurt å åpne bildet på nytt.');
                        setupInvoice();
                    });
                },
                err => {
                    this.errorService.handle(err);
                    reject(err);
                }
            );
        });
    }

    private updateSummary(lines) {
        if (!lines) { lines = []; }

        const sumAmountCurrency = lines.reduce((sum, line) => {
            return sum + (line.AmountCurrency || 0);
        }, 0);
        const sumNetAmountCurrency = lines.reduce((sum, line) => {
            return sum + (line.NetAmountCurrency || 0);
        }, 0);
        const sumVatAmountCurrency = sumAmountCurrency - sumNetAmountCurrency;
        const invoice = this.current.getValue();
        const sumInvoice = invoice.TaxInclusiveAmountCurrency || 0;

        this.sumRemainder = UniMath.round(sumInvoice) - UniMath.round(sumAmountCurrency);
        this.sumVat = sumVatAmountCurrency;
    }

    public updateDimensions(lines) {
        if (lines.length > this.lastJournalEntryData?.length) { // new line at the end
            const newLine = lines[lines.length - 1];
            const dimensions = this.current?.getValue().DefaultDimensions;
            if (dimensions) {
                const projectId = dimensions?.ProjectID;
                const departmentId = dimensions?.DepartmentID;
                if (projectId) {
                    newLine.Dimensions.ProjectID = projectId;
                    newLine.Dimensions.Project = this.projects.find(x => x.ID === projectId);
                }
                if (departmentId) {
                    newLine.Dimensions.DepartmentID = departmentId;
                    newLine.Dimensions.Department = this.departments.find(x => x.ID === projectId);
                }
                for (let i = 5; i < 11; i++) {
                    const dimensionID = dimensions[`Dimension${i}ID`];
                    if (dimensionID) {
                        newLine.Dimensions[`Dimension${i}ID`] = dimensionID;
                        newLine.Dimensions[`Dimension${i}`] = this.customDimensions
                            .find(dimMetadata => dimMetadata.Dimension === i).Data.find(x => x.ID === dimensionID);
                    }
                }
            }
        }
        this.lastJournalEntryData = [...lines];
        this.journalEntryManual.setJournalEntryData(this.lastJournalEntryData);
    }

    public onJournalEntryManualChange(lines) {
        let changes = false;
        this.updateSummary(lines);
        this.updateDimensions(lines);
        let supplierInvoice = this.current.getValue();
        if (supplierInvoice.TaxExclusiveAmountCurrency) {
            supplierInvoice.TaxExclusiveAmountCurrency = supplierInvoice.TaxInclusiveAmountCurrency - this.sumVat;
        }
        this.current.next(supplierInvoice);
        let previousLine = null;

        lines.map(line => {
            const currentSupplierInvoice = this.current.value;
            if (!line.VatDate) {
                line.VatDate = currentSupplierInvoice.InvoiceDate;

                line = this.setVatDeductionPercent(line);
            }

            if (!line.FinancialDate) {
                if (previousLine && previousLine.FinancialDate) {
                    line.FinancialDate = previousLine.FinancialDate;
                } else {
                    line.FinancialDate = currentSupplierInvoice.DeliveryDate || currentSupplierInvoice.InvoiceDate;
                }
            }

            if (!line.Description || line._updateDescription) {
                line.Description = this.createLineDescription();
                changes = line.Description !== '';
            }

            if (!line.Dimensions) {
                line.Dimensions = {};
            }

            line.CurrencyCodeID = currentSupplierInvoice.CurrencyCodeID;
            line.CurrencyCode = currentSupplierInvoice.CurrencyCode;
            line.CurrencyExchangeRate = currentSupplierInvoice.CurrencyExchangeRate;

            if (!line.Dimensions.Project && supplierInvoice.DefaultDimensions && supplierInvoice.DefaultDimensions.Project) {
                line.Dimensions.Project = supplierInvoice?.DefaultDimensions?.Project;
                line.Dimensions.ProjectID = supplierInvoice?.DefaultDimensions?.ProjectID;
            }

            if (!line.Dimensions.Department && !!supplierInvoice.DefaultDimensions && supplierInvoice.DefaultDimensions.Department) {
                line.Dimensions.Department = supplierInvoice?.DefaultDimensions?.Department;
                line.Dimensions.DepartmentID = supplierInvoice?.DefaultDimensions?.DepartmentID;
            }

            this.customDimensions.forEach((dimension) => {
                if (!line.Dimensions['Dimension' + dimension.Dimension]
                    && currentSupplierInvoice.DefaultDimensions
                    && currentSupplierInvoice.DefaultDimensions['Dimension' + dimension.Dimension]) {

                    line.Dimensions['Dimension' + dimension.Dimension] =
                        currentSupplierInvoice.DefaultDimensions['Dimension' + dimension.Dimension];
                    line.Dimensions['Dimension' + dimension.Dimension + 'ID'] =
                        currentSupplierInvoice.DefaultDimensions['Dimension' + dimension.Dimension + 'ID'];
                }
            });

            if (!line.Amount && !line.AmountCurrency) {
                line.AmountCurrency = UniMath.round(this.sumRemainder);
                line.Amount = UniMath.round(line.AmountCurrency * (line.CurrencyExchangeRate || 1), 2);
                changes = true;
            }

            if (line.Amount === line.AmountCurrency && line.CurrencyExchangeRate !== 1) {
                line.Amount = UniMath.round(line.AmountCurrency * (line.CurrencyExchangeRate || 1), 2);
                changes = true;
            }

            previousLine = line;
        });

        if (changes) {
            this.journalEntryManual.setJournalEntryData(lines);

            // changes can potentially cause recalculations of netamounts, so we need to update
            // to recalculate this correctly
            setTimeout(() => {
                this.updateSummary(this.journalEntryManual.getJournalEntryData());
                supplierInvoice = this.current.getValue();
                if (supplierInvoice.TaxInclusiveAmountCurrency) {
                    supplierInvoice.TaxExclusiveAmountCurrency = supplierInvoice.TaxInclusiveAmountCurrency - this.sumVat;
                }
                this.current.next(supplierInvoice);
            });
        }

        // flag unsaved changes so the save button is activated
        this.flagUnsavedChanged();
    }

    private setVatDeductionPercent(rowModel: JournalEntryData): JournalEntryData {
        let deductivePercent: number = 0;
        rowModel.VatDeductionPercent = null;

        if (rowModel.DebitAccount && rowModel.DebitAccount.UseVatDeductionGroupID) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(
                this.vatDeductions, rowModel.DebitAccount, (rowModel.VatDate ? rowModel.VatDate : rowModel.FinancialDate)
            );
        }

        if (deductivePercent !== 0) {
            rowModel.VatDeductionPercent = deductivePercent;
        }

        return rowModel;
    }

    public onFormReady() {
        this.formReady = true;
        if (this.current.value.ID
            && this.current.value.SupplierID
            && this.current.value.StatusCode !== StatusCodeSupplierInvoice.Journaled
        ) {
            this.getValidationMessage(
                this.current.value.SupplierID,
                this.current.value.DefaultDimensionsID,
                this.current.value.DefaultDimensions
            );
        }
    }

    private updateJournalEntryManualDates(financialDate: LocalDate, vatDate: LocalDate) {
        if (this.journalEntryManual) {
            let lines = this.journalEntryManual.getJournalEntryData();
            lines = lines.map(line => {
                line.VatDate = vatDate;
                line.FinancialDate = financialDate;
                return line;
            });
            this.journalEntryManual.setJournalEntryData(lines);
        }
    }

    public onDetailsTabClick(index: number) {
        // Check lock status when activating the details tab to avoid
        if (index === 0) {
            setTimeout(() => {
                this.checkLockStatus();
            });
        }
    }

    private checkLockStatus() {
        if (!this.formReady || this.detailsTabIndex === 1) {
            return;
        }

        this.supplierIsReadOnly = true;
        const current = this.current.getValue();
        if (current && current.StatusCode) {
            switch (safeInt(current.StatusCode)) {
                case StatusCode.Deleted: // rejected
                    this.uniForm.readMode();
                    return;

                case StatusCode.Completed:
                    this.uniForm.readMode();
                    return;

                case StatusCodeSupplierInvoice.Journaled:
                    this.uniForm.readMode();
                    this.uniForm.field('PaymentID').editMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    this.uniForm.field('DefaultDimensions.ProjectID').editMode();
                    this.uniForm.field('DefaultDimensions.DepartmentID').editMode();
                    this.uniForm.field('BankAccountID').editMode();
                    return;

            }
        } else {
            this.uniForm.editMode();
        }

        if (this.hasLoadedCustomDimensions) {
            this.customDimensions.forEach((dim) => {
                if (this.uniForm.field(`DefaultDimensions.Dimension${dim.Dimension}ID`)) {
                    if (dim.IsActive) {
                        this.uniForm.field(`DefaultDimensions.Dimension${dim.Dimension}ID`).editMode();
                    } else {
                        this.uniForm.field(`DefaultDimensions.Dimension${dim.Dimension}ID`).readMode();
                    }
                }
            });
        }

        this.supplierIsReadOnly = false;
    }

    public setFieldsReadonly(fieldPropertyNames: string[]) {
        setTimeout(() => {
            const fields = this.fields$.value;
            if (fieldPropertyNames) {
                fieldPropertyNames.forEach(fieldPropertyName => {
                    const field = fields.find((f) => f['Property'] === fieldPropertyName);
                    if (field) {
                        field['ReadOnly'] = true;
                    }
                });
                this.fields$.next(fields);
            }
        });
    }

    public getSupplierName(): string {
        const current = this.current.getValue();
        return current
        && current.Supplier
        && current.Supplier.Info ? current.Supplier.Info.Name : '';
    }

    public tryDelete(done) {
        const bill = this.current.getValue();
        this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: 'Vennligst bekreft sletting av faktura ' + (bill.InvoiceNumber || ''),
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                return this.delete(done);
            }

            done('');
        });
    }

    public delete(done) {
        const invoice = this.current.getValue();
        if (invoice.ID) {
            this.supplierInvoiceService.Remove<SupplierInvoice>(invoice.ID).subscribe(
                () => {
                    done('Sletting ok');
                    this.newInvoice(false);
                },
                err => {
                    this.errorService.handle(err);
                    done();
                }
            );
        } else {
            done();
            this.newInvoice(false);
        }
    }

    private saveAndGetNewDocument(done?) {
        return this.save(done).then(() => {
            this.supplierInvoiceService.fetch(
                'filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense|Upload/0?action=get-supplierInvoice-inbox')
                .subscribe((res) => {
                    if (res && res.length > 0) {
                        this.router.navigateByUrl('/accounting/bills/0?fileid=' + res[0].ID);
                        if (done) { done('Lagret'); }
                    } else {
                        this.toast.addToast('Ingen flere dokumenter i flyten', ToastType.good, 2);
                    }
                }, (err) => {
                    // In case of error fetching documents, get current and show error
                    this.errorService.handle(err);
                    this.toast.addToast('Kunne ikke laste nytt dokument', ToastType.bad, 2);
                } );
        });
    }

    public saveAndReject(done) {
        let obs;
        const current = this.current.getValue();
        if (!current.SupplierID && (!current.Supplier || (current.Supplier && !current.Supplier['_createguid']))) {
            current.Supplier = null;
        }
        if (current.ID) {
            // if the journalentry is already booked, clear the object before saving as we don't
            // want to resave a booked journalentry
            if (current.JournalEntry.DraftLines.filter(x => x.StatusCode).length > 0) {
                current.JournalEntry = null;
            }
            if (!current.SupplierID && (!current.Supplier || (current.Supplier && !current.Supplier['_createguid']))) {
                current.Supplier = null;
            } else if (current.SupplierID && (current.Supplier && current.Supplier['_createguid'])) {
                current.SupplierID = null;
            }
            obs = this.supplierInvoiceService.Put(current.ID, current);
        } else {
            if (!current.SupplierID && (!current.Supplier || (current.Supplier && !current.Supplier['_createguid']))) {
                current.Supplier = null;
            }
            obs = this.supplierInvoiceService.Post(current);
        }
        obs.subscribe((res) => {
            this.supplierInvoiceService.send('supplierinvoices/' + res.ID + '?action=reject', null, 'PUT').subscribe(() => {
                this.hasUnsavedChanges = false;
                done('Lagret og avvist!');

                this.linkFiles(res.ID, this.unlinkedFiles, StatusCode.Completed).subscribe(() => {
                    this.router.navigateByUrl('/accounting/bills/' + res.ID);
                });
            });
        });
    }

    public save(done?, updateRoute = true): Promise<ILocalValidation> {

        this.preSave();

        return new Promise((resolve, reject) => {
            let obs: any;
            const current = this.current.getValue();

            const saveFunc = () => {
                if (current.ID) {
                    // Items should only be saved first time with post
                    current.Items = null;
                    // if the journalentry is already booked, clear the object before saving as we don't
                    // want to resave a booked journalentry
                    // also clean up _createguid property if that was saved before
                    if (current.JournalEntry.DraftLines.filter(x => x.StatusCode).length > 0) {
                        current.JournalEntry = null;
                    } else {
                        if (current.JournalEntry?.ID) {
                            current.JournalEntry._createguid = undefined // avoid push to server
                        }
                        current.JournalEntry.DraftLines.forEach(line => {
                            if (line.ID && line._createguid) {
                                line._createguid = undefined; // avoid push to server
                            } else if (!line.ID && line._createguid) {
                                line._createguid = getNewGuid();
                            }
                            if (!line.VatDeductionPercent) {
                                line.VatDeductionPercent = 0;
                            }
                        });
                    }
                    if (current.ReInvoice != null) {
                        current.ReInvoice = null;
                    }
                    if (!current.SupplierID
                        && (!current.Supplier || (current.Supplier && !current.Supplier['_createguid']))) {
                        current.Supplier = null;
                    } else if (current.SupplierID
                        && (current.Supplier && current.Supplier['_createguid'])) {
                        current.SupplierID = null;
                    }
                    obs = this.supplierInvoiceService.Put(current.ID, current);
                } else {
                    if (!current.SupplierID
                        && (!current.Supplier || (current.Supplier && !current.Supplier['_createguid']))) {
                        current.Supplier = null;
                    }
                    obs = this.supplierInvoiceService.Post(current);
                }

                obs.subscribe((result) => {
                    const onSaveComplete = () => {
                        if ((!current.ID) && updateRoute) {
                            this.currentID = result.ID;
                            this.router.navigateByUrl('/accounting/bills/' + result.ID);
                        }
                        this.currentID = result.ID;
                        this.hasUnsavedChanges = false;
                        this.commentsConfig.entityID = result.ID;

                        this.fetchInvoice(this.currentID, (!!done))
                            .then(() => {
                                resolve({ success: true });
                                if (done) { done('Lagret'); }
                            })
                            .catch((msg) => {
                                reject({ success: false, errorMessage: msg });
                                if (done) { done(msg); }
                            });
                    };

                    if (this.unlinkedFiles.length > 0) {
                        this.linkFiles(result.ID, this.unlinkedFiles, StatusCode.Completed).subscribe(() => {
                            this.resetDocuments();
                            onSaveComplete();
                        });
                    } else {
                        onSaveComplete();
                    }
                }, (err) => {
                    this.errorService.handle(err);
                    if (done) { done('Feil ved lagring'); }
                    reject({ success: false, errorMessage: 'Feil ved lagring' });
                });
            };

            const paymentIdContainsCharacters = current.PaymentID?.match(/[a-å]/gi)?.length > 0 ?? false;
            if (!paymentIdContainsCharacters && !this.modulusService.isValidKID(current.PaymentID)) {
                this.toast.toast({
                    title: 'KID er ikke gyldig',
                    type: ToastType.bad,
                    duration: 5
                });

                resolve({ success: false });
                if (done) {
                    done();
                }

                return;
            }

            // Query to see if invoiceID/supplierID combo has been used before
            this.supplierInvoiceService.checkInvoiceData(
                current.InvoiceNumber, current.SupplierID, current.ID
            ).subscribe((data: any) => {
                if ((data && data.Data && data.Data[0].countid > 0)) {
                    const message = 'Faktura med samme fakturanr. og leverandør er allerede lagret.'
                        + '<br> Du kan ignorere dette og lagre om ønskelig.';

                    this.modalService.open(UniConfirmModalV2, {
                        buttonLabels: {
                            accept: 'Lagre',
                            cancel: 'Avbryt'
                        },
                        header: 'Vil du lagre?',
                        message: message
                    }).onClose.subscribe(res => {
                        if (res === ConfirmActions.ACCEPT) {
                            saveFunc();
                        } else {
                            resolve({ success: false, cancelled: true });
                            if (done) {
                                done('Lagring avbrutt');
                            }
                        }
                    });
                } else {
                    saveFunc();
                }
            });
        });
    }

    private updateOcrDataActualValue() {
        if (this.ocrData) {
            const current = this.current.getValue();

            this.setActualValueOnOcrProp(OcrPropertyType.InvoiceDate, current.InvoiceDate);
            this.setActualValueOnOcrProp(OcrPropertyType.DueDate, current.PaymentDueDate);
            this.setActualValueOnOcrProp(OcrPropertyType.InvoiceNumber, current.InvoiceNumber);
            this.setActualValueOnOcrProp(
                OcrPropertyType.BankAccountNumber,
                current.BankAccount ? current.BankAccount.AccountNumber : null
            );
            this.setActualValueOnOcrProp(OcrPropertyType.CustomerIdentificationNumber, current.PaymentID);
            this.setActualValueOnOcrProp(OcrPropertyType.TotalAmount, current.TaxInclusiveAmountCurrency);
            this.setActualValueOnOcrProp(
                OcrPropertyType.OfficialNumber,
                current.Supplier ? current.Supplier.OrgNumber : null
            );
        }
    }

    private setActualValueOnOcrProp(propertyType: OcrPropertyType, value) {
        const prop =
            this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === propertyType);

        if (prop) {
            prop.ActualValue = value;
        } else {
            const newProp = {
                OcrProperty: {
                    PropertyType: propertyType
                },
                ActualValue: value
            };

            this.ocrData.InterpretedProperties.push(newProp);
        }
    }

    private createLineDescription() {
        const current = this.current.getValue();
        if (!current.Supplier && !current.InvoiceNumber) { return ''; }

        const supplierDescription = (current.Supplier
                ? current.Supplier.SupplierNumber : '') + (current.Supplier && current.Supplier.Info
                ? ' - ' + current.Supplier.Info.Name
                : '');

        return current.InvoiceNumber
            ? `${supplierDescription} - fakturanr. ${current.InvoiceNumber || 0}`
            : supplierDescription;
    }

    private preSave(): boolean {

        let changesMade = false;
        const current = this.current.getValue();
        current.InvoiceDate = current.InvoiceDate || new LocalDate();
        current.FreeTxt = this.currentFreeTxt;
        current.Supplier.CostAllocation = null;

        const fd = this.companySettings.BookCustomerInvoiceOnDeliveryDate ? current.DeliveryDate : current.InvoiceDate;
        const vd = current.InvoiceDate;

        this.updateJournalEntryManualDates(fd, vd);

        if (!current.JournalEntry) {
            current.JournalEntry = new JournalEntry();
            current.JournalEntry.DraftLines = [];
        }

        if (current.JournalEntry.DraftLines.filter(x => x.StatusCode).length === 0) {
            // Update draftlines, but dont do anything if any draftlines is already
            // booked - because then we wont save any changes anyway (and the )
            if (this.journalEntryManual) {
                const lines  = this.journalEntryManual.getJournalEntryData();
                let draftlines = [];

                // Add draft lines
                lines.forEach((line: any) => {
                    const draft = new JournalEntryLineDraft();
                    draft['_createguid'] = this.journalEntryService.getNewGuid();

                    // Debit
                    draft.AccountID = line.DebitAccountID;
                    draft.Account = null;
                    draft.Amount = line.Amount;
                    draft.AmountCurrency = line.AmountCurrency;
                    draft.Description = line.Description ? line.Description : this.createLineDescription();
                    draft.VatTypeID = line.DebitVatTypeID;
                    draft.VatPercent = line.DebitVatType ? line.DebitVatType.VatPercent : 0;
                    draft.VatDeductionPercent = line.VatDeductionPercent;
                    draft.FinancialDate = line.FinancialDate;
                    draft.VatDate = line.VatDate;
                    draft.Dimensions = line.Dimensions;

                    if (draft.Dimensions && !draft.Dimensions.ID) {
                        draft.Dimensions._createguid = draft.Dimensions._createguid || this.journalEntryService.getNewGuid();
                    }

                    if (line.JournalEntryDataAccrual) {
                        draft.Accrual = line.JournalEntryDataAccrual;

                        // create a new accrual, this is simpler than updating/modifying the existing, and it is also
                        // more correct, because the journalentrydraftline will replace the original journalentrydraftline
                        // as well
                        draft.Accrual.ID = 0;
                        draft.Accrual['_createguid'] = this.journalEntryService.getNewGuid();
                        draft.Accrual.Periods.forEach(p => {
                            p.AccrualID = 0;
                            p['_createguid'] = this.journalEntryService.getNewGuid();
                        });
                    }

                    draftlines.push(draft);
                });

                // Add draftlines to be deleted
                const deleted = current.JournalEntry.DraftLines.filter(x => !draftlines.find(y => y.ID === x.ID) && x.ID);
                deleted.map(line => line.Deleted = true);
                draftlines = draftlines.concat(deleted);

                const autogenerated = current.JournalEntry.DraftLines.filter(x => x['_isautogeneratedcreditline']);
                draftlines = draftlines.concat(autogenerated);
                current.JournalEntry.DraftLines = draftlines;
                current.JournalEntry['_createguid'] = current.JournalEntry['_createguid'] || this.journalEntryService.getNewGuid();
            }
        }

        /// NumberSeriesTask

        // Clean up the ocrData, e.g. if the user has changed the values manually,
        // the ActualValue should be updated. UniFiles will handle the rest
        this.updateOcrDataActualValue();

        // start training - dont wait for result, this will run in the background
        // and handle reauthentication if needed
        if (this.ocrData) {
            this.uniFilesService.trainOcrEngine(this.ocrData);
        }

        if (current.JournalEntry) {
            if (!current.JournalEntry.NumberSeriesTaskID) {
                current.JournalEntry.NumberSeriesTaskID = NumberSeriesTaskIds.SupplierInvoice;
                changesMade = true;
            }
        }

        // Ensure dates are set
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach(x => {
                const orig = x.FinancialDate;
                x.FinancialDate = x.FinancialDate || current.DeliveryDate || current.InvoiceDate;

                if (x.FinancialDate !== orig) {
                    changesMade = true;
                }
            });
        }

        // Auto-set "paymentinformation" from invoicenumber (if kid not set):
        if ((!current.PaymentID) && (!current.PaymentInformation)) {
            if (current.InvoiceNumber) {
                current.PaymentInformation = 'Fakturanr.' + current.InvoiceNumber;
                changesMade = true;
            }
        }

        // clear BankAccount, this should be saved/defined on the Supplier, and only the ID should
        // be set on the SupplierInvoice
        if (current.BankAccount) {
            current.BankAccount = null;
        }

        if (current.DefaultDimensions && !current.DefaultDimensions.ID) {
            current.DefaultDimensions._createguid = this.supplierInvoiceService.getNewGuid();
        }

        // set CurrencyID
        if (current.CurrencyCodeID && current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach(x => {
                const orig = x.CurrencyCodeID;
                x.CurrencyCodeID = x.CurrencyCodeID || current.CurrencyCodeID;
                if (x.CurrencyCodeID !== orig) {
                    changesMade = true;
                }
            });
        }
        // set CurrencyExchangeRate
        if (current.CurrencyExchangeRate && current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach(x => {
                const orig = x.CurrencyExchangeRate;
                x.CurrencyExchangeRate = x.CurrencyExchangeRate || current.CurrencyExchangeRate;
                if (x.CurrencyExchangeRate !== orig) {
                    changesMade = true;
                }
            });
        }
        return changesMade;
    }

    private UpdateSuppliersJournalEntry(): Promise<ILocalValidation> {

        return new Promise((resolve, reject) => {
            const current = this.current.getValue();
            if (!current.JournalEntry || !current.JournalEntry.DraftLines || !current.JournalEntry.DraftLines.length) {
                resolve({ success: true });
            } else {
                const completeAccount = (item: JournalEntryLineDraft, addToList = false) => {
                    if (item.AmountCurrency !== current.TaxInclusiveAmountCurrency * -1) {

                        const fd = this.companySettings.BookCustomerInvoiceOnDeliveryDate ? current.DeliveryDate : current.InvoiceDate;
                        const vd = current.InvoiceDate;

                        item.FinancialDate = fd;
                        item.VatDate = vd;

                        item.AmountCurrency = current.TaxInclusiveAmountCurrency * -1;
                        item.Description = item.Description
                            || ('fakturanr. ' + current.InvoiceNumber);
                        item['_isautogeneratedcreditline'] = true;

                        if (addToList) {
                            current.JournalEntry.DraftLines.push(item);
                            this.current.next(current);
                        }
                        const validation = this.hasValidDraftLines(true);
                        if (!validation.success) {
                            reject(validation);
                            return;
                        }
                        this.save().then(x => resolve(x)).catch(x => reject(x));
                    } else {
                        resolve({ success: true });
                    }
                };

                const supplierNumber = safeInt(current.Supplier.SupplierNumber);
                let draftitem: JournalEntryLineDraft;
                const items = current.JournalEntry.DraftLines;
                draftitem = items.find(
                    x => x.Account ? x.Account.AccountNumber === current.Supplier.SupplierNumber : false
                );
                if (!draftitem) {
                    draftitem = new JournalEntryLineDraft();
                    checkGuid(draftitem);
                    this.supplierInvoiceService
                        .getStatQuery(`?model=account&select=ID as AccountID&filter=AccountNumber eq ${supplierNumber}`)
                        .subscribe(result => {
                            draftitem.AccountID = result[0].AccountID;
                            completeAccount(draftitem, true);
                        }, (err) => {
                            this.errorService.handle(err);
                            reject({ success: false, errorMessage: 'Fant ikke leverandørkonto' });
                        });
                } else {
                    completeAccount(draftitem);
                }
            }
        });
    }

    private registerPayment(done) {
        const bill = this.current.getValue();

        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(bill.RestAmount),
            AmountCurrency: roundTo(bill.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: bill.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: new LocalDate(Date()),
            AgioAccountID: 0,
            BankChargeAccountID: 0,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: bill.DefaultDimensionsID
        };

        const modal = this.modalService.open(UniRegisterPaymentModal, {
            header: 'Registrere betaling for leverandør-faktura: ' + (bill.InvoiceNumber || ''),
            data: paymentData,
            modalConfig: {
                entityName: 'SupplierInvoice',
                currencyCode: this.currencyCodes.find(code => code.ID === bill.CurrencyCodeID).Code,
                currencyExchangeRate: bill.CurrencyExchangeRate,
                entityID: bill.SupplierID,
                supplierID: bill.SupplierID,
            }
        });

        modal.onClose.subscribe((payment) => {
            if (payment) {
                this.supplierInvoiceService.payinvoice(bill.ID, payment)
                    .finally(() => this.busy = false)
                    .subscribe(() => {
                        this.fetchInvoice(bill.ID, true);
                        done();
                    }, err => {
                        this.errorService.handle(err);
                        done('Betaling feilet');
                    });
            } else {
                done();
            }
        });
    }

    private hasValidDraftLines(showErrMsg: boolean): ILocalValidation {
        let msg: string;
        const current = this.current.getValue();
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            const items = current.JournalEntry.DraftLines.filter(x => !x.Deleted);
            let sum = 0, maxSum = 0, minSum = 0, itemSum = 0;
            items.forEach(x => {
                itemSum = x.AmountCurrency || 0;
                maxSum = itemSum > maxSum ? itemSum : maxSum;
                minSum = itemSum < minSum ? itemSum : minSum;
                sum += x.AmountCurrency;
            });
            sum = roundTo(sum);
            if (sum === 0 && (maxSum || minSum)) {
                return { success: true };
            }
            if (sum !== 0) {
                msg = 'Differanse i posteringer';
            }
        }
        msg = msg || 'Kontering mangler';
        if (showErrMsg) {
            this.userMsg(msg);
        }
        return { success: false, errorMessage: msg };
    }

    public onTabClick(tab: ITab) {
        if (tab.isSelected) { return; }
        this.tabs.forEach((t: any) => {
            if (t.name !== tab.name) { t.isSelected = false; }
        });
        tab.isSelected = true;
    }

    private openDocumentsInUseModal() {
        return this.modalService.open(UniConfirmModalWithList, {
            header: 'Ubehandlede dokumenter',
            message: 'Du har ubehandlede dokumenter. Hva ønsker du å gjøre med disse?',
            buttonLabels: {
                accept: 'Fullfør',
                reject: 'Avbryt'
            },
            list: this.files,
            listkey: 'Name',
            listMessage: 'Marker de dokumentene du ønsker å legge i innboksen, de andre slettes.'
        });
    }

    private checkSave(): Promise<boolean> {
        if (!this.hasUnsavedChanges || this.isBlockedSupplier) {
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            const unhandledDocuments = () => {
                if (this.documentsInUse.length > 0) {
                    this.openDocumentsInUseModal().onClose.subscribe((response: IConfirmModalWithListReturnValue) => {
                        if (response.action === ConfirmActions.ACCEPT) {
                            response.list.forEach((bool: boolean, index: number) => {
                                if (bool) {
                                    this.tagFileStatus(this.documentsInUse[index], 0);
                                } else {
                                    this.supplierInvoiceService
                                        .send('files/' + this.documentsInUse[index], undefined, 'DELETE')
                                        .subscribe(null, err => this.errorService.handle(err));
                                }
                            });
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                } else {
                    resolve(true);
                }
            };

            this.modalService.open(UniConfirmModalV2, {
                header: 'Ulagrede endringer',
                message: 'Du har ulagrede endringer. Ønsker du å lagre disse før vi fortsetter?',
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.busy = false;
                    this.save(undefined, false).then(() => {
                        this.busy = false;
                        resolve(true);
                    }).catch(() => {
                        this.busy = false;
                        resolve(false);
                    });
                } else if (response === ConfirmActions.REJECT) {
                    if (this.hasUploaded) {
                        unhandledDocuments();
                    } else {
                        this.documentsInUse.forEach((fileID) => {
                            this.tagFileStatus(fileID, 0);
                        });
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            });


        });
    }

    public onEntryChange(details: { rowIndex: number, item: JournalEntryLineDraft, extra: any }) {
        this.flagUnsavedChanged();
    }

    private getStatustrackConfig() {
        const current = this.current.getValue();
        const statustrack: IStatus[] = [];
        const activeStatus = current.StatusCode;
        this.supplierInvoiceService.statusTypes.forEach((status) => {
            let _state: STATUSTRACK_STATES;
            const _substatuses: IStatus[] = [];
            let _addIt = status.isPrimary;
            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
                if (this.CurrentTask) {
                    _state = STATUSTRACK_STATES.Obsolete;
                }
                _addIt = true;
            }
            if (_addIt) {
                statustrack.push({
                    title: status.Text,
                    state: _state,
                    code: status.Code,
                    substatusList: [],
                });
            }
        });
        return statustrack;
    }

    private getPaymentStatusIndicator() {
        const statusLabel = this.supplierInvoiceService.getPaymentStatusText(this.current.getValue()['PaymentStatus']);

        if (statusLabel) {
            const statusClass = this.getPaymentStatusClass();
            let payments;
            if (this.invoicePayments) {
                this.invoicePayments.sort((payment1, payment2) =>
                    new Date(<any> payment1.PaymentDate).getTime() - new Date(<any> payment2.PaymentDate).getTime()
                );

                const buildLink = (payment) => {
                    if (!payment.JournalEntryNumber) {
                        return '';
                    }
                    const [journalEntryNumber, year] = payment.JournalEntryNumber.split('-');
                    return `#/accounting/transquery?JournalEntryNumber=${journalEntryNumber}&AccountYear=${year}`;
                };

                payments = this.invoicePayments.map(payment => {
                    return {
                        label: payment.AmountCurrency.toFixed(2) + ' ' + payment.CurrencyCode,
                        status: (payment.StatusCode === 31002 || payment.StatusCode === 31003)
                            ? this.paymentService.getStatusText(44006) : this.paymentService.getStatusText(payment.StatusCode),
                        timestamp: new Date(<any> payment.PaymentDate),
                        link: buildLink(payment)
                    };
                });
            }

            return {
                label: statusLabel,
                class: statusClass,
                subStatuses: payments,
            };
        }
    }

    private getPaymentStatusClass() {
        let statusClass = 'info';
        const paymentStatus = this.supplierInvoiceService.getPaymentStatusText(this.current.getValue()['PaymentStatus']);
        switch (paymentStatus) {
            case 'Betalt':
                statusClass = 'good';
            break;
            case 'Delvis betalt':
                statusClass = 'warn';
            break;
            case 'Ubetalt':
                statusClass = 'bad';
            break;
            default:
                statusClass = 'info';
            break;
        }
        return statusClass;
    }

    private get CurrentTask(): Task {
        if (this.current) {
            const document = this.current.getValue();
            const task: Task = <any>( document ? <any>document['_task'] : undefined );
            return task;
        }
    }

    private get currentJournalEntryNumber(): string {
        const doc: SupplierInvoice = this.current.getValue();
        if (doc && doc.JournalEntry && doc.JournalEntry.JournalEntryNumber) {
            return doc.JournalEntry.JournalEntryNumber;
        }
        return '';
    }

    private setupToolbar() {
        const invoice: SupplierInvoice = this.current.getValue();
        const stConfig = this.getStatustrackConfig();
        this.paymentStatusIndicator = this.getPaymentStatusIndicator();
        const jnr = invoice && invoice.JournalEntry && invoice.JournalEntry.JournalEntryNumber
            ? invoice.JournalEntry.JournalEntryNumber
            : undefined;
        this.commentsConfig = {
            entityID: invoice.ID || 0,
            entityType: SupplierInvoice.EntityType
        };
        this.contextMenuItems = [
            {
                label: 'Tøm konteringslisten',
                action: () => this.journalEntryManual.removeJournalEntryData(),
                disabled: () => this.current && this.current.getValue().StatusCode >= StatusCodeSupplierInvoice.Journaled,
            },
            {
                label: 'Viderefakturer',
                action: () => this.openReinvoiceModal(),
            },
            {
                label: 'Kjør tolk (OCR/EHF)',
                action: () => { this.runConverter(this.files, true); }
            },
            {
                label: 'Kjør smart bokføring',
                action: () => { this.runSmartBooking(this.orgNumber, true); }
            },
            {
                label: 'Innstillinger for smart bokføring',
                action: () => { this.openSmartBookingSettingsModal(); }
            }
        ];
        this.toolbarConfig = {
            title: invoice && invoice.ID
                ? `Leverandørfaktura ${invoice.InvoiceNumber || 'kladd'}`
                : 'ACCOUNTING.SUPPLIER_INVOICE.NEW',

            subheads: [{
                title: jnr ? `Bilagsnr. ${jnr}` : '',
                link: jnr && jnr.split('-').length > 1
                    ? `#/accounting/transquery?JournalEntryNumber=${jnr.split('-')[0]}&AccountYear=${jnr.split('-')[1]}`
                    : `#/accounting/transquery?JournalEntryNumber=${jnr}&AccountYear=${moment(invoice.InvoiceDate).year()}`,
            }],
            statustrack: stConfig,
            navigation: {
                prev: () => this.navigateTo('prev'),
                next: () => this.navigateTo('next'),
            },
            entityID: invoice && invoice.ID || null,
            entityType: 'SupplierInvoice',
            contextmenu: this.contextMenuItems
        };

        // Only set add-function when current supplier invoice is saved
        if (this.currentID) {
            this.toolbarConfig.navigation.add = () => {
                this.checkSave().then((res: boolean) => {
                    if (res) {
                        this.newInvoice(false);
                        this.router.navigateByUrl('/accounting/bills/0');
                    }
                });
            };
        }
    }

    private navigateTo(direction = 'next') {
        this.busy = true;
        this.navigate(direction).then(() => this.busy = false, () => this.busy = false);
    }

    private navigate(direction = 'next'): Promise<any> {

        let params = '?model=supplierinvoice';
        let resultFld = 'minid';
        const id = this.current.getValue().ID;
        const status = this.current.getValue().StatusCode;

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\''
                + (id ? ' and id gt ' + id + ' and StatusCode eq ' + status : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\''
                + (id ? ' and id lt ' + id + ' and StatusCode eq ' + status : '');
            resultFld = 'maxid';
        }

        return new Promise((resolve, reject) => {
            this.supplierInvoiceService.getStatQuery(params).subscribe((items) => {
                if (items && items.length > 0) {
                    const key = items[0][resultFld];
                    if (key) {
                        this.fetchInvoice(key, false);
                        resolve(true);
                        return;
                    }
                }
                reject(0); // not found
            }, (err) => {
                reject(-1); // error
            });
        });
    }

    private loadFromFileID(fileID: number | string) {
        this.startUpFileID = [safeInt(fileID)];
        this.numberOfDocuments++;
        this.hasUnsavedChanges = true;
    }

    private linkFiles(entityID: number, fileIDs: number[], newFileStatus?) {
        const requests = (fileIDs || []).map(fileID => {
            const route = `files/${fileID}?action=link&entitytype=SupplierInvoice&entityid=${entityID}`;
            return this.supplierInvoiceService.send(route).pipe(
                tap(() => {
                    if (newFileStatus) {
                        this.tagFileStatus(fileID, newFileStatus);
                    }
                }),
                catchError(err => of(null))
            );
        });

        return requests.length ? forkJoin(requests) : of([]);
    }

    private checkPath() {
        const pageParams = this.pageStateService.getPageState();
        if (pageParams.fileid) {
            this.loadingFiles = true;
            this.loadFromFileID(pageParams.fileid);
        } else {
            this.modalService.open(BillInitModal).onClose.subscribe(fileID => {
                if (fileID) {
                    this.loadingFiles = true;
                    this.loadFromFileID(fileID);
                }
            });
        }
    }

    private tagFileStatus(fileID: number, flagFileStatus: number) {
        this.fileService.getStatistics(
            'model=filetag&select=id,tagname as tagname&top=1&orderby=ID asc&filter=deleted eq 0 and fileid eq ' + fileID
        ).subscribe(tags => {
            let tagname;
            if (tags.Data.length) {
                tagname = tags.Data[0].tagname;
            } else {
                const file = this.files && this.files.find(f => f.ID === fileID);
                tagname = file && this.supplierInvoiceService.isOCR(file) ? 'IncomingMail' : 'IncomingEHF';
            }

            if (tagname) {
                this.fileService.tag(fileID, tagname, flagFileStatus).subscribe(
                    () => {},
                    err => this.errorService.handle(err)
                );
            }
        });
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        let txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":') > 0) {
                txt = trimLength(msg.substr(msg.indexOf('"Message":') + 12, 80) + '..', 200, true);
            }
        }
        this.userMsg(msg, 'Advarsel', 7);
        return txt;
    }

    private userMsg(msg: string, title?: string, delay = 6, isGood = false) {
        this.toast.addToast(
            title || (isGood ? 'Til informasjon' : 'Advarsel'),
            isGood ? ToastType.good : ToastType.bad, delay,
            msg
        );
    }

    private tryUpdateCostAllocationData(invoice) {
        const currentCostAllocationData = this.costAllocationData$.getValue();
        if (invoice.TaxInclusiveAmountCurrency !== currentCostAllocationData.CurrencyAmount ||
            invoice.CurrencyExchangeRate !== currentCostAllocationData.ExchangeRate ||
            invoice.CurrencyCodeID !== currentCostAllocationData.CurrencyCodeID ||
            invoice.DeliveryDate !== currentCostAllocationData.FinancialDate ||
            invoice.InvoiceDate !== currentCostAllocationData.VatDate) {

            currentCostAllocationData.CurrencyAmount = invoice.TaxInclusiveAmountCurrency;
            currentCostAllocationData.CurrencyCodeID = invoice.CurrencyCodeID;
            currentCostAllocationData.ExchangeRate = invoice.CurrencyExchangeRate;
            currentCostAllocationData.FinancialDate = invoice.DeliveryDate;
            currentCostAllocationData.VatDate = invoice.InvoiceDate;
            this.costAllocationData$.next(currentCostAllocationData);
        }
    }

    private tryAddCostAllocation(mode: string = '', runSmartBooking: boolean = true) {
        const current = this.current.getValue();
        if (current.SupplierID > 0 && current.TaxInclusiveAmountCurrency !== 0) {
            this.journalEntryManual.addCostAllocationForSupplier(
                current.SupplierID,
                current.TaxInclusiveAmountCurrency,
                current.CurrencyCodeID,
                current.CurrencyExchangeRate,
                current.DeliveryDate,
                current.InvoiceDate,
                false
            ).then((result: boolean) => {
                if (!result && mode === 'EHF' && runSmartBooking) {
                    this.runSmartBooking(this.orgNumber);
                }
            });
        }
    }

    private resetPostings() {
        this.journalEntryManual.clear();
    }

    public getValidationMessage(supplierID: number, dimensionsID: number = null, dimensions: Dimensions = null) {
        if (!this.accountsWithMandatoryDimensionsIsUsed || !dimensionsID) {
            return;
        }

        this.accountMandatoryDimensionService.getSupplierMandatoryDimensionsReport(
            supplierID, dimensionsID, dimensions
        ).subscribe((report) => {
            this.validationMessage = new ValidationMessage();
            if (report && report.MissingRequiredDimensionsMessage) {
                this.validationMessage.Level = ValidationLevel.Error;
                this.validationMessage.Message = report.MissingRequiredDimensionsMessage;
            } else {
                this.validationMessage.Level = 0;
            }
        });
    }

    private addEHFAccountingCostLines(items: Array<SupplierInvoiceItem>)
    {
        return new Promise((resolve,reject) => {
            if (!items.some(line => line.AccountingCost && line.AccountingCost.trim().toLowerCase().includes('konto='))) {
                resolve(false);
            }

            // Map AccountingCost string to object
            const model = this.current.value;
            const lines = items.map((line) => {
                const newpart = new AccountingCostSuggestion();
                const parts = line.AccountingCost.split(';');
                parts.map(p => {
                    const keyvalue = p.split('=');
                    newpart[keyvalue[0].toLowerCase()] = keyvalue[1];
                });
                newpart.Amount = line.SumTotalExVat;
                newpart.AmountCurrency = line.SumTotalExVatCurrency;
                newpart.Description = line.ItemText;
                newpart.FinancialDate = model.InvoiceDate;

                return newpart;
            });

            // Group lines with equal parameters
            const groupedlines = [];
            lines.forEach(line => {
                const existing = groupedlines.find(groupedline =>
                    line.konto === groupedline.konto &&
                    line.avd === groupedline.avd &&
                    line.mvakode === groupedline.mvakode &&
                    line.prod === groupedline.prod &&
                    line.prosj === groupedline.prosj
                );
                if (existing) {
                    existing.Amount += line.Amount;
                    existing.AmountCurrency += line.AmountCurrency;
                    existing.Description += existing.Description ? ', ' + line.Description : line.Description;
                } else {
                    groupedlines.push(line);
                }
            });

            this.journalEntryManual.journalEntryProfessional.addCostAllocationJournalEntryDataLines(groupedlines).then((value: any) => {
                if (value && value.msg) {
                    resolve(true);
                    this.toast.addToast('EHF bokføring', value.type, ToastTime.medium, value.msg);
                } else {
                    resolve(false);
                }
            });
        });
    }

    private itCanBeAnAsset(current: SupplierInvoice) {
        if (current?.JournalEntry?.DraftLines?.length > 0) {
            const line = current?.JournalEntry?.DraftLines[0];
            return this.accountService.Get(line.AccountID).pipe(
                tap((account) => current.JournalEntry.DraftLines[0].Account = account),
                map((account) => {
                    return account.AccountNumber.toString().startsWith('10')
                        || account.AccountNumber.toString().startsWith('11')
                        || account.AccountNumber.toString().startsWith('12');
                })
            );
        }
        return of(false);
    }
}
