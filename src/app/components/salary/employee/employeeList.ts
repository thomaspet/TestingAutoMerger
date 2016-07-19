import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

import {Observable} from 'rxjs/Observable';

import {Employee} from '../../../unientities';

import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {EmployeeService} from '../../../services/services';

@Component({
    templateUrl: 'app/components/salary/employee/employeeList.html',
    pipes: [AsyncPipe],
    directives: [UniTable],
    providers: [EmployeeService]
})

export class EmployeeList {
    private employeeTableConfig: UniTableConfig;
    private employees$: Observable<Employee>;

    constructor(private router: Router, private tabService: TabService, private _employeeService: EmployeeService) {

        this.employees$ = _employeeService.GetAll('orderby=EmployeeNumber ASC&filter=BusinessRelationID gt 0');
        
        var idCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Number).setWidth('15%');

        var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);

        var employmentDateCol = new UniTableColumn('EmploymentDate', 'Ansettelsesdato', UniTableColumnType.Date)
            .setWidth('15%');

        this.employeeTableConfig = new UniTableConfig(false)
            .setColumns([idCol, nameCol, employmentDateCol]);

        this.tabService.addTab({ name: 'Ansatte', url: '/salary/employees', moduleID: 12, active: true });
    }

    public rowSelected(event) {
        this.router.navigate(['/salary/employees/', event.rowModel.ID]);
    }
    
    public newEmployee() {
        this.router.navigateByUrl('/salary/employees/' + 0);
    }
    
}
