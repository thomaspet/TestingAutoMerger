import {Component, OnInit, ViewChild} from '@angular/core';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';

import {CompanyType, PeriodSeries, Currency, FieldType, AccountGroup, Account} from '../../../unientities';
import {CompanySettingsService, CurrencyService, VatTypeService, AccountService, AccountGroupSetService, PeriodSeriesService, CompanyTypeService, MunicipalService} from '../../../services/services';

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
        MunicipalService 
    ],
    directives: [ROUTER_DIRECTIVES, UniForm, UniSave]
})

export class CompanySettings implements OnInit {
    @ViewChild(UniForm) public form: UniForm;
        
    private company: any;
    
    private companyTypes: Array<CompanyType> = [];
    private currencies: Array<Currency> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private accounts: Array<Account> = [];    
    
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
    constructor(private routeParams: RouteParams,
                private companySettingsService: CompanySettingsService, 
                private accountService: AccountService,
                private currencyService: CurrencyService,
                private accountGroupSetService: AccountGroupSetService,
                private periodeSeriesService: PeriodSeriesService,
                private companyTypeService: CompanyTypeService,
                private vatTypeService: VatTypeService,
                private municipalService: MunicipalService) {
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
            this.companySettingsService.Get(1, ['Address', 'Emails', 'Phones'])            
        ).subscribe(
            (dataset) => {            
                this.companyTypes = dataset[0];
                this.currencies = dataset[1];
                this.periodSeries = dataset[2];
                this.accountGroupSets = dataset[3];
                this.accounts = dataset[4];
                this.company = dataset[5];
        
                this.extendFormConfig();
                 
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
        
        this.companySettingsService
            .Put(this.company.ID, this.company)
            .subscribe(
                (response) => {
                    complete('Innstillinger lagret');
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
