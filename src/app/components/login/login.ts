import { Component } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';
import { Router } from 'angular2/router';

import { Authenticator } from '../../../framework/authentication/authenticator';
import { CompanyDropdown } from '../../../framework/companyDropdown/companyDropdown';

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanyDropdown],
	providers: [Authenticator]
}) 
export class Login {
	errorMessage: string;
	
	constructor(public authenticator: Authenticator, public router: Router) {
		this.errorMessage = "";
	}
	
	onSubmit(event, username: string, password: string) {
		event.preventDefault();
		
		if (this.authenticator.authenticate("jonterje", "MySuperP@ss!")) {
			// route
		} else {
			this.errorMessage = "Invalid username/password";
			this.router.navigateByUrl('/');
		}
	}
}