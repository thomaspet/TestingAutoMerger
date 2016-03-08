import {Component} from "angular2/core";
import {Router} from "angular2/router";

import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {IEmployee} from "../../../interfaces";

@Component({
    templateUrl: "app/components/salary/employee/employeeList.html",
    directives: [UniTable]
})

export class EmployeeList {
    employeeTableConfig;

    constructor(router: Router) {
        var idCol = new UniTableColumn("ID", "ID", "number")
        .setEditable(false);
        var empNmbCol = new UniTableColumn("EmployeeNumber", "Ansattnummer", "number")
        .setEditable(false);
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name", "Navn", "string");
        var birthCol = new UniTableColumn("BirthDate", "Fødselsdato","datetime")
        .setNullable(true)
        .setFormat("{0: dd.MM.yyyy}");
        var employmentDateCol = new UniTableColumn('EmploymentDate', 'Ansettelsesdato', 'date')
        .setFormat("{0: dd.MM.yyyy}");
        
        this.employeeTableConfig = new UniTableBuilder('employees', false)
        .setExpand('BusinessRelationInfo')
        .setFilter('BusinessRelationID gt 0')
        .setSelectCallback((selectedEmployee) => {
            router.navigateByUrl('/salary/employees/' + selectedEmployee.ID); 
        })
        .addColumns(idCol, nameCol, birthCol, employmentDateCol);   
    }
}