import {Component} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniSelect, ISelectConfig} from '../../../../framework/controls/select/select';

@Component({
    selector: 'uni-login',
    templateUrl: 'app/components/init/login/login.html',
    directives: [ROUTER_DIRECTIVES, UniSelect]
})
export class Login {
    private credentials: { username: string, password: string };
    private working: boolean;
    private loginSuccess: boolean  = false;
    private errorMessage: string = '';
    
    private availableCompanies: any[];
    private selectConfig: ISelectConfig;

    constructor(private _authService: AuthService, private _router: Router, private http: UniHttp) {
        this.credentials = {
            username: '',
            password: ''
        };

        this.selectConfig = {
            displayField: 'Name',
            placeholder: 'Velg selskap'
        };
    }

    private login(event: Event) {
        event.preventDefault();
        this.errorMessage = '';
        this.working = true;
        
        this._authService.authenticate(this.credentials)
            .subscribe(
                (response) => {
                    this.onAuthSuccess();
                },
                (error) => {
                    this.working = false;
                    this.errorMessage = 'Noe gikk galt. Vennligst sjekk brukernavn og passord, og prøv igjen.'; // TODO: Should this come from backend (statusText)?
                }
            );        
    }

    private onAuthSuccess() {
        this.working = false;
        this.loginSuccess = true;
        
        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send({}, true)
            .subscribe(response => {
                this.working = false;
                
                if (response.status !== 200) {
                    this.loginSuccess = false;
                    this.errorMessage = 'Du har ingen selskaper. Midlertidig fix: gå til signup og lag ett.';
                    return;
                }
                
                this.availableCompanies = response.json();
                if (this.availableCompanies.length === 1) {
                    this.onCompanySelected(this.availableCompanies[0]);
                }
            });
    }

    private onCompanySelected(company) {
        if (company) {
            this._authService.setActiveCompany(company);
        }
        this.navigate();
    }

    private navigate() {
        const url = localStorage.getItem('lastNavigationAttempt') || '/';
        localStorage.removeItem('lastNavigationAttempt');
        this._router.navigate([url]);
    }
}
