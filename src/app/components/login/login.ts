import { Component, NgModel } from 'angular2/angular2';
import {CompanyDropdown} from '../../../framework/companyDropdown/companyDropdown';

@Component({
	selector: 'login',
	templateUrl: 'app/components/login/login.html',
	directives: [CompanyDropdown]
}) 
export class Login {
		
	constructor() {	}
	
	authenticate(event, username, password) {
		event.preventDefault();
		
		window.alert('Authenticating: ' + username + ' / ' + password);
	}
}