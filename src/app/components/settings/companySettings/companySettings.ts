﻿import {Component, OnInit, Inject, provide} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';//from Emp
import {NgFor, NgIf, Validators, Control, FormBuilder} from 'angular2/common';
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {UniForm} from '../../../../framework/forms/uniForm';
import {UniFormBuilder} from "../../../../framework/forms/builders/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../framework/forms/builders/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../../framework/forms/builders/uniFieldBuilder";
import {UniGroupBuilder} from '../../../../framework/forms/builders/uniGroupBuilder';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {UniTabs} from '../../layout/uniTabs/uniTabs';

//import {ApplicationNav} from '../../../Layout/applicationNav/applicationNav';
import {CompanySettingsDS} from '../../../../framework/data/companySettings';
import {UniHttpService} from '../../../../framework/data/uniHttpService';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/companySettings/companySettings.html',
    directives: [ROUTER_DIRECTIVES, NgFor, NgIf, UniForm],
    providers: [provide(CompanySettingsDS, { useClass: CompanySettingsDS })]
})

export class CompanySettings implements OnInit {
    id: any;
    form: any;
    company: any;
    activeCompany: any;
    companyTypes: Array<any> = [];
    currencies: Array<any> = [];
    periodSeries: Array<any> = [];
    accountGroupSets: Array<any> = [];

    constructor(private routeParams: RouteParams, private companySettingsDS: CompanySettingsDS, private http: UniHttpService) {
        
    }
  
    dataReady() {
        console.log("dataReady called");

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

        /********************************************************************/
        /*********************  Selskapsoppsett    **************************/
        var companySetup = new UniGroupBuilder("Selskapsoppsett");

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
            });
        companySetup.addFields(companyReg, taxMandatory, companyType, companyCurrency);

        /********************************************************************/
        /*********************  Regnskapsinnstillinger    *******************/
        var accountingSettings = new UniGroupBuilder('Regnskapsinnstillinger');

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
                    filter: { field: "SeriesType", operator: "eq", value: "1" }
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
                    filter: { field: "SeriesType", operator: "eq", value: "0" }
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

        accountingSettings.addFields(periodSeriesAccount, periodSeriesVat, accountGroupSet, accountingLockedDate, vatLockedDate, forceSupplierInvoiceApproval);

        /********************************************************************/
        /*********************  Form Builder    *******************/
        formBuilder.addFields(companyName, orgNr, web, street, street2, postNumber, place, phone, email, companySetup, accountingSettings);

        this.form = formBuilder;
    }

    /********************************************************************/
    /*********************  Form Builder    *******************/
    update() {
        this.http.multipleRequests('GET', [
            { resource: "companytypes" },
            { resource: "currencies" },
            { resource: "period-series" },
            { resource: "accountgroupsets" },
            { resource: "companysettings/" + this.id, expand: "Address,Emails,Phones" }
        ]).subscribe(
            (dataset) => {
                this.companyTypes = dataset[0];
                this.currencies = dataset[1];
                this.periodSeries = dataset[2];
                this.accountGroupSets = dataset[3];
                this.company = dataset[4];
                this.dataReady();
            },
            (error) => console.log(error)
            )
    }

    ngOnInit() {
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.update();
    }

    ngOnChanges() {
        console.log("NGCHANGE event")
    }

    onSubmit(value) {
        console.log("onSubmit called");

        this.http.put({
            resource: "companysettings/" + this.company.ID,
            body: this.company
        }).subscribe(
            (response) => {
                console.log("onSubmit response");
            },
            (error) => console.log(error)
            );
    }
}