import {Component} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';
import {AuthService} from '../../../framework/core/authService';
import {StaticRegisterService} from '../../services/staticregisterservice';

declare var jQuery;

@Component({
    selector: 'uni-login',
    templateUrl: 'app/components/authentication/login.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Login {
    private credentials: { username: string, password: string };
    private working: boolean;
    private loginSuccess: boolean  = false;
    private errorMessage: string = '';

    constructor(private _authService: AuthService, private _router: Router, 
                private _staticRegisterService: StaticRegisterService) {
        // initialize credentials to a valid login for testing purposes
        this.credentials = {
            username: '',
            password: ''
        };
    }

    private login(event: Event) {
        event.preventDefault();
        this.working = true;
        
        this._authService.authenticate(this.credentials)
            .subscribe(
                (response) => {
                    this._authService.setToken(response.access_token);
                    this.onAuthSuccess();
                },
                (error) => {
                    this.working = false;
                    this.errorMessage = 'Invalid username or password'; // TODO: This should come from backend (statusText)?
                }
            );        
    }

    private onAuthSuccess() {
        this.working = false;
        this.loginSuccess = true;
        
        // skip process of selecting a company if activeCompany exists in localStorage
        if (this._authService.hasActiveCompany()) {
            this.onCompanySelected();
        }
        
        var companies;
        this._authService.getCompanies()
        .subscribe((response) => {
            console.log(response);
            this.working = false;
            if (response.status !== 200) {
                this.loginSuccess = false;
                this.errorMessage = "Du har ingen selskaper. Midlertidig fix: gå til signup og lag ett.";
                return;
            }
            
            this.showCompanySelect(response.json());
        });
    }
    
    private showCompanySelect(companies) {
        // setup and compile company dropdown        
        var dropdownConfig = {
            delay: 50,
            dataTextField: 'Name',
            dataValueField: 'ID',
            optionLabel: {
                Name: 'Select a company',
                ID: -1
            },
            dataSource: {
                transport: {
                    read: (options) => {
                        options.success(companies);
                    }
                }
            },
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var company = (event.sender.dataItem(<any>event.item));
                if (company.ID >= 0) {
                    this._authService.setActiveCompany(company);
                    this.onCompanySelected();
                }
            },
        };

        var element = jQuery('.company_select > select').first().show();
        element.kendoDropDownList(dropdownConfig);
    }
    
    private createCompany() {
        
    }
    

    private onCompanySelected() {
        this._staticRegisterService.checkForStaticRegisterUpdate();
        var url = localStorage.getItem('lastNavigationAttempt') || '/';
        localStorage.removeItem('lastNavigationAttempt');
        this._router.navigateByUrl(url);
    }
}
