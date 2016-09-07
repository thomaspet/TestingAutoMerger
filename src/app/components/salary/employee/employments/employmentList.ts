import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {EmploymentService, EmployeeService} from '../../../../services/services';
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
    private employmentListConfig: UniTableConfig;
    private employments$: Observable<Employment>;

    constructor(
        private _employmentService: EmploymentService,
        private employeeService: EmployeeService,
        private route: ActivatedRoute) {

        
    }
    
    public ngOnInit() {
        this.route.parent.params.subscribe( params => {
            this.currentEmployeeID = +params['id'];
            this.refreshList();
        });
    }
    
    private setTableConfig() {
        this.busy = true;
        let idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('JobName', 'Stillingsnavn', UniTableColumnType.Text);
        let styrkCol = new UniTableColumn('JobCode', 'Stillingskode', UniTableColumnType.Text);
        
        this.employmentListConfig = new UniTableConfig(false)
        .setColumns([idCol, styrkCol, nameCol]);
        
        this.busy = false;
    }

    public addNewEmployment() {
        this._employmentService.GetNewEntity().subscribe((response: Employment) => {
                    
            var newEmployment = response;
            newEmployment.EmployeeNumber = this.currentEmployee.EmployeeNumber;
            newEmployment.EmployeeID = this.currentEmployee.ID;
            newEmployment.JobCode = '';
            newEmployment.JobName = '';
            newEmployment.StartDate = new Date();
            newEmployment.LastSalaryChangeDate = new Date();
            newEmployment.LastWorkPercentChangeDate = new Date();
            newEmployment.SeniorityDate = new Date();
            
            this.selectedEmployment = newEmployment;
        });
    }

    public refreshList() {
        this.employments$ = this._employmentService.GetAll('filter=EmployeeID eq ' + this.currentEmployeeID);
        
        this.employeeService.get(this.currentEmployeeID)
        .subscribe((response: any) => {
            this.currentEmployee = response;
            this.employeeService.refreshEmployee(response);
            if (this.currentEmployee.Employments.length > 0) {
                if (this.currentEmployee.Employments.length > 1) {
                    this.setTableConfig();
                }
                this.currentEmployee.Employments.forEach(employment => {
                    if (employment.Standard === true) {
                        this.selectedEmployment = employment;
                    }
                });
            } else {
                // no employments, lets create an emtpy object to show
                this.addNewEmployment();
            }
        },
        (err) => {
            console.log('error getting employee', err);
            this.log(err);
        });
    }

    public rowSelected(event) {
        this.selectedEmployment = event.rowModel;
    }

    public log(err) {
        alert(err._body);
    }
}
