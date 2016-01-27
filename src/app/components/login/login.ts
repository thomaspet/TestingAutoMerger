import { Component } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Router, ROUTER_DIRECTIVES } from 'angular2/router';
import { AuthService } from '../../../framework/authentication/authService';

declare var jQuery;

@Component({
	selector: 'uni-login',
	templateUrl: 'app/components/login/login.html',
	providers: [AuthService],
    directives: [ROUTER_DIRECTIVES]
})
export class Login { 
	credentials: { username: string, password: string };
    authenticated: boolean;
    
	constructor(public authService: AuthService, public router: Router) {				
		// Initialize credentials to a valid login for testing purposes
		this.credentials = {
			username: "jonterje",
			password: "MySuperP@ss!"
		}
        
        this.authenticated = false;
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
        
        this.authenticated = true;
        
		// If active company exists in localStorage we can skip the companySelect part
		// TODO: We should verify that the user still has access to the company?
		if (localStorage.getItem('activeCompany'))			
			this.onCompanySelected();
		else
            this.showCompanySelect();
	}
	
	onAuthError(reason) {
		console.log(reason.error_description);
	}
    
    showCompanySelect() {
        var element = jQuery('.company_select > select').first().show();
        
        var dropdownConfig = {
            delay: 50,
            dataTextField: 'name',
            dataValueField: 'id',
            dataSource:  [
                { id: 1, name: 'Unimicro AS' },
                { id: 2, name: 'Google' },
                { id: 3, name: 'Apple' },
                { id: 4, name: 'Microsoft' },
            ],
            optionLabel: {id: -1, name: 'Select a company'},
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var company = (event.sender.dataItem(<any>event.item));
                if (company.id >= 0) {
                    localStorage.setItem('activeCompany', JSON.stringify(company));
                    this.onCompanySelected();
                }
            },
        }
        
        element.kendoDropDownList(dropdownConfig);
        // jQuery('.k-input').first().html('Select a company');
    }
    
    onCompanySelected() {
        var url = localStorage.getItem('lastNavigationAttempt') || '/';
		localStorage.removeItem('lastNavigationAttempt');
		this.router.navigateByUrl(url);
    }
}