import {ViewChild, Component, SimpleChanges, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {ICommentsConfig} from '../../../common/toolbar/toolbar';
import {
    safeInt,
    roundTo,
    safeDec,
    filterInput,
    trimLength
} from '../../../common/utils/utils';
import {
    Supplier, SupplierInvoice, JournalEntryLineDraft,
    StatusCodeSupplierInvoice, BankAccount, LocalDate,
    InvoicePaymentData, CurrencyCode, CompanySettings, Task,
    Project, Department, User, ApprovalStatus, Approval,
    UserRole,
    TaskStatus,
    Dimensions
} from '../../../../unientities';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, FieldType, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {Location} from '@angular/common';
import {BillSimpleJournalEntryView} from './journal/simple';
import {IOcrServiceResult, OcrValuables, OcrPropertyType} from './ocr';
import {billViewLanguage as lang, billStatusflowLabels as workflowLabels} from './lang';
import {BillHistoryView} from './history/history';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniImageSize, UniImage} from '../../../../../framework/uniImage/uniImage';
import {IUniSearchConfig} from '../../../../../framework/ui/unisearch/index';
import {UniAssignModal, AssignDetails} from './assignmodal';
import {UniAddFileModal} from './addFileModal';
import {UniMath} from '../../../../../framework/core/uniMath';
import {CommentService} from '../../../../../framework/comments/commentService';
import {NumberSeriesTaskIds} from '../../../../models/models';
import {
    UniModalService,
    UniBankAccountModal,
    UniRegisterPaymentModal,
    UniConfirmModalV2,
    UniConfirmModalWithList,
    IConfirmModalWithListReturnValue,
    ConfirmActions,
    UniApproveModal,
    ApprovalDetails
} from '../../../../../framework/uniModal/barrel';
import {
    SupplierInvoiceService,
    SupplierService,
    UniCacheService,
    VatTypeService,
    BankAccountService,
    CurrencyCodeService,
    CurrencyService,
    CompanySettingsService,
    ErrorService,
    PageStateService,
    checkGuid,
    EHFService,
    UniSearchSupplierConfig,
    ModulusService,
    ProjectService,
    DepartmentService,
    UserService,
    ValidationService,
    UniFilesService,
    BankService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import {UniNewSupplierModal} from '../../supplier/details/newSupplierModal';
declare var _;

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
    ocr = 3
}


interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
}

@Component({
    selector: 'uni-bill',
    templateUrl: './bill.html'
})
export class BillView implements OnInit {

    public busy: boolean = true;
    public toolbarConfig: any;
    public formConfig: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<UniFieldLayout[]>;
    public current: BehaviorSubject<SupplierInvoice> = new BehaviorSubject(new SupplierInvoice());
    public currentSupplierID: number = 0;
    public collapseSimpleJournal: boolean = false;
    public hasUnsavedChanges: boolean = false;
    public hasStartupFileID: boolean = false;
    public historyCount: number = 0;
    public ocrData: any;
    public ocrWords: Array<any>;
    public startUpFileID: Array<number> = [];
    // Stores a boolean value per document, true if document is from client pc, not inbox
    private hasUploaded: boolean = false;
    private numberOfDocuments: number = 0;

    private myUser: User;
    private myUserRoles: UserRole[] = [];
    private files: Array<any> = [];
    private unlinkedFiles: Array<number> = [];
    private documentsInUse: number[] = [];
    private supplierIsReadOnly: boolean = false;
    private commentsConfig: ICommentsConfig;
    private formReady: boolean;

    private currencyCodes: Array<CurrencyCode>;
    private companySettings: CompanySettings;
    private uniSearchConfig: IUniSearchConfig;

    @ViewChild(UniForm) public uniForm: UniForm;
    @ViewChild(BillSimpleJournalEntryView) private simpleJournalentry: BillSimpleJournalEntryView;
    @ViewChild(BillHistoryView) private historyView: BillHistoryView;
    @ViewChild(UniImage) public uniImage: UniImage;

    private supplierExpandOptions: Array<string> = [
        'Info',
        'Info.BankAccounts',
        'Info.DefaultBankAccount',
        'CurrencyCode'
    ];

    public tabs: Array<ITab> = [
        { label: lang.tab_invoice, name: 'head', isHidden: true },
        { label: lang.tab_document, name: 'docs', isSelected: true },
        { label: lang.tab_journal, name: 'journal', isHidden: true },
        { label: lang.tab_items, name: 'items', isHidden: true },
        { label: lang.tab_history, name: 'history' }
    ];

    public actions: IUniSaveAction[];

    private rootActions: IUniSaveAction[] = [
        {
            label: lang.tool_save,
            action: (done) => this.save(done),
            main: true,
            disabled: true
        },
        {
            label: lang.tool_save_and_new,
            action: (done) => this.saveAndGetNewDocument(done),
            main: true,
            disabled: true
        },
        {
            label: lang.tool_delete,
            action: (done) => this.tryDelete(done),
            main: false,
            disabled: true
        },
        {
            label: lang.converter,
            action: (done) => { this.runConverter(this.files); done(); },
            main: false,
            disabled: false
        },
    ];

    private projects: Project[];
    private departments: Department[];

    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private route: ActivatedRoute,
        private cache: UniCacheService,
        private vatTypeService: VatTypeService,
        private supplierService: SupplierService,
        private router: Router,
        private location: Location,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private bankAccountService: BankAccountService,
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private ehfService: EHFService,
        private uniSearchSupplierConfig: UniSearchSupplierConfig,
        private modulusService: ModulusService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private modalService: UniModalService,
        private userService: UserService,
        private commentService: CommentService,
        private validationService: ValidationService,
        private uniFilesService: UniFilesService,
        private bankService: BankService
    ) {
        this.actions = this.rootActions;
        userService.getCurrentUser().subscribe( usr => {
            this.myUser = usr;
            this.userService.getRolesByUserId(this.myUser.ID).subscribe(roles => {
                this.myUserRoles = roles;
            });
        });
    }

    public ngOnInit() {
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
            this.current.next(current);
        }
    }

    private initFromRoute() {
        this.route.params.subscribe((params: any) => {
            const id = safeInt(params.id);
            const projectID = safeInt(params['projectID']);
            if (id === this.currentID) { return; } // no-reload-required
            Observable.forkJoin(
                this.companySettingsService.Get(1),
                this.currencyCodeService.GetAll(null),
                this.projectService.GetAll(null),
                this.departmentService.GetAll(null)
            ).subscribe((res) => {
                this.companySettings = res[0];
                this.currencyCodes = res[1];
                this.projects = res[2];
                this.departments = res[3];

                if (id > 0) {
                    this.fetchInvoice(id, true);
                } else {
                    this.newInvoice(true);
                    this.checkPath();
                }
                if (projectID > 0) {
                    this.projectService.Get(projectID).subscribe(project => {
                        const model = this.current.getValue();
                        model.DefaultDimensions.ProjectID = project.ID;
                        model.DefaultDimensions.Project = project;
                        this.current.next(model);
                        this.expandProjectSection();
                    });
                }
                this.extendFormConfig();
            }, err => this.errorService.handle(err));

            this.commentsConfig = {
                entityType: 'SupplierInvoice',
                entityID: id
            };
        });
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
        const projectsField = fields.find(f => f.Property === 'DefaultDimensions.ProjectID');
        projectsField.Options = {
            source: this.projects,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };
        projectsField.Section = 1;
        projectsField.Sectionheader = 'Prosjekt/avdeling';

        const departmentsField = fields.find(f => f.Property === 'DefaultDimensions.DepartmentID');
        departmentsField.Options = {
            source: this.departments,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };
        departmentsField.Section = 1;

        this.fields$.next(fields);
    }

    private addTab(id: number = 0) {
        const label = id > 0 ? trimLength(this.toolbarConfig.title, 12) : lang.title_new;
        this.tabService.addTab({
            name: label,
            url : '/accounting/bills/' + id,
            moduleID: UniModules.Bills,
            active: true
        });
    }

    private initForm() {
        const fields = [
            <any> {
                Property: 'Supplier',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Leverandør',
            },
            <any> {
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato',
                Classes: 'bill-small-field'
            },
            <any> {
                Property: 'PaymentDueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato',
                Classes: 'bill-small-field'
            },
            <any> {
                Property: 'InvoiceNumber',
                FieldType: FieldType.TEXT,
                Label: 'Fakturanummer',
                Classes: 'bill-small-field'
            },
            <any> {
                Property: 'BankAccountID',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Bankkonto',
                Classes: 'bill-small-field'
            },
            <any> {
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID',
                Validations: [this.modulusService.formValidationKID]
            },
            <any> {
                Property: 'TaxInclusiveAmountCurrency',
                FieldType: FieldType.NUMERIC,
                Label: 'Fakturabeløp',
                Classes: 'bill-amount-field'
            },
            <any> {
                Property: 'CurrencyCodeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Valuta',
                Classes: 'bill-currency-field'
            },
            <any> {
                Property: 'DefaultDimensions.ProjectID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Prosjekt'
            },
            <any> {
                Property: 'DefaultDimensions.DepartmentID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Avdeling',
            },
        ];


        this.uniSearchConfig = this.uniSearchSupplierConfig.generateDoNotCreateNew(
            this.supplierExpandOptions,
            (currentInputValue) => {
                return this.modalService.open(UniNewSupplierModal, {
                    data: currentInputValue
                }).onClose.asObservable().map((returnValue) => {
                    if (returnValue && returnValue.Info) {
                        returnValue.Info.BankAccounts = returnValue.Info.BankAccounts || [];
                    }
                    this.uniForm.field('Supplier').focus();
                    return returnValue;
                });
            });

        // Extend config with stuff that can't come from layout system
        const supplierField = fields.find(f => f.Property === 'Supplier');
        supplierField.Options = {
            uniSearchConfig: this.uniSearchConfig
        };

        const sumField = fields.find(f => f.Property === 'TaxInclusiveAmountCurrency');
        sumField.Options = {
            events: {
                enter: (x) => {
                    setTimeout(() => this.focusJournalEntries(), 50);
                }
            },
            decimalLength: 2,
            decimalSeparator: ','
        };

        const currencyField = fields.find(f => f.Property === 'CurrencyCodeID');
        currencyField.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayValue: 'Code',
            debounceTime: 200,
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
                return bankAccount.AccountNumber ? (bankAccount.AccountNumber.substr(0, 4) + ' '
                    + bankAccount.AccountNumber.substr(4, 2) + ' ' + bankAccount.AccountNumber.substr(6)) : '';
            }
        };

        this.fields$ = new BehaviorSubject(fields);
    }

    private focusJournalEntries() {
        // todo: ask Jorge how to fetch new value from the damned "TaxInclusiveAmountCurrency" ?
        this.simpleJournalentry.focus();
    }

    /// =============================

    ///     OCR AND EHF

    /// =============================

    private runConverter(files: Array<any>) {
        if (files && files.length > 0) {
            const file = this.uniImage.getCurrentFile() || files[0];
            if (this.isOCR(file)) {
                this.runOcr(file);
            } else if (this.isEHF(file)) {
                this.runEHF(file);
            }
        }
    }

    /// =============================

    ///     FILES AND EHF

    /// =============================

    private runEHF(file: any) {
        this.userMsg(lang.ehf_running, null, null, true);
        this.ehfService.Get(`?action=parse&fileID=${file.ID}`)
            .subscribe((invoice: SupplierInvoice) => {
                if (invoice.Supplier.Info.DefaultBankAccount) {
                    invoice.Supplier.Info.BankAccounts = invoice.Supplier.Info.BankAccounts.filter(b => 
                        b.AccountNumber !== invoice.Supplier.Info.DefaultBankAccount.AccountNumber
                    );
                }

                this.current.next(invoice);
                this.toast.clear();
                this.handleEHFResult(invoice);
                this.flagUnsavedChanged();
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private handleEHFResult(invoice: SupplierInvoice) {
        // Existing supplier with existing bankaccount
        let existingBankAccount: BankAccount;
        if (invoice.Supplier && invoice.Supplier.Info && invoice.Supplier.Info.BankAccounts) {
            existingBankAccount = invoice.Supplier.Info.BankAccounts.find(b => 
                b.AccountNumber === invoice.BankAccount.IBAN ||
                b.IBAN === invoice.BankAccount.AccountNumber
            );
        } 
        
        if (existingBankAccount)
        {
            invoice.BankAccount = existingBankAccount;
            invoice.BankAccountID = existingBankAccount.ID;
            this.current.next(invoice);
        }
        // New supplier?
        else if (!invoice.SupplierID && invoice.Supplier) {
            const title = `${lang.create_supplier} '${invoice.InvoiceReceiverName}' ?`;
            const msg = `${invoice.InvoiceAddressLine1 || ''} ${invoice.InvoicePostalCode || ''} ${invoice.InvoiceCity || ''}.`
                + ` ${lang.org_number}: ${invoice.Supplier.OrgNumber}`;
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
                    this.supplierService.Post(invoice.Supplier).subscribe(
                        res => this.fetchNewSupplier(res.ID, true),
                        err => this.errorService.handle(err)
                    );
                }
            });
        // Existing supplier and new bankaccount
        } else if (invoice.SupplierID && !invoice.BankAccountID && invoice.BankAccount) {
            const bbanoriban = invoice.BankAccount.AccountNumber
                ? `${lang.create_bankaccount_bban} ${invoice.BankAccount.AccountNumber}`
                : `${lang.create_bankaccount_iban} ${invoice.BankAccount.IBAN}`;
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: `${lang.create_bankaccount_title} ${bbanoriban}?`,
                message: `${lang.create_bankaccount_info} ${invoice.InvoiceReceiverName}`,
                buttonLabels: {
                    accept: 'Opprett konto',
                    cancel: 'Avbryt'
                }
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    if (!invoice.BankAccount.AccountNumber) { // IBAN only
                        this.bankService.validateIBANUpsertBank(invoice.BankAccount.IBAN).subscribe(bankaccount => {
                            invoice.BankAccount.BankID = bankaccount.Bank.ID;
                            this.saveBankAccount(invoice.Supplier, invoice.BankAccount);
                        });
                    } else {
                        this.saveBankAccount(invoice.Supplier, invoice.BankAccount);
                    }
                }
            });
        }
    }

    private saveBankAccount(supplier: Supplier, bankAccount: BankAccount) {
        bankAccount.BusinessRelationID = supplier.BusinessRelationID;
        this.bankAccountService.Post(bankAccount).subscribe(
            res => {
                supplier.Info.BankAccounts.push(res);

                const invoice = this.current.getValue();
                invoice.BankAccount = res;
                invoice.BankAccountID = res.ID;
                this.current.next(invoice);

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

    public onImageClicked(file: any) {
        const current = this.current.getValue();
        const data = {
            entity: 'SupplierInvoice',
            entityID: current.ID || 0,
            fileIDs: null,
            showFileID: file.ID,
            readonly: true,
            size: UniImageSize.large
        };

        if (data.entityID <= 0) {
            data.fileIDs = this.files.map(f => f.ID);
        }
        this.modalService.open(ImageModal, { data: data });
    }

    public onImageDeleted(file: any) {
        const index = this.files.findIndex(f => f.ID === file.ID);
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

    public onFileListReady(files: Array<any>) {

        const current = this.current.value;
        this.files = files;
        if (files && files.length) {
            if (this.files.length !== this.numberOfDocuments) {
                this.hasUploaded = true;
            }
            if (!this.hasValidSupplier()) {
                this.runConverter(files);
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
    }

    private hasValidSupplier() {
        const current = this.current.getValue();
        return (current && current.SupplierID) ? true : false;
    }

    private runOcr(file: any) {
        this.userMsg(lang.ocr_running, null, null, true);
        this.supplierInvoiceService.fetch(`files/${file.ID}?action=ocranalyse`)
            .subscribe((result: IOcrServiceResult) => {
                this.toast.clear();
                this.handleOcrResult(new OcrValuables(result));
                this.flagUnsavedChanged();
                this.ocrData = result;
                this.uniImage.setOcrData(this.ocrData);
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private handleOcrResult(ocr: OcrValuables) {
        if (ocr.Orgno) {
            if (!this.hasValidSupplier()) {
                const orgNo = filterInput(ocr.Orgno);
                this.supplierService.GetAll(`filter=contains(OrgNumber,'${orgNo}')`, ['Info.BankAccounts'])
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
        }

        const current = this.current.getValue();

        current.PaymentID = ocr.PaymentID;
        current.InvoiceNumber = ocr.InvoiceNumber;
        current.TaxInclusiveAmountCurrency = +safeDec(ocr.TaxInclusiveAmount).toFixed(2);
        if (ocr.InvoiceDate) {
            current.InvoiceDate = new LocalDate(moment(ocr.InvoiceDate).toDate());
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
                header: `${lang.create_bankaccount_title} ${bankAccountNumber}?`,
                message: `${lang.create_bankaccount_info} ${supplier.Info.Name}`,
                buttonLabels: {
                    accept: lang.create_bankaccount_accept,
                    cancel: lang.create_bankaccount_reject
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
                const title = `${lang.create_supplier} '${item.navn}' ?`;
                const msg = `${item.foretningsadr || ''} ${item.forradrpostnr || ''} `
                    + `${item.forradrpoststed || ''}. ${lang.org_number}: ${item.orgnr}`;
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
                                item.foretningsadr,
                                item.forradrpostnr,
                                item.forradrpoststed,
                                bankAccount
                            );
                        }
                    });
                } else {
                    this.createSupplier(
                        item.orgnr, item.navn, item.foretningsadr,
                        item.forradrpostnr, item.forradrpoststed, bankAccount
                    );
                }
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
            sup.Info.DefaultBankAccount = <any>{ AccountNumber: bankAccount, BankAccountType: 'supplier' };
        }

        this.supplierService.Post(sup).subscribe(x => {
            this.fetchNewSupplier(x.ID, true);
        }, err => this.errorService.handle(err));
    }

    public onSaveDraftForImage() {
        this.save((msg) => {
            this.userMsg(lang.add_image_now, lang.fyi, 3, true);
        });
    }

    public onFormInput(event) {
        this.flagUnsavedChanged();
    }

    public onFocusEvent(event) {

        if (!this.uniImage.getCurrentFile() || !this.ocrData) { return; }

        this.uniImage.removeHighlight();

        let property = null;

        switch (event.field.Property) {
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
    }

    public onUseWord(event) {
        const invoice = this.current.getValue();
        if (invoice.StatusCode && invoice.StatusCode !== StatusCodeSupplierInvoice.Draft) {
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

        console.log(isValid, invoice);

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

    public onToggleEvent(event) {
        setTimeout(() => {
            this.simpleJournalentry.closeEditor();
        });
    }

    public onFormChange(change: SimpleChanges) {
        try {
            this.onFormChanged(change);
        } catch (err) {
            console.log('onFormChange-Error', err);
        }
    }

    private onFormChanged(change: SimpleChanges) {

        const model = this.current.getValue();

        if (!model) { return; }


        if(change['DefaultDimensions.ProjectID'] || change['DefaultDimensions.DepartmentID']) {
            this.current.next(model);
        }


        if (change['SupplierID']) {
            this.fetchNewSupplier(model.SupplierID);
        }

        if (change['Supplier'])  {
            const newID = change['Supplier'].currentValue.ID;
            if (newID) {
                this.fetchNewSupplier(newID);
            }
            return;
        }

        if (change['InvoiceDate']) {
            let creditdays = model.Supplier ? model.Supplier.CreditDays : null;
            if (!creditdays) { creditdays = this.companySettings.CustomerCreditDays; }
            if (creditdays) {
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

                        this.updateJournalEntryAmountsWhenCurrencyChanges(model);

                        this.current.next(model);
                        this.flagUnsavedChanged();
                    }, err => this.errorService.handle(err)
                    );
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
                    this.updateJournalEntryAmountsWhenCurrencyChanges(model);

                    this.current.next(model);
                    this.flagUnsavedChanged();
                }, err => this.errorService.handle(err));
            } else {
                this.updateJournalEntryAmountsWhenCurrencyChanges(model);
                this.current.next(model);
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

        // need to add _createguid if missing making a new dimension
        if (change['DefaultDimensions.ProjectID'] || change['DefaultDimensions.DepartmentID']) {
            if (!model.DefaultDimensions.ID && !model.DefaultDimensions['_createguid']) {
                model.DefaultDimensions['_createguid'] = this.projectService.getNewGuid();
                this.current.next(model);
            }
        }

        this.flagUnsavedChanged();
    }

    private updateJournalEntryAmountsWhenCurrencyChanges(model: SupplierInvoice) {
        if (model.JournalEntry && model.JournalEntry.DraftLines) {
            model.JournalEntry.DraftLines.forEach(line => {
                line.CurrencyCodeID = model.CurrencyCodeID;

                if (!line.CurrencyCodeID || line.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID) {
                    line.CurrencyExchangeRate = 1;
                } else {
                    line.CurrencyExchangeRate = model.CurrencyExchangeRate;
                }

                line.Amount = UniMath.round(line.AmountCurrency * line.CurrencyExchangeRate);
            });
        }
    }

    private fetchNewSupplier(id: number, updateCombo = false) {
        if (id) {
            this.supplierService.Get(id, this.supplierExpandOptions)
                .subscribe((result: Supplier) => this.setSupplier(result, updateCombo));
        }
    }

    private setSupplier(result: Supplier, updateCombo = true) {


        const current: SupplierInvoice = this.current.getValue();
        this.currentSupplierID = result.ID;
        current.Supplier = result;

        if (current.SupplierID !== result.ID) {
            current.SupplierID = result.ID;
        }

        if (!current.BankAccountID && result.Info.DefaultBankAccountID ||
            (current.BankAccount && current.BankAccount.BusinessRelationID !== result.BusinessRelationID)) {
            current.BankAccountID = result.Info.DefaultBankAccountID;
            current.BankAccount = result.Info.DefaultBankAccount;
        }

        if (result.CurrencyCodeID) {
            current.CurrencyCodeID = result.CurrencyCodeID;
        } else {
            current.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
        }

        // make uniform update itself to show correct values for bankaccount/currency
        this.current.next(current);

        this.setupToolbar();
        this.fetchHistoryCount(this.currentSupplierID);
    }

    private fetchHistoryCount(supplierId: number) {
        const current: SupplierInvoice = this.current.getValue();
        if (current.StatusCode >= StatusCodeSupplierInvoice.Payed) {
            return;
        }
        if (!supplierId) {
            this.setHistoryCounter(0);
            return;
        }
        if (this.historyView) {
            const tab = this.tabs.find(x => x.name === 'history');
            if (tab) {
                this.historyView.getNumberOfInvoices(supplierId, current.ID)
                    .subscribe(x => this.setHistoryCounter(x));
            }
        }
    }

    private setHistoryCounter(value: number) {
        const tab = this.tabs.find(x => x.name === 'history');
        if (tab) {
            tab.count = value;
        }
        if (value > 0) {
           this.simpleJournalentry.lookupHistory();
        }
    }

    private newInvoice(isInitial: boolean) {
        const current = new SupplierInvoice();
        current.StatusCode = 0;
        current.SupplierID = null;
        current.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
        current.CurrencyExchangeRate = 1;
        current.DefaultDimensions = new Dimensions();
        this.current.next(current);

        if (this.uniSearchConfig) {
            this.uniSearchConfig.initialItem$.next(null);
        } else {
            setTimeout(() => {
                if (this.uniSearchConfig) {
                    this.uniSearchConfig.initialItem$.next(null);
                }
            });
        }

        this.currentSupplierID = 0;
        this.simpleJournalentry.clear();
        this.setupToolbar();
        this.addTab(0);
        this.flagUnsavedChanged(true);
        this.initDefaultActions();
        this.flagActionBar(actionBar.delete, false);
        this.supplierIsReadOnly = false;
        this.hasUnsavedChanges = false;
        this.resetDocuments();
        this.files = [];
        this.startUpFileID = [];
        this.setHistoryCounter(0);
        this.busy = false;

        if (!isInitial) {
            this.hasStartupFileID = false;
        }
        try { if (this.uniForm) { this.uniForm.editMode(); } } catch (err) { }
    }

    private flagUnsavedChanged(reset = false) {
        this.flagActionBar(actionBar.save, !reset);
        this.flagActionBar(actionBar.saveWithNewDocument, !reset);
        if (!reset) {
            this.actions.forEach(x => x.main = false);
            this.actions[actionBar.save].main = true;
            this.actions[actionBar.saveWithNewDocument].main = true;

            this.actions = this.actions.concat();
        }

        this.hasUnsavedChanges = !reset;
    }

    private flagActionBar(index: actionBar, enable = true) {
        this.actions[index].disabled = !enable;
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
            const filter = ((it.StatusCode === StatusCodeSupplierInvoice.ToPayment
                && hasJournalEntry) ? ['journal'] : undefined);
            this.addActions(it._links.transitions, list, true, ['assign', 'approve', 'journal', 'pay'], filter);

            // Reassign as admin
            if (!it._links.transitions.hasOwnProperty('reAssign')
                && it.StatusCode === StatusCodeSupplierInvoice.ForApproval
            ) {
                if (this.myUserRoles.find(
                    x => x.SharedRoleName === 'Accounting.Admin' || x.SharedRoleName === 'Administrator')
                ) {
                    const reassign = this.newAction(workflowLabels.reAssign, 'reAssign',
                        `api/biz/supplierinvoices?action=reAssign`, false);
                    list.push(reassign);
                }
            }

            if (this.CurrentTask && this.CurrentTask.StatusCode !== TaskStatus.Complete) {
                const task = this.CurrentTask;
                const hasActiveApproval = task.Approvals && task.Approvals.findIndex( t => t.StatusCode === ApprovalStatus.Active ) >= 0;
                if (hasActiveApproval ) {

                    list.forEach( x => x.main = false );
                    const approval = task.Approvals.find(a => a.UserID === this.myUser.ID);
                    const approvalID = approval ? approval.ID : task.Approvals[0].ID;
                    let action = this.newAction(lang.task_approval, 'task_approval',
                        `api/biz/approvals/${approvalID}?action=approve`, true);
                    list.push(action);
                    action = this.newAction(lang.task_reject, 'task_reject',
                        `api/biz/approvals/${approvalID}?action=approve`, false);
                    list.push(action);

                    // Godkjenn og Bokfør, Godkjenn, Bokfør og Til betaling
                    if (it.StatusCode === StatusCodeSupplierInvoice.ForApproval) {
                        const toJournalAction = this.newAction(
                            lang.task_approve_and_journal,
                            'task_approve_and_journal',
                            `api/biz/approvals/${approvalID}?action=approve`,
                            false, approval === undefined);
                        list.push(toJournalAction);

                        const topaymentaction = this.newAction(
                            lang.task_approve_and_journal_and_topayment,
                            'task_approve_and_journal_and_topayment',
                            `api/biz/approvals/${approvalID}?action=approve`,
                            false, approval === undefined);
                        list.push(topaymentaction);
                    }
                }
            }

            if (it.StatusCode === StatusCodeSupplierInvoice.Journaled || it.StatusCode === StatusCodeSupplierInvoice.ToPayment) {
                list.push(
                    {
                        label: 'Krediter',
                        action: (done) => setTimeout(this.creditSupplierInvoice(done)),
                        main: false,
                        disabled: false
                    }
                );
            }

            // Bokfør og Til betaling
            if (it.StatusCode === StatusCodeSupplierInvoice.Approved) {
                const toPaymentAction =
                    this.newAction(lang.task_journal_and_topayment, 'task_journal_and_topayment', '');
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

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Kreditere faktura?',
            message: 'Vil du kreditere bokføringen for fakturaen? Fakturaen vil settes tilbake til forrige status. '
        });

        modal.onClose.subscribe(response => {
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
                    list.push(this.newAction(label, itemKey, href, setAsMain));
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

    public onTaskApproval(details: ApprovalDetails) {
        if (!details) {
            return;
        }
        if (details.approved || details.rejected) {
            this.supplierInvoiceService.invalidateCache();
            this.fetchInvoice(this.currentID, true);
            if (details.message && details.message !== '') {
                this.addComment(details.message);
            }
        }
    }

    public onReAssignClickOk(details: AssignDetails) {
        const id = this.currentID;
        if (!id || !details) { return; }
        this.supplierInvoiceService.reAssign(id, details)
            .subscribe( x => {
                this.fetchInvoice(id, true);
                if (details.Message && details.Message !== '') {
                    this.addComment(details.Message);
                }
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    public onAssignClickOk(details: AssignDetails) {
        const id = this.currentID;
        if (!id || !details) { return; }
        this.supplierInvoiceService.assign(id, details)
            .subscribe( x => {
                this.fetchInvoice(id, true);
                if (details.Message && details.Message !== '') {
                    this.addComment(details.Message);
                }
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    public openAddFileModal() {
        this.modalService.open(UniAddFileModal).onClose.subscribe((element) => {
            if (element) {
                if (this.files.length === 0) {
                    this.startUpFileID = [safeInt(element.ID)];
                } else {
                    this.uniImage.fetchDocumentWithID(safeInt(element.ID));
                }
                this.numberOfDocuments++;
                this.hasUnsavedChanges = true;
            }
        });
    }

    private handleActionAfterCheckSave(key: string, label: string, href: string, done: any): boolean {
        const current = this.current.getValue();
        switch (key) {
            case 'reAssign':
                this.modalService.open(UniAssignModal, {closeOnClickOutside: false})
                    .onClose.subscribe(details => this.onReAssignClickOk(details));
                done(lang.reAssign_success);
                break;

            case 'assign':
                this.modalService.open(UniAssignModal, {closeOnClickOutside: false})
                    .onClose.subscribe(details => this.onAssignClickOk(details));
                done(lang.assign_success);
                break;

            case 'journal':
                this.journal(true, href).subscribe(result => {
                    if (result) {
                        done(lang.save_success);
                    } else {
                        done();
                    }
                });

                return true;

            case 'smartbooking':
                this.supplierInvoiceService.Action(current.ID, key).subscribe((result) => {
                    this.userMsg(JSON.stringify(result));
                    done('ok');
                }, (err) => {
                    this.errorService.handle(err);
                    done(err);
                });
                return true;

            case 'pay':
            case 'payInvoice':
                this.registerPayment(done);
                return true;

            case 'finish':
                this.modalService.open(UniConfirmModalV2, {
                    header: lang.ask_archive,
                    message: lang.ask_archive + current.InvoiceNumber,
                    warning: lang.warning_action_not_reversable
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        return this.RunActionOnCurrent(key, done, undefined, true);
                    }

                    done();
                });

                return true;

            case 'task_approval':
                this.modalService.open(UniApproveModal, {
                    data: {
                        invoice: current,
                        forApproval: true
                    }
                }).onClose.subscribe((details: ApprovalDetails) => {
                    this.onTaskApproval(details);
                });
                done();
                return true;

            case 'task_reject':
                this.modalService.open(UniApproveModal, {
                    data: {
                        invoice: current,
                        forApproval: false
                    }
                }).onClose.subscribe((details: ApprovalDetails) => {
                    this.onTaskApproval(details);
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
                                    : Observable.of(false);
                            })
                            .subscribe(result => {
                                this.fetchInvoice(current.ID, false);
                                done(result ? 'Godkjent og bokført' : '');
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
                                    : Observable.of(false);
                            })
                            .switchMap(journaled => {
                                return journaled
                                    ? this.sendForPayment()
                                    : Observable.of(false);
                            })
                            .subscribe(result => {
                                this.fetchInvoice(current.ID, false);
                                done(result ? 'Godkjent, bokført og til betaling' : '');
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
                            : Observable.of(false);
                    })
                    .switchMap(journaled => {
                        return journaled
                            ? this.sendForPayment()
                            : Observable.of(false);
                    })
                    .subscribe(result => {
                        this.fetchInvoice(current.ID, false);
                        done(result ? 'Bokført og til betaling' : '');
                    });

                return true;

            default:
                return this.RunActionOnCurrent(key, done, undefined, true);
        }
    }

    private sendForPayment(): Observable<boolean> {
        const current = this.current.getValue();
        return this.supplierInvoiceService.PostAction(current.ID, 'sendForPayment')
                   .switchMap(result => Observable.of(true))
                   .catch(err => Observable.of(false));
    }

    private journal(ask: boolean, href: string): Observable<boolean> {
        const current = this.current.getValue();

        const obs = ask
            ? this.modalService.open(UniConfirmModalV2, {
                header: lang.ask_journal_title + current.Supplier.Info.Name,
                message: lang.ask_journal_msg + current.TaxInclusiveAmountCurrency.toFixed(2) + '?',
                warning: lang.warning_action_not_reversable,
                buttonLabels: {
                    accept: 'Bokfør',
                    cancel: 'Avbryt'
                }
              }).onClose.map(response => response === ConfirmActions.ACCEPT)
            : Observable.of(true);

        return obs.switchMap(response => {
            if (!response) { return Observable.of(false); }

            this.busy = true;
            return Observable.fromPromise(
                this.tryJournal(href).then((status: ILocalValidation) => {
                    this.busy = false;
                    this.hasUnsavedChanges = false;
                    this.fetchInvoice(current.ID, false);
                    return true;
                }).catch((err: ILocalValidation) => {
                    this.busy = false;
                    this.userMsg(err.errorMessage, lang.warning, 10);
                    return false;
                })
            );
        });
    }

    private askApproveAndJournal(): Observable<any> {
        const current = this.current.getValue();
        return this.modalService.open(UniConfirmModalV2, {
            header: lang.ask_approve_and_journal_title + current.Supplier.Info.Name,
            message: lang.ask_journal_msg + current.TaxInclusiveAmountCurrency.toFixed(2) + '?',
            warning: lang.warning_action_not_reversable,
            buttonLabels: {
                accept: lang.task_approve_and_journal,
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    private askApproveAndJournalAndToPayment(): Observable<any> {
        const current = this.current.getValue();
        return this.modalService.open(UniConfirmModalV2, {
            header: lang.ask_approve_and_journal_and_topayment_title + current.Supplier.Info.Name,
            message: lang.ask_journal_msg + current.TaxInclusiveAmountCurrency.toFixed(2) + '?',
            warning: lang.warning_action_not_reversable,
            buttonLabels: {
                accept: lang.task_approve_and_journal_and_topayment,
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    private askJournalAndToPayment(): Observable<any> {
        const current = this.current.getValue();
        return this.modalService.open(UniConfirmModalV2, {
            header: lang.ask_journal_and_topayment_title + current.Supplier.Info.Name,
            message: lang.ask_journal_msg + current.TaxInclusiveAmountCurrency.toFixed(2) + '?',
            warning: lang.warning_action_not_reversable,
            buttonLabels: {
                accept: lang.task_journal_and_topayment,
                cancel: 'Avbryt'
            }
        }).onClose;
    }

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

        return new Promise((resolve, reject) => {

            this.UpdateSuppliersJournalEntry().then(result => {
                const current = this.current.getValue();
                const validation = this.hasValidDraftLines(true);
                if (!validation.success) {
                    reject(validation);
                    return;
                }

                this.supplierInvoiceService.journal(current.ID).subscribe(x => {
                    this.fetchInvoice(current.ID, false);
                    resolve(result);
                    this.userMsg(lang.journaled_ok, null, 6, true);

                }, (err) => {
                    this.errorService.handle(err);
                    reject(err);
                });


            }).catch((err: ILocalValidation) => {
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

    private fetchInvoice(id: number | string, flagBusy: boolean): Promise<any> {
        if (flagBusy) { this.busy = true; }
        this.files = undefined;
        this.setHistoryCounter(0);
        return new Promise((resolve, reject) => {
            this.supplierInvoiceService.Get(
                id,
                [
                    'Supplier.Info.BankAccounts',
                    'JournalEntry.DraftLines.Account,JournalEntry.DraftLines.VatType',
                    'CurrencyCode',
                    'BankAccount',
                    'DefaultDimensions'
                ]).finally( () => {
                this.flagUnsavedChanged(true);
             })
            .subscribe(result => {
                if (flagBusy) { this.busy = false; }
                if (result.Supplier === null) { result.Supplier = new Supplier(); }
                this.current.next(result);
                this.setupToolbar();
                this.addTab(+id);
                this.flagActionBar(actionBar.delete, result.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.flagActionBar(actionBar.ocr, result.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.loadActionsFromEntity();
                this.checkLockStatus();
                this.fetchHistoryCount(result.SupplierID);
                this.uniSearchConfig.initialItem$.next(result.Supplier);
                if (result.DefaultDimensions && result.DefaultDimensions.ProjectID > 0) {
                    this.expandProjectSection();
                }
                resolve('');
            }, (err) => {
                this.errorService.handle(err);
                reject(err);
            });
        });
    }

    private expandProjectSection() {
        const formConfig = this.formConfig.getValue();
        formConfig.sections = {
            1: {isOpen: true}
        };
        this.formConfig.next(formConfig);
    }

    public onFormReady() {
        this.formReady = true;
        this.checkLockStatus();
    }

    private checkLockStatus() {
        if (!this.formReady) {
            return;
        }

        this.supplierIsReadOnly = true;
        const current = this.current.getValue();
        if (current && current.StatusCode) {
            switch (safeInt(current.StatusCode)) {
                case StatusCodeSupplierInvoice.Payed:
                case StatusCodeSupplierInvoice.PartlyPayed:
                case 90001: // rejected
                case 40001: // archived
                    this.uniForm.readMode();
                    return;

                case StatusCodeSupplierInvoice.ToPayment:
                    this.uniForm.readMode();
                    this.uniForm.field('BankAccountID').editMode();
                    this.uniForm.field('PaymentID').editMode();
                    return;

                case StatusCodeSupplierInvoice.Journaled:
                    this.uniForm.readMode();
                    this.uniForm.field('PaymentID').editMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    this.uniForm.field('DefaultDimensions.ProjectID').editMode();
                    this.uniForm.field('DefaultDimensions.DepartmentID').editMode();
                    this.uniForm.field('BankAccountID').editMode();
                    return;

                case StatusCodeSupplierInvoice.ForApproval:
                    this.uniForm.readMode();
                    this.supplierIsReadOnly = false;
                    this.uniForm.field('PaymentID').editMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    this.uniForm.field('DefaultDimensions.ProjectID').editMode();
                    this.uniForm.field('DefaultDimensions.DepartmentID').editMode();
                    return;
            }
        }

        this.uniForm.editMode();
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
            message: lang.ask_delete + (bill.InvoiceNumber || '') + '?',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                return this.delete(done);
            }

            done(lang.delete_canceled);
        });
    }

    public delete(done) {
        const current = this.current.getValue();
        let obs: any;
        if (current.ID) {
            obs = this.supplierInvoiceService.Remove<SupplierInvoice>(current.ID, current);
        } else {
            done(lang.delete_nothing_todo);
        }
        obs.subscribe((result) => {
            done(lang.delete_success);
            this.newInvoice(false);
        }, (error) => {
            let msg = error.statusText;
            if (error._body) {
                msg = trimLength(error._body, 100, true);
                this.showErrMsg(msg, true);
            } else {
                this.userMsg(lang.save_error);
            }
            done(lang.delete_error + ': ' + msg);
        });
    }

    private saveAndGetNewDocument(done?) {
        return this.save(done).then(() => {
            this.supplierInvoiceService.fetch('filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0').subscribe((res) => {
                if (res && res.length > 0) {
                    this.newInvoice(false);
                    this.hasStartupFileID = true;
                    this.startUpFileID = [res[0].ID];
                    if (done) { done(lang.save_success); }
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


    public save(done?, updateRoute = true): Promise<ILocalValidation> {

        this.preSave();

        return new Promise((resolve, reject) => {

            const reload = () => {
                this.fetchInvoice(this.currentID, (!!done))
                .then(() => {
                    resolve({ success: true });
                    if (done) { done(lang.save_success); }
                })
                .catch((msg) => {
                    reject({ success: false, errorMessage: msg });
                    if (done) { done(msg); }
                });
            };

            let obs: any;
            const current = this.current.getValue();

            const saveFunc = () => {
                if (current.ID) {
                    obs = this.supplierInvoiceService.Put(current.ID, current);
                } else {
                    obs = this.supplierInvoiceService.Post(current);
                }
                obs.subscribe((result) => {
                    if ((!current.ID) && updateRoute) {
                        this.currentID = result.ID;
                        this.router.navigateByUrl('/accounting/bills/' + result.ID);
                    }
                    this.currentID = result.ID;
                    this.hasUnsavedChanges = false;
                    this.commentsConfig.entityID = result.ID;
                    if (this.unlinkedFiles.length > 0) {
                        this.linkFiles(result.ID, this.unlinkedFiles, 'SupplierInvoice', 40001).then(
                            () => {
                            this.hasStartupFileID = false;
                            this.resetDocuments();
                            reload();
                        });
                    } else {
                        reload();
                    }
                }, (error) => {
                    let msg = error.statusText;
                    if (error._body) {
                        msg = trimLength(error._body, 150, true);
                        this.showErrMsg(msg, true);
                    } else {
                        this.userMsg(lang.save_error);
                    }
                    if (done) { done(lang.save_error + ': ' + msg); }
                    reject({ success: false, errorMessage: msg });
                });
            };

            const isValidKID: boolean = this.modulusService.isValidKID(current.PaymentID);
            if (current.ID) {
                if (isValidKID) {
                    saveFunc();
                } else {
                    this.modalService.open(UniConfirmModalV2,
                        {
                            buttonLabels: {
                                accept: 'Lagre',
                                cancel: 'Avbryt'
                            },
                            header: 'Vil du lagre?',
                            message: `<li>KID-nr. er ikke gyldig.</li><br>Du kan ignorere dette og lagre om ønskelig.`
                        }).onClose.subscribe((res) => {
                            if (res === ConfirmActions.ACCEPT) {
                                saveFunc();
                            } else {
                                resolve({ success: false });
                                if (done) {
                                    done('Lagring avbrutt');
                                }
                            }
                        });
                }
            } else {
                // Query to see if invoiceID/supplierID combo has been used before
                this.supplierInvoiceService.checkInvoiceData(current.InvoiceNumber, current.SupplierID)
                .subscribe((data: any) => {
                    if ((data && data.Data && data.Data[0].countid > 0) || !isValidKID) {
                        let message: string = '';
                        if (!isValidKID) {
                            message += `<li>KID-nr. er ikke gyldig.</li>`;
                        }
                        if (data && data.Data && data.Data[0].countid > 0) {
                            message += `<li>Faktura med samme fakturanr. og leverandør er allerede lagret.</li>`;
                        }
                        message += `<br>Du kan ignorere dette og lagre om ønskelig.`;
                        this.modalService.open(UniConfirmModalV2,
                            {
                                buttonLabels: {
                                    accept: 'Lagre',
                                    cancel: 'Avbryt'
                                },
                                header: 'Vil du lagre?',
                                message: message
                            }).onClose.subscribe((res) => {
                                if (res === ConfirmActions.ACCEPT) {
                                    saveFunc();
                                } else {
                                    resolve({ success: false });
                                    if (done) {
                                        done('Lagring avbrutt');
                                    }
                                }
                            });
                    } else {
                        saveFunc();
                    }
                });
            }
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
        }
    }

    private preSave(): boolean {

        this.simpleJournalentry.closeEditor();

        let changesMade = false;
        const current = this.current.getValue();
        current.InvoiceDate = current.InvoiceDate || new LocalDate();

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
                current.PaymentInformation = lang.headliner_invoice + current.InvoiceNumber;
                changesMade = true;
            }
        }

        // clear BankAccount, this should be saved/defined on the Supplier, and only the ID should
        // be set on the SupplierInvoice
        if (current.BankAccount) {
            current.BankAccount = null;
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
            const completeAccount = (item: JournalEntryLineDraft, addToList = false) => {
                if (item.AmountCurrency !== current.TaxInclusiveAmountCurrency * -1) {
                    item.FinancialDate = item.FinancialDate || current.DeliveryDate || current.InvoiceDate;
                    item.AmountCurrency = current.TaxInclusiveAmountCurrency * -1;
                    item.Description = item.Description
                        || (lang.headliner_invoice.toLowerCase() + ' ' + current.InvoiceNumber);
                    if (addToList) {
                        current.JournalEntry.DraftLines.push(item);
                    }
                    this.save().then(x => resolve(x)).catch(x => reject(x));
                } else {
                    resolve({ success: true });
                }
            };

            if (current.JournalEntry && current.JournalEntry.DraftLines) {
                const supplierId = safeInt(current.Supplier.SupplierNumber);
                let item: JournalEntryLineDraft;
                const items = current.JournalEntry.DraftLines;
                item = items.find(
                    x => x.Account ? x.Account.AccountNumber === current.Supplier.SupplierNumber : false
                );
                if (!item) {
                    item = new JournalEntryLineDraft();
                    checkGuid(item);
                    this.supplierInvoiceService
                        .getStatQuery(`?model=account&select=ID as AccountID&filter=AccountNumber eq ${supplierId}`)
                        .subscribe(result => {
                            item.AccountID = result[0].AccountID;
                            completeAccount(item, true);
                            return;
                        }, (err) => {
                            this.errorService.handle(err);
                            reject({ success: false, errorMessage: lang.err_supplieraccount_not_found });
                        });
                    return;
                }
                completeAccount(item);
                return;
            }

            reject({ success: false, errorMessage: lang.err_missing_journalEntries });
        });
    }

    private registerPayment(done) {
        const bill = this.current.getValue();

        const paymentData: InvoicePaymentData = {
            Amount: roundTo(bill.RestAmount),
            AmountCurrency: roundTo(bill.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: bill.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: new LocalDate(Date()),
            AgioAccountID: 0,
            BankChargeAccountID: 0,
            AgioAmount: 0
        };

        const modal = this.modalService.open(UniRegisterPaymentModal, {
            header: lang.ask_register_payment + bill.InvoiceNumber,
            data: paymentData,
            modalConfig: {
                entityName: 'SupplierInvoice',
                currencyCode: bill.CurrencyCode.Code,
                currencyExchangeRate: bill.CurrencyExchangeRate
            }
        });

        modal.onClose.subscribe((payment) => {
            if (payment) {
                this.supplierInvoiceService.ActionWithBody(bill.ID, payment, 'payInvoice')
                    .finally(() => this.busy = false)
                    .subscribe((res) => {
                        this.fetchInvoice(bill.ID, true);
                        this.userMsg(lang.payment_ok, null, 3, true);
                        done('Betaling registrert');
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
            const items = current.JournalEntry.DraftLines;
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
                msg = lang.err_diff;
            }
        }
        msg = msg || lang.err_missing_journalEntries;
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

    private checkSave(): Promise<boolean> {
        if (!this.hasUnsavedChanges) {
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            const unhandledDocuments = () => {
                if (this.documentsInUse.length > 0) {
                    this.modalService.open(UniConfirmModalWithList, {
                        header: 'Ubehandlede dokumenter',
                        message: 'Du har ubehandlede dokumenter. Hva ønsker du å gjøre med disse?',
                        buttonLabels: {
                            accept: 'Fullfør',
                            reject: 'Avbryt'
                        },
                        list: this.files,
                        listkey: 'Name',
                        listMessage: 'Marker de dokumentene du ønsker å legge i innboksen, de andre slettes.'

                    }).onClose.subscribe((response: IConfirmModalWithListReturnValue) => {
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
                    code: status.Code
                });
            }
        });

        return statustrack;
    }

    private get CurrentTask(): Task {
        if (this.current) {
            const document = this.current.getValue();
            const task: Task = <any>( document ? <any>document['_task'] : undefined );
            return task;
        }
    }

    private setupToolbar() {
        const doc: SupplierInvoice = this.current.getValue();
        const stConfig = this.getStatustrackConfig();
        const jnr = doc && doc.JournalEntry && doc.JournalEntry.JournalEntryNumber
            ? doc.JournalEntry.JournalEntryNumber
            : undefined;
        this.commentsConfig = {
            entityID: doc.ID || 0,
            entityType: SupplierInvoice.EntityType
        };
        this.toolbarConfig = {
            title: doc && doc.Supplier && doc.Supplier.Info
                ? `${trimLength(doc.Supplier.Info.Name, 20)}`
                : lang.headliner_new,
            subheads: [
                { title: doc && doc.InvoiceNumber ? `${lang.headliner_invoice} ${doc.InvoiceNumber}` : '' },
                { title: doc && doc.Supplier ? `${lang.headliner_supplier} ${doc.Supplier.SupplierNumber}` : '' },
                {
                    title: jnr ? `(${lang.headliner_journal} ${jnr})` : `(${lang.headliner_journal_not})`,
                    link: jnr ? `#/accounting/transquery;JournalEntryNumber=${jnr}` : undefined
                }
            ],
            statustrack: stConfig,
            navigation: {
                prev: () => this.navigateTo('prev'),
                next: () => this.navigateTo('next'),
                add: () => {
                    this.checkSave().then((res: boolean) => {
                        if (res) {
                            this.newInvoice(false);
                            this.router.navigateByUrl('/accounting/bills/0');
                        }
                    });

                }
            },
            entityID: doc && doc.ID ? doc.ID : null,
            entityType: 'SupplierInvoice'
        };
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

        this.simpleJournalentry.closeEditor();


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
        this.hasStartupFileID = true;
        this.startUpFileID = [safeInt(fileID)];
        this.numberOfDocuments++;
        this.hasUnsavedChanges = true;
    }

    private linkFiles(ID: any, fileIDs: Array<any>, entityType: string, flagFileStatus?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                const route = `files/${fileID}?action=link&entitytype=${entityType}&entityid=${ID}`;
                if (flagFileStatus) {
                    this.tagFileStatus(fileID, flagFileStatus);
                }
                this.supplierInvoiceService.send(route).subscribe(x => resolve(x));
            });
        });
    }

    private checkPath() {
        const pageParams = this.pageStateService.getPageState();
        if (pageParams.fileid) {
            this.loadFromFileID(pageParams.fileid);
        }
    }

    private tagFileStatus(fileID: number, flagFileStatus: number) {
        const file = this.files.find(x => x.ID === fileID);
        const tag = this.isOCR(file) ? 'IncomingMail' : 'IncomingEHF';

        this.supplierInvoiceService.send(
            `filetags/${fileID}`,
            undefined,
            undefined,
            { FileID: fileID, TagName: tag, Status: flagFileStatus }
        ).subscribe(null, err => this.errorService.handle(err));
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        let txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":') > 0) {
                txt = trimLength(msg.substr(msg.indexOf('"Message":') + 12, 80) + '..', 200, true);
            }
        }
        this.userMsg(msg, lang.warning, 7);
        return txt;
    }

    private userMsg(msg: string, title?: string, delay = 3, isGood = false) {
        this.toast.addToast(
            title || (isGood ? lang.fyi : lang.warning),
            isGood ? ToastType.good : ToastType.bad, delay,
            msg
        );
    }

    private isOCR(file: any): Boolean {
        if (!file.Name) { return false; }

        if (file.ContentType) {
            if (file.ContentType === 'application/xml') { return false; }
            if (file.ContentType.startsWith('image')) { return true; }
        }
        if (file.Extension && file.Extension === '.xml') { return false; }

        const ocrformats = ['pdf', 'png', 'jpeg', 'jpg', 'gif', 'tiff'];
        const ending = file.Name.toLowerCase().split('.').pop();

        return ocrformats.indexOf(ending) >= 0 || ending.indexOf('pdf') >= 0;
    }

    private isEHF(file): Boolean {
        const name = (file.Name || '').toLowerCase();
        return name.indexOf('.xml') !== -1 || name.indexOf('.ehf') !== -1;
    }
}
