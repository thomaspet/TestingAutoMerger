﻿import {Component, OnInit, Inject, provide} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';//from Emp
import {NgFor, NgIf, Validators, Control, FormBuilder} from 'angular2/common';
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {UniForm, FIELD_TYPES} from '../../../../framework/forms/uniForm';
import {UniFormBuilder} from "../../../../framework/forms/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../framework/forms/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../../framework/forms/uniFieldBuilder";
import {UniGroupBuilder} from '../../../../framework/forms/uniGroupBuilder';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';

import {ApplicationNav} from '../../common/applicationNav/applicationNav';

import {CompanySettingsDS} from '../../../../framework/data/companySettings';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html',
    providers: [provide(CompanySettingsDS, { useClass: CompanySettingsDS })],
    directives: [ROUTER_DIRECTIVES, NgFor, NgIf, UniForm]
})

export class CompanySettings implements OnInit {

    id: any;
    form: any;
    error: boolean;
    headers: Headers;
    company: any;
    activeCompany: any;
    companyTypes: Array<any> = [];
    currencies: Array<any> = [];
    periodSeries: Array<any> = [];
    accountGroupSets: Array<any> = [];

    constructor(private routeParams: RouteParams, private companySettingsDS: CompanySettingsDS) { }

    ngOnInit() {

        //ID of active company used to GET company settings
        //ONLY GETTING DATA WHEN **UNI MICRO AS*** IS CHOSEN
        //BECAUSE ID = 1 IS THE ONLY ONE IN THE DB
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;

        this.error = false;
        this.headers = new Headers();
        this.headers.append('Client', 'client1');

        Observable.forkJoin(
            this.companySettingsDS.get(this.id),
            this.companySettingsDS.getCompanyTypes(),
            this.companySettingsDS.getCurrencies(),
            this.companySettingsDS.getPeriodSeries(),
            this.companySettingsDS.getAccountGroupSets()
        ).subscribe(results => this.dataReady(results));
    }

    dataReady(data) {
        console.log("dataReady3 called");

        if (data === null) {
            this.error = true;
            return;
        }

        this.company = data[0];
        this.companyTypes = data[1];
        this.currencies = data[2];
        this.periodSeries = data[3];
        this.accountGroupSets = data[4];

        var formBuilder = new UniFormBuilder();

        var companyName = new UniFieldBuilder();
        companyName.setLabel('Firmanavn')
            .setModel(this.company)
            .setModelField('CompanyName')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var orgNr = new UniFieldBuilder();
        orgNr.setLabel('Orgnr.')
            .setModel(this.company)
            .setModelField('OrganizationNumber')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var web = new UniFieldBuilder();
        web.setLabel('Web')
            .setModel(this.company)
            .setModelField('WebAddress')
            .setType(UNI_CONTROL_TYPES.TEXT);

        //TODO
        //Contact information should be styled according to standard - when this is ready.
        var street = new UniFieldBuilder();
        street.setLabel('Adresse')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine1')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var street2 = new UniFieldBuilder();
        street2.setLabel('Adresse 2')
            .setModel(this.company.Address[0])
            .setModelField('AddressLine2')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var postNumber = new UniFieldBuilder();
        postNumber.setLabel('Postnr')
            .setModel(this.company.Address[0])
            .setModelField('PostalCode')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var place = new UniFieldBuilder();
        place.setLabel('Sted')
            .setModel(this.company.Address[0])
            .setModelField('City')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var phone = new UniFieldBuilder();
        phone.setLabel('Telefon')
            .setModel(this.company.Phones[0])
            .setModelField('Number')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var email = new UniFieldBuilder();
        email.setLabel('Epost')
            .setModel(this.company.Emails[0])
            .setModelField('EmailAddress')
            .setType(UNI_CONTROL_TYPES.EMAIL)
        //TODO Use UNI_CONTROL_TYPES.EMAIL?? or .setType(UNI_CONTROL_TYPES.TEXT);??

        /********************************************************************/
        /*********************  Selskapsoppsett    **************************/
        var companySetup = new UniGroupBuilder("Selskapsoppsett");

        //TODO:
        //Checkbox not working atm
        var companyReg = new UniFieldBuilder();
        companyReg.setLabel('Foretaksregister')
            .setModel(this.company)
            .setModelField('CompanyRegistered')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);

        //Checkbox not working atm
        var taxMandatory = new UniFieldBuilder();
        taxMandatory.setLabel('Mva-pliktig')
            .setModel(this.company)
            .setModelField('TaxMandatory')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);

        /*        var companyType = new UniFieldBuilder();
                companyType.setLabel('Firmatype')
                    .setModel(this.companyTypes[this.company.CompanyTypeID])
                    .setModelField('type')
                    .setType(UNI_CONTROL_TYPES.DROPDOWN)
                    .setKendoOptions({
                        dataSource: this.companyTypes
                    });*/
        var companyType = new UniFieldBuilder();
        companyType.setLabel('Firmatype')
            .setModel(this.companyTypes[this.company.CompanyTypeID])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: this.companyTypes,
                dataTextField: 'FullName',
                dataValueField: 'ID'
            });

        var companyCurrency = new UniFieldBuilder();
        companyCurrency.setLabel('Valuta')
            .setModel(this.currencies[this.company.BaseCurrency])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: this.currencies,
                dataTextField: 'Code',
                dataValueField: 'Code'
            });

        companySetup.addFields(companyReg, taxMandatory, companyType, companyCurrency);

        /********************************************************************/
        /*********************  Regnskapsinnstillinger    *******************/
        var accountingSettings = new UniGroupBuilder('Regnskapsinnstillinger');

        //TODO:
        //.setModel(this.periodSeries[this.company.PeriodSeriesAccountID]) 
        //is not a correct selection!!
        //this.periodSeries.ID should be equal the value of .setModelField('type')
        //periodSeriesAccountAll is only for test purpose of the above problem.
        var periodSeriesAccountAll = new UniFieldBuilder();
        periodSeriesAccountAll.setLabel('RegnskapsperioderAll')
            .setModel(this.periodSeries[this.company.PeriodSeriesAccountID])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: this.periodSeries,
                dataTextField: 'Name',
                dataValueField: 'ID'
            });


        var periodSeriesAccount = new UniFieldBuilder();
        periodSeriesAccount.setLabel('Regnskapsperioder')
            .setModel(this.periodSeries[this.company.PeriodSeriesAccountID])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: { field: "SeriesType", operator: "eq", value: "1" }
                }),
                dataTextField: 'Name',
                dataValueField: 'ID'
            });

        var periodSeriesVat = new UniFieldBuilder();
        periodSeriesVat.setLabel('Mva perioder')
            .setModel(this.periodSeries[this.company.PeriodSeriesVatID])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: { field: "SeriesType", operator: "eq", value: "0" }
                }),
                dataTextField: 'Name',
                dataValueField: 'ID'
            });
            
       

        //TODO: 
        //Mangler foreløpig kobling mellom Firma og kontogruppeinndeling
        /*var accountGroupSets = new UniFieldBuilder();
        accountGroupSets.setLabel('Kontogruppeinndeling')
            .setModel(this.periodSeries[this.company.PeriodSeriesVatID])
            .setModelField('type')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({
                dataSource: this.periodSeries,
                dataTextField: 'Name',
                dataValueField: 'ID'
            });
*/

        if (this.company.AccountingLockedDate !== null) {
            this.company.AccountingLockedDate = new Date(this.company.AccountingLockedDate);
        }

        if (this.company.VatLockedDate !== null) {
            this.company.VatLockedDate = new Date(this.company.VatLockedDate);
        }

        var accountingLockedDate = new UniFieldBuilder();
        accountingLockedDate.setLabel('Regnskapsdato')
            .setModel(this.company)
            .setModelField('AccountingLockedDate')
            .setType(UNI_CONTROL_TYPES.DATEPICKER);

        var vatLockedDate = new UniFieldBuilder();
        vatLockedDate.setLabel('Momsdato')
            .setModel(this.company)
            .setModelField('VatLockedDate')
            .setType(UNI_CONTROL_TYPES.DATEPICKER)
            .setKendoOptions({});

        //TODO
        //Checkbox not working atm
        var forceSupplierInvoiceApproval = new UniFieldBuilder();
        forceSupplierInvoiceApproval.setLabel('Tvungen godkjenning')
            .setModel(this.company)
            .setModelField('ForceSupplierInvoiceApproval')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);

        accountingSettings.addFields(periodSeriesAccount, periodSeriesAccountAll, periodSeriesVat, accountingLockedDate, vatLockedDate, forceSupplierInvoiceApproval);

        formBuilder.addFields(companyName, orgNr, web, street, street2, postNumber, place, phone, email, companySetup, accountingSettings);

        this.form = formBuilder;
    }

    submitForm() {
        console.log("submitForm called");
        this.companySettingsDS.update(this.headers, this.company);
    }
}