import {Component, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {IUniSaveAction} from '@uni-framework/save/save';
import {FieldType, UniForm, UniFormError} from '@uni-framework/ui/uniform/index';
import {UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {IUploadConfig} from '@uni-framework/uniImage/uniImage';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {SearchResultItem} from '../../common/externalSearch/externalSearch';
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
    CampaignTemplate
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
    EmailService,
    ErrorService,
    FinancialYearService,
    MunicipalService,
    PeriodSeriesService,
    PhoneService,
    UniSearchAccountConfig,
    VatReportFormService,
    VatTypeService,
    UniFilesService,
    AdminProductService,
    CampaignTemplateService
} from '@app/services/services';
import {SubEntitySettingsService} from '../agaAndSubEntitySettings/services/subEntitySettingsService';
import {CompanySettingsViewService} from './services/companySettingsViewService';
import {ChangeCompanySettingsPeriodSeriesModal} from '../companySettings/ChangeCompanyPeriodSeriesModal';
import {
    UniActivateAPModal,
    UniAddressModal,
    UniBankAccountModal,
    UniEmailModal,
    UniModalService,
    UniPhoneModal,
    ConfirmActions
} from '@uni-framework/uniModal/barrel';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import { AgreementService } from '@app/services/common/agreementService';

declare var _;

@Component({
    selector: 'settings',
    templateUrl: './companySettings.html'
})
export class CompanySettingsComponent implements OnInit {
    @ViewChild(UniForm)
    public form: UniForm;

    @ViewChild(ReminderSettings)
    public reminderSettings: ReminderSettings;

    public defaultExpands: any = [
        'DefaultAddress',
        'DefaultEmail',
        'DefaultPhone',
        'BankAccounts',
        'BankAccounts.Bank',
        'BankAccounts.Account',
        'CompanyBankAccount',
        'TaxBankAccount',
        'SalaryBankAccount',
        'DefaultSalesAccount'
    ];

    public company$: BehaviorSubject<CompanySettings> = new BehaviorSubject(null);
    private savedCompanyOrgValue: string;

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
    public imageUploadOptions: IUploadConfig;

    public addressChanged: any;
    public emailChanged: any;
    public phoneChanged: any;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;

    private showExternalSearch: boolean = false;
    private searchText: string = '';
    private organizationnumbertoast: number;

    public isDirty: boolean = false;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public companyLogoFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public saveactions: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (event) => this.saveSettings(event),
        main: true,
        disabled: false
    }];

    public roundingTypes: {ID: number, Label: string}[] = [
        {ID: 0, Label: 'Opp'},
    //    {ID: 1, Label: 'Ned'},
    //    {ID: 2, Label: 'Hele'},
    //    {ID: 3, Label: 'Halve'}
    ];

    private roundingNumberOfDecimals: {Decimals: number, Label: string}[] = [
        {Decimals: 0, Label: 'Ingen desimaler'},
        {Decimals: 2, Label: '2 desimaler'},
        // {Decimals: 3, Label: '3 desimaler'},
        // {Decimals: 4, Label: '4 desimaler'}
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

    private currentYear: number;

    private invoiceTemplate: CampaignTemplate;
    private orderTemplate: CampaignTemplate;
    private quoteTemplate: CampaignTemplate;

    public reportModel$: BehaviorSubject<any> = new BehaviorSubject({});

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
        private phoneService: PhoneService,
        private emailService: EmailService,
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
        private subEntitySettingsService: SubEntitySettingsService,
        private companySettingsViewService: CompanySettingsViewService,
        private adminProductService: AdminProductService,
        private router: Router,
        private agreementService: AgreementService,
        private campaignTemplateService: CampaignTemplateService
    ) {
        this.financialYearService.lastSelectedFinancialYear$.subscribe(
            res => this.currentYear = res.Year,
            err => this.errorService.handle(err)
        );
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {

        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.vatReportFormService.GetAll(null),
            this.currencyCodeService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.companySettingsService.Get(1),
            this.municipalService.GetAll(null),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity(null, 'Address'),
            this.accountVisibilityGroupService.GetAll(null, ['CompanyTypes']),
            this.financialYearService.GetAll(null),
            this.campaignTemplateService.getInvoiceTemplatetext(),
            this.campaignTemplateService.getOrderTemplateText(),
            this.campaignTemplateService.getQuoteTemplateText()
        ).subscribe(
            (dataset) => {
                this.companyTypes = dataset[0];
                this.vatReportForms = dataset[1];
                this.currencyCodes = dataset[2];
                this.periodSeries = dataset[3];
                this.accountGroupSets = dataset[4];
                this.municipalities = dataset[6];
                this.emptyPhone = dataset[7];
                this.emptyEmail = dataset[8];
                this.emptyAddress = dataset[9];
                // get accountvisibilitygroups that are not specific for a companytype
                this.accountVisibilityGroups = dataset[10].filter(x => x.CompanyTypes.length === 0);
                this.accountYears = dataset[11];
                this.accountYears.forEach(item => item['YearString'] = item.Year.toString());

                this.invoiceTemplate = JSON.parse(dataset[12]._body)[0]
                    || <CampaignTemplate>{
                        EntityName: 'CustomerInvoice',
                        Template: ''
                    };
                this.orderTemplate = JSON.parse(dataset[13]._body)[0]
                    || <CampaignTemplate>{
                        EntityName: 'CustomerOrder',
                        Template: ''
                    };
                this.quoteTemplate = JSON.parse(dataset[14]._body)[0]
                    || <CampaignTemplate>{
                        EntityName: 'CustomerQuote',
                        Template: ''
                    };



                this.reportModel$.next({
                    company: this.setupCompanySettingsData(dataset[5]),
                    orderTemplate: this.orderTemplate,
                    invoiceTemplate: this.invoiceTemplate,
                    quoteTemplate: this.quoteTemplate
                })

                // do this after getting emptyPhone/email/address
                this.company$.next(this.setupCompanySettingsData(dataset[5]));
                this.savedCompanyOrgValue = dataset[5].OrganizationNumber;
                this.companyService.Get(this.authService.activeCompany.ID).subscribe(
                    company => {
                        const data = this.company$.getValue();
                        data['_FileFlowEmail'] = company['FileFlowEmail'];
                        data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
                        data['_FileFlowOrgnrEmailCheckbox'] = !!data['_FileFlowOrgnrEmail'];
                        data.LogoHideField = data.LogoHideField || this.logoHideOptions[2].Value;
                        data.LogoAlign = data.LogoAlign || this.logoAlignOptions[0].Alignment;
                        this.company$.next(data);
                        this.getFormLayout();
                        this.extendFormConfig();
                    },
                    err => this.errorService.handle(err)
                );

                this.showExternalSearch = this.company$.getValue().OrganizationNumber === '';

                if (this.showExternalSearch) {
                    setTimeout(() => {
                        this.searchText = this.company$.getValue().CompanyName;
                    });
                }

                if (this.showExternalSearch) {
                    this.form.field('CompanyName')
                        .component
                        .control
                        .valueChanges
                        .debounceTime(300)
                        .distinctUntilChanged()
                        .subscribe((data) => {
                            this.searchText = data;
                        });
                }
            },
            err => this.errorService.handle(err)
            );
    }

    private setupCompanySettingsData(companySettings: CompanySettings) {
        // this is done to make it easy to use the multivalue component - this works with arrays
        // so we create dummy arrays and put our default address, phone and email in the arrays
        // even though we actually only have one of each
        companySettings.DefaultAddress = companySettings.DefaultAddress
            ? companySettings.DefaultAddress : this.emptyAddress;
        companySettings['Addresses'] = [companySettings.DefaultAddress];
        companySettings.DefaultPhone = companySettings.DefaultPhone ? companySettings.DefaultPhone : this.emptyPhone;
        companySettings['Phones'] = [companySettings.DefaultPhone];
        companySettings.DefaultEmail = companySettings.DefaultEmail ? companySettings.DefaultEmail : this.emptyEmail;
        companySettings['Emails'] = [companySettings.DefaultEmail];

        return companySettings;
    }

    public onFormReady() {
        const data = this.company$.getValue();
        if (data['_FileFlowEmail']) {
            this.form.field('_UpdateEmail').readMode(); // Disable button update email address as initial state
        }
    }

    public addSearchInfo(searchInfo: SearchResultItem) {
        const company = this.company$.getValue();

        company.OrganizationNumber = searchInfo.orgnr;
        company.CompanyName = searchInfo.navn;
        company.DefaultAddress.AddressLine1 = searchInfo.forretningsadr;
        company.DefaultAddress.PostalCode = searchInfo.forradrpostnr;
        company.DefaultAddress.City = searchInfo.forradrpoststed;
        company.OfficeMunicipalityNo = searchInfo.forradrkommnr;
        company.DefaultPhone.Number = searchInfo.tlf;
        company.WebAddress = searchInfo.url;

        const companyType = this.companyTypes.find(x => x !== null && x.Name === searchInfo.organisasjonsform);
        if (companyType) {
            company.CompanyTypeID = companyType.ID;
        }
        this.company$.next(company);
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
                company: this.company$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['orderTemplate.Template']) {
            this.orderTemplate.Template = changes['orderTemplate.Template'].currentValue;
            this.reportModel$.next({
                company: this.company$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['invoiceTemplate.Template']) {
            this.invoiceTemplate.Template = changes['invoiceTemplate.Template'].currentValue;
            this.reportModel$.next({
                company: this.company$.value,
                orderTemplate: this.orderTemplate,
                invoiceTemplate: this.invoiceTemplate,
                quoteTemplate: this.quoteTemplate
            });
        }

        if (changes['PeriodSeriesAccountID'] || changes['PeriodSeriesVatID']) {
            this.modalService.open(ChangeCompanySettingsPeriodSeriesModal).onClose.subscribe(
                result => {
                    this.router.navigateByUrl('/settings/company');
                }, err => this.errorService.handle
            );
        }

        if (changes['CompanyBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['CompanyBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'CompanyBankAccount');
                        const list = _.get(this.company$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.company$.next(this.company$.getValue());
                });
        }

        if (changes['TaxBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['TaxBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'TaxBankAccount');
                        const list = _.get(this.company$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.company$.next(this.company$.getValue());
                });
        }

        if (changes['SalaryBankAccount']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['SalaryBankAccount'])
                .catch((ba: BankAccount) => {
                    const field: UniFieldLayout = this.fields$
                        .getValue().find(x => x.Property === 'SalaryBankAccount');
                        const list = _.get(this.company$.getValue(), field.Options.listProperty);
                    ba['_mode'] = 0;
                    list.push(ba);
                    this.company$.next(this.company$.getValue());
                });
        }

        if (changes['OrganizationNumber']) {
            const organizationnumber = changes['OrganizationNumber'].currentValue;
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

                this.company$
                    .asObservable()
                    .take(1)
                    .subscribe(
                        compSettings => this.promptImportFromBrregIfNeeded(compSettings),
                        err => this.errorService.handle(err)
                    );
            }
        }

        if (changes['_FileFlowOrgnrEmailCheckbox']) {
            const data = this.company$.getValue();
            if (data['_FileFlowOrgnrEmailCheckbox']) {
                this.generateOrgnrInvoiceEmail();
            } else {
                this.disableOrgnrInvoiceEmail();
            }
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
        }
    }

    public saveSettings(complete) {
        const company = this.company$.value;
        const templates = [this.invoiceTemplate, this.orderTemplate, this.quoteTemplate];

        if (company.BankAccounts) {
            company.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 && !bankaccount['_createguid']) {
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                }
            });
        }

        if (company.DefaultAddress.ID === 0 && !company.DefaultAddress['_createguid']) {
            company.DefaultAddress['_createguid'] = this.addressService.getNewGuid();
        }

        if (company.DefaultEmail.ID === 0 && !company.DefaultEmail['_createguid']) {
            company.DefaultEmail['_createguid'] = this.emailService.getNewGuid();
        }

        if (company.DefaultPhone.ID === 0 && !company.DefaultPhone['_createguid']) {
            company.DefaultPhone['_createguid'] = this.phoneService.getNewGuid();
        }

        if (company.CompanyBankAccount) {
            if (!company.CompanyBankAccount.ID) {
                company.CompanyBankAccount['_createguid'] = this.bankaccountService.getNewGuid();
                company.CompanyBankAccount.BankAccountType = 'company';
            }
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.CompanyBankAccount);
        }

        if (company.TaxBankAccount) {
            if (!company.TaxBankAccount.ID) {
                company.TaxBankAccount['_createguid'] = this.bankaccountService.getNewGuid();
                company.TaxBankAccount.BankAccountType = 'bankaccount';
            }
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.TaxBankAccount);
        }

        if (company.SalaryBankAccount) {
            if (!company.SalaryBankAccount.ID) {
                company.SalaryBankAccount['_createguid'] = this.bankaccountService.getNewGuid();
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
            .do((companySettings: CompanySettings) => this.promptUpdateOfSubEntitiesIfNeeded(companySettings))
            .subscribe(
            (response) => {
                this.companySettingsService.Get(1).subscribe(retrievedCompany => {
                    // this.company$.next(this.setupCompanySettingsData(retrievedCompany));
                    this.getDataAndSetupForm();
                    this.showExternalSearch = retrievedCompany.OrganizationNumber === '';

                    this.reminderSettings.save().then(() => {
                        this.isDirty = false;
                        this.toastService.addToast('Innstillinger lagret', ToastType.good, 3);
                        complete('Innstillinger lagret');

                        // just start this after saving settings - it wont matter much if it
                        // fails, so the service will fail silently if the updated settings
                        // cant be synced
                        this.uniFilesService.syncUniEconomyCompanySettings();

                        const currentFinancialYear = new FinancialYear();
                        currentFinancialYear.Year = response.CurrentAccountingYear;
                        // setting currentAccountingYear in dropdown as well, this triggers route change to '/'
                        if (company.CurrentAccountingYear !== this.currentYear) {
                            this.financialYearService.setActiveYear(currentFinancialYear);
                        }
                    }).catch((err) => {
                        this.errorService.handle(err);
                        complete('Purreinnstillinger feilet i lagring');
                    });
                });
            },
            (err) => {
                this.errorService.handle(err);
                complete('Lagring feilet.');
            }
        );
    }

    private promptUpdateOfSubEntitiesIfNeeded(companySettings: CompanySettings) {
        if (companySettings.OrganizationNumber !== this.savedCompanyOrgValue) {
            this.subEntitySettingsService
                .addSubEntitiesFromExternal(companySettings.OrganizationNumber)
                .subscribe(
                    subEntities => this.savedCompanyOrgValue = companySettings.OrganizationNumber,
                    err => this.errorService.handle(err)
                );
        }
    }

    private promptImportFromBrregIfNeeded(companySettings: CompanySettings) {
        if (!!this.savedCompanyOrgValue && this.savedCompanyOrgValue !== '-') {
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
                this.company$.next(compSettings);
                this.saveSettings(() => {});
            }, err => this.errorService.handle(err));
    }

    public updateMunicipalityName() {
        const company = this.company$.getValue();
        this.municipalService.GetAll(`filter=MunicipalityNo eq '${company.OfficeMunicipalityNo}'`)
            .subscribe((data) => {
                if (data && data.length > 0) {
                    company['MunicipalityName'] = data[0].MunicipalityName;
                    this.company$.next(company);
                }
            }, err => this.errorService.handle(err));
    }

    private extendFormConfig() {
        const fields = this.fields$.getValue();
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

        const currentAccountYear: UniFieldLayout = fields.find(x => x.Property === 'CurrentAccountingYear');
        currentAccountYear.Options = {
            source: this.accountYears,
            valueProperty: 'Year',
            displayProperty: 'YearString',
            debounceTime: 200
        };

        const officeMunicipality: UniFieldLayout = fields.find(x => x.Property === 'OfficeMunicipalityNo');
        officeMunicipality.Options = {
            source: this.municipalities,
            valueProperty: 'MunicipalityNo',
            displayProperty: 'MunicipalityNo',
            debounceTime: 200,
            template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - `
                + `${obj.MunicipalityName.substr(0, 1).toUpperCase()
                + obj.MunicipalityName.substr(1).toLowerCase()}` : ''
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

        const settings = this.company$.getValue();
        const apActivated: UniFieldLayout = fields.find(x => x.Property === 'APActivated');
        apActivated.Label = settings.APActivated ? 'Reaktiver' : 'Aktiver';
        apActivated.Options.class = settings.APActivated ? 'good' : '';

        this.fields$.next(fields);
    }

    private getBankAccountOptions(storeResultInProperty, bankAccountType) {
        return {
            entity: BankAccount,
            listProperty: 'BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            storeIdInProperty: storeResultInProperty + 'ID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount || !bankaccount.ID) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.company$.getValue().ID;
                    bankaccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    modalConfig: {
                        ledgerAccountVisible: true
                    },
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
                const data = this.company$.getValue();
                data['_FileFlowEmail'] = company['FileFlowEmail'];
                const fields = this.fields$.getValue();
                fields.find(f => f.Property === '_APActivatedOCR').Label = 'Deaktiver OCR';
                fields.find(f => f.Property === '_FileFlowEmail').Hidden = false;
                fields.find(f => f.Property === '_UpdateEmail').Hidden = false;
                fields.find(f => f.Property === '_FileFlowOrgnrEmailCheckbox').Hidden = false;
                fields.find(f => f.Property === '_FileFlowOrgnrEmail').Hidden = false;
                this.fields$.next(fields);
                this.company$.next(data);
                setTimeout(() => {
                     this.form.field('_UpdateEmail').readMode();
                }, 100); // temp solution
            }, err => this.errorService.handle(err));
    }

    private updateInvoiceEmail() {
        const data = this.company$.getValue();
        const customEmail = data['_FileFlowEmail'];
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email', 'customEmail=' + customEmail)
        .subscribe(
            company => {
                this.form.field('_UpdateEmail').readMode();
                data['_FileFlowEmail'] = company['FileFlowEmail'];
                this.company$.next(data);
            }, err => this.errorService.handle(err));
    }

    private disableInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-email')
        .subscribe(
        company => {
            const data = this.company$.getValue();
            const fields = this.fields$.getValue();
            data['_FileFlowEmail'] = '';
            data['_FileFlowOrgnrEmail'] = '';
            data['_FileFlowOrgnrEmailCheckbox'] = false;
            fields.find(f => f.Property === '_APActivatedOCR').Label = 'Aktiver OCR';
            fields.find(f => f.Property === '_FileFlowEmail').Hidden = true;
            fields.find(f => f.Property === '_UpdateEmail').Hidden = true;
            fields.find(f => f.Property === '_FileFlowOrgnrEmailCheckbox').Hidden = true;
            fields.find(f => f.Property === '_FileFlowOrgnrEmail').Hidden = true;
            this.fields$.next(fields);
            this.company$.next(data);
        }, err => this.errorService.handle(err));
    }

    private generateOrgnrInvoiceEmail() {
        const data = this.company$.getValue();
        this.companyService.Action(this.authService.activeCompany.ID, 'create-orgnr-email')
            .subscribe(
            company => {
                data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
                this.company$.next(data);
            }, err => {
                data['_FileFlowOrgnrEmailCheckbox'] = false;
                this.company$.next(data);
                this.errorService.handle(err);
            });
    }

    private disableOrgnrInvoiceEmail() {
        const data = this.company$.getValue();
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-orgnr-email')
            .subscribe(
            company => {
                data['_FileFlowOrgnrEmail'] = '';
                this.company$.next(data);
            }, err => {
                data['_FileFlowOrgnrEmailCheckbox'] = true;
                this.company$.next(data);
                this.errorService.handle(err);
            });
    }

    private getFormLayout() {
        this.config$.next({});
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
                Label: 'Epost',
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
                Property: 'CurrentAccountingYear',
                FieldType: FieldType.DROPDOWN,
                Label: 'Aktivt regnskapsår',
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
                Property: 'TaxMandatory',
                FieldType: FieldType.CHECKBOX,
                Label: 'Mva-pliktig',
                FieldSet: 2,
                Section: 1,
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
                Label: 'Foretaksregistert',
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
                Legend: 'Kundeleverandør'
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
                HelpText: 'Dersom lønnskonto ikke er fylt ut vil lønn bruke driftskonto ved utbetaling',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PaymentBankIdentification',
                FieldType: FieldType.TEXT,
                Label: 'Bank-integrasjon ID',
                FieldSet: 6,
                Section: 1,
                Sectionheader: 'Bankkontoer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'UseXtraPaymentOrgXmlTag',
                FieldType: FieldType.CHECKBOX,
                Label: 'Betaling fra DnB konto',
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
                Property: 'APActivated',
                FieldType: FieldType.BUTTON,
                Label: 'Kjøp EHF fra markedsplassen',
                Sectionheader: 'EHF',
                Section: 1,
                FieldSet: 7,
                Legend: 'Elektroniske Faktura',
                Options: {
                    click: () => this.activateAP()
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'APIncludeAttachment',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inkluder pdf av faktura',
                FieldSet: 7,
                Section: 1,
                Legend: 'Elektronisk Faktura'
            },
            {
                Property: '_APActivatedOCR',
                FieldType: FieldType.BUTTON,
                Label: this.company$.getValue()['_FileFlowEmail'] ? 'Deaktiver OCR' : 'Aktiver OCR',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Legend: 'OCR Faktura',
                Options: {
                    click: () => this.confirmTermsOCR()
                 }
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn Faktura e-mail',
                Property: '_FileFlowEmail',
                Placeholder: 'epost',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                ReadOnly: false,
                Hidden: !this.company$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.BUTTON,
                Label: 'Endre epost adresse',
                Property: '_UpdateEmail',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Options: {
                    click: () => this.updateInvoiceEmail()
                },
                ReadOnly: this.company$.getValue()['_FileFlowEmail'],
                Hidden: !this.company$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.CHECKBOX,
                Label: 'Bruk orgnr for faktura epost',
                Property: '_FileFlowOrgnrEmailCheckbox',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                Hidden: !this.company$.getValue()['_FileFlowEmail']
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Orgnr faktura epost',
                Property: '_FileFlowOrgnrEmail',
                Placeholder: 'ikke i bruk',
                Sectionheader: 'Diverse',
                Section: 1,
                FieldSet: 7,
                ReadOnly: true,
                Hidden: !this.company$.getValue()['_FileFlowEmail']
            }
        ]);

        this.companyLogoFields$.next([
            {
                FieldType: FieldType.DROPDOWN,
                Label: 'Vis logo i rapport',
                Property: 'company.LogoHideField',
                Options: {
                    source: this.logoHideOptions,
                    valueProperty: 'Value',
                    displayProperty: 'Label',
                    hideDeleteButton: true,
                },
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
                },
                FieldSet: 1,
                Section: 0,
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
                FieldType: FieldType.TEXTAREA,
                EntityType: 'CampaignTemplate',
                Label: 'Fast tekst ordre',
                Property: 'orderTemplate.Template',
                Validations: [this.defaultTextValidation],
                FieldSet: 3,
                Section: 0
            },
            {
                FieldType: FieldType.TEXTAREA,
                EntityType: 'CampaignTemplate',
                Label: 'Fast tekst faktura',
                Property: 'invoiceTemplate.Template',
                Validations: [this.defaultTextValidation],
                FieldSet: 4,
                Section: 0,
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

    private logoFileChanged(files: Array<any>) {
        let company = this.company$.getValue();
        if (files && files.length > 0 && company.LogoFileID !== files[files.length - 1].ID) {
            // update logourl in company object
            company.LogoFileID = files[files.length - 1].ID;
            this.company$.next(company);

            // run request to save it without the user clicking save, because otherwise
            // the LogoFileID and FileEntityLinks will be left in an inconsistent state
            this.companySettingsService.PostAction(1, 'update-logo', `logoFileId=${company.LogoFileID}`)
                .subscribe((res) => {
                    this.toastService.addToast('Logo lagret', ToastType.good, ToastTime.short);
                }, err => this.errorService.handle(err));
        }
    }

    private activateAP() {
        let settings = this.company$.getValue();
        if (settings.APActivated) {
            this.modalService.open(UniActivateAPModal)
                .onClose.subscribe((status) => {
                    if (status !== 0) {
                        this.companySettingsService.Get(1).subscribe(settings => {
                            let company = this.company$.getValue();
                            company.BankAccounts = settings.BankAccounts;
                            company.CompanyBankAccount = settings.CompanyBankAccount;
                            this.company$.next(company);
                        });
                    }
                }, err => this.errorService.handle(err));
        } else {
            this.adminProductService.FindProductByName('EHF').subscribe(p => {
                this.router.navigateByUrl('/marketplace/add-ons/' + p.id);
            });
        }
    }

    private confirmTermsOCR() {
        const data = this.company$.getValue();
        if (!data['_FileFlowEmail']) {
            this.agreementService.Current('OCR').subscribe(message => {
                this.modalService.confirm({
                    header: 'Betingelser',
                    message: message,
                    class: 'medium',
                    buttonLabels: {
                        accept: 'Aksepter',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.generateInvoiceEmail();
                    }
                });
            });
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
