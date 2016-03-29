import {Component, provide, OnInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import { Observable } from 'rxjs/Observable';
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

import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {SalaryTransactionEmployeeList} from '../salarytrans/salarytransList';

const CHILD_ROUTES = [
    {path: '/', component: PersonalDetails, as: 'PersonalDetails'},
    {path: '/employment', component: EmployeeEmployment, as: 'Employment'},
    {path: '/salarytrans', component: SalaryTransactionEmployeeList, as: 'Lønnstranser'},
    {path: '/hours', component: Hours, as: 'Hours'},
    {path: '/travel', component: Travel, as: 'Travel'},
    {path: '/employeeleave', component: EmployeeLeave, as: 'EmployeeLeave'}
];

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
            provide(EmployeeDS, {useClass: EmployeeDS})
            , provide(STYRKCodesDS, {useClass: STYRKCodesDS})
        ],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs, EmployeeCategoryButtons]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails implements OnInit {
    private employee: any; // any = {};
    // empJSON;
    private childRoutes: RouteDefinition[];
    private subEntities: any;

    constructor(private routeParams: RouteParams, private employeeDS: EmployeeDS) {
        this.childRoutes = CHILD_ROUTES;
    }

    public ngOnInit() {
        var employeeID = this.routeParams.get('id');
        Observable.forkJoin(
            this.employeeDS.get(employeeID),
            this.employeeDS.getSubEntities()
        ).subscribe((response: any) => {
            let [emp, loc] = response;
            this.employee = emp;
            this.subEntities = loc;

            // console.log('employee', response);
            
        }, error => console.log(error));
    }

    // onFormSubmit(value) {
    //     console.log(value);
    // }

}