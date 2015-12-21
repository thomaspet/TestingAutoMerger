import {Component} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/map';
import 'rxjs/operator/first';

import {WidgetPoster} from '../../common/widgetPoster/widgetPoster';
import {TestForm} from './testForm';

@Component({
	selector: 'uni-employee-details',
	templateUrl: 'app/components/employee/details/employeeDetails.html',
	directives: [WidgetPoster, TestForm]
})
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
		.first()
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