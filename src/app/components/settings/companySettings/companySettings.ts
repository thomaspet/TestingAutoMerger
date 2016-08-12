import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';
import {UniImage, IUploadConfig} from '../../../../framework/uniImage/uniImage';

import {CompanyType, PeriodSeries, Currency, FieldType, AccountGroup, Account, BankAccount} from '../../../unientities';
import {CompanySettingsService, CurrencyService, VatTypeService, AccountService, AccountGroupSetService, PeriodSeriesService, CompanyTypeService, MunicipalService, BankAccountService} from '../../../services/services';
import {BankAccountModal} from '../../common/modals/modals';

declare var _;

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html',
    providers: [
        CompanySettingsService, 
        CurrencyService, 
        AccountService, 
        AccountGroupSetService, 
        PeriodSeriesService,
        VatTypeService,
        CompanyTypeService,
        MunicipalService,
        BankAccountService
    ],
    directives: [UniForm, UniSave, UniImage, BankAccountModal]
})

export class CompanySettings implements OnInit {
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;

    private defaultExpands: any = [
        'Address', 
        'Emails', 
        'Phones', 
        'BankAccounts', 
        'BankAccounts.Bank',
        'BankAccounts.Account', 
        'CompanyBankAccount', 
        'TaxBankAccount', 
        'SalaryBankAccount'
    ];

    private company: any;
    
    private companyTypes: Array<CompanyType> = [];
    private currencies: Array<Currency> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private accounts: Array<Account> = [];    
    private bankAccountChanged: any;

    private showImageSection: boolean = true; // used in template
    private imageUploadOptions: IUploadConfig;

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
    
    // TODO Use service instead of Http, Use interfaces!!
    constructor(private companySettingsService: CompanySettingsService,
                private accountService: AccountService,
                private currencyService: CurrencyService,
                private accountGroupSetService: AccountGroupSetService,
                private periodeSeriesService: PeriodSeriesService,
                private companyTypeService: CompanyTypeService,
                private vatTypeService: VatTypeService,
                private municipalService: MunicipalService,
                private bankAccountService: BankAccountService) {
    }
    
    public ngOnInit() {
        this.getDataAndSetupForm();
    }
        
    private getDataAndSetupForm() {
        this.getFormLayout();
        
        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.currencyService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.accountService.GetAll(null),
            this.companySettingsService.Get(1, this.defaultExpands)
        ).subscribe(
            (dataset) => {
                this.companyTypes = dataset[0];
                this.currencies = dataset[1];
                this.periodSeries = dataset[2];
                this.accountGroupSets = dataset[3];
                this.accounts = dataset[4];
                this.company = dataset[5];

                this.extendFormConfig();
                this.imageUploadOptions = {
                    entityType: 'companysettings',
                    entityId: 1,
                    onSuccess: (imageId) => {
                        this.company['LogoFileID'] = imageId;
                    }
                };
                 
                setTimeout(() => {
                    this.form.onReady.subscribe((event) => {
                        this.updateMunicipalityName();
                                                
                        this.form.field('OfficeMunicipalityNo')
                            .onChange
                            .subscribe((value) => {
                               this.updateMunicipalityName(); 
                            });
                        });
                });   
                                
            },
            error => alert('Feil ved henting av data')
        );
    }


    public saveSettings(complete) {
        
        if (this.company.Address.length > 0 && !this.company.Address[0].ID) {
            this.company.Address[0].ID = 0;
            this.company.Address[0]._createguid = this.companySettingsService.getNewGuid();
            this.company.Address[0].BusinessRelationID = 0;
        }
        
        if (this.company.Emails.length > 0 && !this.company.Emails[0].ID) {
            this.company.Emails[0].ID = 0;
            this.company.Emails[0]._createguid = this.companySettingsService.getNewGuid();
        }
        
        if (this.company.Phones.length > 0 && !this.company.Phones[0].ID) {
            this.company.Phones[0].ID = 0;
            this.company.Phones[0]._createguid = this.companySettingsService.getNewGuid();
        }

        if (this.company.BankAccounts) {
            this.company.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 && !bankaccount['_createguid']) {
                    bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
                }
            });
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
                        this.company = company;
                        complete('Innstillinger lagret');
                    })
                },
                (error) => {                    
                    complete('Feil oppsto ved lagring');
                    alert('Feil oppsto ved lagring:' + JSON.stringify(error.json()));
                }
            );
    }

    private updateMunicipalityName() {
        this.municipalService.GetAll(`filter=MunicipalityNo eq '${this.company.OfficeMunicipalityNo}'`)
            .subscribe((data) => {
                if (data != null && data.length > 0) {
                    this.company.MunicipalityName = data[0].MunicipalityName;
                    this.company = _.cloneDeep(this.company); 
                }
            });
    }
    
    private extendFormConfig() {
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
                
                this.bankAccountChanged = this.bankAccountModal.Changed.subscribe((bankaccount) => { 
                    this.bankAccountChanged.unsubscribe();                     

                    // update BankAccounts list only active is updated directly
                    this.company.BankAccounts.forEach((ba, i) => {
                        if ((ba.ID && ba.ID == bankaccount.ID) || (ba['_createdguid'] && ba['_createguid'] == bankaccount._createguid)) {
                            this.company.BankAccounts[i] = bankaccount;
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
                    Property: 'Address[0].AddressLine1',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    Property: 'Address[0].AddressLine2',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Adresse 2',
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
                    Property: 'Address[0].PostalCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Postnummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Sectionheader: '',
                    Placeholder: '',
                    Options: null,
                    LineBreak: null,
                    IsLookUp: false,
                    Validations: []
                },
                {
                    ComponentLayoutID: 1,
                     
                    EntityType: 'CompanySettings',
                    Property: 'Address[0].City',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Poststed',
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
                    hasLineBreak: true,
                    Validations: []
                },
                {
                    ComponentLayoutID: 1,
                     
                    EntityType: 'CompanySettings',
                    Property: 'Address[0].CountryCode',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Landskode (land)',
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
                    Property: 'Address[0].Country',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Land',
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
                    hasLineBreak: true,
                    Validations: []
                },
                {
                    ComponentLayoutID: 1,                     
                    EntityType: 'CompanySettings',
                    Property: 'Emails[0].EmailAddress',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    Property: 'Phones[0].Number',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontorkommunenr',
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
                    Property: 'MunicipalityName',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontorkommunenavn',
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
                    alert('Kontoplan synkronisert for AS');
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
                    alert('VatTypes synkronisert');
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
