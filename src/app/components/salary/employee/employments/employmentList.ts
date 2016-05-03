import {Component, OnInit, ViewChild, Injector} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {UniTable, UniTableColumn, UniTableBuilder} from '../../../../../framework/uniTable';
import {EmploymentService} from '../../../../services/services';
import {EmployeeDS} from '../../../../data/employee';
import {Employee, Employment} from '../../../../unientities';
import {EmployeeEmployment} from './employments';

@Component({
    selector: 'employment-list',
    templateUrl: 'app/components/salary/employee/employments/employmentList.html',
    directives: [UniTable, EmployeeEmployment],
    providers: [EmploymentService]
})

export class EmploymentList implements OnInit {
    
    private currentEmployee: Employee;
    private currentEmployeeID: number;
    private selectedEmployment: Employment;
    private busy: boolean;
    private employmentListConfig: any;
    @ViewChild(UniTable) private tables: UniTable;
    
    constructor(private _employmentService: EmploymentService, private injector: Injector, private employeeDataSource: EmployeeDS, private router: Router) {
        let params = injector.parent.parent.get(RouteParams);
        // console.log('params', params);
        this.currentEmployeeID = params.get('id');
    }
    
    public ngOnInit() {
        this.employeeDataSource.get(this.currentEmployeeID)
        .subscribe((response: any) => {
            // console.log('response', response);
            this.currentEmployee = response;
            this.setTableConfig();
            // console.log('set tableconfig');
        },
        (err) => {
            console.log('error getting employee', err);
        });
    }
    
    private setTableConfig() {
        this.busy = true;
        var idCol = new UniTableColumn('ID', 'Nr', 'number').setWidth('4rem');
        var nameCol = new UniTableColumn('JobName', 'Tittel', 'string');
        var styrkCol = new UniTableColumn('JobCode', 'Stillingskode', 'string');
        
        this.employmentListConfig = new UniTableBuilder(this.currentEmployee.Employments, false)
            .setSelectCallback((selected: Employment) => {
            this.selectedEmployment = selected;
        })
        .setColumnMenuVisible(false)
        .setPageable(false)
        .addColumns(idCol, nameCol, styrkCol);
        
        this.busy = false;
    }
}
