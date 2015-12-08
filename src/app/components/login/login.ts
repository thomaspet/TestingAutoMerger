// jwt.io
// Bearer <asdf>
// x-www-form-urlencoded
// username: jonterje
// password: MySuperP@ss!
// grant_type: password

import { Component } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';
import { Router } from 'angular2/router';
import { CompanyDropdown } from '../common/companyDropdown/companyDropdown';
import { AuthService } from '../../../framework/authentication/authService';

declare var jQuery;

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanyDropdown],
	providers: [AuthService]
})
export class Login {
	loginForm; companyDropdown;
	
	credentials: { username: string, password: string };
	errorMessage: string;
	
	constructor(public authService: AuthService, public router: Router) {		
		this.loginForm = jQuery('#loginForm');
		this.companyDropdown = jQuery('#companyDropdown').hide();
		this.errorMessage = "";
		
		// Initialize credentials to a valid login for testing purposes
		this.credentials = {
			username: "jonterje",
			password: "MySuperP@ss!"
		}
	}
	
	onSubmit(event) {
		event.preventDefault();
		
		this.authService.authenticate(this.credentials.username, this.credentials.password)
		.subscribe (
			response => {
				var token = response.access_token;
				var decoded = this.authService.decodeToken(token);
				
				localStorage.setItem('jwt', "Bearer " + token);
				localStorage.setItem('jwt_decoded', JSON.stringify(decoded));
				
				this.loggedIn();
			},
			err => {
				console.log(err);
				this.errorMessage = err.error_description;
				this.credentials = { username: "", password: "" };
			}
		);
	}
	
	loggedIn() {
		var lastActiveCompany; // = localStorage.getItem('activeCompany');
		
		// todo: check if user still has access to this company
		if (lastActiveCompany) {
			this.router.navigateByUrl('/');	
			return;
		}
		
		// Show company selector
		this.loginForm.fadeOut(300, () => {
			this.companyDropdown.fadeIn(500);
		});
	}
}