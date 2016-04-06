import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';
import {AuthService} from '../../../framework/core/authService';
import {AppConfig} from '../../AppConfig';
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
                private _http: Http, private _staticRegisterService: StaticRegisterService) {
        // initialize credentials to a valid login for testing purposes
        this.credentials = {
            username: 'einar23',
            password: 'SimplePass1'
        };
    }

    private login(event: Event) {
        event.preventDefault();
        this.working = true;
        
        let headers = new Headers({'Content-type': 'application/json'});
        this._http.post(
           AppConfig.LOGIN_URL, JSON.stringify(this.credentials), {headers: headers}
        ).map(response => JSON.parse(response.json()))
        .subscribe(
            (response) => {
                this._authService.setToken(response.access_token);
                this._staticRegisterService.checkForStaticRegisterUpdate();
                this.onAuthSuccess();
            }, error => console.log(error)
        );
        
    }

    private onAuthSuccess() {
        this.working = false;
        
        console.log(this._authService.hasActiveCompany());
        // skip process of selecting a company if activeCompany exists in localStorage
        if (this._authService.hasActiveCompany()) {
            this.onCompanySelected();
        }

        // setup and compile company dropdown        
        var dropdownConfig = {
            delay: 50,
            dataTextField: 'name',
            dataValueField: 'id',
            dataSource: [
                {id: 1, name: 'Unimicro AS'},
                {id: 2, name: 'Google'},
                {id: 3, name: 'Apple'},
                {id: 4, name: 'Microsoft'},
            ],
            optionLabel: {id: -1, name: 'Select a company'},
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var company = (event.sender.dataItem(<any>event.item));
                if (company.id >= 0) {
                    this._authService.setActiveCompany(company);
                    this.onCompanySelected();
                }
            },
        };

        var element = jQuery('.company_select > select').first().show();
        element.kendoDropDownList(dropdownConfig);
    }

    private onCompanySelected() {
        var url = localStorage.getItem('lastNavigationAttempt') || '/';
        localStorage.removeItem('lastNavigationAttempt');
        this._router.navigateByUrl(url);
    }
}
