import {Component, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {FieldType, UniForm, UniFormError} from '@uni-framework/ui/uniform/index';
import {UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {AuthService} from '../../../authService';
import {ReminderSettings} from '../../common/reminder/settings/reminderSettings';
import {
    AccountGroup,
    AccountVisibilityGroup,
    Address,
    BankAccount,
    CompanySettings,
    CompanyType,
    CurrencyCode,
    Email,
    FinancialYear,
    Municipal,
    PeriodSeries,
    Phone,
    VatReportForm,
    CampaignTemplate,
    ReportDefinition
} from '@uni-entities';
import {
    AccountService,
    AccountGroupSetService,
    AccountVisibilityGroupService,
    AddressService,
    BankAccountService,
    CompanyService,
    CompanySettingsService,
    CompanyTypeService,
    CurrencyCodeService,
    CurrencyService,
    EHFService,
    ErrorService,
    FinancialYearService,
    MunicipalService,
    PeriodSeriesService,
    UniSearchAccountConfig,
    VatReportFormService,
    VatTypeService,
    UniFilesService,
    ElsaPurchaseService,
    CampaignTemplateService,
    SubEntityService,
    ReportTypeService
} from '@app/services/services';
import {CompanySettingsViewService} from './services/companySettingsViewService';
import {ChangeCompanySettingsPeriodSeriesModal} from '../companySettings/ChangeCompanyPeriodSeriesModal';
import {
    UniActivateAPModal,
    UniActivateInvoicePrintModal,
    ActivateOCRModal,
    UniAddressModal,
    UniBankAccountModal,
    UniEmailModal,
    UniModalService,
    UniPhoneModal,
    UniBrRegModal,
    ConfirmActions,
} from '@uni-framework/uni-modal';
import {SettingsService} from '../settings-service';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {BusinessRelationService} from '@app/services/sales/businessRelationService';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {environment} from 'src/environments/environment';

import * as _ from 'lodash';
import { tap } from 'rxjs/operators';
import { SubEntitySettingsService } from '../agaAndSubEntitySettings/services/subEntitySettingsService';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'settings',
    templateUrl: './companySettings.html'
})
export class CompanySettingsComponent implements OnInit {
    @ViewChild(UniForm)
    public form: UniForm;

    @ViewChild(ReminderSettings)
    public reminderSettings: ReminderSettings;

    public companySettings$: BehaviorSubject<CompanySettings> = new BehaviorSubject(null);
    private savedCompanyOrgValue: string;
    private savedCompanyMunicipalValue: string;

    private companyTypes: Array<CompanyType> = [];
    private vatReportForms: Array<VatReportForm> = [];
    private currencyCodes: Array<CurrencyCode> = [];
    private accountYears: Array<FinancialYear> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private municipalities: Municipal[] = [];
    private accountVisibilityGroups: AccountVisibilityGroup[] = [];

    public showImageSection: boolean = false;
    public showReminderSection: boolean = false;
    public showReportOptionsSection: boolean = false;

    private organizationnumbertoast: number;

    public isDirty: boolean = false;
    public config$ = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public reportSetupFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private roundingNumberOfDecimals: {Decimals: number, Label: string}[] = [
        {Decimals: 0, Label: 'Ingen desimaler'},
        {Decimals: 2, Label: '2 desimaler'},
        {Decimals: 3, Label: '3 desimaler'},
        {Decimals: 4, Label: '4 desimaler'}
    ];

    private logoAlignOptions: {Alignment: number, Label: string}[] = [
        {Alignment: 1, Label: 'Venstre'},
        {Alignment: 2, Label: 'Høyre'}
    ];

    private logoHideOptions: {Value: number, Label: string}[] = [
        {Value: 1, Label: 'Firmanavn'},
        {Value: 2, Label: 'Logo'},
        {Value: 3, Label: 'Firmanavn & logo'},
    ];

    private localizationOptions: {Culture: string, Label: string}[] = [
        {Culture: 'no', Label: 'Norsk bokmål'},
        {Culture: 'en', Label: 'Engelsk'},
    ];

    private quoteFormList: ReportDefinition[];
    private orderFormList: ReportDefinition[];
    private invoiceFormList: ReportDefinition[];
    private invoiceReminderFormList: ReportDefinition[];

    private invoiceTemplate: CampaignTemplate;
    private orderTemplate: CampaignTemplate;
    private quoteTemplate: CampaignTemplate;

    private hideXtraPaymentOrgXmlTagValue: boolean;
    private hideBankValues: boolean;

    public reportModel$: BehaviorSubject<any> = new BehaviorSubject({});
    public saveActions = [{
        label: 'Lagre firmainnstillinger',
        action: (event) => this.saveSettings(event),
        main: true,
        disabled: false
    }];

    constructor(
        private companySettingsService: CompanySettingsService,
        private accountService: AccountService,
        private currencyCodeService: CurrencyCodeService,
        private accountGroupSetService: AccountGroupSetService,
        private periodeSeriesService: PeriodSeriesService,
        private companyTypeService: CompanyTypeService,
        private vatReportFormService: VatReportFormService,
        private vatTypeService: VatTypeService,
        private municipalService: MunicipalService,
        private bankaccountService: BankAccountService,
        private addressService: AddressService,
        private toastService: ToastService,
        private accountVisibilityGroupService: AccountVisibilityGroupService,
        private companyService: CompanyService,
        private authService: AuthService,
        private errorService: ErrorService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private currencyService: CurrencyService,
        private financialYearService: FinancialYearService,
        private ehfService: EHFService,
        private modalService: UniModalService,
        private uniFilesService: UniFilesService,
        private companySettingsViewService: CompanySettingsViewService,
        private router: Router,
        private campaignTemplateService: CampaignTemplateService,
        private elsaPurchasesService: ElsaPurchaseService,
        private subEntityService: SubEntityService,
        private settingsService: SettingsService,
        private businessRelationService: BusinessRelationService,
        private reportTypeService: ReportTypeService,
        private subEntitySettingsService: SubEntitySettingsService,
        private tabService: TabService,
    ) { }

    public ngOnInit() {
        this.updateTabAndUrl();
        this.getDataAndSetupForm();
    }

    ngOnDestroy() {
        // Avoid memory leaks
        this.companySettings$.complete();
        this.fields$.complete();
        this.config$.complete();
        this.reportSetupFields$.complete();
        this.reportModel$.combineAll();
    }

    updateTabAndUrl() {
        this.tabService.addTab({
            name: 'Firmainnstillinger',
            url: '/settings/company',
            moduleID: UniModules.Settings,
            active: true
       });
    }

    private getDataAndSetupForm() {
        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.vatReportFormService.GetAll(null),
            this.currencyCodeService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.companySettingsService.Get(1),
            this.municipalService.getAll(null),
            this.accountVisibilityGroupService.GetAll(null, ['CompanyTypes']),
            this.financialYearService.GetAll(null),
            this.campaignTemplateService.getTemplateText(),
            this.campaignTemplateService.getTemplateText(),
            this.campaignTemplateService.getTemplateText(),
            this.reportTypeService.getFormType(ReportTypeEnum.QUOTE),
            this.reportTypeService.getFormType(ReportTypeEnum.ORDER),
            this.reportTypeService.getFormType(ReportTypeEnum.INVOICE),
            this.reportTypeService.getFormType(ReportTypeEnum.REMINDER)
        ).subscribe(
            (dataset) => {
                this.companyTypes = dataset[0];
                this.vatReportForms = dataset[1];
                this.currencyCodes = dataset[2];
                this.periodSeries = dataset[3];
                this.accountGroupSets = dataset[4];
                this.hideXtraPaymentOrgXmlTagValue = !dataset[5].UseXtraPaymentOrgXmlTag;
                this.hideBankValues = !dataset[5].UsePaymentBankValues;
                this.municipalities = dataset[6];

                // get accountvisibilitygroups that are not specific for a companytype
                this.accountVisibilityGroups = dataset[7].filter(x => x.CompanyTypes.length === 0);
                this.accountYears = dataset[8];
                this.accountYears.forEach(item => item['YearString'] = item.Year.toString());

                this.invoiceTemplate = dataset[9][0] || <CampaignTemplate> {
                    EntityName: 'CustomerInvoice',
                    Template: ''
                };
                this.orderTemplate = dataset[10][0] || <CampaignTemplate> {
                    EntityName: 'CustomerOrder',
                    Template: ''
                };
                this.quoteTemplate = dataset[11][0] || <CampaignTemplate> {
                    EntityName: 'CustomerQuote',
                    Template: ''
                };

                this.reportModel$.next({
                    company: this.setupMultivalueData(dataset[5]),
                    orderTemplate: this.orderTemplate,
                    invoiceTemplate: this.invoiceTemplate,
                    quoteTemplate: this.quoteTemplate
                });

                this.quoteFormList = dataset[12];
                this.orderFormList = dataset[13];
                this.invoiceFormList = dataset[14];
                this.invoiceReminderFormList = dataset[15];

                this.companySettings$.next(this.setupMultivalueData(dataset[5]));
                this.savedCompanyOrgValue = dataset[5].OrganizationNumber;
                this.savedCompanyMunicipalValue = dataset[5].OfficeMunicipalityNo;
                this.companyService.Get(this.authService.activeCompany.ID).subscribe(
                    company => {
                        const data = this.companySettings$.getValue();
                        data['_FileFlowEmail'] = company['FileFlowEmail'];
                        data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
                        data['_FileFlowOrgnrEmailCheckbox'] = !!data['_FileFlowOrgnrEmail'];
                        data.LogoHideField = data.LogoHideField || this.logoHideOptions[2].Value;
                        data.LogoAlign = data.LogoAlign || this.logoAlignOptions[0].Alignment;
                        this.companySettings$.next(data);
                        this.getFormLayout();
                        this.extendFormConfig();
                    },
                    err => this.errorService.handle(err)
                );
            },
            err => this.errorService.handle(err)
            );
    }

    private setupMultivalueData(settings: CompanySettings) {
        settings['Addresses'] = [settings.DefaultAddress || {_createguid: this.companySettingsService.getNewGuid()}];
        settings['Phones'] = [settings.DefaultPhone || {_createguid: this.companySettingsService.getNewGuid()}];
        settings['Emails'] = [settings.DefaultEmail || {_createguid: this.companySettingsService.getNewGuid()}];
        settings['FactoringEmails'] = [settings.FactoringEmail || {_createguid: this.companySettingsService.getNewGuid()}];
        return settings;
    }

    public onFormReady() {
        const data = this.companySettings$.getValue();
        if (data['_FileFlowEmail']) {
            this.form.field('_UpdateEmail').readMode(); // Disable button update email address as initial state
        }
    }

    public canDeactivate(): Observable<boolean> {
        return !this.isDirty && (!this.reminderSettings || !this.reminderSettings.isDirty)
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveSettings(() => {});
                    }
                    return result !== ConfirmActions.CANCEL;
                });
    }

    public companySettingsChange(changes: SimpleChanges) {
        this.isDirty = true;

        if (changes['quoteTemplate.Template']) {
            this.quoteTemplate.Template = changes['quoteTemplate.Template'].currentValue;
            this.reportModel$.next({
                company: this.companySettings$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['orderTemplate.Template']) {
            this.orderTemplate.Template = changes['orderTemplate.Template'].currentValue;
            this.reportModel$.next({
                company: this.companySettings$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['invoiceTemplate.Template']) {
            this.invoiceTemplate.Template = changes['invoiceTemplate.Template'].currentValue;
            this.reportModel$.next({
                company: this.companySettings$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['PeriodSeriesAccountID'] || changes['PeriodSeriesVatID']) {
            this.modalService.open(ChangeCompanySettingsPeriodSeriesModal, {
                data: {
                    PeriodSeriesAccountID: (changes['PeriodSeriesAccountID'] && changes['PeriodSeriesAccountID'].previousValue) || null,
                    PeriodSeriesVatID: (changes['PeriodSeriesVatID'] && changes['PeriodSeriesVatID'].previousValue) || null
                }
            }).onClose.subscribe(
                result => {
                    const companySettings = this.companySettings$.getValue();
                    companySettings.PeriodSeriesAccountID = result.PeriodSeriesAccountID;
                    companySettings.PeriodSeriesVatID = result.PeriodSeriesVatID;
                    this.companySettings$.next(_.cloneDeep(companySettings));
                    this.router.navigateByUrl('/settings/company');
                }, err => this.errorService.handle
            );
        }

        if (changes['CompanyBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['CompanyBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'CompanyBankAccount');
                        const list = _.get(this.companySettings$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.companySettings$.next(this.companySettings$.getValue());
                });
        }

        if (changes['TaxBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['TaxBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'TaxBankAccount');
                        const list = _.get(this.companySettings$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.companySettings$.next(this.companySettings$.getValue());
                });
        }

        if (changes['SalaryBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['SalaryBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'SalaryBankAccount');
                        const list = _.get(this.companySettings$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.companySettings$.next(this.companySettings$.getValue());
                });
        }

        if (changes['OrganizationNumber']) {
            const organizationnumber = changes['OrganizationNumber'].currentValue.trim();
            if (organizationnumber === ''
                || isNaN(<any>organizationnumber)
                || organizationnumber.length !== 9) {
                this.organizationnumbertoast = this.toastService.addToast(
                    'Organisasjonsnummer',
                    ToastType.warn,
                    5,
                    'Vennligst oppgi et gyldig organisasjonsnr'
                );
            } else {
                if (this.organizationnumbertoast) {
                    this.toastService.removeToast(this.organizationnumbertoast);
                }

                this.companySettings$
                    .asObservable()
                    .take(1)
                    .subscribe(
                        compSettings => this.promptImportFromBrregIfNeeded(compSettings),
                        err => this.errorService.handle(err)
                    );
            }
        }

        if (changes['_FileFlowOrgnrEmailCheckbox']) {
            const data = this.companySettings$.getValue();
            if (data['_FileFlowOrgnrEmailCheckbox']) {
                this.generateOrgnrInvoiceEmail();
            } else {
                this.disableOrgnrInvoiceEmail();
            }
        }

        if (changes['UseXtraPaymentOrgXmlTag']) {
            this.hideXtraPaymentOrgXmlTagValue = !changes['UseXtraPaymentOrgXmlTag'].currentValue;
            this.fields$.next(this.fields$.getValue().map((item) => {
                if (item.Property === 'XtraPaymentOrgXmlTagValue') {
                    item.Hidden = this.hideXtraPaymentOrgXmlTagValue;
                }
                return item;
            }));

            const obj = this.companySettings$.getValue();

            // If Nordea bank is activated while DNB bank is activated
            if (obj.UseXtraPaymentOrgXmlTag && obj['UsePaymentBankValues']) {
                obj.UsePaymentBankValues = false;
                this.hideBankValues = true;
                this.companySettings$.next(obj);
                this.fields$.next(this.fields$.getValue().map((item) => {
                    if (item.Property === 'PaymentBankAgreementNumber' || item.Property === 'PaymentBankIdentification') {
                        item.Hidden = this.hideBankValues;
                    }
                    return item;
                }));
            }
        }

        if (changes['UsePaymentBankValues']) {
            this.hideBankValues = !changes['UsePaymentBankValues'].currentValue;
            this.fields$.next(this.fields$.getValue().map((item) => {
                if (item.Property === 'PaymentBankAgreementNumber' || item.Property === 'PaymentBankIdentification') {
                    item.Hidden = this.hideBankValues;
                }
                return item;
            }));

            const obj = this.companySettings$.getValue();

            // If DNB bank is activated while Nordea bank is activated
            if (obj.UseXtraPaymentOrgXmlTag && obj['UsePaymentBankValues']) {
                obj.UseXtraPaymentOrgXmlTag = false;
                this.hideXtraPaymentOrgXmlTagValue = true;
                this.companySettings$.next(obj);
                this.fields$.next(this.fields$.getValue().map((item) => {
                    if (item.Property === 'XtraPaymentOrgXmlTagValue') {
                        item.Hidden = this.hideXtraPaymentOrgXmlTagValue;
                    }
                    return item;
                }));
            }

        }

        if (changes['DefaultEmail'] || changes['DefaultAddress'] || changes['DefaultPhone']) {
            this.extendFormConfig();
        }
    }

    public onFormInputChange(changes: SimpleChanges) {
        if (changes['_FileFlowEmail']) {
            const customEmail = changes['_FileFlowEmail'].currentValue;
            this.companyService.GetAction(this.authService.activeCompany.ID, 'check-email-changed-valid-available', 'email=' + customEmail)
            .subscribe(
                isValid => {
                    if (isValid === true) {
                        this.form.field('_UpdateEmail').editMode();
                    } else {
                        this.form.field('_UpdateEmail').readMode();
                    }
            }, err => this.errorService.handle(err));
        } else if (changes['TaxMandatoryType']) {
            const taxMandatoryType = changes['TaxMandatoryType'].currentValue;
            const previousTaxMandatoryType = changes['TaxMandatoryType'].previousValue;

            if ((taxMandatoryType === 2 && previousTaxMandatoryType !== 2)
                || (taxMandatoryType !== 2 && previousTaxMandatoryType === 2)) {

                // run extendFormConfig to show/hide fields based on the new taxMandatoryType
                this.extendFormConfig();
            }

            if (taxMandatoryType === 1 && previousTaxMandatoryType !== 1) {
                const companySettings = this.companySettings$.getValue();
                const currentDefaultSalesAccount = companySettings.DefaultSalesAccount;

                if (currentDefaultSalesAccount && currentDefaultSalesAccount.AccountNumber !== 3020) {
                    // ask user if default salesaccount should be changed if they change
                    // to using taxmandatorytype === 1 (not taxable)
                    return this.modalService.confirm({
                        header: 'Endre standard salgskonto?',
                        message: `Vil du endre standard salgskonto til konto 3200, dette er ` +
                            `normalt å bruke når selskapet ikke er avgiftspliktig`,
                        buttonLabels: {
                            accept: 'Ja, endre salgskonto',
                            cancel: 'Nei, fortsett uten å endre'
                        }
                    }).onClose.subscribe(modalResponse => {
                        if (modalResponse === ConfirmActions.ACCEPT) {
                            this.accountService.GetAll('filter=AccountNumber eq 3200')
                                .subscribe(accounts => {
                                    if (accounts.length > 0) {
                                        companySettings.DefaultSalesAccount = accounts[0];
                                        companySettings.DefaultSalesAccountID = accounts[0].ID;
                                        this.companySettings$.next(companySettings);
                                    }
                                });
                        }
                    });
                }


            }
        }
    }

    public saveSettings(complete) {
        const company = this.companySettings$.value;
        const templates = [this.invoiceTemplate, this.orderTemplate, this.quoteTemplate];

        if (company.BankAccounts) {
            company.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 && !bankaccount['_createguid']) {
                    bankaccount['_createguid'] = this.companySettingsService.getNewGuid();
                }
            });
        }

        if (company.DefaultAddress && company.DefaultAddress.ID === 0 && !company.DefaultAddress['_createguid']) {
            company.DefaultAddress['_createguid'] = this.companySettingsService.getNewGuid();
        }

        if (company.FactoringEmail && company.FactoringEmail.ID === 0 && !company.FactoringEmail['_createguid']) {
            company.FactoringEmail['_createguid'] = this.companySettingsService.getNewGuid();
        }

        if (company.DefaultEmail && company.DefaultEmail.ID === 0 && !company.DefaultEmail['_createguid']) {
            company.DefaultEmail['_createguid'] = this.companySettingsService.getNewGuid();
        }

        if (company.DefaultPhone && company.DefaultPhone.ID === 0 && !company.DefaultPhone['_createguid']) {
            company.DefaultPhone['_createguid'] = this.companySettingsService.getNewGuid();
        }

        if (company.CompanyBankAccount) {
            if (!company.CompanyBankAccount.ID) {
                company.CompanyBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                company.CompanyBankAccount.BankAccountType = 'company';
            }
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.CompanyBankAccount);
        }

        if (company.TaxBankAccount) {
            if (!company.TaxBankAccount.ID) {
                company.TaxBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                company.TaxBankAccount.BankAccountType = 'bankaccount';
            }
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.TaxBankAccount);
        }

        if (company.SalaryBankAccount) {
            if (!company.SalaryBankAccount.ID) {
                company.SalaryBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                company.SalaryBankAccount.BankAccountType = 'salarybank';
            }
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.SalaryBankAccount);
        }

        templates.forEach(template => {
            template.ID
                ? this.campaignTemplateService
                    .Put(template.ID, template)
                    .subscribe()
                : this.campaignTemplateService
                    .Post(template)
                    .subscribe();
        });

        this.companySettingsService
            .Put(company.ID, company)
            .finally(() => this.subEntityService.invalidateCache())
            .catch((err, obs) => {
                complete('Lagring feilet.');
                return this.errorService.handleRxCatch(err, obs);
            })
            .pipe(
                tap((companySettings: CompanySettings) => {
                    if (companySettings.OrganizationNumber !== this.savedCompanyOrgValue
                        || companySettings.OfficeMunicipalityNo !== this.savedCompanyMunicipalValue) {
                        this.subEntitySettingsService
                            .saveSubEntitiesFromMainOrgAndBrreg(companySettings.OrganizationNumber);
                    }
                })
            )
            .subscribe(
            (response) => {
                this.companySettingsService.Get(1).subscribe(retrievedCompany => {
                    this.getDataAndSetupForm();

                    this.reminderSettings.save().then(() => {
                        this.isDirty = false;
                        complete('Innstillinger lagret');

                        // just start this after saving settings - it wont matter much if it
                        // fails, so the service will fail silently if the updated settings
                        // cant be synced
                        this.uniFilesService.syncUniEconomyCompanySettings();
                    }).catch((err) => {
                        this.errorService.handle(err);
                        complete('Purreinnstillinger feilet i lagring');
                    });
                });
            }
        );
    }

    private promptImportFromBrregIfNeeded(companySettings: CompanySettings) {
        if (!!this.savedCompanyOrgValue && this.savedCompanyOrgValue !== '-') {
            this.companySettingsViewService.informUserAboutBrregSubEntityImport(companySettings);
            return;
        }


        this.companySettingsViewService
            .askUserAboutBrregImport(companySettings)
            .subscribe(result => {
                const [compSettings, confirmAction] = result;

                if (confirmAction !== ConfirmActions.ACCEPT) {
                    return;
                }

                this.savedCompanyOrgValue = compSettings.OrganizationNumber;
                this.companySettings$.next(compSettings);
                this.saveSettings(() => {});
            }, err => this.errorService.handle(err));
    }

    private openBrRegModal() {
        this.modalService.open(UniBrRegModal).onClose.subscribe(brRegInfo => {
            if (brRegInfo) {
                const companySettings = this.companySettings$.getValue();

                this.businessRelationService.updateCompanySettingsWithBrreg(
                    companySettings,
                    brRegInfo,
                    this.companyTypes,
                );

                this.companySettings$.next(companySettings);
            }
        });
    }

    public updateMunicipalityName() {
        const company = this.companySettings$.getValue();
        this.municipalService.GetAll(`filter=MunicipalityNo eq '${company.OfficeMunicipalityNo}'`)
            .subscribe((data) => {
                if (data && data.length > 0) {
                    company['MunicipalityName'] = data[0].MunicipalityName;
                    this.companySettings$.next(company);
                }
            }, err => this.errorService.handle(err));
    }

    private extendFormConfig() {
        const fields = this.fields$.getValue();
        const companySettings = this.companySettings$.getValue();

        const defaultAddress: UniFieldLayout = fields.find(x => x.Property === 'DefaultAddress');
        defaultAddress.Options = {
            allowAddValue: false,
            allowDeleteValue: true,
            entity: Address,
            listProperty: 'Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultAddress',
            storeIdInProperty: 'DefaultAddressID',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        const phones: UniFieldLayout = fields.find(x => x.Property === 'DefaultPhone');

        phones.Options = {
            allowAddValue: false,
            allowDeleteValue: true,
            entity: Phone,
            listProperty: 'Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultPhone',
            storeIdInProperty: 'DefaultPhoneID',
            editor: (value) => {
                const modal = this.modalService.open(UniPhoneModal, {
                    data: value || new Phone(),
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            },
        };

        const emails: UniFieldLayout = fields.find(x => x.Property === 'DefaultEmail');

        emails.Options = {
            allowAddValue: false,
            allowDeleteValue: true,
            entity: Email,
            listProperty: 'Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultEmail',
            storeIdInProperty: 'DefaultEmailID',
            editor: (value) => {
                const modal = this.modalService.open(UniEmailModal, {
                    data: value || new Email(),
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            },
        };

        const factoringemail: UniFieldLayout = fields.find(x => x.Property === 'FactoringEmail');

        factoringemail.Options = {
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
        };

        this.accountGroupSets.unshift(null);
        const accountGroupSetID: UniFieldLayout = fields.find(x => x.Property === 'AccountGroupSetID');
        accountGroupSetID.Options = {
            source: this.accountGroupSets,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.accountVisibilityGroups.unshift(null);
        const accountVisibilityGroupID: UniFieldLayout = fields.find(x => x.Property === 'AccountVisibilityGroupID');
        accountVisibilityGroupID.Options = {
            source: this.accountVisibilityGroups,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        const taxMandatoryType: UniFieldLayout = fields.find(x => x.Property === 'TaxMandatoryType');
        taxMandatoryType.Options = {
            source: [{
                ID: 1,
                Name: 'Avgiftsfri'
            }, {
                ID: 2,
                Name: 'Avgiftsfri, men planlegger mva-registrering når omsetningsgrensen passeres'
            }, {
                ID: 3,
                Name: 'Avgiftspliktig'
            }],
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        const taxableFromLimit: UniFieldLayout = fields.find(x => x.Property === 'TaxableFromLimit');
        const taxableFrom: UniFieldLayout = fields.find(x => x.Property === 'TaxableFromDate');

        if (companySettings.TaxMandatoryType === 2) {
            taxableFromLimit.Hidden = false;
            taxableFrom.Hidden = false;
        } else {
            taxableFromLimit.Hidden = true;
            taxableFrom.Hidden = true;
        }

        this.companyTypes.unshift(null);
        const companyTypeID: UniFieldLayout = fields.find(x => x.Property === 'CompanyTypeID');
        companyTypeID.Options = {
            source: this.companyTypes,
            valueProperty: 'ID',
            displayProperty: 'FullName',
            debounceTime: 200
        };

        this.vatReportForms.unshift(null);
        const vatReportFormID: UniFieldLayout = fields.find(x => x.Property === 'VatReportFormID');
        vatReportFormID.Options = {
            source: this.vatReportForms,
            valueProperty: 'ID',
            debounceTime: 200,
            template: vatReportForm => `${vatReportForm.Name} ${vatReportForm.Description}`
        };

        const baseCurrency: UniFieldLayout = fields.find(x => x.Property === 'BaseCurrencyCodeID');
        baseCurrency.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            template: (obj: CurrencyCode) => obj ? `${obj.Code} - ${obj.Name}` : '',
            debounceTime: 200
        };

        const officeMunicipality: UniFieldLayout = fields.find(x => x.Property === 'OfficeMunicipalityNo');
        officeMunicipality.Options = {
            getDefaultData: () => this.municipalService
                .getByNumber(companySettings.OfficeMunicipalityNo),
            search: (text: string) => this.municipalService.search(text),
            debounceTime: 200,
            template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - `
                + `${obj.MunicipalityName.substr(0, 1).toUpperCase()
                + obj.MunicipalityName.substr(1).toLowerCase()}` : '',
            valueProperty: 'MunicipalityNo',
        };

        const periodSeriesAccountID: UniFieldLayout = fields.find(x => x.Property === 'PeriodSeriesAccountID');
        periodSeriesAccountID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType.toString() === '1'),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200,
            ReadOnly: true
        };

        const periodSeriesVatID: UniFieldLayout = fields.find(x => x.Property === 'PeriodSeriesVatID');
        periodSeriesVatID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType.toString() === '0'),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200,
            ReadOnly: true

        };

        const companyBankAccount: UniFieldLayout = fields.find(x => x.Property === 'CompanyBankAccount');
        companyBankAccount.Options = this.getBankAccountOptions('CompanyBankAccount', 'company');

        const taxBankAccount: UniFieldLayout = fields.find(x => x.Property === 'TaxBankAccount');
        taxBankAccount.Options = this.getBankAccountOptions('TaxBankAccount', 'tax');

        const salaryBankAccount: UniFieldLayout = fields.find(x => x.Property === 'SalaryBankAccount');
        salaryBankAccount.Options = this.getBankAccountOptions('SalaryBankAccount', 'salary');

        const settings = this.companySettings$.getValue();
        const apActivated: UniFieldLayout = fields.find(x => x.Property === 'APActivated');
        apActivated.Label = this.ehfService.isEHFActivated()
            ? 'Reaktiver EHF' : 'Aktiver EHF';
        apActivated.Options.class = this.ehfService.isEHFActivated() ? 'good' : '';

        const invoicePrint: UniFieldLayout = fields.find(x => x.Property === 'InvoicePrint');
        invoicePrint.Label = this.ehfService.isInvoicePrintActivated()
            ? 'Reaktiver Fakturaprint' : 'Aktiver Fakturaprint';
        invoicePrint.Options.class = this.ehfService.isInvoicePrintActivated() ? 'good' : '';


        const ocrToggle = fields.find(f => f.Property === 'UseOcrInterpretation');
        ocrToggle.Label = settings.UseOcrInterpretation ? 'Deaktiver fakturatolkning' : 'Aktiver fakturatolkning';
        ocrToggle.Options.class = settings.UseOcrInterpretation ? 'secondary bad' : '';

        this.fields$.next(fields);
    }

    private getBankAccountOptions(storeResultInProperty: string, bankAccountType: string) {
        const modalConfig: any = {
            ledgerAccountVisible: true,
            defaultAccountNumber: bankAccountType === 'company' ? 1920 : bankAccountType === 'tax' ? 1950 : null,
        };

        if (theme.theme === THEMES.SR) {
            modalConfig.BICLock = {
                BIC:  'SPRONO22',
                BankName: 'SpareBank 1 SR-Bank'
            };
        }

        return {
            entity: BankAccount,
            listProperty: 'BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            storeIdInProperty: storeResultInProperty + 'ID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount || bankaccount.ID <= 0) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.companySettingsService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.companySettings$.getValue().ID;
                    bankaccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    modalConfig: modalConfig,
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            }
        };
    }

    private generateInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email')
            .subscribe(
            company => {
                const data = this.companySettings$.getValue();
                data['_FileFlowEmail'] = company['FileFlowEmail'];
                const fields = this.fields$.getValue();
                fields.find(f => f.Property === '_FileFlowEmailActivated').Label = 'Deaktiver e-postmottak';
                fields.find(f => f.Property === '_FileFlowEmail').Hidden = false;
                fields.find(f => f.Property === '_UpdateEmail').Hidden = false;
                fields.find(f => f.Property === '_UpdateEmail').ReadOnly = true;
                fields.find(f => f.Property === '_FileFlowOrgnrEmailCheckbox').Hidden = false;
                fields.find(f => f.Property === '_FileFlowOrgnrEmail').Hidden = false;

                this.fields$.next(fields);
                this.companySettings$.next(data);

            }, err => this.errorService.handle(err));
    }

    private updateInvoiceEmail() {
        const data = this.companySettings$.getValue();
        const customEmail = data['_FileFlowEmail'];
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email', 'customEmail=' + customEmail)
        .subscribe(
            company => {
                this.form.field('_UpdateEmail').readMode();
                data['_FileFlowEmail'] = company['FileFlowEmail'];
                this.companySettings$.next(data);
            }, err => this.errorService.handle(err));
    }

    private disableInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-email')
            .subscribe(company => {
                const data = this.companySettings$.getValue();
                const fields = this.fields$.getValue();
                data['_FileFlowEmail'] = '';
                data['_FileFlowOrgnrEmail'] = '';
                data['_FileFlowOrgnrEmailCheckbox'] = false;
                fields.find(f => f.Property === '_FileFlowEmailActivated').Label = 'Aktiver e-postmottak';
                fields.find(f => f.Property === '_FileFlowEmail').Hidden = true;
                fields.find(f => f.Property === '_UpdateEmail').Hidden = true;
                fields.find(f => f.Property === '_FileFlowOrgnrEmailCheckbox').Hidden = true;
                fields.find(f => f.Property === '_FileFlowOrgnrEmail').Hidden = true;
                this.fields$.next(fields);
                this.companySettings$.next(data);
            },
            err => this.errorService.handle(err)
        );
    }

    private generateOrgnrInvoiceEmail() {
        const data = this.companySettings$.getValue();
        this.companyService.Action(this.authService.activeCompany.ID, 'create-orgnr-email')
            .subscribe(
            company => {
                data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
                this.companySettings$.next(data);
            }, err => {
                data['_FileFlowOrgnrEmailCheckbox'] = false;
                this.companySettings$.next(data);
                this.errorService.handle(err);
            });
    }

    private disableOrgnrInvoiceEmail() {
        const data = this.companySettings$.getValue();
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-orgnr-email')
            .subscribe(
            company => {
                data['_FileFlowOrgnrEmail'] = '';
                this.companySettings$.next(data);
            }, err => {
                data['_FileFlowOrgnrEmailCheckbox'] = true;
                this.companySettings$.next(data);
                this.errorService.handle(err);
            });
    }

    private getFormLayout() {
        this.fields$.next([
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyName',
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn',
                FieldSet: 1,
                Legend: 'Firma',
                Section: 0
            },
            {
                EntityType: 'CompanySettings',
                Property: 'OrganizationNumber',
                FieldType: FieldType.TEXT,
                Label: 'Orgnr',
                FieldSet: 1,
                Section: 0
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyTypeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Firmatype',
                FieldSet: 1,
                Section: 0,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'Supplier',
                Property: 'GLN',
                Label: 'GLN',
                FieldType: FieldType.TEXT,
                Section: 0,
                FieldSet: 1
            },
            {
                EntityType: 'CompanySettings',
                Property: 'OfficeMunicipalityNo',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Kontorkommune',
                FieldSet: 1,
                Section: 0
            },
            {
                Section: 0,
                FieldSet: 1,
                FieldType: FieldType.BUTTON,
                Label: 'Hent opplysninger fra br-reg',
                Options: {
                    click: () => this.openBrRegModal(),
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultAddress',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Adresse',
                FieldSet: 2,
                Legend: 'Kontaktinformasjon',
                Section: 0,
                openByDefault: true
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultEmail',
                FieldType: FieldType.MULTIVALUE,
                Label: 'E-post',
                FieldSet: 2,
                Section: 0
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultPhone',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Telefon',
                FieldSet: 2,
                Section: 0
            },
            {
                EntityType: 'CompanySettings',
                Property: 'WebAddress',
                FieldType: FieldType.URL,
                Label: 'Web',
                FieldSet: 2,
                Section: 0
            },
            // Here Firmalogo when UniImage in UniForm
            {
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Regnskapsperioder',
                FieldSet: 1,
                Section: 1,
                Sectionheader: 'Firmaoppsett',
                Legend: 'Perioder'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesVatID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Mva perioder',
                FieldSet: 1,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'VatLockedDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'MVA låst til',
                FieldSet: 1,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AccountingLockedDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Regnskap låst til',
                FieldSet: 1,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'BookCustomerInvoiceOnDeliveryDate',
                FieldType: FieldType.CHECKBOX,
                Label: 'Periodiser etter leveringsdato',
                FieldSet: 1,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AccountGroupSetID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Kontoplan',
                FieldSet: 2,
                Section: 1,
                Legend: 'Innstillinger',
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AccountVisibilityGroupID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Synlige kontoer',
                FieldSet: 2,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxMandatoryType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Mva-pliktig',
                FieldSet: 2,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxableFromLimit',
                FieldType: FieldType.NUMERIC,
                Label: 'Avgiftspliktig fra (beløpsgrense)',
                FieldSet: 2,
                Section: 1,
                Hidden: true,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxableFromDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Avgiftspliktig fra (dato)',
                FieldSet: 2,
                Section: 1,
                Hidden: true,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'VatReportFormID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Mva skjema',
                FieldSet: 2,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyRegistered',
                FieldType: FieldType.CHECKBOX,
                Label: 'Foretaksregistrert',
                FieldSet: 2,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CustomerCreditDays',
                FieldType: FieldType.TEXT,
                Label: 'Kredittdager',
                FieldSet: 3,
                Section: 1,
                Legend: 'Kunde/leverandør'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultSalesAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Standard salgskonto',
                FieldSet: 3,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CustomerAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Kundereskontro samlekonto',
                FieldSet: 3,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'SupplierAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Leverandørreskontro samlekonto',
                FieldSet: 3,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'SaveCustomersFromQuoteAsLead',
                FieldType: FieldType.CHECKBOX,
                Label: 'Lagre som lead',
                FieldSet: 3,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'BaseCurrencyCodeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Valuta',
                FieldSet: 4,
                Section: 1,
                Legend: 'Valuta',
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AgioGainAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto for valutagevinst',
                FieldSet: 4,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AgioLossAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto for valutatap',
                FieldSet: 4,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'ShowNumberOfDecimals',
                FieldType: FieldType.DROPDOWN,
                Label: 'Antall desimaler i visning av antall og pris',
                Section: 1,
                FieldSet: 5,
                Legend: 'Avrunding',
                Sectionheader: '',
                Options: {
                    source: this.roundingNumberOfDecimals,
                    valueProperty: 'Decimals',
                    displayProperty: 'Label'
                }
            },
            {
                Property: 'RoundingNumberOfDecimals',
                FieldType: FieldType.DROPDOWN,
                Label: 'Antall desimaler ved avrunding',
                Section: 1,
                FieldSet: 5,
                Sectionheader: 'Avrunding',
                Options: {
                    source: this.roundingNumberOfDecimals,
                    valueProperty: 'Decimals',
                    displayProperty: 'Label'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AcceptableDelta4CustomerPaymentAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto for øredifferanse',
                FieldSet: 5,
                Section: 1,
                Sectionheader: 'Øredifferanse ved innbetaling',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'AcceptableDelta4CustomerPayment',
                FieldType: FieldType.NUMERIC,
                Label: 'Akseptabelt differanse-beløp ved innbetaling',
                FieldSet: 5,
                Section: 1,
                Sectionheader: 'Øredifferanse ved innbetaling'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Driftskonto',
                FieldSet: 6,
                Section: 1,
                Legend: 'Bank',
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Skattetrekkskonto',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'SalaryBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Lønnskonto',
                Tooltip: {
                    Text: 'Dersom lønnskonto ikke er fylt ut vil lønn bruke driftskonto ved utbetaling'
                },
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'UsePaymentBankValues',
                FieldType: FieldType.CHECKBOX,
                Label: 'Betaling fra Nordea',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer',
                Hidden: theme.theme === THEMES.SR
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PaymentBankIdentification',
                FieldType: FieldType.TEXT,
                Label: 'Nordea signer id',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer',
                Hidden: this.hideBankValues || theme.theme === THEMES.SR,
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PaymentBankAgreementNumber',
                FieldType: FieldType.TEXT,
                Label: 'Nordea avtalenummer',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer',
                Hidden: this.hideBankValues || theme.theme === THEMES.SR
            },
            {
                EntityType: 'CompanySettings',
                Property: 'UseXtraPaymentOrgXmlTag',
                FieldType: FieldType.CHECKBOX,
                Label: 'Betaling fra DnB konto',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer',
                Hidden: theme.theme === THEMES.SR
            },
            {
                EntityType: 'CompanySettings',
                Property: 'XtraPaymentOrgXmlTagValue',
                FieldType: FieldType.TEXT,
                Label: 'Divisjonskode DNB',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer',
                Hidden: this.hideXtraPaymentOrgXmlTagValue || theme.theme === THEMES.SR
            },
            {
                EntityType: 'CompanySettings',
                Property: 'IgnorePaymentsWithoutEndToEndID',
                FieldType: FieldType.CHECKBOX,
                Label: 'Bokfør kun utbet. fra UE',
                Tooltip: {
                    Text: 'Utbetalinger som ikke er sendt fra systemet (som ikke har EndToEndID) blir ikke bokført'
                },
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'BankChargeAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto for bankgebyr',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'ShowKIDOnCustomerInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Vis KID i fakturablankett',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Selskapsoppsett'
            },
            {
                EntityType: 'CompanySettings',
                Label: 'Mellomkonto innbetaling',
                Property: 'InterrimPaymentAccountID',
                FieldType: FieldType.UNI_SEARCH,
                FieldSet: 6,
                Section: 1,
                Options: {
                    valueProperty: 'ID',
                    source: model => this.accountService
                        .GetAll(`filter=ID eq ${model.InterrimPaymentAccountID}`)
                        .map(results => results[0])
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
                }
            },
            {
                EntityType: 'CompanySettings',
                Label: 'Mellomkonto utbetaling',
                Property: 'InterrimRemitAccountID',
                FieldType: FieldType.UNI_SEARCH,
                FieldSet: 6,
                Section: 1,
                Options: {
                    valueProperty: 'ID',
                    source: model => this.accountService
                        .GetAll(`filter=ID eq ${model.InterrimRemitAccountID}`)
                        .map(results => results[0])
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TwoStageAutobankEnabled',
                FieldType: FieldType.CHECKBOX,
                Label: 'Autobank tofaktor autentisering',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Selskapsoppsett',
                Hidden: true // Remove when autobank full rollout is ready
            },
            {
                EntityType: 'CompanySettings',
                Property: 'InvoicePrint',
                FieldType: FieldType.BUTTON,
                Label: 'Kjøp fakturaprint fra markedsplassen',
                Sectionheader: 'Fakturaprint',
                Section: 1,
                FieldSet: 7,
                Legend: 'Elektroniske Faktura',
                Options: {
                    click: () => this.activateProduct('INVOICEPRINT', this.openActivateInvoicePrintModal.bind(this))
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'APActivated',
                FieldType: FieldType.BUTTON,
                Label: 'Kjøp EHF fra markedsplassen',
                Sectionheader: 'EHF',
                Section: 1,
                FieldSet: 7,
                Legend: 'Elektroniske Faktura',
                Options: {
                    click: () => this.activateProduct('EHF', this.openActivateAPModal.bind(this))
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'APIncludeAttachment',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inkluder pdf av faktura',
                FieldSet: 7,
                Section: 1,
                Legend: 'Elektronisk Faktura',
                Hidden: !this.companySettings$.getValue()['APActivated']
            },
            {
                Property: 'UseOcrInterpretation',
                FieldType: FieldType.BUTTON,
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Legend: 'Fakturatolk',
                Options: {
                    click: () => {
                        if (this.companySettings$.getValue().UseOcrInterpretation) {
                            this.deactivateOCR();
                        } else {
                            this.activateProduct('OCR-SCAN', this.openActivateOCRModal.bind(this));
                        }
                    }
                }
            },
            {
                Property: '_FileFlowEmailActivated',
                FieldType: FieldType.BUTTON,
                Label: this.companySettings$.getValue()['_FileFlowEmail'] ? 'Deaktiver e-postmottak' : 'Aktiver e-postmottak',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Legend: 'E-post mottak',
                Options: {
                    click: () => this.activateEmail()
                 }
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn Faktura e-mail',
                Property: '_FileFlowEmail',
                Placeholder: 'e-post',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                ReadOnly: false,
                Hidden: !this.companySettings$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.BUTTON,
                Label: 'Endre e-postadresse',
                Property: '_UpdateEmail',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Options: {
                    click: () => this.updateInvoiceEmail()
                },
                ReadOnly: this.companySettings$.getValue()['_FileFlowEmail'],
                Hidden: !this.companySettings$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.CHECKBOX,
                Label: 'Bruk orgnr for faktura e-post',
                Property: '_FileFlowOrgnrEmailCheckbox',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Hidden: !this.companySettings$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Orgnr faktura e-post',
                Property: '_FileFlowOrgnrEmail',
                Placeholder: 'ikke i bruk',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                ReadOnly: true,
                Hidden: !this.companySettings$.getValue()['_FileFlowEmail']
            },
            {
                EntityType: 'CompanySettings',
                Property: 'Factoring',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                Options: {
                    source: [{ID: 0, Label: ''}, {ID: 1, Label: 'SGFinans'}],
                    displayProperty: 'Label',
                    valueProperty: 'ID'
                },
                FieldSet: 8,
                Section: 1,
                Legend: 'Factoring',
                Hidden: false
            },
            {
                EntityType: 'CompanySettings',
                Property: 'FactoringNumber',
                FieldType: FieldType.TEXT,
                Label: 'Factoring nr.',
                FieldSet: 8,
                Section: 1,
                Hidden: false
            },
            {
                EntityType: 'CompanySettings',
                Property: 'FactoringEmail',
                FieldType: FieldType.MULTIVALUE,
                Label: 'E-post',
                FieldSet: 8,
                Section: 1
            },
        ]);

        this.reportSetupFields$.next([
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Vis logo i rapport',
                Property: 'company.LogoHideField',
                Options: {
                    source: this.logoHideOptions,
                    valueProperty: 'Value',
                    displayProperty: 'Label',
                    hideDeleteButton: true,
                    searchable: false,
                },
                Legend: 'Generelt',
                Section: 0,
                FieldSet: 1,
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Rapportlogo plassering',
                Property: 'company.LogoAlign',
                Options: {
                    source: this.logoAlignOptions,
                    valueProperty: 'Alignment',
                    displayProperty: 'Label',
                    hideDeleteButton: true,
                    searchable: false,
                },
                FieldSet: 1,
                Section: 0,
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Standard språk',
                Property: 'company.Localization',
                Options: {
                    source: this.localizationOptions,
                    valueProperty: 'Culture',
                    displayProperty: 'Label',
                    hideDeleteButton: true,
                    searchable: false,
                },
                Section: 0,
                FieldSet: 1,
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Property: 'company.DefaultCustomerQuoteReportID',
                Options: {
                    source: this.quoteFormList,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    hideDeleteButton: false,
                    searchable: false,
                },
                Legend: 'Tilbud',
                Section: 0,
                FieldSet: 2,
            },
            {
                FieldType: FieldType.TEXTAREA,
                EntityType: 'CampaignTemplate',
                Label: 'Fast tekst tilbud',
                Property: 'quoteTemplate.Template',
                Validations: [this.defaultTextValidation],
                FieldSet: 2,
                Section: 0,
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Property: 'company.DefaultCustomerOrderReportID',
                Options: {
                    source: this.orderFormList,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    hideDeleteButton: false,
                    searchable: false,
                },
                FieldSet: 3,
                Legend: 'Ordre',
                Section: 0,
            },
            {
                FieldType: FieldType.TEXTAREA,
                EntityType: 'CampaignTemplate',
                Label: 'Fast tekst ordre',
                Property: 'orderTemplate.Template',
                Validations: [this.defaultTextValidation],
                FieldSet: 3,
                Section: 0
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Property: 'company.DefaultCustomerInvoiceReportID',
                Options: {
                    source: this.invoiceFormList,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    hideDeleteButton: false,
                    searchable: false,
                },
                Section: 0,
                FieldSet: 4,
                Legend: 'Faktura',
            },
            {
                FieldType: FieldType.TEXTAREA,
                EntityType: 'CampaignTemplate',
                Label: 'Fast tekst faktura',
                Property: 'invoiceTemplate.Template',
                Validations: [this.defaultTextValidation],
                FieldSet: 4,
                Section: 0,
            },
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Property: 'company.DefaultCustomerInvoiceReminderReportID',
                Options: {
                    source: this.invoiceReminderFormList,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    hideDeleteButton: false,
                    searchable: false,
                },
                Section: 0,
                FieldSet: 5,
                Legend: 'Purring',
            }
        ]);
    }

    private defaultTextValidation(value: string, field: UniFieldLayout): UniFormError | null {
        if (value && value.length > 160) {
            return {
                value: value,
                errorMessage: 'Maks antall tegn er 160.',
                field: field,
                isWarning: false
            };
        }
        return null;
    }

    logoFileChanged(files: Array<any>) {
        const company = this.companySettings$.getValue();
        if (files && files.length > 0 && company.LogoFileID !== files[files.length - 1].ID) {
            // update logourl in company object
            company.LogoFileID = files[files.length - 1].ID;
            this.companySettings$.next(company);

            // run request to save it without the user clicking save, because otherwise
            // the LogoFileID and FileEntityLinks will be left in an inconsistent state
            this.companySettingsService.PostAction(1, 'update-logo', `logoFileId=${company.LogoFileID}`).subscribe(
                () => {},
                err => this.errorService.handle(err)
            );
        }
    }

    private activateProduct(productName: string, activationModal: () => void) {
        this.elsaPurchasesService.getPurchaseByProductName(productName).subscribe(purchase => {
            if (purchase) {
                activationModal();
            } else {
                const marketplaceUrl = `/marketplace/modules?productName=${productName}`;
                this.router.navigateByUrl(marketplaceUrl);
            }
        });
    }

    private openActivateAPModal() {
        this.modalService.open(UniActivateAPModal).onClose.subscribe(
            (status) => {
                if (status !== 0) {
                    this.companySettingsService.Get(1).subscribe(settings => {
                        const company = this.companySettings$.getValue();
                        company.BankAccounts = settings.BankAccounts;
                        company.CompanyBankAccount = settings.CompanyBankAccount;
                        this.companySettings$.next(company);

                        // Hacky, but uniform doesnt like things that change..
                        this.extendFormConfig();
                    });
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private openActivateInvoicePrintModal() {
        this.modalService.open(UniActivateInvoicePrintModal).onClose.subscribe(
            (status) => {
                if (status !== 0) {
                    this.companySettingsService.Get(1).subscribe(settings => {
                        const company = this.companySettings$.getValue();
                        company.BankAccounts = settings.BankAccounts;
                        company.CompanyBankAccount = settings.CompanyBankAccount;
                        this.companySettings$.next(company);

                        // Hacky, but uniform doesnt like things that change..
                        this.extendFormConfig();
                    });
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private openActivateOCRModal() {
        this.modalService.open(ActivateOCRModal).onClose.subscribe(activated => {
            if (activated) {
                const settings = this.companySettings$.getValue();
                settings.UseOcrInterpretation = true;
                this.companySettings$.next(settings);

                // Hacky, but uniform doesnt like things that change..
                this.extendFormConfig();
            }
        });
    }

    private deactivateOCR() {
        this.companySettingsService.PostAction(1, 'reject-ocr-agreement').subscribe(
            () => {
                const settings = this.companySettings$.getValue();
                settings.UseOcrInterpretation = false;
                this.companySettings$.next(settings);

                // Hacky, but uniform doesnt like things that change..
                this.extendFormConfig();
            },
            err => this.errorService.handle(err)
        );
    }

    private activateEmail() {
        const data = this.companySettings$.getValue();
        if (!data['_FileFlowEmail']) {
            this.generateInvoiceEmail();
        } else {
            this.disableInvoiceEmail();
        }
    }

    //#region Test data
    public syncAll() {
        console.log('SYNKRONISERER');
        this.accountService.PutAction(null, 'synchronize-ns4102-as')
            .subscribe(() => {
                console.log('1/2 Kontoplan synkronisert for AS');
                this.vatTypeService.PutAction(null, 'synchronize')
                    .subscribe(() => {
                        console.log('2/2 VatTypes synkronisert');
                        this.toastService.addToast(
                            'Synkronisert',
                            ToastType.good,
                            5,
                            'Kontoplan og momskoder synkronisert'
                        );
                    },
                    err => this.errorService.handle(err)
                    );
            },
            err => this.errorService.handle(err));
    }

    public syncAS() {
        console.log('SYNKRONISER KONTOPLAN');
        this.accountService.PutAction(null, 'synchronize-ns4102-as')
            .subscribe(
            (response: any) => {
                console.log('Kontoplan synkronisert for AS');
            },
            err => this.errorService.handle(err));
    }

    public syncVat() {
        console.log('SYNKRONISER MVA');
        this.vatTypeService.PutAction(null, 'synchronize')
            .subscribe(
            (response: any) => {
                console.log('VatTypes synkronisert');
            },
            err => this.errorService.handle(err));
    }

    public syncCurrency() {
        console.log('LAST NED VALUTA');
        this.currencyService.GetAction(null, 'download-from-norgesbank')
            .subscribe(
            (response: any) => {
                this.toastService.addToast('Valuta', ToastType.good, 5, 'Valuta lastet ned');
            },
            err => this.errorService.handle(err));
    }

    //#endregion Test data
}
