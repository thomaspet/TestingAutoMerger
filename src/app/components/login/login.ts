import {Component} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';
import {AuthService} from '../../../framework/core/authService';
import {StaticRegisterService} from '../../services/staticregisterservice';

declare var jQuery;

@Component({
    selector: 'uni-login',
    templateUrl: 'app/components/login/login.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Login {
    private credentials: { username: string, password: string };
    private working: boolean;

    constructor(private _authService: AuthService, private _router: Router, 
                private _staticRegisterService: StaticRegisterService) {
        // initialize credentials to a valid login for testing purposes
        this.credentials = {
            username: 'einar23',
            password: 'SimplePass1'
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
                }, error => console.log(error)
            );        
    }

    private onAuthSuccess() {
        this.working = false;
        
        // skip process of selecting a company if activeCompany exists in localStorage
        if (this._authService.hasActiveCompany()) {
            this.onCompanySelected();
        }

        // setup and compile company dropdown        
        var dropdownConfig = {
            delay: 50,
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: {
                transport: {
                    read: (options) => {
                        this._authService.getCompanies()
                            .subscribe((response) => {
                                options.success(response);
                            });
                    }
                }
            },
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var company = (event.sender.dataItem(<any>event.item));
                this._authService.setActiveCompany(company);
                this.onCompanySelected();
            },
        };

        var element = jQuery('.company_select > select').first().show();
        element.kendoDropDownList(dropdownConfig);
    }

    private onCompanySelected() {
        this._staticRegisterService.checkForStaticRegisterUpdate();
        var url = localStorage.getItem('lastNavigationAttempt') || '/';
        localStorage.removeItem('lastNavigationAttempt');
        this._router.navigateByUrl(url);
    }
}
