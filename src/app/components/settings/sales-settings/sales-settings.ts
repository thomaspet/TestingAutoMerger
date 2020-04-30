import {Component, ViewChild, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    CompanySettingsService,
    PageStateService,
    TermsService,
    EHFService,
    ElsaPurchaseService,
    CompanyService,
    ErrorService
} from '@app/services/services';
import {AuthService} from '../../../authService';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniReportSettingsView} from '../report/report-setup';
import {CompanySettings, CustomerInvoiceReminderSettings} from '@app/unientities';
import { Observable, BehaviorSubject } from 'rxjs';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {ReminderSettings} from '../../common/reminder/settings/reminderSettings';
import {
    UniModalService,
    IModalOptions,
    UniTermsModal,
    ConfirmActions,
    ActivateOCRModal,
    UniActivateAPModal,
    UniActivateInvoicePrintModal
} from '@uni-framework/uni-modal';
import { IUniTab } from '@uni-framework/uni-tabs';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'uni-sales-settings-view',
    templateUrl: './sales-settings.html',
    styleUrls: ['./sales-settings.sass']
})

export class UniSalesSettingsView {

    @ViewChild(UniReportSettingsView, { static: true })
    private reportSettings: UniReportSettingsView;

    @ViewChild(ReminderSettings, { static: false })
    public reminderSettings: ReminderSettings;

    cs: CompanySettings;
    customerInvoiceReminderSettings: CustomerInvoiceReminderSettings;

    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    fields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    electronicInvoiceFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fields$Customer = new BehaviorSubject<UniFieldLayout[]>([]);

    expands = [
        'DefaultSalesAccount',
        'CustomerInvoiceReminderSettings',
        'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
        'CustomerInvoiceReminderSettings.DebtCollectionSettings'
    ];

    isDirty: boolean = false;
    activeIndex: number = 0;


    eInvoiceItems: any[] = [
        { name: 'Fakturaprint', isActivated: false, value: 0 },
        { name: 'EHF', isActivated: false, value: 1 },
        { name: 'OCR-tolkning', isActivated: false, value: 2 }
    ];

    tabs: IUniTab[] = [
        {name: 'SETTINGS.SALES_INVOICE'},
        {name: 'NAVBAR.TERMS'},
        {name: 'SETTINGS.FORM_SETTINGS'},
        {name: 'SETTINGS.COLLECTOR'}
    ];

    decimals: {Decimals: number, Name: string}[] = [
        {Decimals: 0, Name: 'Ingen desimaler'},
        {Decimals: 2, Name: '2 desimaler'},
        {Decimals: 3, Name: '3 desimaler'},
        {Decimals: 4, Name: '4 desimaler'}
    ];

    terms: any[] = [];
    paymentTerms: any[] = [];
    deliveryTerms: any[] = [];

    saveActions: any[] = [
        {
            label: 'Lagre salgsinnstillinger',
            action: done => this.saveCompanySettings(done),
            main: true,
            disabled: false
        },
    ];

    constructor (
        private companySettingsService: CompanySettingsService,
        private termsService: TermsService,
        private modalService: UniModalService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastService,
        private authService: AuthService,
        private errorService: ErrorService,
        private tabService: TabService,
        private companyService: CompanyService,
        private pageStateService: PageStateService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private ehfService: EHFService,
        private elsaPurchasesService: ElsaPurchaseService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const index = +params['index'];
            if (!isNaN(index) && index >= 0 && index < this.tabs.length) {
                this.activeIndex = index;
            }
            this.onTabChange();
            this.reloadCompanySettingsData();
        });
    }

    ngOnDestroy() {
        this.companySettings$.complete();
        this.fields$.complete();
        this.electronicInvoiceFields$.complete();
        this.fields$Customer.complete();
    }

    reloadCompanySettingsData() {
        Observable.forkJoin(
            this.companySettingsService.Get(1, this.expands),
            this.termsService.GetAll(null),
            this.companyService.Get(this.authService.activeCompany.ID)
        ).subscribe((response) => {
            const data = response[0];
            const company = response[2];
            data['_FileFlowEmail'] = company['FileFlowEmail'];
            data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
            data['_FileFlowOrgnrEmailCheckbox'] = !!data['_FileFlowOrgnrEmail'];

            this.companySettings$.next(data);
            this.cs = cloneDeep(response[0]);
            this.customerInvoiceReminderSettings = (response[0] && response[0].CustomerInvoiceReminderSettings) || {};
            this.terms = response[1];

            this.eInvoiceItems[0].isActivated = this.ehfService.isInvoicePrintActivated(response[0]);
            this.eInvoiceItems[1].isActivated = this.ehfService.isEHFActivated(response[0]);
            this.eInvoiceItems[2].isActivated = response[0].UseOcrInterpretation;

            this.setUpTermsArrays();
            this.setUpElectronicInvoiceFormFields();
        });
    }

    onTabChange() {
        if (this.activeIndex === 0) {
            this.fields$.next(this.getFormFields(0));
            this.fields$Customer.next(this.getFormFields(1));
        }
        this.updateTabAndUrl();
    }

    setUpTermsArrays() {
        // Split terms by type
        this.paymentTerms = this.terms.filter(term => term.TermsType === 1);
        this.deliveryTerms = this.terms.filter(term => term.TermsType === 2);
    }

    updateTabAndUrl() {
        this.pageStateService.setPageState('index', this.activeIndex + '');
        this.tabService.addTab({
            name: 'Innstillinger - Salg',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.SubSettings,
            active: true
       });
    }

    openTermsModal(term: any = null, termsType: number) {
        term = term || this.getNewTerm(termsType);
        const value: IModalOptions = {
            header: term.ID ? 'Rediger betingelse' : 'Ny betingelse',
            data: {...term},
            closeOnClickOutside: false
        };

        this.modalService.open(UniTermsModal, value).onClose.subscribe(response => {
            if (response) {
                this.reloadCompanySettingsData();
                this.toast.addToast('Betingelse lagret', ToastType.good, 5);
            }
        });
    }

    deleteTerm(term) {
        const options: IModalOptions = {
            header: 'Slette betingelse?',
            message: `Er du sikker på du at du vil slette betingelsen <strong>${term.Name}</strong>`,
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        };

        this.modalService.confirm(options).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.termsService.Remove(term.ID).subscribe(() => {
                    this.toast.addToast('Betingelse slettet', ToastType.good, 5);
                    // this.reloadCompanySettingsData();
                    this.terms.splice(this.terms.findIndex(t => t.ID === term.ID), 1);
                    this.setUpTermsArrays();
                });
            }
        });
    }

    getNewTerm(termsType) {
        return {
            Name: '',
            ID: 0,
            CreditDays: 14,
            Description: '',
            TermsType: termsType
        };
    }

    logoFileChanged(files: Array<any>) {
        const companySettings = this.companySettings$.getValue();
        if (!companySettings) {
            return;
        }

        if (files && files.length > 0 && companySettings.LogoFileID !== files[files.length - 1].ID) {
            // update logourl in company object
            companySettings.LogoFileID = files[files.length - 1].ID;

            // run request to save it without the user clicking save, because otherwise
            // the LogoFileID and FileEntityLinks will be left in an inconsistent state
            this.companySettingsService.PostAction(1, 'update-logo', `logoFileId=${companySettings.LogoFileID}`).subscribe(
                () => {},
                err => this.errorService.handle(err)
            );
        }
    }

    saveCompanySettings(done?) {
        const companySettings = this.companySettings$.getValue();
        return new Promise(res => {
            if (!this.isDirty && !this.reportSettings.isDirty && !this.reminderSettings.isDirty) {
                done('Ingen endringer');
                return;
            }

            Observable.forkJoin(
                this.isDirty ? this.companySettingsService.Put(companySettings.ID, companySettings) : Observable.of(true),
                this.reportSettings.isDirty ? this.reportSettings.saveReportSettings() : Observable.of(true),
                this.reminderSettings.isDirty ? Observable.fromPromise(this.reminderSettings.save()) : Observable.of(true)
            ).subscribe((response) => {
                if (done) {
                    done('Salgsinnstillinger lagret');
                }
                this.isDirty = false;
                this.reportSettings.isDirty = false;
                res(true);
            }, err => {
                if (done) {
                    done('Lagring feilet. Sjekk at info stemmer, eller last inn siden på nytt og prøv igjen.');
                }
                res(false);
            });
        });
    }

    onEInvoiceItemClick(item) {
        switch (item.value) {
            // Fakturaprint
            case 0:
                this.activateProduct('INVOICEPRINT', this.openActivateInvoicePrintModal.bind(this));
                break;
            // EHF
            case 1:
                this.activateProduct('EHF', this.openActivateAPModal.bind(this));
                break;
            // OCR
            case 2:
                if (item.isActivated) {
                    this.companySettingsService.PostAction(1, 'reject-ocr-agreement').subscribe(() => {
                        const settings = this.companySettings$.getValue();
                        settings.UseOcrInterpretation = false;
                        this.companySettings$.next(settings);
                    }, err => this.errorService.handle(err));
                } else {
                    this.activateProduct('OCR-SCAN', this.openActivateOCRModal.bind(this));
                }
            break;
        }
    }

    private activateProduct(productName: string, activationModal: () => void) {
        this.elsaPurchasesService.getPurchaseByProductName(productName).subscribe(purchase => {
            if (purchase) {
                activationModal();
            } else {
                this.router.navigateByUrl(`/marketplace/modules?productName=${productName}`);
            }
        });
    }

    private openActivateAPModal() {
        this.modalService.open(UniActivateAPModal).onClose.subscribe((status) => {
            if (status !== 0) {
                this.companySettingsService.Get(1).subscribe(settings => {
                    const company = this.companySettings$.getValue();
                    company.BankAccounts = settings.BankAccounts;
                    company.CompanyBankAccount = settings.CompanyBankAccount;
                    this.companySettings$.next(company);
                });
            }
        }, err => this.errorService.handle(err) );
    }

    private openActivateInvoicePrintModal() {
        this.modalService.open(UniActivateInvoicePrintModal).onClose.subscribe((status) => {
            if (status !== 0) {
                this.companySettingsService.Get(1).subscribe(settings => {
                    const company = this.companySettings$.getValue();
                    company.BankAccounts = settings.BankAccounts;
                    company.CompanyBankAccount = settings.CompanyBankAccount;
                    this.companySettings$.next(company);
                });
            }
        }, err => this.errorService.handle(err));
    }

    private openActivateOCRModal() {
        this.modalService.open(ActivateOCRModal).onClose.subscribe(activated => {
            if (activated) {
                const settings = this.companySettings$.getValue();
                settings.UseOcrInterpretation = true;
                this.companySettings$.next(settings);
            }
        });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty && !this.reportSettings.isDirty) {
            return true;
        }

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i innstillingene som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.saveCompanySettings().then(res => true).catch(res => false);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }

    private updateInvoiceEmail() {
        const data = this.companySettings$.getValue();
        const customEmail = data['_FileFlowEmail'];
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email', 'customEmail=' + customEmail)
        .subscribe(company => {
            data['_FileFlowEmail'] = company['FileFlowEmail'];
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    private activateEmail() {
        const data = this.companySettings$.getValue();
        if (!data['_FileFlowEmail']) {
            this.generateInvoiceEmail();
        } else {
            this.disableInvoiceEmail();
        }
    }

    private generateInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email').subscribe(company => {
            const data = this.companySettings$.getValue();
            data['_FileFlowEmail'] = company['FileFlowEmail'];
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    private disableInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-email').subscribe(company => {
            const data = this.companySettings$.getValue();
            data['_FileFlowEmail'] = '';
            data['_FileFlowOrgnrEmail'] = '';
            data['_FileFlowOrgnrEmailCheckbox'] = false;
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    eifChange(changes: SimpleChanges) {
        if (changes['_FileFlowOrgnrEmailCheckbox']) {
            const data = this.companySettings$.getValue();
            if (data['_FileFlowOrgnrEmailCheckbox']) {
                this.generateOrgnrInvoiceEmail(data);
            } else {
                this.disableOrgnrInvoiceEmail(data);
            }
        }
    }

    private generateOrgnrInvoiceEmail(data) {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-orgnr-email').subscribe(company => {
            data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
            this.companySettings$.next(data);
        }, err => {
            data['_FileFlowOrgnrEmailCheckbox'] = false;
            this.companySettings$.next(data);
            this.errorService.handle(err);
        });
    }

    private disableOrgnrInvoiceEmail(data) {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-orgnr-email').subscribe(company => {
            data['_FileFlowOrgnrEmail'] = '';
            this.companySettings$.next(data);
        }, err => {
            data['_FileFlowOrgnrEmailCheckbox'] = true;
            this.companySettings$.next(data);
            this.errorService.handle(err);
        });
    }

    setUpElectronicInvoiceFormFields() {
        const companySettings = this.companySettings$.getValue();
        this.electronicInvoiceFields$.next([
            <any>{
                Property: '_FileFlowEmailActivated',
                FieldType: FieldType.BUTTON,
                Label: companySettings['_FileFlowEmail'] ? 'Deaktiver e-postmottak' : 'Aktiver e-postmottak',
                Options: {
                    click: () => this.activateEmail()
                 }
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Faktura e-post med firmanavn',
                Property: '_FileFlowEmail',
                Placeholder: 'E-post',
                ReadOnly: false,
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.BUTTON,
                Label: 'Endre e-postadresse',
                Property: '_UpdateEmail',
                Options: {
                    click: () => this.updateInvoiceEmail()
                },
                ReadOnly: companySettings['_FileFlowEmail'],
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.CHECKBOX,
                Label: 'Bruk orgnr for faktura e-post',
                Property: '_FileFlowOrgnrEmailCheckbox',
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Faktura e-port med orgnr',
                Property: '_FileFlowOrgnrEmail',
                Placeholder: 'Ikke i bruk',
                ReadOnly: true,
                Hidden: !companySettings['_FileFlowEmail']
            }
        ]);
    }

    private getFormFields(index: number) {
        let fields = [];
        switch (index) {
            case 0:
                fields = [
                    {
                        EntityType: 'CompanySettings',
                        Property: 'DefaultSalesAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Standard salgskonto',
                        Options: {
                            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                            valueProperty: 'ID'
                        }
                    },
                    {
                        Property: 'ShowNumberOfDecimals',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Antall desimaler i visning av antall og pris',
                        Options: {
                            source: this.decimals,
                            valueProperty: 'Decimals',
                            displayProperty: 'Name'
                        }
                    },
                    {
                        Property: 'RoundingNumberOfDecimals',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Antall desimaler ved avrunding',
                        Options: {
                            source: this.decimals,
                            valueProperty: 'Decimals',
                            displayProperty: 'Name'
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'BookCustomerInvoiceOnDeliveryDate',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Periodiser etter leveringsdato',
                    },
                    {
                        EntityType: 'Supplier',
                        Property: 'GLN',
                        Label: 'GLN',
                        FieldType: FieldType.TEXT
                    },
                ];
                break;
            case 1:
                fields = [
                    {
                        EntityType: 'CompanySettings',
                        Property: 'CustomerCreditDays',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Kredittdager',
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'SaveCustomersFromQuoteAsLead',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Tillat lagring som potensiell kunde',
                    }
                ];
                break;
        }

        return fields;
    }
}
