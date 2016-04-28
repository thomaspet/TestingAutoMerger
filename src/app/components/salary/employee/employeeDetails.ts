import {Component, provide, OnInit} from 'angular2/core';
import {
    RouteConfig, 
    RouteDefinition, 
    RouteParams, 
    ROUTER_DIRECTIVES, 
    AsyncRoute, 
    Router} 
from 'angular2/router';

import 'rxjs/add/operator/map';

import {PersonalDetails} from './personalDetails/personalDetails';
import {EmployeeEmployment} from './employments/employments';
import {Hours} from './hours/hours';
import {Travel} from './travel/travel';
// import {SalaryTransactions} from './salaryTransactions/salaryTransactions';
import {EmployeeLeave} from './employeeLeave/employeeLeave';

import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {EmployeeCategoryButtons} from './employeeCategoryButtons';

import {EmployeeService} from '../../../services/services';
import {Employee, BusinessRelation} from '../../../unientities';
import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {SalaryTransactionEmployeeList} from '../salarytrans/salarytransList';
import {ComponentProxy} from '../../../../framework/core/componentProxy';

const CHILD_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/personal-details',
        name: 'Detaljer',
        loader: () => ComponentProxy.LoadComponentAsync('PersonalDetails', './app/components/salary/employee/personalDetails/personalDetails')
    }),
    new AsyncRoute({
        path: '/employment',
        name: 'Arbeidsforhold',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeEmployment', './app/components/salary/employee/employments/employments')
    }),
    // new AsyncRoute({
    //     path: '/salarytrans',
    //     name: 'Lønnstranser',
    //     loader: () => ComponentProxy.LoadComponentAsync('SalaryTransactionEmployeeList', './app/components/salary/salarytrans/salarytransList')
    // }),
    // new AsyncRoute({
    //     path: '/hours',
    //     name: 'Hours',
    //     loader: () => ComponentProxy.LoadComponentAsync('Hours', './app/components/salary/employee/hours/hours')
    // }),
    // new AsyncRoute({
    //     path: '/travel',
    //     name: 'Travel',
    //     loader: () => ComponentProxy.LoadComponentAsync('Travel', './app/components/salary/employee/travel/travel')
    // }),
    new AsyncRoute({
        path: '/employeeleave',
        name: 'Fravær',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeLeave', './app/components/salary/employee/employeeLeave/employeeLeave')
    })
];

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
            provide(EmployeeDS, {useClass: EmployeeDS})
            , provide(STYRKCodesDS, {useClass: STYRKCodesDS}),
            EmployeeService
        ],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs, EmployeeCategoryButtons]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails implements OnInit {
    private employee: Employee;
    private url: string;
    private employeeID: number;
    private isNextOrPrevious: boolean;
    private businessRelation: BusinessRelation;
    private childRoutes: RouteDefinition[];

    constructor(private routeParams: RouteParams,
                private _employeeService: EmployeeService, 
                private _router: Router) {
                    
        this.childRoutes = CHILD_ROUTES;
        this.employee = new Employee();
        this.businessRelation = new BusinessRelation();
        this.employee.BusinessRelationInfo = this.businessRelation;
        this.url = '/salary/employees/';
        this.employeeID = +this.routeParams.get('id');
    }

    public ngOnInit() {
        if (this.employeeID) {
            if (!this.isNextOrPrevious) {
                this._employeeService.get(this.employeeID).subscribe((response: any) => {
                this.employee = response;
                }, error => console.log(error));
            }
            this.isNextOrPrevious = false;
        }else {
            this.businessRelation.Name = 'Ny Ansatt';
            this.employee.BusinessRelationInfo = this.businessRelation;
            this.employee.EmployeeNumber = 0;
        }
    }
    
    public nextEmployee() {
        this._employeeService.getNext(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
        });
    }
    
    public previousEmployee() {
        this._employeeService.getPrevious(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
        });
    }

}
