import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {EmploymentService} from '../../../../services/services';
import {EmployeeDS} from '../../../../data/employee';
import {Employee, Employment} from '../../../../unientities';
import {EmployeeEmployment} from './employments';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

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
    private showEmploymentList: boolean = false;
    private employmentListConfig: UniTableConfig;
    private employments$: Observable<Employment>;
    
    constructor(private _employmentService: EmploymentService, private employeeDataSource: EmployeeDS, private router: Router, private rootRouteParams: RootRouteParamsService) {        
        this.currentEmployeeID = +rootRouteParams.params.get('id');
    }
    
    public ngOnInit() {
        this.refreshList();
        this.employeeDataSource.get(this.currentEmployeeID)
        .subscribe((response: any) => {
            this.currentEmployee = response;
            if (this.currentEmployee.Employments.length > 0) {
                if (this.currentEmployee.Employments.length > 1) {
                    this.showEmploymentList = true;
                    this.setTableConfig();
                }
                this.currentEmployee.Employments.forEach(employment => {
                    if (employment.Standard === true) {
                        this.selectedEmployment = employment;
                    }
                });
            } else {
                // no employments, lets create an emtpy object to show
                let newEmployment = new Employment();
                newEmployment.Standard = true;
                newEmployment.EmployeeNumber = this.currentEmployee.EmployeeNumber;
                newEmployment.EmployeeID = this.currentEmployee.ID;
                this.selectedEmployment = newEmployment;
            }
        },
        (err) => {
            console.log('error getting employee', err);
        });
    }
    
    private setTableConfig() {
        this.busy = true;
        var nameCol = new UniTableColumn('JobName', 'Stillingsnavn', UniTableColumnType.Text).setWidth('8%');
        var styrkCol = new UniTableColumn('JobCode', 'Stillingskode', UniTableColumnType.Text).setWidth('5%');
        
        this.employmentListConfig = new UniTableConfig(false)
        .setColumns([styrkCol, nameCol])
        .setPageable(false);
        
        this.busy = false;
    }

    public refreshList() {
        this.employments$ = this._employmentService.GetAll('filter=EmployeeID eq ' + this.currentEmployeeID);
    }

    public rowSelected(event) {
        this.selectedEmployment = event.rowModel;
    }
}
