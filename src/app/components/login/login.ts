import { Component } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';
import { Router } from 'angular2/router';
import { AuthService } from '../../../framework/authentication/authService';
import { CompanyDropdown } from '../../../framework/companyDropdown/companyDropdown';

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanyDropdown],
	providers: [AuthService]
}) 
export class Login {
	credentials: { username: string, password: string };
	errorMessage: string;
	
	constructor(public authService: AuthService, public router: Router) {
		this.credentials = {
			username: "jonterje",
			password: "MySuperP@ss!"
		}
		this.errorMessage = "";
	}
	
	onSubmit(event) {
		event.preventDefault();
		
		this.authService.authenticate(this.credentials.username, this.credentials.password)
		.subscribe (
			result => {
				localStorage.setItem('jwt', "Bearer " + result.access_token);
				this.router.navigateByUrl('/');	
			},
			err => {
				console.log(err);
				this.errorMessage = err.error_description;
				this.credentials = { username: "", password: "" };
			}
		);
	}
}