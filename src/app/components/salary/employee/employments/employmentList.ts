import {Component, OnInit, Injector} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniTable, UniTableColumn, UniTableBuilder} from '../../../../../framework/uniTable';
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
    private employmentListConfig: any;
    
    constructor(private _employmentService: EmploymentService, private injector: Injector, private employeeDataSource: EmployeeDS, private router: Router, private rootRouteParams: RootRouteParamsService) {        
        this.currentEmployeeID = +rootRouteParams.params.get('id');
    }
    
    public ngOnInit() {
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
