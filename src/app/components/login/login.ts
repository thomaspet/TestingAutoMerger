import { Component } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';
import { Authenticator } from '../../../framework/authentication/authenticator';
import { CompanyDropdown } from '../../../framework/companyDropdown/companyDropdown';

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanyDropdown]
}) 
export class Login {
	errorMessage: string;
	
	constructor(public http: Http) {
		this.errorMessage = "";
	}
	
	onSubmit(event, username: string, password: string) {
		event.preventDefault();
		
		var auth = new Authenticator(this.http);
		if (auth.authenticate("jonterje", "MySuperP@ss!")) {
			// route
		} else {
			this.errorMessage = "Invalid username/password";
		}
	}
}