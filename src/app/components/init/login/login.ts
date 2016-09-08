import {Component} from '@angular/core';
import {FormControl, Validators, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniSelect, ISelectConfig} from '../../../../framework/uniform/controls/select/select';

@Component({
    selector: 'uni-login',
    templateUrl: 'app/components/init/login/login.html',
    directives: [REACTIVE_FORM_DIRECTIVES, ROUTER_DIRECTIVES, UniSelect]
})
export class Login {
    private usernameControl: FormControl = new FormControl('', Validators.required);
    private passwordControl: FormControl = new FormControl('', Validators.required);

    private working: boolean;
    private loginSuccess: boolean  = false;
    private errorMessage: string = '';

    private availableCompanies: any[];
    private selectConfig: ISelectConfig;

    constructor(private _authService: AuthService, private _router: Router, private http: UniHttp) {
        this.selectConfig = {
            displayField: 'Name',
            placeholder: 'Velg selskap'
        };
    }

    private login(event: Event) {
        event.preventDefault();
        this.errorMessage = '';
        this.working = true;

        this._authService.authenticate({
            username: this.usernameControl.value,
            password: this.passwordControl.value
        }).subscribe(
            (response) => {
                this.onAuthSuccess();
            },
            (error) => {
                this.working = false;
                this.errorMessage = 'Noe gikk galt. Vennligst sjekk brukernavn og passord, og prøv igjen.';
            }
        );
    }

    private onAuthSuccess() {
        this.working = false;
        this.loginSuccess = true;

        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
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
