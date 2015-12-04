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
	credentials: { username: string, password: string };
	errorMessage: string;
	
	constructor(public authenticator: Authenticator, public router: Router) {
		this.credentials = {
			username: "",
			password: ""
		}
		this.errorMessage = "";
	}
	
	onSubmit(event) {
		event.preventDefault();
		
		this.authenticator.authenticate(this.credentials.username, this.credentials.password)
		.subscribe (
			result => {
				localStorage.setItem('jwt', result.access_token);
				this.router.navigateByUrl('/');	
			},
			err => {
				console.log(err);
				this.errorMessage = err.error_description;
				this.credentials = { username: "", password: "" };
			}
		);
	}
	
	test() {
		this.credentials = {
			username: 'jonterje',
			password: 'MySuperP@ss!'
		}
	}
}