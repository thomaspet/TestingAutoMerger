import {Component, Injector, ViewChild, ComponentRef} from "angular2/core";
import {RouteParams} from "angular2/router";

import {UniForm} from "../../../../../framework/forms/uniForm";
import {FieldType} from "../../../../../framework/interfaces/interfaces";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";

import {UniFormBuilder} from "../../../../../framework/forms";

import {EmployeeDS} from "../../../../../framework/data/employee";
import {EmployeeModel} from "../../../../../framework/models/employee";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/merge";
import {UniSectionBuilder} from "../../../../../framework/forms/builders/uniSectionBuilder";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {IEmployment} from "../../../../../framework/interfaces/interfaces";

declare var jQuery;

@Component({
    selector: "employee-hours",
    directives: [UniComponentLoader, UniForm],
    templateUrl: "app/components/salary/employee/hours/hours.html"
})
export class Hours {
    currentEmployee;
    form: UniFormBuilder = new UniFormBuilder();
    layout;
    @ViewChild(UniComponentLoader) ucl: UniComponentLoader;
    EmployeeID;
    formInstance: UniForm;
    model;

    constructor(private Injector: Injector, public employeeDS: EmployeeDS) {
        // let params = Injector.parent.parent.get(RouteParams);
        // employeeDS.get(params.get("id"))
        // .subscribe(response => {
        //     this.currentEmployee = response;
        //     console.log(response);
        //     this.buildGroupConfigs();
        // },error => console.log(error));

        let params = Injector.parent.parent.get(RouteParams);
        this.EmployeeID = params.get("id");
    }

    ngAfterViewInit() {

        var self = this;
        Observable.forkJoin(
            self.employeeDS.get(this.EmployeeID),
            self.employeeDS.layout("EmployeeEmploymentsForm")
        ).subscribe(
            (response: any) => {
                self.currentEmployee = EmployeeModel.createFromObject(response[0]);

                self.form = self.buildGroupConfigs();
                self.form.hideSubmitButton();

                self.ucl.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    setTimeout(() => {
                        self.formInstance = cmp.instance;
                    }, 100);

                });
            },
            (error: any) => console.error(error)
        );
    }

    buildGroupConfigs() {
        var formbuilder = new UniFormBuilder();
        this.currentEmployee.Employments.forEach((employment: IEmployment) => {
            var group = new UniSectionBuilder(employment.JobName);

            // if(employment.Standard) {
            //     group.openByDefault(true);
            // }

            var jobCode = new UniFieldBuilder()
                .setLabel("stillingskode")
                .setModel(employment)
                .setModelField("JobCode")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var jobName = new UniFieldBuilder()
                .setLabel("Navn")
                .setModel(employment)
                .setModelField("JobName")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var startDate = new UniFieldBuilder()
                .setLabel("Startdato")
                .setModel(employment)
                .setModelField("StartDate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var endDate = new UniFieldBuilder()
                .setLabel("Sluttdato")
                .setModel(employment)
                .setModelField("EndDate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var monthRate = new UniFieldBuilder()
                .setLabel("Månedlønn")
                .setModel(employment)
                .setModelField("MonthRate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

            var hourRate = new UniFieldBuilder()
                .setLabel("Timelønn")
                .setModel(employment)
                .setModelField("HourRate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

            var workPercent = new UniFieldBuilder()
                .setLabel("Stillingprosent")
                .setModel(employment)
                .setModelField("WorkPercent")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

            if (typeof employment.Localization !== "undefined") {
                if (typeof employment.Localization.BusinessRelationInfo !== "undefined") {
                    var localization = new UniFieldBuilder()
                        .setLabel("Lokalitet")
                        .setModel(employment.Localization.BusinessRelationInfo)
                        .setModelField("Name")
                        .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
                }
            } else {
                var localization = new UniFieldBuilder()
                    .setLabel("Lokalitet")
                    .setModel(employment)
                    .setModelField("LocalizationID")
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
            }

            group.addUniElements(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, localization);

            var readmore = new UniSectionBuilder("VIS MER...");

            var salaryChanged = new UniFieldBuilder()
                .setLabel("Endret lønn")
                .setModel(employment)
                .setModelField("LastSalaryChangeDate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var workpercentChange = new UniFieldBuilder()
                .setLabel("Endret stillingprosent")
                .setModel(employment)
                .setModelField("LastWorkPercentChangeDate")
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            readmore.addUniElements(salaryChanged, workpercentChange);

            formbuilder.addUniElement(group);
            formbuilder.addUniElements(readmore);
        });
        this.form = formbuilder;
        return formbuilder;
    }

    onFormSubmit(event: any, index: number|string) {
        jQuery.merge(this.currentEmployee.Employments[index], event.value);
    }
}
