import {Component, OnInit, provide} from 'angular2/core'
import {RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {NgFor, NgIf} from 'angular2/common';
import {Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {UniFieldBuilder, UniFormBuilder, UniForm, UniSectionBuilder, UniComboFieldBuilder} from '../../../../framework/forms';
import {} from '../../../../framework/forms/uniComboGroupBuilder'
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {CompanySettingsDS} from '../../../data/companySettings';
import {UniHttp} from '../../../../framework/core/http/http';
import {SubEntity, AGAZone, FieldType} from '../../../unientities';
import {SubEntityService, AgaZoneService, MunicipalService} from '../../../services/services';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html',
    providers: [provide(CompanySettingsDS, { useClass: CompanySettingsDS }), SubEntityService, AgaZoneService, MunicipalService],
    directives: [ROUTER_DIRECTIVES, NgFor, NgIf, UniForm]
})

export class CompanySettings implements OnInit {
    id: any;
    form: any;
    error: boolean;
    headers: Headers;
    company: any;
    subEntities: Array<SubEntity>;
    activeCompany: any;
    companyTypes: Array<any> = [];
    currencies: Array<any> = [];
    periodSeries: Array<any> = [];
    accountGroupSets: Array<any> = [];
    agaZones: Array<any> = [];
    agaRules: Array<any> = [];
    municipals: Array<any> = [];
    accounts: Array<any> = [];

    //TODO Use service instead of Http, Use interfaces!!
    constructor(private routeParams: RouteParams,
                private companySettingsDS: CompanySettingsDS, 
                private http: UniHttp, 
                private subEntityService: SubEntityService,
                private agaZoneService: AgaZoneService,
                private municipalService: MunicipalService) {

    }

    //ngOnInit() {
    //    //ID of active company used to GET company settings
    //    //ONLY GETTING DATA WHEN **UNI MICRO AS*** IS CHOSEN
    //    //BECAUSE ID = 1 IS THE ONLY ONE IN THE DB
    //    this.id = JSON.parse(localStorage.getItem('activeCompany')).id;

    //    this.error = false;
    //    this.headers = new Headers();
    //    this.headers.append('Client', 'client1');

    //    Observable.forkJoin(
    //        this.companySettingsDS.get(this.id),
    //        this.companySettingsDS.getCompanyTypes(),
    //        this.companySettingsDS.getCurrencies(),
    //        this.companySettingsDS.getPeriodSeries(),
    //        this.companySettingsDS.getAccountGroupSets()
    //    ).subscribe(
    //        (results: any[]) => {
    //            console.log(results);
    //            this.dataReady(results)
    //        },
    //        (error: any) => {
    //            console.error(error);
    //        }
    //    );
    //}

    private dataReady() {
        console.log('dataReady called');

        var formBuilder = new UniFormBuilder();

        var companyName = new UniFieldBuilder();
        companyName.setLabel('Firmanavn')
            .setModel(this.company)
            .setModelField('CompanyName')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var orgNr = new UniFieldBuilder();
        orgNr.setLabel('Orgnr.')
            .setModel(this.company)
            .setModelField('OrganizationNumber')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var web = new UniFieldBuilder();
        web.setLabel('Web')
            .setModel(this.company)
            .setModelField('WebAddress')
            .setType(UNI_CONTROL_DIRECTIVES[10]);


        //TODO
        //Contact information should be styled according to standard - when this is ready.
        var street = new UniFieldBuilder();
        street.setLabel('Adresse')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine1')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var street2 = new UniFieldBuilder();
        street2.setLabel('Adresse 2')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine2')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var postNumber = new UniFieldBuilder();
        postNumber.setLabel('Postnr')
            .setModel(this.company.Address[0])
            .setModelField('PostalCode')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var place = new UniFieldBuilder();
        place.setLabel('Sted')
            .setModel(this.company.Address[0])
            .setModelField('City')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var phone = new UniFieldBuilder();
        phone.setLabel('Telefon')
            .setModel(this.company.Phones[0])
            .setModelField('Number')
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var email = new UniFieldBuilder();
        email.setLabel('Epost')
            .setModel(this.company.Emails[0])
            .setModelField('EmailAddress')
            .setType(UNI_CONTROL_DIRECTIVES[11]);
        
        var officeMunicipalNumber = new UniFieldBuilder();
        officeMunicipalNumber.setModel(this.company)
            .setLabel('Kontorkommunenr/navn')
            .setModelField('OfficeMunicipalityNo')
            .setType(UNI_CONTROL_DIRECTIVES[10]);
                
        var officeMunicipalName = new UniFieldBuilder();
        officeMunicipalName.setModel(this.municipals.find(x => x.MunicipalityNo === this.company.OfficeMunicipalityNo))
            .setModelField('MunicipalityName')
            .setType(UNI_CONTROL_DIRECTIVES[10]);
        
        var officeMunicipality = new UniComboFieldBuilder();
        officeMunicipality.addUniElements(officeMunicipalNumber, officeMunicipalName);
        
        //*********************  Virksomhet og aga  ***************************/
        var subEntitiesSection = new UniSectionBuilder('Virksomhet og aga');
        this.subEntities.forEach(subEntity => {
            var municipal = this.municipals.find(x => x.MunicipalityNo === subEntity.MunicipalityNo);
            var agaZone: AGAZone = this.getAgaZone(subEntity.AgaZone);
            var agaRule = this.agaRules.find(x => x.sectorID === subEntity.AgaRule);
            var agaZoneName = '';
            var agaRuleName = '';
            if (agaZone) { agaZoneName = ', Sone ' + agaZone.ZoneName}
            if (agaRule) { agaRuleName = ', ' + agaRule.sector}
            var subEntitySection = new UniSectionBuilder(subEntity.BusinessRelationInfo.Name + 
                ', ' + subEntity.OrgNumber + 
                ', ' + subEntity.MunicipalityNo + '-' + municipal.MunicipalityName +
                agaZoneName + 
                agaRuleName );
            
            var subEntityName = new UniFieldBuilder();
            subEntityName.setLabel('Virksomhet navn')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.Name')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            
            var subEntityOrgNumber = new UniFieldBuilder();
            subEntityOrgNumber.setLabel('Orgnr for virksomheten')
                .setModel(subEntity)
                .setModelField('OrgNumber')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            
            var subEntityAddress = new UniFieldBuilder();
            subEntityAddress.setLabel('Gateadr')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.AddressLine1')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            
            var subEntityPostnr = new UniFieldBuilder();
            subEntityPostnr.setLabel('Postnr, sted')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.PostalCode')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            var subEntityCity = new UniFieldBuilder();
            subEntityCity
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.City')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            var subEntityLocation = new UniComboFieldBuilder();
            subEntityLocation.addUniElements(subEntityPostnr, subEntityCity);
                
            var subEntityMunicipalNumber = new UniFieldBuilder();
            subEntityMunicipalNumber.setModel(subEntity)
                .setLabel('Kommunenr/navn')
                .setModelField('MunicipalityNo')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
                
            var subEntityMunicipalName = new UniFieldBuilder();
            subEntityMunicipalName.setModel(this.municipals.find(x => x.MunicipalityNo === subEntity.MunicipalityNo))
                .setModelField('MunicipalityName')
                .setType(UNI_CONTROL_DIRECTIVES[10]);
            
            var subEntityMunicipality = new UniComboFieldBuilder();
            subEntityMunicipality.addUniElements(subEntityMunicipalNumber, subEntityMunicipalName);
            
            
            var subEntityAgaZone = new UniFieldBuilder();
            subEntityAgaZone.setLabel('Sone')
                .setModel(subEntity)
                .setModelField('AgaZone')
                .setType(UNI_CONTROL_DIRECTIVES[3])
                .setKendoOptions({
                    dataSource: this.agaZones,
                    dataTextField: 'ZoneName',
                    dataValueField: 'ID',
                });
            
            var subEntityAgaRule = new UniFieldBuilder();
            subEntityAgaRule.setLabel('Beregningsregel AGA')
                .setModel(subEntity)
                .setModelField('AgaRule')
                .setType(UNI_CONTROL_DIRECTIVES[3])
                .setKendoOptions({
                    dataSource: this.agaRules,
                    dataTextField: 'Sector',
                    dataValueField: 'SectorID',
                });
            
            subEntitySection.addUniElements(subEntityName, subEntityOrgNumber, subEntityAddress, subEntityLocation, subEntityMunicipality, subEntityAgaZone, subEntityAgaRule);
            subEntitiesSection.addUniElement(subEntitySection);
        });
        
        
        
        // ********************************************************************/
        // ********************  Selskapsoppsett    ***************************/
        var companySetup = new UniSectionBuilder('Selskapsoppsett');

        var companyReg = new UniFieldBuilder();
        companyReg.setLabel('Foretaksregister')
            .setModel(this.company)
            .setModelField('CompanyRegistered')
            .setType(UNI_CONTROL_DIRECTIVES[8]);

        var taxMandatory = new UniFieldBuilder();
        taxMandatory.setLabel('Mva-pliktig')
            .setModel(this.company)
            .setModelField('TaxMandatory')
            .setType(UNI_CONTROL_DIRECTIVES[8])
            .hasLineBreak(true);

        var companyType = new UniFieldBuilder();
        companyType.setLabel('Firmatype')
            .setModel(this.company)
            .setModelField('CompanyTypeID')
            .setType(UNI_CONTROL_DIRECTIVES[3])
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
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: this.currencies,
                dataTextField: 'Code',
                dataValueField: 'Code',
                index: this.currencies.indexOf(this.company.BaseCurrency)
            })
            .hasLineBreak(true);

        //TODO

        var supplierAccount = new UniFieldBuilder();
        supplierAccount.setLabel('Leverandør-konto')
            .setModel(this.company)
            .setModelField('SupplierAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[3])
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
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: this.accounts,
                dataTextField: 'AccountNumber',
                dataValueField: 'ID',
                index: this.currencies.indexOf(this.company.CustomerAccountID)
            })
            .hasLineBreak(true);;

        var creditDays = new UniFieldBuilder();
        creditDays.setLabel('Kredittdager')
            .setModel(this.company)
            .setModelField('CustomerCreditDays')
            .setType(UNI_CONTROL_DIRECTIVES[10]);


        companySetup.addUniElements(companyReg, taxMandatory, companyType, companyCurrency, supplierAccount, customerAccount, creditDays);

        // ********************************************************************/
        // *********************  Regnskapsinnstillinger    *******************/
        var accountingSettings = new UniSectionBuilder('Regnskapsinnstillinger');

        //var periodSeriesAccountAll = new UniFieldBuilder();
        //periodSeriesAccountAll.setLabel('RegnskapsperioderAll')
        //    .setModel(this.company)
        //    .setModelField('PeriodSeriesAccountID')
        //    .setType(UNI_CONTROL_DIRECTIVES[3])
        //    .setKendoOptions({
        //        dataSource: this.periodSeries,
        //        dataTextField: 'Name',
        //        dataValueField: 'ID',
        //        index: this.periodSeries.indexOf(this.company.PeriodSeriesAccountID)
        //    });

        var periodSeriesAccount = new UniFieldBuilder();
        periodSeriesAccount.setLabel('Regnskapsperioder')
            .setModel(this.company)
            .setModelField('PeriodSeriesAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[3])
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
            .setType(UNI_CONTROL_DIRECTIVES[3])
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
            .setType(UNI_CONTROL_DIRECTIVES[3])
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
            .setType(UNI_CONTROL_DIRECTIVES[2]);

        var vatLockedDate = new UniFieldBuilder();
        vatLockedDate.setLabel('Mva låst tom')
            .setModel(this.company)
            .setModelField('VatLockedDate')
            .setType(UNI_CONTROL_DIRECTIVES[2])
            .setKendoOptions({})
            .hasLineBreak(true);

        var forceSupplierInvoiceApproval = new UniFieldBuilder();
        forceSupplierInvoiceApproval.setLabel('Tvungen godkjenning')
            .setModel(this.company)
            .setModelField('ForceSupplierInvoiceApproval')
            .setType(UNI_CONTROL_DIRECTIVES[8]);

        accountingSettings.addUniElements(
            periodSeriesAccount, periodSeriesVat, accountGroupSet, 
            accountingLockedDate, vatLockedDate, forceSupplierInvoiceApproval);

        formBuilder.addUniElements(companyName, orgNr, web, street, street2,
            postNumber, place, phone, email, officeMunicipality, subEntitiesSection, companySetup, accountingSettings);

        this.form = formBuilder;
    }

    /********************************************************************/
    /*********************  Form Builder    *******************/
    
    private update() {
        Observable.forkJoin(
            this.companySettingsDS.getCompanyTypes(),
            this.companySettingsDS.getCurrencies(),
            this.companySettingsDS.getPeriodSeries(),
            this.companySettingsDS.getAccountGroupSets(),
            this.companySettingsDS.getAccounts(),
            this.companySettingsDS.get(this.id),
            this.subEntityService.GetAll('expand=BusinessRelationInfo,BusinessRelationInfo.InvoiceAddress'),
            this.agaZoneService.GetAll(''),
            this.agaZoneService.getAgaRules()
        )
            .subscribe(
            (dataset) => {
                
                var filter: string = '';
                
                dataset[6].forEach((element) => {
                    filter += 'MunicipalityNo eq ' + element.MunicipalityNo + ' or ';
                });
                
                filter = filter.slice(0, filter.length - 3);
                console.log('filter: ' + filter);
                
                this.municipalService.GetAll('filter=' + filter).subscribe((response) => {
                    this.companyTypes = dataset[0];
                    this.currencies = dataset[1];
                    this.periodSeries = dataset[2];
                    this.accountGroupSets = dataset[3];
                    this.accounts = dataset[4];
                    this.company = dataset[5];
                    this.subEntities = dataset[6];
                    this.agaZones = dataset[7];
                    this.agaRules = dataset[8];
                    console.log('error 1');
                    this.municipals = response;
                    console.log(JSON.stringify(response));
                    this.dataReady();
                    
                },
                (error) => console.log(error));
/*
        var self = this;

        this.http
            .asGET()
            .usingBusinessDomain()
            .multipleRequests([
                { endPoint: 'companytypes' },
                { endPoint: 'currencies' },
                { endPoint: 'period-series' },
                { endPoint: 'accountgroupsets' },
                { endPoint: 'accounts' },
                { endPoint: 'companysettings/' + self.id, expand: 'Address,Emails,Phones' }
            ])
            .subscribe(
            (dataset) => {
                self.companyTypes = dataset[0];
                self.currencies = dataset[1];
                self.periodSeries = dataset[2];
                self.accountGroupSets = dataset[3];
                self.accounts = dataset[4];
                self.company = dataset[5];
                self.dataReady();
*/
            },
            (error) => console.log(error)
            );
    }

    private ngOnInit() {
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.update();
    }

    private ngOnChanges() {
        console.log('NGCHANGE event')
    }
    
    private getAgaZone(id: number) {
        return this.agaZones.find(object => object.ID === id);
    }

    /*
    onSubmit(value) {
        console.log('onSubmit called');

        this.http.put({
            resource: 'companysettings/' + this.company.ID,
            body: this.company
        }).subscribe(
            (response) => {
                console.log('onSubmit response');
            },
            (error) => console.log(error)
            );
    }
    */
    private onSubmit(value) {
        console.log('onSubmit called');

        var self = this;

        console.log('LAGRE id: ' + this.id);
        this.http
            .asPUT()
            .withEndPoint('companysettings/' + self.company.ID)
            .withBody(self.company)
            .send().subscribe(
            (response) => {
                console.log('LAGRET Firmainnstillinger ' + self.company.ID)
                //this.uniSaved.emit(this.company); //TODO according to account...
            },
            (error) => {
                console.log('OPPDATERING FEILET');
                console.log(error._body);
            }
            );
    }

    //#region Test data
    private syncAS() {
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

    private syncVat() {
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

    private syncCurrency() {
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