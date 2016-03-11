import {Component, Injector} from "angular2/core";
import {RouteParams} from "angular2/router";
import {EmployeeDS} from "../../../../data/employee";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../../framework/uniTable";
import {Employment} from "../../../../unientities";

@Component({
    selector: "employee-leave",
    templateUrl: "app/components/salary/employee/employeeLeave/employeeLeave.html",
    directives: [UniTable]
})
export class EmployeeLeave {

    currentEmployee;
    employments: Array<any>;
    filter;

    leaveTypes: Array<any>;

    dataConfig;

    getLeaveTypeText = (typeID: string) => {
        var text = "";
        this.leaveTypes.forEach((leaveType) => {
            if (leaveType.typeID === typeID) {
                text = leaveType.text;
            }
        });
        return text;
    }

    getEmploymentJobName = (employmentID: number) => {
        var jobName = "";

        this.employments.forEach((employment: Employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
                console.log("Jobname: " + jobName);
            }
        });
        return jobName;
    }

    buildFilterAndEmployments() {
        var filter = "";
        this.currentEmployee.Employments.forEach((employment: Employment) => {
            filter += " EmploymentID eq " + employment.ID + " or";
            this.employments.push(employment);
        });
        filter = filter.slice(0, filter.length - 2);
        console.log("EmployeeLeave filter: " + filter);
        return filter;
    }

    buildTableConfigs() {
        this.filter = this.buildFilterAndEmployments();
        console.log("employments: " + this.employments);

        var idCol = new UniTableColumn("ID", "Id", "number")
            .setEditable(false)
            .setNullable(true);

        var fromDateCol = new UniTableColumn("FromDate", "Startdato", "date")
            .setFormat("{0: dd.MM.yyyy}");

        var toDateCol = new UniTableColumn("ToDate", "Sluttdato", "date")
            .setFormat("{0: dd.MM.yyyy}");

        var leavePercentCol = new UniTableColumn("LeavePercent", "Andel permisjon", "number")
            .setFormat("{0: #\\'%'}");

        var commentCol = new UniTableColumn("Description", "Kommentar", "string");

        var leaveTypeCol = new UniTableColumn("LeaveType", "Type", "string")
            .setTemplate((dataItem) => {
                return this.getLeaveTypeText(dataItem.LeaveType);
            })
            .setCustomEditor('dropdown', {
                dataSource: this.leaveTypes,
                dataValueField: 'typeID',
                dataTextField: 'text'
            });

        var employmentIDCol = new UniTableColumn("EmploymentID", "Arbeidsforhold", '')
            .setTemplate((dataItem) => {
                return this.getEmploymentJobName(dataItem.EmploymentID)
            })
            .setCustomEditor('dropdown', {
                dataSource: this.employments,
                dataValueField: 'ID',
                dataTextField: 'JobName'
            });

        this.dataConfig = new UniTableBuilder("EmployeeLeave", true)
            .setFilter(this.filter)
            .addColumns(idCol, fromDateCol, toDateCol, leavePercentCol, leaveTypeCol, employmentIDCol, commentCol);
    }

    ngOnInit() {

        let params = this.Injector.parent.parent.get(RouteParams);
        this.employeeDS
            .get(params.get("id"))
            .subscribe((response: any) => {
                this.currentEmployee = response;
                this.buildTableConfigs();
            });
    }

    constructor(private Injector: Injector, public employeeDS: EmployeeDS) {
        this.leaveTypes = [
            {typeID: "0", text: "ikke satt"},
            {typeID: "1", text: "Permisjon"},
            {typeID: "2", text: "Permittering"}
        ];
        this.employments = new Array();

    }
}
