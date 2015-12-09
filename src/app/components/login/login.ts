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
		this.loginForm = jQuery('#loginForm');//.show();
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
				var decodedToken = this.authService.decodeToken(token);
				
				localStorage.setItem('jwt', "Bearer " + token);
				localStorage.setItem('jwt_decoded', JSON.stringify(decodedToken));
				
				this.onAuthSuccess();
			},
			err => {
				console.log(err);
				this.errorMessage = err.error_description;
				this.credentials = { username: "", password: "" };
			}
		);
	}
	
	onAuthSuccess() {
		var lastActiveCompany = localStorage.getItem('activeCompany');
				
		// If lastActiveCompany exists in localstorage we skip the "select company" stage
		if (lastActiveCompany) {
			var url = localStorage.getItem('lastNavigationAttempt');
			if (url && url !== '/login') {
				localStorage.removeItem('lastNavigationAttempt');
				this.router.navigateByUrl(url);
				return;	
			}
			
			this.router.navigateByUrl('/');	
		}
		
		this.companyDropdown.fadeIn(200);
		// this.loginForm.fadeOut(200, () => {
		// 	this.companyDropdown.fadeIn(300);
		// });
	}
}