import {Component, Injector} from "angular2/core";
import {RouteParams} from "angular2/router";
import {EmployeeDS} from "../../../../../framework/data/employee";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../../framework/uniTable";
import {IEmployment} from "../../../../../framework/interfaces/interfaces";

@Component({
    selector: "employee-leave",
    templateUrl: "app/components/salary/employee/employeeLeave/employeeLeave.html",
    directives: [UniTable]
})
export class EmployeeLeave {

    currentEmployee;

    leaveType: Array<any> = [
        {ID: 0, Name: "ikke satt"},
        {ID: 1, Name: "Permisjon"},
        {ID: 2, Name: "Permittering"}
    ];

    dataConfig;

    constructor(private Injector: Injector, public employeeDS: EmployeeDS) {
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

    buildTableConfigs() {

        var idCol = new UniTableColumn("ID", "Id", "number")
            .setEditable(false)
            .setNullable(true);

        var fromDateCol = new UniTableColumn("FromDate", "Startdato", "date").setFormat("{0: dd.MM.yyyy}");
        var toDateCol = new UniTableColumn("ToDate", "Sluttdato", "date").setFormat("{0: dd.MM.yyyy}");
        var leavePercentCol = new UniTableColumn("LeavePercent", "Andel permisjon", "number");
        var commentCol = new UniTableColumn("Description", "Kommentar", "string");
        var leaveTypeCol = new UniTableColumn("LeaveType", "Type", "string");
        var employmentIDCol = new UniTableColumn("EmploymentID", "Arbeidsforhold", "string");

        this.dataConfig = new UniTableBuilder("EmployeeLeave", true)
            .setFilter(this.buildFilter())
            .addColumns(idCol, fromDateCol, toDateCol, leavePercentCol, leaveTypeCol, employmentIDCol, commentCol);
    }

    buildFilter() {
        var filter = "";
        this.currentEmployee.Employments.forEach((employment: IEmployment) => {
            filter += " EmploymentID eq " + employment.ID + " or";
        });
        filter = filter.slice(0, filter.length - 2);
        console.log("EmployeeLeave filter: " + filter);
        return filter;
    }
}
