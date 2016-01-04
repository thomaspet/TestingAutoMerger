import {Component, Inject} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {WidgetPoster} from '../../common/widgetPoster/widgetPoster';
import {PersonalDetails} from './childComponents/personalDetails';
import {Employment} from './childComponents/employment';
import {Hours} from './childComponents/hours';
import {Travel} from './childComponents/travel';
import {SalaryTransactions} from './childComponents/salaryTransactions';

import {ApplicationNav} from '../../common/applicationNav/applicationNav';

import {EmployeeDS} from '../../../../framework/data/employee';

const CHILD_ROUTES = [
    { path: '/', component: PersonalDetails, as: 'PersonalDetails' },
    { path: '/employment', component: Employment, as: 'Employment' },
    { path: '/salarytransactions', component: SalaryTransactions, as: 'SalaryTransactions' },
    { path: '/hours', component: Hours, as: 'Hours' },
    { path: '/travel', component: Travel, as: 'Travel' },
];

@Component({
	selector: 'uni-employee-details',
	templateUrl: 'app/components/employee/details/employeeDetails.html',
    providers: [EmployeeDS],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, ApplicationNav]
})
@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails {
	employeeID;
	employee: any; // todo: type this as interface?
	dataIsReady: boolean = false; // better workaround for this? (view is drawn before object is back from http call)
	
	onFormSubmit: Function;
    childRoutes: RouteDefinition[];
    	
	constructor(private routeParams: RouteParams, @Inject(EmployeeDS) private employeeDS:EmployeeDS) {
		this.employeeID = routeParams.get('id');
        employeeDS.get(this.employeeID)
        .subscribe (
			response => {
				this.employee = response;
                this.dataIsReady = true;
			},
			error => {
				console.log(error);
			}
		);
		this.onFormSubmit = (value) => { console.log(value); };
        
        this.childRoutes = CHILD_ROUTES;
	}
	
}