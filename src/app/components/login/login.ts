import { Component } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Router } from 'angular2/router';
import { CompanySelect } from '../common/companySelect/companySelect';
import { AuthService } from '../../../framework/authentication/authService';

declare var jQuery;

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanySelect],
	providers: [AuthService]
})
export class Login {
	loginForm; 
	companySelect;
	
	credentials: { username: string, password: string };
	errorMessage: string;
	activeCompany: any;
	
	constructor(public authService: AuthService, public router: Router) {				
		this.loginForm = jQuery('#loginForm');
		this.companySelect = jQuery('#companySelect').hide();
		this.errorMessage = "";
		this.activeCompany = localStorage.getItem('activeCompany');
		
		// Initialize credentials to a valid login for testing purposes
		this.credentials = {
			username: "jonterje",
			password: "MySuperP@ss!"
		}
	}
	
	authenticate(event) {
		event.preventDefault();
		
		this.authService.authenticate(this.credentials.username, this.credentials.password)
		.subscribe (
			response => this.onAuthSuccess(response.json()),
			error    => this.onAuthError(error.json())
		);
	}
	
	onAuthSuccess(data) {
		var token = data.access_token;
		var decoded = this.authService.decodeToken(token);
		localStorage.setItem('jwt', 'Bearer ' + token);
		localStorage.setItem('jwt_decoded', JSON.stringify(decoded));
		
		// If active company exists in localStorage we can skip the companySelect part
		// TODO: We should verify that the user still has access to the company?
		if (this.activeCompany) {			
			var url = localStorage.getItem('lastNavigationAttempt') || '/';
			localStorage.removeItem('lastNavigationAttempt');
			this.router.navigateByUrl(url);
		}
		
		this.companySelect.fadeIn(200);
	}
	
	onAuthError(reason) {
		console.log(reason.error_description);
	}
}