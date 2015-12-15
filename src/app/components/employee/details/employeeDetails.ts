import {Component} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/map';

import {WidgetPoster} from '../../common/widgetPoster/widgetPoster';
import {UniForm, FIELD_TYPES} from '../../../../framework/forms/uniForm'

@Component({
	selector: 'uni-employee-details',
	templateUrl: 'app/components/employee/details/employeeDetails.html',
	directives: [WidgetPoster, UniForm]
})
export class EmployeeDetails {
	employeeID;
	employee: any; // todo: type this as interface?
	dataIsReady: boolean = false; // better workaround for this? (view is drawn before object is back from http call)
	
	// uniform stuff
	model;
	form;
	
	constructor(private routeParams: RouteParams, private http: Http) {
		this.employeeID = routeParams.get('id');
		
		// GET employee. todo: this should happen somewhere else!
		var headers = new Headers();
		headers.append('Client', 'client1');
		
		this.http.get(
			'http://devapi.unieconomy.no:80/api/biz/employees/' + this.employeeID,
			{headers: headers}	
		)
		.map((result: any) => result.json())
		.subscribe (
			response => {
				this.employee = response;
				this.setupForm();
				this.dataIsReady = true;
			},
			error => {
				console.log(error);
			}
		);	
		
	}
	
	setupForm() {
		this.model = {
			ssn: 'anders@urrang.no',//this.employee.SocialSecurityNumber
		}
		
		var self = this;	
		this.form = [
			{
				fieldType: FIELD_TYPES.FIELD,
				model: self.model,
				label: 'Social security number',
				type: 'email',
				field: 'ssn'
			}	
		];
	}
	
	onSubmit(value) {
        console.log("Form:", value);
        console.log("Model:", this.model);
    }
	
}