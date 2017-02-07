import {Component, OnInit, ViewChild} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {IUniSaveAction} from '../../../../framework/save/save';

import {UniForm, FieldType, UniField} from 'uniform-ng2/main';
import {UniFieldLayout} from 'uniform-ng2/main';
import {IUploadConfig} from '../../../../framework/uniImage/uniImage';

import {
    CompanyType, CompanySettings, VatReportForm, PeriodSeries, Currency, AccountGroup, Account,
    BankAccount, Municipal, Address, Phone, Email, AccountVisibilityGroup, Company
} from '../../../unientities';
import {BankAccountModal} from '../../common/modals/modals';
import {AddressModal, EmailModal, PhoneModal} from '../../common/modals/modals';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {SearchResultItem} from '../../common/externalSearch/externalSearch';
import {AuthService} from '../../../../framework/core/authService';
import {ReminderSettings} from '../../common/reminder/settings/reminderSettings';
import {
    CompanySettingsService,
    CurrencyService,
    VatTypeService,
    AccountService,
    AccountGroupSetService,
    PeriodSeriesService,
    PhoneService,
    EmailService,
    CompanyTypeService,
    VatReportFormService,
    MunicipalService,
    BankAccountService,
    AddressService,
    AccountVisibilityGroupService,
    ErrorService,
    CompanyService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html'
})
export class CompanySettingsComponent implements OnInit {
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(ReminderSettings) public reminderSettings: ReminderSettings;

    private defaultExpands: any = [
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

    private company$: BehaviorSubject<CompanySettings> = new BehaviorSubject(null);
    public onlyCompanyModel$: BehaviorSubject<Company> = new BehaviorSubject(null);

    private companyTypes: Array<CompanyType> = [];
    private vatReportForms: Array<VatReportForm> = [];
    private currencies: Array<Currency> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private accounts: Array<Account> = [];
    private municipalities: Municipal[] = [];
    private accountVisibilityGroups: AccountVisibilityGroup[] = [];
    private bankAccountChanged: any;

    private showImageSection: boolean = false; // used in template
    private showReminderSection: boolean = false; // used in template
    private imageUploadOptions: IUploadConfig; // used in template

    private addressChanged: any;
    private emailChanged: any;
    private phoneChanged: any;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;

    private showExternalSearch: boolean = false;
    private searchText: string = '';

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public onlyCompanyConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public onlyCompanyFields$: BehaviorSubject<any[]> = new BehaviorSubject(this.generateOnlyCompanyFields());

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (event) => this.saveSettings(event),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private companySettingsService: CompanySettingsService,
        private accountService: AccountService,
        private currencyService: CurrencyService,
        private accountGroupSetService: AccountGroupSetService,
        private periodeSeriesService: PeriodSeriesService,
        private companyTypeService: CompanyTypeService,
        private vatReportFormService: VatReportFormService,
        private vatTypeService: VatTypeService,
        private municipalService: MunicipalService,
        private bankAccountService: BankAccountService,
        private addressService: AddressService,
        private phoneService: PhoneService,
        private emailService: EmailService,
        private toastService: ToastService,
        private accountVisibilityGroupService: AccountVisibilityGroupService,
        private companyService: CompanyService,
        private authService: AuthService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
        this.companyService.Get(this.authService.activeCompany.ID).subscribe(
            company => this.onlyCompanyModel$.next(company),
            err => this.errorService.handle(err)
        );
    }

    private getDataAndSetupForm() {
        this.getFormLayout();

        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.vatReportFormService.GetAll(null),
            this.currencyService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.accountService.GetAll('filter=Visible eq true&orderby=AccountNumber'),
            this.companySettingsService.Get(1),
            this.municipalService.GetAll(null),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity(null, 'Address'),
            this.accountVisibilityGroupService.GetAll(null, ['CompanyTypes'])
        ).subscribe(
            (dataset) => {
                this.companyTypes = dataset[0];
                this.vatReportForms = dataset[1];
                this.currencies = dataset[2];
                this.periodSeries = dataset[3];
                this.accountGroupSets = dataset[4];
                this.accounts = dataset[5];
                this.municipalities = dataset[7];
                this.emptyPhone = dataset[8];
                this.emptyEmail = dataset[9];
                this.emptyAddress = dataset[10];
                // get accountvisibilitygroups that are not specific for a companytype
                this.accountVisibilityGroups = dataset[11].filter(x => x.CompanyTypes.length === 0);

                console.log(dataset[6]);
                // do this after getting emptyPhone/email/address
                this.company$.next(this.setupCompanySettingsData(dataset[6]));

                this.showExternalSearch = this.company$.getValue().OrganizationNumber === '';

                if (this.showExternalSearch) {
                    setTimeout(() => {
                        this.searchText = this.company$.getValue().CompanyName;
                    });
                }

                this.extendFormConfig();

                setTimeout(() => {
                    if (this.showExternalSearch) {
                        this.form.field('CompanyName')
                            .Component
                            .control
                            .valueChanges
                            .debounceTime(300)
                            .distinctUntilChanged()
                            .subscribe((data) => {
                                this.searchText = data;
                            });
                    }
                });

            },
            err => this.errorService.handle(err)
            );
    }

    private setupCompanySettingsData(companySettings: CompanySettings) {
        // this is done to make it easy to use the multivalue component - this works with arrays
        // so we create dummy arrays and put our default address, phone and email in the arrays
        // even though we actually only have one of each
        companySettings.DefaultAddress = companySettings.DefaultAddress ? companySettings.DefaultAddress : this.emptyAddress;
        companySettings['Addresses'] = [companySettings.DefaultAddress];
        companySettings.DefaultPhone = companySettings.DefaultPhone ? companySettings.DefaultPhone : this.emptyPhone;
        companySettings['Phones'] = [companySettings.DefaultPhone];
        companySettings.DefaultEmail = companySettings.DefaultEmail ? companySettings.DefaultEmail : this.emptyEmail;
        companySettings['Emails'] = [companySettings.DefaultEmail];

        return companySettings;
    }

    private addSearchInfo(searchInfo: SearchResultItem) {
        let company = this.company$.getValue();

        company.OrganizationNumber = searchInfo.orgnr;
        company.CompanyName = searchInfo.navn;
        company.DefaultAddress.AddressLine1 = searchInfo.forretningsadr;
        company.DefaultAddress.PostalCode = searchInfo.forradrpostnr;
        company.DefaultAddress.City = searchInfo.forradrpoststed;
        company.OfficeMunicipalityNo = searchInfo.forradrkommnr;
        company.DefaultPhone.Number = searchInfo.tlf;
        company.WebAddress = searchInfo.url;

        let companyType = this.companyTypes.find(x => x != null && x.Name === searchInfo.organisasjonsform);
        if (companyType) {
            company.CompanyTypeID = companyType.ID;
        }

        this.company$.next(company);
    }

    public saveSettings(complete) {
        let company = this.company$.getValue();
        if (company.OrganizationNumber === ''
            || isNaN(<any>company.OrganizationNumber)) {
            alert('Vennligst oppgi et gyldig organisasjonsnr');
            complete('Ugyldig organisasjonsnr, lagring avbrutt');
            return;
        }

        if (company.BankAccounts) {
            company.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 && !bankaccount['_createguid']) {
                    bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
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
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.CompanyBankAccount);
        }

        if (company.TaxBankAccount) {
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.TaxBankAccount);
        }

        if (company.SalaryBankAccount) {
            company.BankAccounts = company.BankAccounts.filter(x => x !== company.SalaryBankAccount);
        }

        this.companySettingsService.Put(company.ID, company).subscribe(
            (reponse) => {
                this.companySettingsService.Get(1).subscribe(retrievedCompany => {
                    this.company$.next(this.setupCompanySettingsData(retrievedCompany));
                    this.showExternalSearch = retrievedCompany.OrganizationNumber === '';

                    this.reminderSettings.save().then(() => {
                        this.toastService.addToast('Innstillinger lagret', ToastType.good, 3);
                        complete('Innstillinger lagret');
                    });
                });
            },
            (err) => this.errorService.handle(err)
        );
    }

    private updateMunicipalityName() {
        let company = this.company$.getValue();
        this.municipalService.GetAll(`filter=MunicipalityNo eq '${company.OfficeMunicipalityNo}'`)
            .subscribe((data) => {
                if (data && data.length > 0) {
                    company['MunicipalityName'] = data[0].MunicipalityName;
                    this.company$.next(company);
                }
            }, err => this.errorService.handle(err));
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();
        var defaultAddress: UniFieldLayout = fields.find(x => x.Property === 'DefaultAddress');
        defaultAddress.Options = {
            allowAddValue: false,
            allowDeleteValue: false,
            entity: Address,
            listProperty: 'Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var phones: UniFieldLayout = fields.find(x => x.Property === 'DefaultPhone');

        phones.Options = {
            allowAddValue: false,
            allowDeleteValue: false,
            entity: Phone,
            listProperty: 'Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultPhoneID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Phone();
                    value.ID = 0;
                }

                this.phoneModal.openModal(value);

                this.phoneChanged = this.phoneModal.Changed.subscribe(modalval => {
                    this.phoneChanged.unsubscribe();
                    resolve(modalval);
                });
            })
        };

        var emails: UniFieldLayout = fields.find(x => x.Property === 'DefaultEmail');

        emails.Options = {
            allowAddValue: false,
            allowDeleteValue: false,
            entity: Email,
            listProperty: 'Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'DefaultEmailID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Email();
                    value.ID = 0;
                }

                this.emailModal.openModal(value);

                this.emailChanged = this.emailModal.Changed.subscribe(modalval => {
                    this.emailChanged.unsubscribe();
                    resolve(modalval);
                });
            })
        };


        this.accountGroupSets.unshift(null);
        let accountGroupSetID: UniFieldLayout = fields.find(x => x.Property === 'AccountGroupSetID');
        accountGroupSetID.Options = {
            source: this.accountGroupSets,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.accountVisibilityGroups.unshift(null);
        let accountVisibilityGroupID: UniFieldLayout = fields.find(x => x.Property === 'AccountVisibilityGroupID');
        accountVisibilityGroupID.Options = {
            source: this.accountVisibilityGroups,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.companyTypes.unshift(null);
        let companyTypeID: UniFieldLayout = fields.find(x => x.Property === 'CompanyTypeID');
        companyTypeID.Options = {
            source: this.companyTypes,
            valueProperty: 'ID',
            displayProperty: 'FullName',
            debounceTime: 200
        };

        this.vatReportForms.unshift(null);
        let vatReportFormID: UniFieldLayout = fields.find(x => x.Property === 'VatReportFormID');
        vatReportFormID.Options = {
            source: this.vatReportForms,
            valueProperty: 'ID',
            debounceTime: 200,
            template: vatReportForm => `${vatReportForm.Name} ${vatReportForm.Description}`
        };

        this.currencies.unshift(null);
        let baseCurrency: UniFieldLayout = fields.find(x => x.Property === 'BaseCurrency');
        baseCurrency.Options = {
            source: this.currencies,
            valueProperty: 'Code',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let supplierAccountID: UniFieldLayout = fields.find(x => x.Property === 'SupplierAccountID');
        supplierAccountID.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let customerAccountID: UniFieldLayout = fields.find(x => x.Property === 'CustomerAccountID');
        customerAccountID.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let defaultSalesAccountID: UniFieldLayout = fields.find(x => x.Property === 'DefaultSalesAccountID');
        defaultSalesAccountID.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let officeMunicipality: UniFieldLayout = fields.find(x => x.Property === 'OfficeMunicipalityNo');
        officeMunicipality.Options = {
            source: this.municipalities,
            valueProperty: 'MunicipalityNo',
            displayProperty: 'MunicipalityNo',
            debounceTime: 200,
            template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase() + obj.MunicipalityName.substr(1).toLowerCase()}` : ''
        };

        let periodSeriesAccountID: UniFieldLayout = fields.find(x => x.Property === 'PeriodSeriesAccountID');
        periodSeriesAccountID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType == 1),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let periodSeriesVatID: UniFieldLayout = fields.find(x => x.Property === 'PeriodSeriesVatID');
        periodSeriesVatID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType == 0),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let companyBankAccount: UniFieldLayout = fields.find(x => x.Property === 'CompanyBankAccount');
        companyBankAccount.Options = this.getBankAccountOptions('CompanyBankAccountID', 'company');

        let taxBankAccount: UniFieldLayout = fields.find(x => x.Property === 'TaxBankAccount');
        taxBankAccount.Options = this.getBankAccountOptions('TaxBankAccountID', 'tax');

        let salaryBankAccount: UniFieldLayout = fields.find(x => x.Property === 'SalaryBankAccount');
        salaryBankAccount.Options = this.getBankAccountOptions('SalaryBankAccountID', 'salary');

        this.fields$.next(fields);
    }

    private getBankAccountOptions(storeResultInProperty, bankAccountType) {
        return {
            entity: BankAccount,
            listProperty: 'BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            editor: (bankaccount: BankAccount) => new Promise((resolve) => {
                if (!bankaccount) {
                    bankaccount = new BankAccount();
                    bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.company$.getValue().ID;
                    bankaccount.ID = 0;
                }

                this.bankAccountModal.openModal(bankaccount);

                this.bankAccountChanged = this.bankAccountModal.Changed.subscribe((changedBankaccount) => {
                    this.bankAccountChanged.unsubscribe();

                    // update BankAccounts list only active is updated directly
                    this.company$.getValue().BankAccounts.forEach((ba, i) => {
                        if ((ba.ID && ba.ID == changedBankaccount.ID) || (ba['_createdguid'] && ba['_createguid'] == changedBankaccount._createguid)) {
                            this.company$.getValue().BankAccounts[i] = changedBankaccount;
                        }
                    });

                    resolve(bankaccount);
                });
            })
        };
    }

    private generateInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-email')
            .subscribe(
            company => this.onlyCompanyModel$.next(company),
            err => this.errorService.handle(err)
            );
    }

    public generateOnlyCompanyFields(): UniField[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Faktura e-mail',
                Property: 'FileFlowEmail',
                Placeholder: 'Trykk på knapp for å generere',
                Sectionheader: 'Diverse',
                Section: 1,
                ReadOnly: true
            },
            <any>{
                FieldType: FieldType.BUTTON,
                Label: 'Generer faktura epost adresse',
                Sectionheader: 'Diverse',
                Section: 1,
                Options: {
                    click: () => this.generateInvoiceEmail()
                }
            }
        ];
    }

    private getFormLayout() {

        this.config$.next({});
        this.fields$.next([
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CompanyName',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Firmanavn',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'OrganizationNumber',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Orgnr',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []                
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CompanyTypeID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Firmatype',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                EntityType: 'Supplier',
                Property: 'GLN',
                Label: 'GLN',
                FieldType: FieldType.TEXT
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'WebAddress',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.URL,
                ReadOnly: false,
                LookupField: false,
                Label: 'Web',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,

                EntityType: 'CompanySettings',
                Property: 'DefaultAddress',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresse',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                IsLookUp: false,
                openByDefault: true,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'DefaultEmail',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Epost',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                IsLookUp: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'DefaultPhone',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Telefon',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                IsLookUp: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'OfficeMunicipalityNo',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kontorkommune',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CompanyRegistered',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                LookupField: false,
                Label: 'Foretaksregistert',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'TaxMandatory',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                LookupField: false,
                Label: 'Mva-pliktig',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'VatReportFormID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Mva skjema',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'BaseCurrency',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Valuta',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'SupplierAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Leverandørreskontro samlekonto',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CustomerAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kundereskontro samlekonto',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'DefaultSalesAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Standard salgskonto',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CustomerCreditDays',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kredittdager',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Regnskapsperioder',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesVatID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Mva perioder',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'AccountGroupSetID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kontoplan',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'AccountVisibilityGroupID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Synlige kontoer',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'AccountingLockedDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Regnskap låst til',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'VatLockedDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'MVA låst til',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 1,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Selskapsoppsett',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'CompanyBankAccount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Driftskonto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 2,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Bankkontoer',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'TaxBankAccount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Skattetrekkskonto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 2,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Bankkontoer',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'SalaryBankAccount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Lønnskonto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 2,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Bankkontoer',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'PaymentBankIdentification',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Bank-integrasjon ID',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 2,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Bankkontoer',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'CompanySettings',
                Property: 'UseXtraPaymentOrgXmlTag',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                LookupField: false,
                Label: 'Betaling fra DnB konto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 2,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: 'Bankkontoer',
                hasLineBreak: false,
                Validations: []
            }



        ]);

        /*
        KE 08062016: Fjernet foreløpig, disse skal sannsynligvis inn et annet sted, men brukes ikke PT
        if (this.company.AccountingLockedDate !== null) {
            this.company.AccountingLockedDate = new Date(this.company.AccountingLockedDate);
        }

        if (this.company.VatLockedDate !== null) {
            this.company.VatLockedDate = new Date(this.company.VatLockedDate);
        }

        var accountingLockedDate = new UniFieldBuilder();
        accountingLockedDate.setLabel('Regnskap låst tom')
            .setModel(this.company)
            .setModelField('AccountingLockedDate')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.LOCAL_DATE_PICKER]);

        var vatLockedDate = new UniFieldBuilder();
        vatLockedDate.setLabel('Mva låst tom')
            .setModel(this.company)
            .setModelField('VatLockedDate')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.LOCAL_DATE_PICKER])
            .setKendoOptions({})
            .hasLineBreak(true);

        var forceSupplierInvoiceApproval = new UniFieldBuilder();
        forceSupplierInvoiceApproval.setLabel('Tvungen godkjenning')
            .setModel(this.company)
            .setModelField('ForceSupplierInvoiceApproval')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);
        */
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
                alert('Valuta lasted ned');
            },
            err => this.errorService.handle(err));
    }

    //#endregion Test data
}
