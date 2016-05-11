import {Component, OnInit, Injector, ViewChild} from '@angular/core';
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
    private lastSavedInfo: string;
    @ViewChild(EmployeeEmployment) private employmentDetails: EmployeeEmployment;
    
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
            }
        },
        (err) => {
            console.log('error getting employee', err);
        });
    }
    
    public saveEmploymentManual() {
        this.saveEmployment();
    }
    
    public saveEmployment() {
        console.log('save');
        console.log('Originalt arbeidsforhold', this.selectedEmployment);
        var changedEmployment: Employment;
        changedEmployment = this.employmentDetails.getCurrentEmployment();
        console.log('Endret arbeidsforhold', changedEmployment);
        
        this.lastSavedInfo = 'Lagrer arbeidsforhold...';
        if (changedEmployment.ID > 0) {
            console.log('object to update', changedEmployment);
            this._employmentService.Put(changedEmployment.ID, changedEmployment)
            .subscribe((response: Employment) => {
                this.selectedEmployment = response;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
            },
            (err) => {
                console.log('Feil ved oppdatering av arbeidsforhold', err);
            });
        } else {
            this._employmentService.Post(changedEmployment)
            .subscribe((response: Employment) => {
                this.selectedEmployment = response;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
            });
        }
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
