import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    CompanySettingsService,
    PageStateService,
    TermsService,
    EHFService,
    ElsaPurchaseService,
    ErrorService
} from '@app/services/services';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniReportSettingsView} from '../report/report-setup';
import {CompanySettings, CustomerInvoiceReminderSettings, Email} from '@app/unientities';
import { Observable, BehaviorSubject } from 'rxjs';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {ReminderSettings} from '../../common/reminder/settings/reminderSettings';
import {
    UniModalService,
    IModalOptions,
    UniTermsModal,
    ConfirmActions,
    UniActivateAPModal,
    UniActivateInvoicePrintModal,
    UniEmailModal
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
    fields$Customer = new BehaviorSubject<UniFieldLayout[]>([]);
    factoringFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    ehfInvoiceField$ = new BehaviorSubject<UniFieldLayout[]>([]);

    expands = [
        'FactoringEmail',
        'DefaultSalesAccount',
        'CustomerInvoiceReminderSettings',
        'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
        'CustomerInvoiceReminderSettings.DebtCollectionSettings'
    ];

    isDirty: boolean = false;
    activeIndex: number = 0;


    eInvoiceItems: any[] = [
        { name: 'Fakturaprint', isActivated: false, value: 0 },
        { name: 'EHF', isActivated: false, value: 1 }
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
            label: 'Lagre innstillinger',
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
        private errorService: ErrorService,
        private tabService: TabService,
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
        this.fields$Customer.complete();
        this.factoringFields$.complete();
    }

    reloadCompanySettingsData() {
        Observable.forkJoin(
            this.companySettingsService.Get(1, this.expands),
            this.termsService.GetAll(null),
        ).subscribe((response) => {
            const data = response[0];
            data['FactoringEmails'] = [data.FactoringEmail || {_createguid: this.companySettingsService.getNewGuid()}];

            this.companySettings$.next(data);
            this.cs = cloneDeep(response[0]);
            this.customerInvoiceReminderSettings = (response[0] && response[0].CustomerInvoiceReminderSettings) || {};
            this.terms = response[1];

            this.eInvoiceItems[0].isActivated = this.ehfService.isInvoicePrintActivated(response[0]);
            this.eInvoiceItems[1].isActivated = this.ehfService.isEHFActivated(response[0]);

            this.setUpEHFField();
            this.setUpFactoringFields();
            this.setUpTermsArrays();
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
            if (!this.isDirty && !this.reportSettings.isDirty && !this.reminderSettings.isDirty && !companySettings['_isDirty']) {
                done('Ingen endringer');
                return;
            }

            Observable.forkJoin(
                (this.isDirty || companySettings['_isDirty'])
                    ? this.companySettingsService.Put(companySettings.ID, companySettings)
                    : Observable.of(true),
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
        }
    }

    private activateProduct(productName: string, activationModal: () => void) {
        this.elsaPurchasesService.getPurchaseByProductName(productName).subscribe(purchase => {
            if (purchase) {
                activationModal();
                this.setUpEHFField();
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
                        EntityType: 'CompanySettings',
                        Property: 'AcceptableDelta4CustomerPaymentAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Konto for øredifferanse',
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

    setUpFactoringFields() {
        this.factoringFields$.next([
            <any>{
                EntityType: 'CompanySettings',
                Property: 'Factoring',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                Options: {
                    source: [{ID: 0, Label: ''}, {ID: 1, Label: 'SGFinans'}],
                    displayProperty: 'Label',
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'FactoringNumber',
                FieldType: FieldType.TEXT,
                Label: 'Factoring nr.'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'FactoringEmail',
                FieldType: FieldType.MULTIVALUE,
                Label: 'E-post',
                Options: {
                    allowAddValue: false,
                    allowDeleteValue: true,
                    entity: Email,
                    listProperty: 'FactoringEmails',
                    displayValue: 'EmailAddress',
                    linkProperty: 'ID',
                    storeResultInProperty: 'FactoringEmail',
                    storeIdInProperty: 'FactoringEmailID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniEmailModal, {
                            data: value || new Email(),
                            closeOnClickOutside: false
                        });

                        return modal.onClose.take(1).toPromise();
                    },
                }
            }
        ]);
    }

    setUpEHFField() {
        const cs = this.companySettings$.getValue();
        this.ehfInvoiceField$.next([
            <any>{
                EntityType: 'CompanySettings',
                Property: 'APIncludeAttachment',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inkluder PDF av faktura ved sending av EHF',
                Hidden: !this.companySettings$.getValue()['APActivated']
            }
        ]);
    }
}
