import {Component, OnInit, provide} from '@angular/core';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';


import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';

import {UniHttp} from '../../../../framework/core/http/http';
import {SubEntity, AGAZone, Municipal, CompanyType, PeriodSeries, Currency, FieldType, AccountGroup, AGARate, Account, CompanySalary} from '../../../unientities';
import {AgaZoneService, CompanySettingsService, CurrencyService, SubEntityService, AccountService, AccountGroupSetService, PeriodSeriesService,
    CompanyTypeService, MunicipalService, CompanySalaryService} from '../../../services/services';

declare var _;

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html',
    providers: [
        CompanySettingsService, 
        AgaZoneService, 
        CurrencyService, 
        SubEntityService, 
        AccountService, 
        AccountGroupSetService, 
        PeriodSeriesService, 
        CompanyTypeService, 
        MunicipalService,
        CompanySalaryService
        ],
    directives: [ROUTER_DIRECTIVES, UniForm, UniSave]
})

export class CompanySettings implements OnInit {
    private id: any;
    //private form: any;
    private company: any;
    
    private subEntities: Array<SubEntity> = [];
    private companyTypes: Array<CompanyType> = [];
    private currencies: Array<Currency> = [];
    private periodSeries: Array<PeriodSeries> = [];
    private accountGroupSets: Array<AccountGroup> = [];
    private agaZones: Array<AGAZone> = [];
    private agaRules: Array<AGARate> = [];
    private municipals: Array<Municipal> = [];
    private accounts: Array<Account> = [];
    private companySalary: CompanySalary[] = [];

    public config: any = {};
    public fields: any[] = [];

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: this.saveSettings.bind(this),
            main: true,
            disabled: false
        }
    ];
    
    // TODO Use service instead of Http, Use interfaces!!
    constructor(private routeParams: RouteParams,
                private http: UniHttp,
                private companySettingsService: CompanySettingsService, 
                private agaZoneService: AgaZoneService,
                private subentityService: SubEntityService,
                private accountService: AccountService,
                private currencyService: CurrencyService,
                private accountGroupSetService: AccountGroupSetService,
                private periodeSeriesService: PeriodSeriesService,
                private companyTypeService: CompanyTypeService,
                private municipalService: MunicipalService,
                private companySalaryService: CompanySalaryService) {



    }
    
    public ngOnInit() {
        this.getDataAndSetupForm();
    }
    
    private dataChange(event) {
        console.log('dataChange', event);
    }
    
    private formReady(event) {
        console.log('dataChange', event);
    }
    
    private getDataAndSetupForm() {
        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.currencyService.GetAll(null),
            this.periodeSeriesService.GetAll(null),
            this.accountGroupSetService.GetAll(null),
            this.accountService.GetAll(null),
            this.companySettingsService.Get(1, ['Address', 'Emails', 'Phones']),
            this.subentityService.GetAll(null, ['BusinessRelationInfo', 'BusinessRelationInfo.InvoiceAddress']),
            this.agaZoneService.GetAll(null),
            this.agaZoneService.getAgaRules(),
            this.companySalaryService.GetAll('')
        ).subscribe(
            (dataset) => {
                let filter: string = '';
                
                dataset[6].forEach((element) => {
                    filter += 'MunicipalityNo eq ' + element.MunicipalityNo + ' or ';
                });
                filter = filter.slice(0, filter.length - 3);
                
                this.municipalService.GetAll(filter).subscribe(
                    (response) => {
                        this.companyTypes = dataset[0];
                        this.currencies = dataset[1];
                        this.periodSeries = dataset[2];
                        this.accountGroupSets = dataset[3];
                        this.accounts = dataset[4];
                        this.company = dataset[5];
                        this.subEntities = dataset[6];
                        this.agaZones = dataset[7];
                        this.agaRules = dataset[8];
                        this.companySalary = dataset[9];
                        this.municipals = response;
       
                        this.buildForm();
                    }, 
                    error => console.log(error)
                );
            },
            error => console.log(error)
        );
    }

    private buildForm() {

        this.config = {
            submitText: 'Dont click me'
        };

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
                    FieldType: FieldType.TEXT,
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
                    Section: 1,
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
                    Property: 'Phones[0].EmailAddress',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Epost',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    Options: {
                        source: this.companyTypes,
                        valueProperty: 'ID',
                        displayProperty: 'FullName',                        
                        debounceTime: 200
                    },
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
                    Options: {                        
                        source: this.currencies,                        
                        valueProperty: 'Code',
                        displayProperty: 'Code',
                        debounceTime: 200
                    },
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
                    Options: {                        
                        source: this.accounts,
                        valueProperty: 'ID',
                        displayProperty: 'AccountNumber',                        
                        debounceTime: 200,
                        template: (obj) => `${obj.AccountNumber} - ${obj.AccountName}`    
                    },
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
                    Options: {
                        source: this.accounts,
                        valueProperty: 'ID',
                        displayProperty: 'AccountNumber',                        
                        debounceTime: 200,
                        template: (obj) => `${obj.AccountNumber} - ${obj.AccountName}`                           
                    },
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
                    Options: {
                        source: this.periodSeries.filter((value) => value.SeriesType == 1),
                        valueProperty: 'ID',
                        displayProperty: 'Name',                        
                        debounceTime: 200
                    },
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
                    Options: {                        
                        source: this.periodSeries.filter((value) => value.SeriesType == 0),
                        valueProperty: 'ID',
                        displayProperty: 'Name',                        
                        debounceTime: 200
                    },
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
                    Options: {
                        source: this.accountGroupSets,
                        valueProperty: 'ID',
                        displayProperty: 'Name',                        
                        debounceTime: 200                        
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'Selskapsoppsett',
                    hasLineBreak: false,                     
                    Validations: []
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'CompanySalary',
                    Property: 'InterrimRemitAccount',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Mellomkonto remittering',
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
                }
        ];



/*
      

        
        var interrimRemit = new UniFieldBuilder();
        interrimRemit
            .setLabel('Mellomkonto remittering')
            .setModel(this.companySalary[0])
            .setModelField('InterrimRemitAccount')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
      
      
      
        /*
        KE: Fjernet foreløpig, disse skal sannsynligvis inn et annet sted, men brukes ikke PT
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

    /********************************************************************
    /*********************  Form Builder    *******************
    */
    
    private getAgaZone(id: number) {
        // lodash find
        return _.find(this.agaZones, object => object.ID === id);
    }
    
    private getMunicipality(municipalityNumber) {
        return _.find(this.municipals, object => object.MunicipalityNo === municipalityNumber);
    }
    
    public saveSettings(value) {        
        
        console.log('LAGRE id: ' + this.id);
        this.companySettingsService
            .Put(this.company.ID, this.company)
            .subscribe(
                (response) => {
                    console.log('LAGRET Firmainnstillinger ' + this.company.ID);
                    // this.uniSaved.emit(this.company); //TODO according to account...
                },
                (error) => {
                    console.log('OPPDATERING FEILET');
                    console.log(error._body);
                }
            );
    }

    //#region Test data
    public syncAS() {
        console.log('SYNKRONISER KONTOPLAN');
        this.accountService
            .PutAction(0, 'synchronize-ns4102-as')            
            .subscribe(
                (response: any) => {
                    alert('Kontoplan synkronisert for AS');
                },
                (error: any) => console.log(error)
            );
    }

    public syncVat() {
        console.log('SYNKRONISER MVA');
        this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('vattypes')
            .send({ 'action': 'synchronize' })
            .subscribe(
            (response: any) => {
                alert('VatTypes synkronisert');
            },
            (error: any) => console.log(error)
            );
    }

    public syncCurrency() {
        console.log('LAST NED VALUTA');
        this.http
            .asGET()
            .withEndPoint('currencies')
            .send({ action: 'download-from-norgesbank' })
            .subscribe(
            (response: any) => {
                alert('Valuta lasted ned');
            },
            (error: any) => console.log(error)
            );
    }


    //#endregion Test data
}
