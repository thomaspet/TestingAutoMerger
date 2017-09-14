import {ViewChild, Component, SimpleChanges} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {safeInt, roundTo, safeDec, filterInput, trimLength,
    createFormField, FieldSize, ControlTypes} from '../../../common/utils/utils';
import {
    Supplier, SupplierInvoice, JournalEntryLineDraft,
    StatusCodeSupplierInvoice, BankAccount, LocalDate,
    InvoicePaymentData, CurrencyCode, CompanySettings, Task,
    Project, Department
} from '../../../../unientities';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, FieldType} from '../../../../../framework/ui/uniform/index';
import {Location} from '@angular/common';
import {BillSimpleJournalEntryView} from './journal/simple';
import {IOcrServiceResult, OcrValuables, OcrPropertyType} from './ocr';
import {billViewLanguage as lang, billStatusflowLabels as workflowLabels} from './lang';
import {BillHistoryView} from './history/history';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniImageSize, UniImage} from '../../../../../framework/uniImage/uniImage';
import {IUniSearchConfig} from '../../../../../framework/ui/unisearch/index';
import {UniAssignModal, AssignDetails} from './assignmodal';
import {UniApproveModal, ApprovalDetails} from './approvemodal';
import {UniMath} from '../../../../../framework/core/uniMath';
import {NumberSeriesTaskIds} from '../../../../models/models';
import {
    UniModalService,
    UniBankAccountModal,
    UniRegisterPaymentModal,
    UniConfirmModalV2,
    ConfirmActions
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
    DepartmentService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import * as moment from 'moment';
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
    delete = 1,
    ocr = 2
};


interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
}

@Component({
    selector: 'uni-bill',
    templateUrl: './bill.html'
})
export class BillView {

    public busy: boolean = true;
    public toolbarConfig: any;
    public formConfig: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<UniFieldLayout[]>;
    public current: BehaviorSubject<SupplierInvoice> = new BehaviorSubject(new SupplierInvoice());
    public currentSupplierID: number = 0;
    public collapseSimpleJournal: boolean = false;
    public hasUnsavedChanges: boolean = false;
    public currentFileID: number = 0;
    public hasStartupFileID: boolean = false;
    public historyCount: number = 0;
    public ocrData: any;

    private files: Array<any>;
    private fileIds: Array<number> = [];
    private unlinkedFiles: Array<number> = [];
    private supplierIsReadOnly: boolean = false;
    private commentsConfig: any;
    private formReady: boolean;

    private currencyCodes: Array<CurrencyCode>;
    private companySettings: CompanySettings;
    private uniSearchConfig: IUniSearchConfig;

    @ViewChild(UniForm) public uniForm: UniForm;
    @ViewChild(BillSimpleJournalEntryView) private simpleJournalentry: BillSimpleJournalEntryView;
    @ViewChild(BillHistoryView) private historyView: BillHistoryView;
    @ViewChild(ImageModal) public imageModal: ImageModal;
    @ViewChild(UniImage) public uniImage: UniImage;
    @ViewChild(UniAssignModal) private assignModal: UniAssignModal;
    @ViewChild(UniApproveModal) private approveModal: UniApproveModal;

    // tslint:disable:max-line-length
    private supplierExpandOptions: Array<string> = ['Info', 'Info.BankAccounts', 'Info.DefaultBankAccount', 'CurrencyCode'];

    private tabLabel: string;
    public tabs: Array<ITab> = [
        { label: lang.tab_invoice, name: 'head', isHidden: true },
        { label: lang.tab_document, name: 'docs', isSelected: true },
        { label: lang.tab_journal, name: 'journal', isHidden: true },
        { label: lang.tab_items, name: 'items', isHidden: true },
        { label: lang.tab_history, name: 'history' }
    ];

    public actions: IUniSaveAction[];

    private rootActions: IUniSaveAction[] = [
        { label: lang.tool_save, action: (done) => this.save(done), main: true, disabled: true },
        { label: lang.tool_delete, action: (done) => this.tryDelete(done), main: false, disabled: true },
        { label: lang.converter, action: (done) => this.runConverter(this.files).then(() => done()), main: false, disabled: false },
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
        private modalService: UniModalService
    ) {
        this.actions = this.rootActions;
    }

    public ngOnInit() {
        this.initForm();
        this.initFromRoute();
    }

    public canDeactivate() {
        return this.checkSave();
    }

    private get currentID(): number {
        let current = this.current.getValue();
        return (current ? current.ID : 0);
    }

    private initFromRoute() {
        this.route.params.subscribe((params: any) => {
            var id = params.id;

            if (safeInt(id) > 0) {
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

                    this.updateTabInfo(id);
                    this.fetchInvoice(id, true);
                    this.extendFormConfig();
                }, err => this.errorService.handle(err));
            } else {
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

                    this.newInvoice(true);
                    this.checkPath();
                    this.extendFormConfig();
                }, err => this.errorService.handle(err));
            }

            this.commentsConfig = {
                entityType: SupplierInvoice.EntityType,
                entityID: +params.id
            };
        });

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

        let projectsField = fields.find(f => f.Property === 'DefaultDimensions.ProjectID');
        projectsField.Options = {
            source: this.projects,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let departmentsField = fields.find(f => f.Property === 'DefaultDimensions.DepartmentID');
        departmentsField.Options = {
            source: this.departments,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.fields$.next(fields);
    }

    private updateTabInfo(id?: number | string, label?: string) {
        let current = this.current.getValue();
        id = id || (current ? current.ID : 0);
        this.tabLabel = label || lang.title_with_id + id;
        var url = '/accounting/bills/' + id;
        this.tabService.addTab({ name: this.tabLabel, url: url, moduleID: UniModules.Bills, active: true });
        if (this.location.path(false) !== url) {
            this.location.go(url);
        }
    }

    private initForm() {
        let fields = [
            <any> {
                Property: 'SupplierID',
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
                Label: 'KID'
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
                Label: 'Prosjekt',
            },
            <any> {
                Property: 'DefaultDimensions.DepartmentID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Avdeling',
            },
        ];

        this.uniSearchConfig = this.uniSearchSupplierConfig
            .generate(this.supplierExpandOptions);

        // Extend config with stuff that can't come from layout system
        let supplierField = fields.find(f => f.Property === 'SupplierID');
        supplierField.Options = {
            uniSearchConfig: this.uniSearchConfig,
            valueProperty: 'ID'
        };

        let sumField = fields.find(f => f.Property === 'TaxInclusiveAmountCurrency');
        sumField.Options = {
            events: {
                enter: (x) => {
                    setTimeout(() => this.focusJournalEntries(), 50);
                }
            },
            decimalLength: 2,
            decimalSeparator: ','
        };

        let currencyField = fields.find(f => f.Property === 'CurrencyCodeID');
        currencyField.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayValue: 'Code',
            debounceTime: 200,
        };

        let bankAccountField = fields.find(f => f.Property === 'BankAccountID');
        bankAccountField.Options = {
            entity: BankAccount,
            listProperty: 'Supplier.Info.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'BankAccount',
            storeIdInProperty: 'BankAccountID',
            editor: (bankAccount: BankAccount) => new Promise((resolve, reject) => {
                let invoice: SupplierInvoice = this.current.getValue();
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
        };


        // var supIdCol = createFormField('SupplierID', lang.col_supplier, FieldType.UNI_SEARCH, FieldSize.Full);
        // supIdCol.Options = {
        //     uniSearchConfig: this.uniSearchConfig,
        //     valueProperty: 'ID'
        // };

        // todo: use NumericInput when it works properly
        // var sumCol = createFormField('TaxInclusiveAmountCurrency', lang.col_total, ControlTypes.TextInput, FieldSize.Double);
        // sumCol.Classes += ' combofield';
        // sumCol.Options = {
        //     events: {
        //         enter: (x) => {
        //             setTimeout(() => this.focusJournalEntries(), 50);
        //         }
        //     },
        //     decimalLength: 2,
        //     decimalSeparator: ','
        // };

        // var currencyCodeCol = createFormField('CurrencyCodeID', lang.col_currency_code, FieldType.DROPDOWN, FieldSize.Double);
        // currencyCodeCol.Classes += ' combofield';
        // currencyCodeCol.Options = {
        //     source: this.currencyCodes,
        //     valueProperty: 'ID',
        //     displayValue: 'Code',
        //     debounceTime: 200,
        // };

        // let bankAccountCol = createFormField('BankAccountID', lang.col_bank, ControlTypes.MultivalueInput, FieldSize.Double);
        // bankAccountCol.Options = {
        //     entity: BankAccount,
        //     listProperty: 'Supplier.Info.BankAccounts',
        //     displayValue: 'AccountNumber',
        //     linkProperty: 'ID',
        //     storeResultInProperty: 'BankAccount',
        //     storeIdInProperty: 'BankAccountID',
        //     editor: (bankaccount: BankAccount) => new Promise((resolve, reject) => {
        //         let current: SupplierInvoice = this.current.getValue();

        //         if (!bankaccount.ID) {
        //             bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
        //             bankaccount.BankAccountType = 'supplier';
        //             bankaccount.BusinessRelationID =
        //                 current.Supplier ? current.Supplier.BusinessRelationID : null;
        //             bankaccount.ID = 0;
        //         }

        //         this.bankAccountModal.confirm(bankaccount, false).then(res => {
        //             if (res.status === ConfirmActions.ACCEPT) {
        //                 // save the bank account to the supplier
        //                 let changedBankaccount = res.model;
        //                 if (changedBankaccount.ID === 0) {
        //                     this.bankAccountService.Post(changedBankaccount)
        //                         .subscribe((savedBankAccount: BankAccount) => {
        //                             current.BankAccountID = savedBankAccount.ID;
        //                             this.current.next(current); // if we update current we emit the new value
        //                             resolve(savedBankAccount);
        //                         },
        //                         err => {
        //                             this.errorService.handle(err);
        //                             reject('Feil ved lagring av bankkonto');
        //                         }
        //                         );
        //                 } else {
        //                     throw new Error('Du kan ikke endre en bankkonto herfra');
        //                 }
        //             }
        //         });
        //     })
        // };

        // var list = [
        //     supIdCol,
        //     createFormField('InvoiceDate', lang.col_date, ControlTypes.LocalDate, FieldSize.Double),
        //     createFormField('PaymentDueDate', lang.col_due, ControlTypes.LocalDate, FieldSize.Double),
        //     createFormField('InvoiceNumber', lang.col_invoice, undefined, FieldSize.Double),
        //     bankAccountCol,
        //     createFormField('PaymentID', lang.col_kid, ControlTypes.TextInput, FieldSize.Double),
        //     sumCol,
        //     currencyCodeCol
        // ];

        this.fields$ = new BehaviorSubject(fields);
    }

    private focusJournalEntries() {
        // todo: ask Jorge how to fetch new value from the damned "TaxInclusiveAmountCurrency" ?
        this.simpleJournalentry.focus();
    }

    /// =============================

    ///     OCR AND EHF

    /// =============================

    private runConverter(files: Array<any>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (files && files.length > 0) {
                let firstFile = files[0];
                if (this.isOCR(firstFile)) {
                    this.runOcr(firstFile);
                } else if (this.isEHF(firstFile)) {
                    this.runEHF(firstFile);
                }
            }
        });
    }

    /// =============================

    ///     FILES AND EHF

    /// =============================

    private runEHF(file: any) {
        this.userMsg(lang.ehf_running, null, null, true);
        this.ehfService.Get(`?action=parse&fileID=${file.ID}`)
            .subscribe( (invoice: SupplierInvoice) => {
                this.current.next(invoice);
                this.toast.clear();
                this.handleEHFResult(invoice);
                this.flagUnsavedChanged();
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private handleEHFResult(invoice: SupplierInvoice) {
        // Supplier
        if (!invoice.SupplierID && invoice.Supplier) {
            let title = `${lang.create_supplier} '${invoice.InvoiceReceiverName}' ?`;
            let msg = `${invoice.InvoiceAddressLine1 || ''} ${invoice.InvoicePostalCode || ''}. ${lang.org_number}: ${invoice.Supplier.OrgNumber}`;
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
        }

        if (!invoice.BankAccountID && invoice.BankAccount) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: `${lang.create_bankaccount_title} ${invoice.BankAccount.AccountNumber}?`,
                message: `${lang.create_bankaccount_info} ${invoice.InvoiceReceiverName}`,
                buttonLabels: {
                    accept: 'Opprett konto',
                    cancel: 'Avbryt'
                }
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.bankAccountService.Post(invoice.BankAccount).subscribe(
                        res => {
                            let bill = this.current.getValue();
                            bill.BankAccountID = res.ID;
                            this.current.next(bill);
                        },
                        err => this.errorService.handle(err)
                    );
                }
            });
        }
    }

    /// =============================

    ///     FILES AND OCR

    /// =============================

    public onImageClicked(file) {
        let current = this.current.getValue();
        let entityID = current.ID || 0;

        // makes a new array without duplicates of file.ID
        if (this.fileIds.length > 0) {
            this.fileIds = this.fileIds.filter(x => x !== parseInt(file.ID));
        }

        if (entityID > 0) {
            this.imageModal.openReadOnly('SupplierInvoice', entityID, file.ID, UniImageSize.large);
        } else {
            // if image is not bound to an entity push its id to the fileIds array,
            // parse it to a number and open that image
            this.fileIds.push(parseInt(file.ID));
            this.imageModal.openReadOnlyFileIds('SupplierInvoice', this.fileIds, file.ID, UniImageSize.large);
        }
    }

    public onFileListReady(files: Array<any>) {
        this.files = files;
        if (files && files.length) {
            if (!this.hasValidSupplier()) {
                this.runConverter(files);
            }
            this.checkNewFiles(files);
        }
    }

    private checkNewFiles(files: Array<any>) {

        if ((!files) || files.length === 0) {
            return;
        }
        let firstFile = files[0];

        const current = this.current.getValue();
        if (!current.ID) {
            if (this.unlinkedFiles.findIndex(x => x === firstFile.ID) < 0) {
                this.unlinkedFiles.push(firstFile.ID);
                if (this.hasStartupFileID !== firstFile.ID) {
                    this.tagFileStatus(firstFile.ID, 0);
                }
            }
        }
    }

    private hasValidSupplier() {
        let current = this.current.getValue();
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

            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private handleOcrResult(ocr: OcrValuables) {
        if (ocr.Orgno) {
            if (!this.hasValidSupplier()) {
                var orgNo = filterInput(ocr.Orgno);
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


                        let supplier = result[0];

                        if (ocr.BankAccountCandidates.length > 0) {
                            let bankAccount: BankAccount;

                            for (let i = 0; i < ocr.BankAccountCandidates.length && !bankAccount; i++) {
                                let candidate = ocr.BankAccountCandidates[i];

                                let existingAccount = supplier.Info.BankAccounts
                                    .find(x => x.AccountNumber === candidate);

                                if (existingAccount) {
                                    bankAccount = existingAccount;
                                }
                            }

                            if (bankAccount) {
                                let current = this.current.getValue();
                                current.BankAccountID = bankAccount.ID;
                                current.BankAccount = bankAccount;
                                this.current.next(current);
                            } else {
                                const modal = this.modalService.open(UniConfirmModalV2, {
                                    header: `${lang.create_bankaccount_title} ${ocr.BankAccount}?`,
                                    message: `${lang.create_bankaccount_info} ${supplier.Info.Name}`,
                                    buttonLabels: {
                                        accept: lang.create_bankaccount_accept,
                                        cancel: lang.create_bankaccount_reject
                                    }
                                });

                                modal.onClose.subscribe(response => {
                                    if (response === ConfirmActions.ACCEPT) {
                                        let newBankAccount = new BankAccount();
                                        newBankAccount.AccountNumber = ocr.BankAccount;
                                        newBankAccount.BusinessRelationID = supplier.BusinessRelationID;
                                        newBankAccount.BankAccountType = 'supplier';

                                        this.bankAccountService.Post(newBankAccount).subscribe(
                                            (res: BankAccount) => {
                                                supplier.Info.BankAccounts.push(res);

                                                let current = this.current.getValue();
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

                        this.setSupplier(supplier);
                    },
                    err => this.errorService.handle(err));
            }
        }


        let current = this.current.getValue();

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

    private findSupplierViaPhonebook(orgNo: string, askUser: boolean, bankAccount?: string) {
        this.supplierInvoiceService.fetch('business-relations/?action=search-data-hotel&searchText=' + orgNo).subscribe(x => {
            if (x.Data && x.Data.entries && x.Data.entries.length > 0) {
                var item = x.Data.entries[0];
                var title = `${lang.create_supplier} '${item.navn}' ?`;
                var msg = `${item.foretningsadr || ''} ${item.forradrpostnr || ''} ${item.forradrpoststed || ''}. ${lang.org_number}: ${item.orgnr}`;
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
                    this.createSupplier(item.orgnr, item.navn, item.foretningsadr, item.forradrpostnr, item.forradrpoststed, bankAccount);
                }
            }
        }, err => this.errorService.handle(err));
    }

    private createSupplier(orgNo: string, name: string, address: string, postalCode: string, city: string, bankAccount?: string) {
        var sup = new Supplier();
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

        if (!this.currentFileID || !this.ocrData) { return; }

        this.uniImage.removeHighlight();

        let property = null;

        switch (event.field.Property) {
            case 'InvoiceDate':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.InvoiceDate);
                break;
            case 'PaymentDueDate':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.DueDate);
                break;
            case 'InvoiceNumber':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.InvoiceNumber);
                break;
            case 'BankAccountID':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.BankAccountNumber);
                break;
            case 'PaymentID':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.CustomerIdentificationNumber);
                break;
            case 'TaxInclusiveAmountCurrency':
                property = this.ocrData.InterpretedProperties.find(x => x.OcrProperty.PropertyType === OcrPropertyType.TotalAmount);
                break;
        }

        let candidate = property ? property.ProposedCandidate : null;

        if (candidate) {
            this.uniImage.highlight(
                [candidate.Left, candidate.Top, candidate.Width, candidate.Height],
                this.ocrData.ImageWidth,
                this.ocrData.ImageHeight
            );
        }
    }

    public onFormChange(change: SimpleChanges) {

        let model = this.current.getValue();

        if (change['SupplierID']) {
            this.fetchNewSupplier(model.SupplierID);
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
                let currencyDate: LocalDate = model.InvoiceDate ? model.InvoiceDate : new LocalDate();
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
                this.currencyService.getCurrencyExchangeRate(model.CurrencyCodeID, this.companySettings.BaseCurrencyCodeID, model.InvoiceDate)
                    .subscribe(res => {
                        model.CurrencyExchangeRate = res.ExchangeRate;
                        this.updateJournalEntryAmountsWhenCurrencyChanges(model);

                        this.current.next(model);
                        this.flagUnsavedChanged();
                    }, err => this.errorService.handle(err)
                );
            } else {
                this.updateJournalEntryAmountsWhenCurrencyChanges(model);
                this.current.next(model);
            }
        }

        // need to push an update if other fields changes to make the journal entry grid update itself
        if (change['TaxInclusiveAmountCurrency'] || change['InvoiceNumber'] || change['PaymentID'] || change['BankAccount']) {
            if (change['TaxInclusiveAmountCurrency']) {
                model.TaxInclusiveAmountCurrency = roundTo(safeDec(change['TaxInclusiveAmountCurrency'].currentValue), 2);
                change['TaxInclusiveAmountCurrency'].currentValue = model.TaxInclusiveAmountCurrency;
            }
            this.current.next(model);
        }

        // need to add _createguid if missing making a new dimension
        if (change['DefaultDimensions.ProjectID']) {
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
        let current: SupplierInvoice = this.current.getValue();
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
        let current: SupplierInvoice = this.current.getValue();
        if (current.StatusCode >= StatusCodeSupplierInvoice.Payed) {
            return;
        }
        if (!supplierId) {
            this.setHistoryCounter(0);
            return;
        }
        if (this.historyView) {
            let tab = this.tabs.find(x => x.name === 'history');
            if (tab) {
                this.historyView.getNumberOfInvoices(supplierId, current.ID)
                    .subscribe(x => this.setHistoryCounter(x));
            }
        }
    }

    private setHistoryCounter(value: number) {
        let tab = this.tabs.find(x => x.name === 'history');
        if (tab) {
            tab.count = value;
        }
        if (value > 0) {
           this.simpleJournalentry.lookupHistory();
        }
    }

    private newInvoice(isInitial: boolean) {
        let current = new SupplierInvoice();
        current.StatusCode = 0;
        current.SupplierID = null;
        current.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
        current.CurrencyExchangeRate = 1;

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

        this.tabLabel = lang.title_new;
        this.currentSupplierID = 0;
        this.simpleJournalentry.clear();
        this.tabService.currentActiveTab.name = this.tabLabel;
        this.setupToolbar();
        this.flagUnsavedChanged(true);
        this.initDefaultActions();
        this.flagActionBar(actionBar.delete, false);
        this.supplierIsReadOnly = false;
        this.hasUnsavedChanges = false;
        this.currentFileID = 0;
        this.fileIds = [];
        this.unlinkedFiles = [];
        this.files = undefined;
        this.setHistoryCounter(0);
        this.busy = false;

        if (!isInitial) {
            this.hasStartupFileID = false;
        }
        try { if (this.uniForm) { this.uniForm.editMode(); } } catch (err) { }
    }

    private flagUnsavedChanged(reset = false) {
        this.flagActionBar(actionBar.save, !reset);
        if (!reset) {
            this.actions.forEach(x => x.main = false);
            this.actions[actionBar.save].main = true;

            this.actions = this.actions.concat();
        }

        this.hasUnsavedChanges = !reset;
    }

    private flagActionBar(index: actionBar, enable = true) {
        this.actions[index].disabled = !enable;
    }

    private loadActionsFromEntity() {
        var it: any = this.current.getValue();
        if (it && it._links) {
            var list: IUniSaveAction[] = [];
            this.rootActions.forEach(x => list.push(x));
            var hasBilag = (!!(it.JournalEntry && it.JournalEntry.JournalEntryNumber));
            let filter = ((it.StatusCode === 30105 && hasBilag) ? ['journal'] : undefined);
            this.addActions(it._links.transitions, list, true, ['assign', 'approve', 'journal', 'pay'], filter);
            /* todo: add smartbooking whenever it works properly..
            if (it._links.actions && it._links.actions.smartbooking) {
                if (it.StatusCode < StatusCodeSupplierInvoice.Journaled) {
                    list.push(this.newAction(
                        workflowLabels.smartbooking,
                        'smartbooking',
                        it._links.actions.smartbooking.href, false
                    ));
                }
            } */
            if (this.CurrentTask) {
                let task = this.CurrentTask;
                if (task.Approvals && task.Approvals.length > 0) {
                    list.forEach( x => x.main = false );
                    let approval = task.Approvals[0];
                    let action = this.newAction(lang.task_approval, 'task_approval',
                        `api/biz/approvals/${approval.ID}?action=approve`, true);
                    list.push(action);
                    action = this.newAction(lang.task_reject, 'task_reject',
                        `api/biz/approvals/${approval.ID}?action=approve`, false);
                    list.push(action);
                }
            }
            this.actions = list;
        } else {
            this.initDefaultActions();
        }
    }

    private initDefaultActions() {
        this.actions = this.rootActions;
    }

    private newAction(label: string, itemKey: string, href: string, asMain = false): any {
        return {
            label: label,
            action: (done) => {
                this.handleAction(itemKey, label, href, done);
            },
            main: asMain,
            disabled: false
        };
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[], filters?: string[]) {
        var ix = 0, setAsMain = false, isFiltered = false, key: string;
        var ixFound = -1;
        if (!linkNode) { return; }

        for (key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {

                isFiltered = filters ? (filters.findIndex(x => x === key) >= 0) : false;
                if (!isFiltered) {
                    ix++;
                    setAsMain = mainFirst ? ix <= 1 : false;
                    // prioritized main?
                    if (priorities) {
                        let ixPri = priorities.findIndex(x => x === key);
                        if (ixPri >= 0 && (ixPri < ixFound || ixFound < 0)) {
                            ixFound = ixPri;
                            setAsMain = true;
                        }
                    }
                    // reset main?
                    if (setAsMain) { list.forEach(x => x.main = false); }

                    let itemKey = key;
                    let label = this.mapActionLabel(itemKey);
                    let href = linkNode[key].href;
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
        if (details.approved || details.rejected) {
            this.supplierInvoiceService.invalidateCache();
            this.fetchInvoice(this.currentID, true);
            if (details.rejected) {
                // todo: update toolbar comments...
            }
        }
        this.approveModal.close();
    }

    public onAssignClickOk(details: AssignDetails) {
        let id = this.currentID;
        if (!id) { return; }
        this.assignModal.goBusy(true);
        this.supplierInvoiceService.assign(id, details)
            .finally( () => this.assignModal.goBusy(false) )
            .subscribe( x => {
                this.assignModal.close();
                this.fetchInvoice(id, true);
            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private handleActionAfterCheckSave(key: string, label: string, href: string, done: any): boolean {
        let current = this.current.getValue();
        switch (key) {
            case 'assign':
                this.assignModal.open();
                done();
                break;

            case 'journal':
                this.modalService.open(UniConfirmModalV2, {
                    header: lang.ask_journal_title + current.Supplier.Info.Name,
                    message: lang.ask_journal_msg + current.TaxInclusiveAmountCurrency.toFixed(2) + '?',
                    warning: lang.warning_action_not_reversable,
                    buttonLabels: {
                        accept: 'Bokfør',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.busy = true;
                        this.tryJournal(href).then((status: ILocalValidation) => {
                            this.busy = false;
                            this.hasUnsavedChanges = false;
                            done(lang.save_success);
                        }).catch((err: ILocalValidation) => {
                            this.busy = false;
                            done(err.errorMessage);
                            this.userMsg(err.errorMessage, lang.warning, 10);
                        });
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
                        return this.RunActionOnCurrent(key, done);
                    }

                    done();
                });

                return true;

            case 'task_approval':
                this.approveModal.open(current, true);
                done();
                return true;

            case 'task_reject':
                this.approveModal.open(current, false);
                done();
                return true;

            default:
                return this.RunActionOnCurrent(key, done);
        }
    }

    private RunActionOnCurrent(action: string, done?: (msg) => {}, successMsg?: string): boolean {
        let current = this.current.getValue();
        this.busy = true;
        this.supplierInvoiceService.PostAction(current.ID, action)
            .finally(() => this.busy = false)
            .subscribe(() => {
                this.fetchInvoice(current.ID, true);
                if (done) { done(successMsg); }
            }, (err) => {
                this.errorService.handle(err);
                done(trimLength(err, 100, true));
            });
        return true;
    }

    private tryJournal(url: string): Promise<ILocalValidation> {

        return new Promise((resolve, reject) => {

            this.UpdateSuppliersJournalEntry().then(result => {
                let current = this.current.getValue();
                var validation = this.hasValidDraftLines(true);
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
        var label = workflowLabels[key];
        if (!label) {
            return key;
        }
        return label;
    }

    private fetchInvoice(id: number | string, flagBusy: boolean): Promise<any> {
        if (flagBusy) { this.busy = true; }
        this.currentFileID = 0;
        this.files = undefined;
        this.setHistoryCounter(0);
        return new Promise((resolve, reject) => {
            this.supplierInvoiceService.Get(
                id,
                ['Supplier.Info.BankAccounts', 'JournalEntry.DraftLines.Account,JournalEntry.DraftLines.VatType', 'CurrencyCode', 'BankAccount', 'DefaultDimensions']
            ).finally( () => {
                this.flagUnsavedChanged(true);
             })
            .subscribe(result => {
                if (flagBusy) { this.busy = false; }
                if (result.Supplier === null) { result.Supplier = new Supplier(); };
                this.current.next(result);
                this.setupToolbar();
                this.updateTabInfo(id, trimLength(this.toolbarConfig.title, 12));
                this.flagActionBar(actionBar.delete, result.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.flagActionBar(actionBar.ocr, result.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.loadActionsFromEntity();
                this.checkLockStatus();
                this.fetchHistoryCount(result.SupplierID);

                this.uniSearchConfig.initialItem$.next(result.Supplier);

                resolve('');
            }, (err) => {
                this.errorService.handle(err);
                reject(err);
            });
        });
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
        let current = this.current.getValue();
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
                    this.uniForm.field('PaymentDueDate').editMode();
                    this.uniForm.field('BankAccountID').editMode();
                    this.uniForm.field('PaymentID').editMode();
                    return;

                case StatusCodeSupplierInvoice.ForApproval:
                    this.uniForm.readMode();
                    this.supplierIsReadOnly = false;
                    this.uniForm.field('PaymentID').editMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    return;
            }
        }

        this.uniForm.editMode();
        this.supplierIsReadOnly = false;
    }

    private getSupplierName(): string {
        let current = this.current.getValue();
        return current
            && current.Supplier
            && current.Supplier.Info ? current.Supplier.Info.Name : '';
    }

    public tryDelete(done) {
        let bill = this.current.getValue();
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
        let current = this.current.getValue();
        var obs: any;
        if (current.ID) {
            obs = this.supplierInvoiceService.Remove<SupplierInvoice>(current.ID, current);
        } else {
            done(lang.delete_nothing_todo);
        }
        obs.subscribe((result) => {
            done(lang.delete_success);
            this.newInvoice(false);
        }, (error) => {
            var msg = error.statusText;
            if (error._body) {
                msg = trimLength(error._body, 100, true);
                this.showErrMsg(msg, true);
            } else {
                this.userMsg(lang.save_error);
            }
            done(lang.delete_error + ': ' + msg);
        });
    }


    public save(done?): Promise<ILocalValidation> {
        this.preSave();
        return new Promise((resolve, reject) => {

            var reload = () => {
                this.fetchInvoice(this.currentSupplierID, (!!done))
                    .then(() => {
                        resolve({ success: true });
                        if (done) { done(lang.save_success); }
                    })
                    .catch((msg) => {
                        reject({ success: false, errorMessage: msg });
                        if (done) { done(msg); }
                    });
            };

            var obs: any;
            let current = this.current.getValue();
            if (current.ID) {
                obs = this.supplierInvoiceService.Put(current.ID, current);
            } else {
                obs = this.supplierInvoiceService.Post(current);
            }
            obs.subscribe((result) => {
                this.currentSupplierID = result.ID;
                this.hasUnsavedChanges = false;
                if (this.unlinkedFiles.length > 0) {
                    this.linkFiles(this.currentSupplierID, this.unlinkedFiles, 'SupplierInvoice', 40001).then(() => {
                        this.hasStartupFileID = false;
                        this.currentFileID = 0;
                        this.unlinkedFiles = [];
                        reload();
                    });
                } else {
                    reload();
                }
            }, (error) => {
                var msg = error.statusText;
                if (error._body) {
                    msg = trimLength(error._body, 150, true);
                    this.showErrMsg(msg, true);
                } else {
                    this.userMsg(lang.save_error);
                }
                if (done) { done(lang.save_error + ': ' + msg); }
                reject({ success: false, errorMessage: msg });
            });
        });
    }

    private preSave(): boolean {

        var changesMade = false;
        let current = this.current.getValue();
        current.InvoiceDate = current.InvoiceDate || new LocalDate();

        if (current.JournalEntry) {
            if (!current.JournalEntry.NumberSeriesTaskID) {
                current.JournalEntry.NumberSeriesTaskID = NumberSeriesTaskIds.SupplierInvoice;
                changesMade = true;
            }
        }

        // Ensure dates are set
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach(x => {
                let orig = x.FinancialDate;
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
                let orig = x.CurrencyCodeID;
                x.CurrencyCodeID = x.CurrencyCodeID || current.CurrencyCodeID;
                if (x.CurrencyCodeID !== orig) {
                    changesMade = true;
                }
            });
        }
        // set CurrencyExchangeRate
        if (current.CurrencyExchangeRate && current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach(x => {
                let orig = x.CurrencyExchangeRate;
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
            let current = this.current.getValue();
            var completeAccount = (item: JournalEntryLineDraft, addToList = false) => {
                if (item.AmountCurrency !== current.TaxInclusiveAmountCurrency * -1) {
                    item.FinancialDate = item.FinancialDate || current.DeliveryDate || current.InvoiceDate;
                    item.AmountCurrency = current.TaxInclusiveAmountCurrency * -1;
                    item.Description = item.Description || (lang.headliner_invoice.toLowerCase() + ' ' + current.InvoiceNumber);
                    if (addToList) {
                        current.JournalEntry.DraftLines.push(item);
                    }
                    this.save().then(x => resolve(x)).catch(x => reject(x));
                } else {
                    resolve({ success: true });
                }
            };

            if (current.JournalEntry && current.JournalEntry.DraftLines) {
                var supplierId = safeInt(current.Supplier.SupplierNumber);
                var item: JournalEntryLineDraft;
                let items = current.JournalEntry.DraftLines;
                item = items.find(x => x.Account ? x.Account.AccountNumber === current.Supplier.SupplierNumber : false);
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
        let bill = this.current.getValue();

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
                currencyCode: bill.CurrencyCode,
                currencyExchangeRate: bill.CurrencyExchangeRate
            }
        });

        modal.onClose.subscribe((payment) => {
            if (payment) {
                this.supplierInvoiceService.ActionWithBody(bill.ID, payment, 'payInvoice')
                    .finally(() => this.busy = false)
                    .subscribe((res) => {
                        this.fetchInvoice(bill.ID, true);
                        this.userMsg(lang.payment_ok, null, null, null);
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
        var msg: string;
        let current = this.current.getValue();
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            let items = current.JournalEntry.DraftLines;
            var sum = 0, maxSum = 0, minSum = 0, itemSum = 0;
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
                    this.save().then(() => {
                        this.busy = false;
                        resolve(true);
                    });
                } else if (response === ConfirmActions.REJECT) {
                    resolve(true);
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
        let current = this.current.getValue();
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = current.StatusCode;

        this.supplierInvoiceService.statusTypes.forEach((status) => {
            let _state: UniStatusTrack.States;
            let _addIt = status.isPrimary;
            if (status.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (status.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (status.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
                if (this.CurrentTask) {
                    _state = UniStatusTrack.States.Obsolete;
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
            let document = this.current.getValue();
            let task: Task = <any>( document ? <any>document['_task'] : undefined );
            return task;
        }
    }

    private setupToolbar() {
        var doc: SupplierInvoice = this.current.getValue();
        var stConfig = this.getStatustrackConfig();
        var jnr = doc && doc.JournalEntry && doc.JournalEntry.JournalEntryNumber ? doc.JournalEntry.JournalEntryNumber : undefined;
        this.toolbarConfig = {
            title: doc && doc.Supplier && doc.Supplier.Info ? `${trimLength(doc.Supplier.Info.Name, 20)}` : lang.headliner_new,
            subheads: [
                { title: doc && doc.InvoiceNumber ? `${lang.headliner_invoice} ${doc.InvoiceNumber}` : '' },
                { title: doc && doc.Supplier ? `${lang.headliner_supplier} ${doc.Supplier.SupplierNumber}` : '' },
                {
                    title: jnr ? `(${lang.headliner_journal} ${jnr})` : `(${lang.headliner_journal_not})`,
                    link: jnr ? `#/accounting/transquery/details;JournalEntryNumber=${jnr}` : undefined
                }
            ],
            statustrack: stConfig,
            navigation: {
                prev: () => this.navigateTo('prev'),
                next: () => this.navigateTo('next'),
                add: () => {
                    this.newInvoice(false);
                    this.router.navigateByUrl('/accounting/bills/0');
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

        var params = '?model=supplierinvoice';
        var resultFld = 'minid';
        var id = this.current.getValue().ID;

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (id ? ' and id gt ' + id : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (id ? ' and id lt ' + id : '');
            resultFld = 'maxid';
        }

        this.simpleJournalentry.closeEditor();

        // TODO: should use BizHttp.getNextID() / BizHttp.getPreviousID()
        return new Promise((resolve, reject) => {
            this.supplierInvoiceService.getStatQuery(params).subscribe((items) => {
                if (items && items.length > 0) {
                    var key = items[0][resultFld];
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
        this.fileIds = [safeInt(fileID)];
        this.currentFileID = safeInt(fileID);
    }

    private linkFiles(ID: any, fileIDs: Array<any>, entityType: string, flagFileStatus?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                var route = `files/${fileID}?action=link&entitytype=${entityType}&entityid=${ID}`;
                if (flagFileStatus) {
                    this.tagFileStatus(fileID, flagFileStatus);
                }
                this.supplierInvoiceService.send(route).subscribe(x => resolve(x));
            });
        });
    }

    private checkPath() {
        var pageParams = this.pageStateService.getPageState();
        if (pageParams.fileid) {
            this.loadFromFileID(pageParams.fileid);
        }
    }

    private tagFileStatus(fileID: number, flagFileStatus: number) {
        var file = this.files.find(x => x.ID === fileID);
        var tag = this.isOCR(file) ? 'IncomingMail' : 'IncomingEHF';

        this.supplierInvoiceService.send(
            `filetags/${fileID}`,
            undefined,
            undefined,
            { FileID: fileID, TagName: tag, Status: flagFileStatus }
        ).subscribe(null, err => this.errorService.handle(err));
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        var txt = msg;
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

    private isOCR(file): Boolean {
        if (file.ContentType) {
            if (file.ContentType === 'application/xml') { return false; }
            if (file.ContentType.startsWith('image')) { return true; }
        }
        if (file.Extension && file.Extension === '.xml') { return false; }
        var ocrformats = ['pdf', 'png', 'jpeg', 'jpg', 'gif', 'tiff'];
        var ending = file.Name.toLowerCase().split('.').pop();
        return ocrformats.indexOf(ending) >= 0;
    }

    private isEHF(file): Boolean {
        let name = (file.Name || '').toLowerCase();
        return name.indexOf('.xml') !== -1 || name.indexOf('.ehf') !== -1);
    }
}
