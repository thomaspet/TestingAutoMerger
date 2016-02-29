import {RouteParams} from "angular2/router";
import {Component, Injector} from "angular2/core";
import {EmployeeDS} from "../../../../../framework/data/employee";
import {STYRKCodesDS} from "../../../../../framework/data/styrkCodes";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../../framework/interfaces/interfaces";
import {
    UniForm, UniFormBuilder, UniFieldBuilder, UniSectionBuilder, UniFieldsetBuilder
} from "../../../../../framework/forms";
import {Observable} from "rxjs/Observable";
import {IEmployment} from "../../../../../framework/interfaces/interfaces";
import {UniElementFinder} from "../../../../../framework/forms/shared/UniElementFinder";

declare var jQuery;

@Component({
    selector: "employee-employment",
    directives: [UniForm],
    templateUrl: "app/components/salary/employee/employments/employments.html"
})
export class Employment {
    currentEmployee;
    formConfigs: UniFormBuilder[];
    styrkCodes;

    typeOfEmployment: Array<any> = [
        {ID: 0, Navn: "Ikke satt"},
        {ID: 1, Navn: "1 - Ordinært arbeidsforhold"},
        {ID: 2, Navn: "2 - Maritimt arbeidsforhold"},
        {ID: 3, Navn: "3 - Frilanser, oppdragstager, honorar"},
        {ID: 4, Navn: "4 - Pensjon og annet uten ansettelse"}
    ];

    renumerationType: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Fast lønnet"},
        {ID: 2, Navn: "2 - Timelønnet"},
        {ID: 3, Navn: "3 - Provisjonslønnet"},
        {ID: 4, Navn: "4 - Honorar"},
        {ID: 5, Navn: "5 - Akkord"}
    ];

    workingHoursScheme: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Ikke skiftarbeid"},
        {ID: 2, Navn: "2 - Arbeid offshore"},
        {ID: 3, Navn: "3 - Helkontinuerlig skiftarbeid"},
        {ID: 4, Navn: "4 - Døgnkontinuerlig skiftarbeid"},
        {ID: 5, Navn: "5 - 2 skiftarbeid"}
    ];

    shipType: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Annet"},
        {ID: 2, Navn: "2 - Boreplattform"},
        {ID: 3, Navn: "3 - Turist"}
    ];

    shipReg: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Norsk Internasjonalt skipsregister"},
        {ID: 2, Navn: "2 - Norsk ordinært skipsregister"},
        {ID: 3, Navn: "3 - Utenlandsk skipsregister"}
    ];

    tradeArea: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Innenriks"},
        {ID: 2, Navn: "2 - Utenriks"}
    ];

    localizations: Array<any> = [
        {ID: 0, Navn: "Modalen"},
        {ID: 1, Navn: "Haugesund"},
        {ID: 2, Navn: "Bergen"},
        {ID: 3, Navn: "Oslo"},
        {ID: 4, Navn: "Trondheim"},
        {ID: 5, Navn: "Stavanger"},
        {ID: 6, Navn: "Bodø"}
    ];

    constructor(private Injector: Injector, public employeeDS: EmployeeDS, public styrkcodesDS: STYRKCodesDS) {
        let params = Injector.parent.parent.get(RouteParams);
        Observable.forkJoin(
            employeeDS.get(params.get("id")),
            styrkcodesDS.getCodes(),
            employeeDS.getLocalizations()
        ).subscribe((response: any) => {
            let [employee, codes, loc] = response;
            console.log("localizations from constructor", loc);
            this.currentEmployee = employee;
            this.styrkCodes = codes;
            this.localizations = loc;
            this.buildFormConfigs();
        }, (error: any) => console.log(error));
    }

    buildFormConfigs() {
        this.formConfigs = [];

        this.currentEmployee.Employments.forEach((employment: IEmployment) => {
            var formbuilder = new UniFormBuilder();
            var bAddLocalization = false;

            var jobCode = this
                .buildField("Stillingskode", employment, "JobCode", FieldType.AUTOCOMPLETE)
                .setKendoOptions({
                    dataSource: this.styrkCodes,
                    dataTextField: "styrk",
                    dataValueField: "styrk"
                });
            jobCode.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                var fjn = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName("JobName", formbuilder.config());
                fjn.control.updateValue(dataItem.tittel, {});
            };

            var jobName = this.buildField("Navn", employment, "JobName", FieldType.AUTOCOMPLETE)
                .setKendoOptions({
                    dataSource: this.styrkCodes,
                    dataTextField: "tittel",
                    dataValueField: "tittel"
                });
            jobName.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                var fjc = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName("JobCode", formbuilder.config());
                fjc.control.updateValue(dataItem.styrk, {});
            };

            var startDate = this.buildField("Startdato", employment, "StartDate", FieldType.DATEPICKER);
            var endDate = this.buildField("Sluttdato", employment, "EndDate", FieldType.DATEPICKER);
            var monthRate = this.buildField("Månedlønn", employment, "MonthRate", FieldType.NUMERIC);
            var hourRate = this.buildField("Timelønn", employment, "HourRate", FieldType.NUMERIC);
            var workPercent = this.buildField("Stillingprosent", employment, "WorkPercent", FieldType.NUMERIC);

            if (typeof employment.Localization !== "undefined") {
                if (typeof employment.Localization.BusinessRelationInfo !== "undefined") {
                    var localization = this
                        .buildField("Lokasjon", employment.Localization.BusinessRelationInfo, "Name", FieldType.COMBOBOX);
                    localization.setKendoOptions({
                        dataSource: this.localizations,
                        dataTextField: "BusinessRelationInfo.Name",
                        dataValueField: "ID"
                    });
                    bAddLocalization = true;
                }
            }

            var readgroup = this.buildGroupForm(employment);

            if (bAddLocalization) {
                formbuilder.addUniElements(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, localization, readgroup);
            } else {
                formbuilder.addUniElements(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, readgroup);
            }


            formbuilder.hideSubmitButton();
            this.formConfigs.push(formbuilder);
        });

    }

    buildGroupForm(employment: IEmployment) {
        var groupBuilder = new UniSectionBuilder("Vis mer");
        if (employment.Standard === true) {
            groupBuilder.openByDefault(true);
        }

        // a-meldingsinfo
        var ameldingSet = new UniFieldsetBuilder();
        var tOfEmplnt = this.buildField("Arbeidsforhold", employment, "TypeOfEmployment", FieldType.COMBOBOX);
        tOfEmplnt.setKendoOptions({
            dataSource: this.typeOfEmployment,
            dataTextField: "Navn",
            dataValueField: "ID"
        });
        var renum = this.buildField("Avlønning", employment, "RenumerationType", FieldType.COMBOBOX);
        renum.setKendoOptions({
            dataSource: this.renumerationType,
            dataTextField: "Navn",
            dataValueField: "ID"
        });
        var work = this.buildField("Arbeidstid", employment, "WorkingHoursScheme", FieldType.COMBOBOX);
        work.setKendoOptions({
            dataSource: this.workingHoursScheme,
            dataTextField: "Navn",
            dataValueField: "ID"
        });
        var hours = this.buildField("Standardtimer", employment, "HoursPerWeek", FieldType.NUMERIC);
        ameldingSet.addUniElements(hours, tOfEmplnt, renum, work);

        // dates
        var dateSet = new UniFieldsetBuilder();
        var salary = this.buildField("Lønnsjustering", employment, "LastSalaryChangeDate", FieldType.DATEPICKER);
        var percent = this.buildField("Endret stillingprosent", employment, "LastWorkPercentChangeDate", FieldType.DATEPICKER);
        var senority = this.buildField("Ansiennitet", employment, "SenorityDate", FieldType.DATEPICKER);
        dateSet.addUniElements(salary, percent, senority);

        // annen lønnsinfo
        var infoSet = new UniFieldsetBuilder();
        var freerate = this.buildField("Fri sats", employment, "UserdefinedRate", FieldType.NUMERIC);
        var ledger = this.buildField("Hovedbokskonto", employment, "LedgerAccount", FieldType.TEXT);
        infoSet.addUniElements(freerate, ledger);

        // dimensjoner
        // prosjekt - ?
        // avdeling - ?

        groupBuilder.addUniElements(ameldingSet, dateSet, infoSet);

        return groupBuilder;
    }

    buildField(label: string, model: any, modelfield: string, type: number, index = null) {
        return new UniFieldBuilder()
            .setLabel(label)
            .setModel(model)
            .setModelField(modelfield)
            .setType(UNI_CONTROL_DIRECTIVES[type]);
    }

    changeDefault(event, index) {
        console.log("Index when changing default: " + index);
    }

    onFormSubmit(event, index) {
        jQuery.merge(this.currentEmployee.Employments[index], event.value);
    }

    // @fixme: Proper date formatting here…
    formatDate(date) {
        if (!date)return "";

        date = new Date(date);
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }

}
