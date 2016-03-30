import {Component} from "angular2/core";
import {Router} from "angular2/router";

import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {Employee} from "../../../unientities";

@Component({
    templateUrl: "app/components/salary/employee/employeeList.html",
    directives: [UniTable]
})

export class EmployeeList {
    employeeTableConfig;

    constructor(router: Router) {
        var idCol = new UniTableColumn("ID", "ID", "number");

        var nameCol = new UniTableColumn("BusinessRelationInfo.Name", "Name", "string");

        var employmentDateCol = new UniTableColumn("EmploymentDate", "Ansettelsesdato", "date")
            .setFormat("{0: dd.MM.yyyy}");

        this.employeeTableConfig = new UniTableBuilder("employees", false)
            .setExpand("BusinessRelationInfo")
            .setFilter("BusinessRelationID gt 0")
            .setSelectCallback((selectedEmployee: Employee) => {
                //router.navigateByUrl(`/salary/employees/${selectedEmployee.ID}`);
                router.navigate(['EmployeeDetails', {id: selectedEmployee.ID}]).then(result => console.log(result));
            })
            .addColumns(idCol, nameCol, employmentDateCol);
    }
}