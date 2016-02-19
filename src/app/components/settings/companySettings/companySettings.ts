import {Component, OnInit, provide} from "angular2/core";
import {RouteParams, ROUTER_DIRECTIVES} from "angular2/router";//from Emp
import {NgFor, NgIf} from "angular2/common";
import {Headers} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";

import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder} from "../../../../framework/forms/builders/uniFormBuilder";
import {UniFieldBuilder} from "../../../../framework/forms/builders/uniFieldBuilder";
import {UniSectionBuilder} from "../../../../framework/forms/builders/uniSectionBuilder";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";

import {CompanySettingsDS} from "../../../../framework/data/companySettings";

@Component({
    selector: "settings",
    templateUrl: "app/components/settings/companySettings/companySettings.html",
    providers: [provide(CompanySettingsDS, {useClass: CompanySettingsDS})],
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

    constructor(private routeParams: RouteParams, private companySettingsDS: CompanySettingsDS) {
    }

    ngOnInit() {

        // id of active company used to GET company settings
        // oNLY GETTING DATA WHEN **UNI MICRO AS*** IS CHOSEN
        // bECAUSE ID = 1 IS THE ONLY ONE IN THE DB
        this.id = JSON.parse(localStorage.getItem("activeCompany")).id;

        this.error = false;
        this.headers = new Headers();
        this.headers.append("Client", "client1");

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
        companyName.setLabel("Firmanavn")
            .setModel(this.company)
            .setModelField("CompanyName")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var orgNr = new UniFieldBuilder();
        orgNr.setLabel("Orgnr.")
            .setModel(this.company)
            .setModelField("OrganizationNumber")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var web = new UniFieldBuilder();
        web.setLabel("Web")
            .setModel(this.company)
            .setModelField("WebAddress")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        // todo
        // contact information should be styled according to standard - when this is ready.
        var street = new UniFieldBuilder();
        street.setLabel("Adresse")
            .setModel(this.company.Address[0])
            .setModelField("AddressLine1")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var street2 = new UniFieldBuilder();
        street2.setLabel("Adresse 2")
            .setModel(this.company.Address[0])
            .setModelField("AddressLine2")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var postNumber = new UniFieldBuilder();
        postNumber.setLabel("Postnr")
            .setModel(this.company.Address[0])
            .setModelField("PostalCode")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var place = new UniFieldBuilder();
        place.setLabel("Sted")
            .setModel(this.company.Address[0])
            .setModelField("City")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var phone = new UniFieldBuilder();
        phone.setLabel("Telefon")
            .setModel(this.company.Phones[0])
            .setModelField("Number")
            .setType(UNI_CONTROL_DIRECTIVES[10]);

        var email = new UniFieldBuilder();
        email.setLabel("Epost")
            .setModel(this.company.Emails[0])
            .setModelField("EmailAddress")
            .setType(UNI_CONTROL_DIRECTIVES[11]);


        // ********************  Selskapsoppsett    **************************/
        var companySetup = new UniSectionBuilder("Selskapsoppsett");

        // todo:
        // checkbox not working atm
        var companyReg = new UniFieldBuilder();
        companyReg.setLabel("Foretaksregister")
            .setModel(this.company)
            .setModelField("CompanyRegistered")
            .setType(UNI_CONTROL_DIRECTIVES[8]);

        // checkbox not working atm
        var taxMandatory = new UniFieldBuilder();
        taxMandatory.setLabel("Mva-pliktig")
            .setModel(this.company)
            .setModelField("TaxMandatory")
            .setType(UNI_CONTROL_DIRECTIVES[8]);

        /*        var companyType = new UniFieldBuilder();
         companyType.setLabel("Firmatype")
         .setModel(this.companyTypes[this.company.CompanyTypeID])
         .setModelField("type")
         .setType(UNI_CONTROL_TYPES.DROPDOWN)
         .setKendoOptions({
         dataSource: this.companyTypes
         });*/
        var companyType = new UniFieldBuilder();
        companyType.setLabel("Firmatype")
            .setModel(this.companyTypes[this.company.CompanyTypeID])
            .setModelField("type")
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: this.companyTypes,
                dataTextField: "FullName",
                dataValueField: "ID"
            });

        var companyCurrency = new UniFieldBuilder();
        companyCurrency.setLabel("Valuta")
            .setModel(this.company)
            .setModelField("BaseCurrency")
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: this.currencies,
                dataTextField: "Code",
                dataValueField: "Code"
            });

        companySetup.addUniElements(companyReg, taxMandatory, companyType, companyCurrency);

        // ********************************************************************/
        // *********************  Regnskapsinnstillinger    *******************/
        var accountingSettings = new UniSectionBuilder("Regnskapsinnstillinger");

        // todo:
        // .setModel(this.periodSeries[this.company.PeriodSeriesAccountID])
        // is not a correct selection!!
        // this.periodSeries.ID should be equal the value of .setModelField("type")
        // periodSeriesAccountAll is only for test purpose of the above problem.
        var periodSeriesAccountAll = new UniFieldBuilder();
        periodSeriesAccountAll.setLabel("RegnskapsperioderAll")
            .setModel(this.periodSeries[this.company.PeriodSeriesAccountID])
            .setModelField("type")
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: this.periodSeries,
                dataTextField: "Name",
                dataValueField: "ID"
            });


        var periodSeriesAccount = new UniFieldBuilder();
        periodSeriesAccount.setLabel("Regnskapsperioder")
            .setModel(this.periodSeries[this.company.PeriodSeriesAccountID])
            .setModelField("type")
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: {field: "SeriesType", operator: "eq", value: "1"}
                }),
                dataTextField: "Name",
                dataValueField: "ID"
            });

        var periodSeriesVat = new UniFieldBuilder();
        periodSeriesVat.setLabel("Mva perioder")
            .setModel(this.periodSeries[this.company.PeriodSeriesVatID])
            .setModelField("type")
            .setType(UNI_CONTROL_DIRECTIVES[3])
            .setKendoOptions({
                dataSource: new kendo.data.DataSource({
                    data: this.periodSeries,
                    filter: {field: "SeriesType", operator: "eq", value: "0"}
                }),
                dataTextField: "Name",
                dataValueField: "ID"
            });


        // todo:
        // mangler foreløpig kobling mellom Firma og kontogruppeinndeling
        /*var accountGroupSets = new UniFieldBuilder();
         accountGroupSets.setLabel("Kontogruppeinndeling")
         .setModel(this.periodSeries[this.company.PeriodSeriesVatID])
         .setModelField("type")
         .setType(UNI_CONTROL_TYPES.DROPDOWN)
         .setKendoOptions({
         dataSource: this.periodSeries,
         dataTextField: "Name",
         dataValueField: "ID"
         });
         */

        if (this.company.AccountingLockedDate !== null) {
            this.company.AccountingLockedDate = new Date(this.company.AccountingLockedDate);
        }

        if (this.company.VatLockedDate !== null) {
            this.company.VatLockedDate = new Date(this.company.VatLockedDate);
        }

        var accountingLockedDate = new UniFieldBuilder();
        accountingLockedDate.setLabel("Regnskapsdato")
            .setModel(this.company)
            .setModelField("AccountingLockedDate")
            .setType(UNI_CONTROL_DIRECTIVES[2]);

        var vatLockedDate = new UniFieldBuilder();
        vatLockedDate.setLabel("Momsdato")
            .setModel(this.company)
            .setModelField("VatLockedDate")
            .setType(UNI_CONTROL_DIRECTIVES[2])
            .setKendoOptions({});

        // todo
        // checkbox not working atm
        var forceSupplierInvoiceApproval = new UniFieldBuilder();
        forceSupplierInvoiceApproval.setLabel("Tvungen godkjenning")
            .setModel(this.company)
            .setModelField("ForceSupplierInvoiceApproval")
            .setType(UNI_CONTROL_DIRECTIVES[8]);
        accountingSettings.addUniElements(
            periodSeriesAccount, periodSeriesAccountAll, periodSeriesVat,
            accountingLockedDate, vatLockedDate, forceSupplierInvoiceApproval
        );
        formBuilder.addUniElements(companyName, orgNr, web, street, street2,
            postNumber, place, phone, email, companySetup, accountingSettings);

        this.form = formBuilder;
    }

    submitForm() {
        console.log("submitForm called");
        this.companySettingsDS.update(this.headers, this.company);
    }
}