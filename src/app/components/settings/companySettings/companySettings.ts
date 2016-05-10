﻿import {Component, OnInit, provide} from '@angular/core';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {NgFor, NgIf} from '@angular/common';
import {Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {
    UniFieldBuilder, UniFormBuilder, UniForm, UniSectionBuilder, UniComboFieldBuilder
} from '../../../../framework/forms';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {UniHttp} from '../../../../framework/core/http/http';
import {
    SubEntity, 
    AGAZone, 
    Municipal, 
    CompanyType, 
    PeriodSeries, 
    Currency, 
    FieldType, 
    AccountGroup,
    AGARate,
    Account,
    CompanySalary
} from '../../../unientities';
import {
    AgaZoneService, 
    CompanySettingsService, 
    CurrencyService, 
    SubEntityService, 
    AccountService, 
    AccountGroupSetService, 
    PeriodSeriesService, 
    CompanyTypeService, 
    MunicipalService,
    CompanySalaryService
} from '../../../services/services';

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
    directives: [ROUTER_DIRECTIVES, NgFor, NgIf, UniForm]
})

export class CompanySettings implements OnInit {
    private id: any;
    private form: any;
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

        var formBuilder = new UniFormBuilder();

        var companyName = new UniFieldBuilder();
        companyName.setLabel('Firmanavn')
            .setModel(this.company)
            .setModelField('CompanyName')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var orgNr = new UniFieldBuilder();
        orgNr.setLabel('Orgnr.')
            .setModel(this.company)
            .setModelField('OrganizationNumber')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var web = new UniFieldBuilder();
        web.setLabel('Web')
            .setModel(this.company)
            .setModelField('WebAddress')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);


        // TODO
        // Contact information should be styled according to standard - when this is ready.
        var street = new UniFieldBuilder();
        street.setLabel('Adresse')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine1')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var street2 = new UniFieldBuilder();
        street2.setLabel('Adresse 2')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine2')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var postNumber = new UniFieldBuilder();
        postNumber.setLabel('Postnr')
            .setModel(this.company.Address[0])
            .setModelField('PostalCode')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var place = new UniFieldBuilder();
        place.setLabel('Sted')
            .setModel(this.company.Address[0])
            .setModelField('City')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var phone = new UniFieldBuilder();
        phone.setLabel('Telefon')
            .setModel(this.company.Phones[0])
            .setModelField('Number')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var email = new UniFieldBuilder();
        email.setLabel('Epost')
            .setModel(this.company.Emails[0])
            .setModelField('EmailAddress')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.EMAIL]);
        
        var officeMunicipalNumber = new UniFieldBuilder();
        officeMunicipalNumber.setModel(this.company)
            .setLabel('Kontorkommunenr/navn')
            .setModelField('OfficeMunicipalityNo')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
                
        var officeMunicipalName = new UniFieldBuilder();
        officeMunicipalName.setModel(this.getMunicipality(this.company.OfficeMunicipalityNo))
            .setModelField('MunicipalityName')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
       
        var officeMunicipality = new UniComboFieldBuilder();
        officeMunicipality.addUniElements(officeMunicipalNumber, officeMunicipalName);
        
        // *********************  Virksomhet og aga  ***************************/
        var subEntitiesSection = new UniSectionBuilder('Virksomhet og arbeidsgiveravgift(aga)');
        
        var mainAccountAlocatedAga = new UniFieldBuilder();
        mainAccountAlocatedAga
            .setLabel('Konto avsatt aga')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
        var mainAccountCostAga = new UniFieldBuilder();
        mainAccountCostAga
            .setLabel('Konto kostnad aga')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
        var mainAccountAllocatedAgaVacation = new UniFieldBuilder();
        mainAccountAllocatedAgaVacation
            .setLabel('Avsatt aga av feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedAGAVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
        var mainAccountCostAgaVacation = new UniFieldBuilder();
        mainAccountCostAgaVacation
            .setLabel('Kostnad aga feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostAGAVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
        var freeAmount = new UniFieldBuilder();
        freeAmount
            .setLabel('Fribeløp')
            .setModel(this.companySalary[0])
            .setModelField('FreeAmount')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        subEntitiesSection.addUniElements(mainAccountAlocatedAga, mainAccountCostAga, mainAccountAllocatedAgaVacation, mainAccountCostAgaVacation, freeAmount);
        this.subEntities.forEach(subEntity => {
            var municipal = this.getMunicipality(subEntity.MunicipalityNo);
            var agaZone: AGAZone = this.getAgaZone(subEntity.AgaZone);
            var agaRule = _.find(this.agaRules, x => x.sectorID === subEntity.AgaRule);
            var agaZoneName = '';
            var agaRuleName = '';
            if (agaZone) { agaZoneName = ', Sone ' + agaZone.ZoneName; }
            if (agaRule) { agaRuleName = ', ' + agaRule.sector; }
            var subEntitySection = new UniSectionBuilder(subEntity.BusinessRelationInfo.Name + 
                ', ' + subEntity.OrgNumber + 
                ', ' + subEntity.MunicipalityNo + '-' + municipal.MunicipalityName +
                agaZoneName + 
                agaRuleName );
            
            var subEntityName = new UniFieldBuilder();
            subEntityName.setLabel('Virksomhet navn')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.Name')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
            var subEntityOrgNumber = new UniFieldBuilder();
            subEntityOrgNumber.setLabel('Orgnr for virksomheten')
                .setModel(subEntity)
                .setModelField('OrgNumber')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
            var subEntityAddress = new UniFieldBuilder();
            subEntityAddress.setLabel('Gateadr')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.AddressLine1')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
            var subEntityPostnr = new UniFieldBuilder();
            subEntityPostnr.setLabel('Postnr/Sted')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.PostalCode')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            var subEntityCity = new UniFieldBuilder();
            subEntityCity
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.City')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            var subEntityLocation = new UniComboFieldBuilder();
            subEntityLocation.addUniElements(subEntityPostnr, subEntityCity);
                
            var subEntityMunicipalNumber = new UniFieldBuilder();
            subEntityMunicipalNumber.setModel(subEntity)
                .setLabel('Kommunenr/Navn')
                .setModelField('MunicipalityNo')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
                
            var subEntityMunicipalName = new UniFieldBuilder();
            subEntityMunicipalName.setModel(municipal)
                .setModelField('MunicipalityName')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
            var subEntityMunicipality = new UniComboFieldBuilder();
            subEntityMunicipality.addUniElements(subEntityMunicipalNumber, subEntityMunicipalName);
            
            
            var subEntityAgaZone = new UniFieldBuilder();
            subEntityAgaZone.setLabel('Sone')
                .setModel(subEntity)
                .setModelField('AgaZone')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
                .setKendoOptions({
                    dataSource: this.agaZones,
                    dataTextField: 'ZoneName',
                    dataValueField: 'ID',
                });
            
            var subEntityAgaRule = new UniFieldBuilder();
            subEntityAgaRule.setLabel('Beregningsregel AGA')
                .setModel(subEntity)
                .setModelField('AgaRule')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
                .setKendoOptions({
                    dataSource: this.agaRules,
                    dataTextField: 'Sector',
                    dataValueField: 'SectorID',
                });
            
            subEntitySection.addUniElements(subEntityName,
                                            subEntityOrgNumber, 
                                            subEntityAddress, 
                                            subEntityLocation, 
                                            subEntityMunicipality, 
                                            subEntityAgaZone, 
                                            subEntityAgaRule);
                                            
            subEntitiesSection.addUniElement(subEntitySection);
        });
        
        // *********************  Instillinger lønn  ***************************/
        
        var salarySettings = new UniSectionBuilder('Innstillinger spesifikke for lønn');
        
        var interrimRemit = new UniFieldBuilder();
        interrimRemit
            .setLabel('Mellomkonto remittering')
            .setModel(this.companySalary[0])
            .setModelField('InterrimRemitAccount')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var mainAccountAllocatedVacation = new UniFieldBuilder();
        mainAccountAllocatedVacation
            .setLabel('Balanse feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var mainAccountCostVacation = new UniFieldBuilder();
        mainAccountCostVacation
            .setLabel('Resultat feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        salarySettings.addUniElements(interrimRemit, mainAccountAllocatedVacation, mainAccountCostVacation);
        
        // ********************************************************************/
        // ********************  Selskapsoppsett    ***************************/
        var companySetup = new UniSectionBuilder('Selskapsoppsett');

        var companyReg = new UniFieldBuilder();
        companyReg.setLabel('Foretaksregister')
            .setModel(this.company)
            .setModelField('CompanyRegistered')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var taxMandatory = new UniFieldBuilder();
        taxMandatory.setLabel('Mva-pliktig')
            .setModel(this.company)
            .setModelField('TaxMandatory')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX])
            .hasLineBreak(true);

        var companyType = new UniFieldBuilder();
        companyType.setLabel('Firmatype')
            .setModel(this.company)
            .setModelField('CompanyTypeID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.companyTypes,
                dataTextField: 'FullName',
                dataValueField: 'ID',
                index: this.currencies.indexOf(this.company.CompanyTypeID)
            });

        var companyCurrency = new UniFieldBuilder();
        companyCurrency.setLabel('Valuta')
            .setModel(this.company)
            .setModelField('BaseCurrency')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.currencies,
                dataTextField: 'Code',
                dataValueField: 'Code',
                index: this.currencies.indexOf(this.company.BaseCurrency)
            })
            .hasLineBreak(true);

        // TODO

        var supplierAccount = new UniFieldBuilder();
        supplierAccount.setLabel('Leverandør-konto')
            .setModel(this.company)
            .setModelField('SupplierAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.accounts,
                dataTextField: 'AccountNumber',
                dataValueField: 'ID',
                index: this.currencies.indexOf(this.company.SupplierAccountID)
            });

        var customerAccount = new UniFieldBuilder();
        customerAccount.setLabel('Kunde-Konto')
            .setModel(this.company)
            .setModelField('CustomerAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.accounts,
                dataTextField: 'AccountNumber',
                dataValueField: 'ID',
                index: this.currencies.indexOf(this.company.CustomerAccountID)
            })
            .hasLineBreak(true);

        var creditDays = new UniFieldBuilder();
        creditDays.setLabel('Kredittdager')
            .setModel(this.company)
            .setModelField('CustomerCreditDays')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);


        companySetup.addUniElements(companyReg, 
                                    taxMandatory, 
                                    companyType, 
                                    companyCurrency, 
                                    supplierAccount, 
                                    customerAccount, 
                                    creditDays);

        // ********************************************************************/
        // *********************  Regnskapsinnstillinger    *******************/
        var accountingSettings = new UniSectionBuilder('Regnskapsinnstillinger');

        var periodSeriesAccount = new UniFieldBuilder();
        periodSeriesAccount.setLabel('Regnskapsperioder')
            .setModel(this.company)
            .setModelField('PeriodSeriesAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: { field: 'SeriesType', operator: 'eq', value: '1' }
                }),
                dataTextField: 'Name',
                dataValueField: 'ID',
                index: this.periodSeries.indexOf(this.company.PeriodSeriesAccountID)
            });

        var periodSeriesVat = new UniFieldBuilder();
        periodSeriesVat.setLabel('Mva perioder')
            .setModel(this.company)
            .setModelField('PeriodSeriesVatID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: { field: 'SeriesType', operator: 'eq', value: '0' }
                }),
                dataTextField: 'Name',
                dataValueField: 'ID',
                index: this.periodSeries.indexOf(this.company.PeriodSeriesVatID)
            });

        var accountGroupSet = new UniFieldBuilder();
        accountGroupSet.setLabel('Kontogruppeinndeling')
            .setModel(this.company)
            .setModelField('AccountGroupSetID')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.accountGroupSets,
                dataTextField: 'Name',
                dataValueField: 'ID',
                index: this.periodSeries.indexOf(this.company.AccountGroupSetID)
            })
            .hasLineBreak(true);


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

        accountingSettings.addUniElements(
            periodSeriesAccount, periodSeriesVat, accountGroupSet, 
            accountingLockedDate, vatLockedDate, forceSupplierInvoiceApproval);

        formBuilder.addUniElements(companyName, 
                                   orgNr, 
                                   web, 
                                   street, 
                                   street2,
                                   postNumber, 
                                   place, 
                                   phone, 
                                   email, 
                                   officeMunicipality, 
                                   subEntitiesSection,
                                   salarySettings, 
                                   companySetup, 
                                   accountingSettings);

        this.form = formBuilder;
    }

    /********************************************************************/
    /*********************  Form Builder    *******************/
    
    private getAgaZone(id: number) {
        // lodash find
        return _.find(this.agaZones, object => object.ID === id);
    }
    
    private getMunicipality(municipalityNumber) {
        return _.find(this.municipals, object => object.MunicipalityNo === municipalityNumber);
    }
    
    public onSubmit(value) {
        console.log('onSubmit called');

        var self = this;

        console.log('LAGRE id: ' + this.id);
        this.http
            .asPUT()
            .withEndPoint('companysettings/' + self.company.ID)
            .withBody(self.company)
            .send().subscribe(
            (response) => {
                console.log('LAGRET Firmainnstillinger ' + self.company.ID);
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
        this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('accounts')
            .send({
                'action': 'synchronize-ns4102-as'
            })
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
