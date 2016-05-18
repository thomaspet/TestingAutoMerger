import {Component} from '@angular/core';
import {Router} from '@angular/router-deprecated';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {Employee} from '../../../unientities';

import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    templateUrl: 'app/components/salary/employee/employeeList.html',
    directives: [UniTable]
})

export class EmployeeList {
    private employeeTableConfig: UniTableBuilder;

    constructor(private router: Router, private tabSer: TabService) {
        
        var idCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', 'number').setWidth('15%');

        var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', 'string');

        var employmentDateCol = new UniTableColumn('EmploymentDate', 'Ansettelsesdato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('15%');

        this.employeeTableConfig = new UniTableBuilder('employees', false)
            .setExpand('BusinessRelationInfo')
            .setFilter('BusinessRelationID gt 0')
            .setSelectCallback((selectedEmployee: Employee) => {
                router.navigate(['EmployeeDetails', {id: selectedEmployee.ID}]);
                      // .then(result => console.log(result));
            })
            .addColumns(idCol, nameCol, employmentDateCol);
        
        this.tabSer.addTab({name: 'Ansatte', url: '/salary/employees'});
    }
    
    public newEmployee() {
        this.router.navigateByUrl('/salary/employees/' + 0);
    }
    
}
