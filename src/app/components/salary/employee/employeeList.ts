import {Component} from 'angular2/core';
import {Router, RouteConfig} from 'angular2/router';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

@Component({
    templateUrl: 'app/components/salary/employee/employeeList.html',    
    directives: [UniTable]
})

export class EmployeeList {
    employeeTableConfig;
    
    constructor(router: Router) {
        var idCol = new UniTableColumn('ID', 'ID', 'number');
        
        var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Name', 'string');
        
        var employmentDateCol = new UniTableColumn('EmploymentDate', 'Ansettelsesdato', 'date')
        .setFormat("{0: dd.MM.yyyy}");
        
        this.employeeTableConfig = new UniTableBuilder('employees', false)
        .setExpand('BusinessRelationInfo')
        .setFilter('BusinessRelationID gt 0')
        .setSelectCallback((selectedEmployee) => {
            router.navigateByUrl('/salary/employees/' + selectedEmployee.ID); 
        })
        .addColumns(idCol, nameCol, employmentDateCol);   
    }
}