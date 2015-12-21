import {Component} from 'angular2/core';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {WidgetPoster} from '../../common/widgetPoster/widgetPoster';
import {PersonalDetails} from './childComponents/personalDetails';
import {Employment} from './childComponents/employment';
import {Hours} from './childComponents/hours';
import {Travel} from './childComponents/travel';
import {SalaryTransactions} from './childComponents/salaryTransactions';


@Component({
	selector: 'uni-employee-details',
	templateUrl: 'app/components/employee/details/employeeDetails.html',
	directives: [ROUTER_DIRECTIVES, WidgetPoster]
})
@RouteConfig([
    { path: '/', component: PersonalDetails, as: 'PersonalDetails' },
    { path: '/employment', component: Employment, as: 'Employment' },
    { path: '/salarytransactions', component: SalaryTransactions, as: 'SalaryTransactions' },
    { path: '/hours', component: Hours, as: 'Hours' },
    { path: '/travel', component: Travel, as: 'Travel' },
])
export class EmployeeDetails {
	employeeID;
	employee: any; // todo: type this as interface?
	dataIsReady: boolean = false; // better workaround for this? (view is drawn before object is back from http call)
	
	onFormSubmit: Function;
	
	constructor(private routeParams: RouteParams, private http: Http) {
		this.employeeID = routeParams.get('id');
		this.getEmployee('http://devapi.unieconomy.no:80/api/biz/employees/' + this.employeeID);
		
		this.onFormSubmit = (value) => { console.log(value); };
	}
	
	// GET employee. todo: this should happen somewhere else!
	getEmployee(url: string): void {
		var headers = new Headers();
		headers.append('Client', 'client1');
		
		this.http.get(url, { headers: headers })
		.map((result: any) => result.json())
		.subscribe (
			response => {
				this.employee = response;
				this.dataIsReady = true;
			},
			error => {
				console.log(error);
			}
		);
	}
	
}