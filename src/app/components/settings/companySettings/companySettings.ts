import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {IUniSaveAction} from '../../../../framework/save/save';

import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';
import {UniImage, IUploadConfig} from '../../../../framework/uniImage/uniImage';

import {CompanyType, CompanySettings, VatReportForm, PeriodSeries, Currency, FieldType, AccountGroup, Account, BankAccount, Municipal, Address, Phone, Email} from '../../../unientities';
import {CompanySettingsService, CurrencyService, VatTypeService, AccountService, AccountGroupSetService, PeriodSeriesService, PhoneService, EmailService} from '../../../services/services';
import {CompanyTypeService, VatReportFormService, MunicipalService, BankAccountService, AddressService} from '../../../services/services';
import {BankAccountModal} from '../../common/modals/modals';
import {AddressModal, EmailModal, PhoneModal} from '../../common/modals/modals';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {SearchResultItem} from '../../common/externalSearch/externalSearch';

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

    private defaultExpands: any = [
        'DefaultAddress',
        'DefaultEmail',
        'DefaultPhone',
        'BankAccounts',
        'BankAccounts.Bank',
        'BankAccounts.Account',
        'CompanyBankAccount',
        'TaxBankAccount',
        'SalaryBankAccount'
    ];

    private company: CompanySettings;

    private companyTypes: Array<CompanyType> = [];
    private vatReportForms: Array<VatReportForm> = [];
    private currencies: Array<Currency> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private accounts: Array<Account> = [];
    private municipalities: Municipal[] = [];
    private bankAccountChanged: any;

    private showImageSection: boolean = false; // used in template
    private imageUploadOptions: IUploadConfig;

    private addressChanged: any;
    private emailChanged: any;
    private phoneChanged: any;
    public emptyPhone: Phone;
    public emptyEmail: Email;
    public emptyAddress: Address;

    private showExternalSearch: boolean = false;
    private searchText: string = '';

    public config: any = {};
    public fields: any[] = [];

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (event) => this.saveSettings(event),
            main: true,
            disabled: false
        }
    ];

    constructor(private companySettingsService: CompanySettingsService,
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
        private toastService: ToastService) {
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {
        this.getFormLayout();

        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.vatReportFormService.GetAll(null),
            this.currencyService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.accountService.GetAll(null),
            this.companySettingsService.Get(1, this.defaultExpands),
            this.municipalService.GetAll(null),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity(null, 'Address')
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

                // do this after getting emptyPhone/email/address
                this.company = this.setupCompanySettingsData(dataset[6]);

                this.showExternalSearch = this.company.OrganizationNumber === '-';

                if (this.showExternalSearch) {
                    setTimeout(() => {
                        this.searchText = this.company.CompanyName;
                    });
                }

                this.extendFormConfig();
                this.imageUploadOptions = {
                    entityType: 'companysettings',
                    entityId: 1,
                    onSuccess: (imageId) => {
                        this.company['LogoFileID'] = imageId;
                    }
                };

                setTimeout(() => {
                    if (this.showExternalSearch) {
                        this.form.field('CompanyName')
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
            error => this.toastService.addToast('Feil ved henting av data', ToastType.bad)
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
        let company = this.company;

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

        this.company = _.cloneDeep(company);
    }

    public saveSettings(complete) {

        if (this.company.OrganizationNumber === '-' || isNaN(<any>this.company.OrganizationNumber)) {
            alert('Vennligst oppgi et gyldig organisasjonsnr');
            complete('Ugyldig organisasjonsnr, lagring avbrutt');
            return;
        }

        if (this.company.BankAccounts) {
            this.company.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 && !bankaccount['_createguid']) {
                    bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
                }
            });
        }

        if (this.company.DefaultAddress.ID === 0 && !this.company.DefaultAddress['_createguid']) {
            this.company.DefaultAddress['_createguid'] = this.addressService.getNewGuid();
        }

        if (this.company.DefaultEmail.ID === 0 && !this.company.DefaultEmail['_createguid']) {
            this.company.DefaultEmail['_createguid'] = this.emailService.getNewGuid();
        }

        if (this.company.DefaultPhone.ID === 0 && !this.company.DefaultPhone['_createguid']) {
            this.company.DefaultPhone['_createguid'] = this.phoneService.getNewGuid();
        }

        if (this.company.CompanyBankAccount) {
            this.company.BankAccounts = this.company.BankAccounts.filter(x => x !== this.company.CompanyBankAccount);
        }

        if (this.company.TaxBankAccount) {
            this.company.BankAccounts = this.company.BankAccounts.filter(x => x !== this.company.TaxBankAccount);
        }

        if (this.company.SalaryBankAccount) {
            this.company.BankAccounts = this.company.BankAccounts.filter(x => x !== this.company.SalaryBankAccount);
        }

        this.companySettingsService
            .Put(this.company.ID, this.company)
            .subscribe(
            (response) => {
                this.companySettingsService.Get(1, this.defaultExpands).subscribe(company => {
                    this.company = this.setupCompanySettingsData(company);
                    this.showExternalSearch = this.company.OrganizationNumber === '-';

                    this.toastService.addToast('Innstillinger lagret', ToastType.good, 3);
                    complete('Innstillinger lagret');
                });
            },
            (error) => {
                complete('Feil oppsto ved lagring');
                this.toastService.addToast('Feil oppsto ved lagring', ToastType.bad, null, JSON.stringify(error.json()));
            }
        );
    }

    private updateMunicipalityName() {
        this.municipalService.GetAll(`filter=MunicipalityNo eq '${this.company.OfficeMunicipalityNo}'`)
            .subscribe((data) => {
                if (data != null && data.length > 0) {
                    this.company['MunicipalityName'] = data[0].MunicipalityName;
                    this.company = _.cloneDeep(this.company);
                }
            });
    }

    private extendFormConfig() {

        var defaultAddress: UniFieldLayout = this.fields.find(x => x.Property === 'DefaultAddress');
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

                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    this.addressChanged.unsubscribe();
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var phones: UniFieldLayout = this.fields.find(x => x.Property === 'DefaultPhone');

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

        var emails: UniFieldLayout = this.fields.find(x => x.Property === 'DefaultEmail');

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
        let accountGroupSetID: UniFieldLayout = this.fields.find(x => x.Property === 'AccountGroupSetID');
        accountGroupSetID.Options = {
            source: this.accountGroupSets,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.companyTypes.unshift(null);
        let companyTypeID: UniFieldLayout = this.fields.find(x => x.Property === 'CompanyTypeID');
        companyTypeID.Options = {
            source: this.companyTypes,
            valueProperty: 'ID',
            displayProperty: 'FullName',
            debounceTime: 200
        };

        this.vatReportForms.unshift(null);
        let vatReportFormID: UniFieldLayout = this.fields.find(x => x.Property === 'VatReportFormID');
        vatReportFormID.Options = {
            source: this.vatReportForms,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        this.currencies.unshift(null);
        let baseCurrency: UniFieldLayout = this.fields.find(x => x.Property === 'BaseCurrency');
        baseCurrency.Options = {
            source: this.currencies,
            valueProperty: 'Code',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let supplierAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'SupplierAccountID');
        supplierAccountID.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => `${obj.AccountNumber} - ${obj.AccountName}`
        };

        let customerAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerAccountID');
        customerAccountID.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => `${obj.AccountNumber} - ${obj.AccountName}`
        };

        let officeMunicipality: UniFieldLayout = this.fields.find(x => x.Property === 'OfficeMunicipalityNo');
        officeMunicipality.Options = {
            source: this.municipalities,
            valueProperty: 'MunicipalityNo',
            displayProperty: 'MunicipalityNo',
            debounceTime: 200,
            template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase() + obj.MunicipalityName.substr(1).toLowerCase()}` : ''
        };

        let periodSeriesAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'PeriodSeriesAccountID');
        periodSeriesAccountID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType == 1),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let periodSeriesVatID: UniFieldLayout = this.fields.find(x => x.Property === 'PeriodSeriesVatID');
        periodSeriesVatID.Options = {
            source: this.periodSeries.filter((value) => value.SeriesType == 0),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let companyBankAccount: UniFieldLayout = this.fields.find(x => x.Property === 'CompanyBankAccount');
        companyBankAccount.Options = this.getBankAccountOptions('CompanyBankAccountID', 'company');

        let taxBankAccount: UniFieldLayout = this.fields.find(x => x.Property === 'TaxBankAccount');
        taxBankAccount.Options = this.getBankAccountOptions('TaxBankAccountID', 'tax');

        let salaryBankAccount: UniFieldLayout = this.fields.find(x => x.Property === 'SalaryBankAccount');
        salaryBankAccount.Options = this.getBankAccountOptions('SalaryBankAccountID', 'salary');
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
                    bankaccount.CompanySettingsID = this.company.ID;
                    bankaccount.ID = 0;
                }

                this.bankAccountModal.openModal(bankaccount);

                this.bankAccountChanged = this.bankAccountModal.Changed.subscribe((changedBankaccount) => {
                    this.bankAccountChanged.unsubscribe();

                    // update BankAccounts list only active is updated directly
                    this.company.BankAccounts.forEach((ba, i) => {
                        if ((ba.ID && ba.ID == changedBankaccount.ID) || (ba['_createdguid'] && ba['_createguid'] == changedBankaccount._createguid)) {
                            this.company.BankAccounts[i] = changedBankaccount;
                        }
                    });

                    resolve(bankaccount);
                });
            })
        };
    }

    private getFormLayout() {

        this.config = {};

        this.fields = [
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
                FieldType: FieldType.MULTISELECT,
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
                FieldType: FieldType.MULTISELECT,
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
                Label: 'Kontogruppeinndeling',
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
            }
        ];

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
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        var vatLockedDate = new UniFieldBuilder();
        vatLockedDate.setLabel('Mva låst tom')
            .setModel(this.company)
            .setModelField('VatLockedDate')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER])
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
    public syncAS() {
        console.log('SYNKRONISER KONTOPLAN');
        this.accountService
            .PutAction(null, 'synchronize-ns4102-as')
            .subscribe(
            (response: any) => {
                console.log('Kontoplan synkronisert for AS');
            },
            (error: any) => console.log(error)
            );
    }

    public syncVat() {
        console.log('SYNKRONISER MVA');
        this.vatTypeService
            .PutAction(null, 'synchronize')
            .subscribe(
            (response: any) => {
                console.log('VatTypes synkronisert');
            },
            (error: any) => console.log(error)
            );
    }

    public syncCurrency() {
        console.log('LAST NED VALUTA');
        this.currencyService.GetAction(null, 'download-from-norgesbank')
            .subscribe(
            (response: any) => {
                alert('Valuta lasted ned');
            },
            (error: any) => console.log(error)
            );
    }


    //#endregion Test data
}
