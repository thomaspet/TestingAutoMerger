import { Component } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Router, ROUTER_DIRECTIVES } from 'angular2/router';
import { AuthService } from '../../../framework/authentication/authService';

declare var jQuery;

@Component({
	selector: 'uni-login',
	templateUrl: 'app/components/login/login.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Login { 
	credentials: { username: string, password: string };
    
	constructor(public authService: AuthService, public router: Router) {				
		// Initialize credentials to a valid login for testing purposes
		this.credentials = {
			username: "jonterje",
			password: "MySuperP@ss!"
		}
        
        // Subscribe to updates from authService
        authService.authenticated$.subscribe((authenticated: boolean) => {
            if (authenticated) {
                this.onAuthSuccess();
            } else {
                // Show error message in view?
                if (authService.errorMessage) console.log(authService.errorMessage);
            }
        });
        
	}
	
	login(event) {
		event.preventDefault();
		this.authService.login(this.credentials.username, this.credentials.password);
	}
    
    onAuthSuccess() {
        // Skip process of selecting a company if activeCompany exists in localStorage
        if (localStorage.getItem('activeCompany')) {
            this.onCompanySelected();
        }
        
        // Setup and compile company dropdown        
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
        
        var element = jQuery('.company_select > select').first().show();
        element.kendoDropDownList(dropdownConfig);
        // jQuery('.k-input').first().html('Select a company');
    }
    
    onCompanySelected() {
        var url = localStorage.getItem('lastNavigationAttempt') || '/';
		localStorage.removeItem('lastNavigationAttempt');
		this.router.navigateByUrl(url);
    }
}