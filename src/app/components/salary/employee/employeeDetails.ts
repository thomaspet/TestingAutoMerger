import {Component, Inject, provide} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {PersonalDetails} from './personalDetails/personalDetails';
import {Employment} from './employments/employments';
import {Hours} from './hours/hours';
import {Travel} from './travel/travel';
import {SalaryTransactions} from './salaryTransactions/salaryTransactions';

import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';

import {EmployeeDS} from '../../../../framework/data/employee';
import {STYRKCodesDS} from '../../../../framework/data/styrkCodes';

const CHILD_ROUTES = [
    { path: '/', component: PersonalDetails, as: 'PersonalDetails' },
    { path: '/employment', component: Employment, as: 'Employment' },
    { path: '/salarytransactions', component: SalaryTransactions, as: 'SalaryTransactions' },
    { path: '/hours', component: Hours, as: 'Hours' },
    { path: '/travel', component: Travel, as: 'Travel' },
];

@Component({
	selector: 'uni-employee-details',
	templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [provide(EmployeeDS,{useClass: EmployeeDS}), provide(STYRKCodesDS, {useClass: STYRKCodesDS})],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs]
})
@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails {
	employee: any = {};
    childRoutes: RouteDefinition[];
    	
	constructor(private routeParams: RouteParams, private employeeDS:EmployeeDS) {
		this.childRoutes = CHILD_ROUTES;
	}
    
    ngOnInit() {
        var employeeID = this.routeParams.get('id');
        this.employeeDS.get(employeeID)
            .subscribe (response => this.employee = response, error => console.error(error));
    }
    
    onFormSubmit(value) {
        console.log(value);
    }
	
}