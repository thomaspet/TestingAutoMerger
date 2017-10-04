import {Component, ViewChild, ElementRef} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniSelect, ISelectConfig} from '../../../../framework/ui/uniform/index';
import {Logger} from '../../../../framework/core/logger';
import * as $ from 'jquery';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html'
})
export class Login {
    @ViewChild(UniSelect)
    private select: UniSelect;

    @ViewChild('loginForm')
    private loginForm: ElementRef;

    @ViewChild('companySelector')
    private companySelector: ElementRef;

    private usernameControl: FormControl = new FormControl('', Validators.required);
    private passwordControl: FormControl = new FormControl('', Validators.required);

    private working: boolean;
    private loginSuccess: boolean  = false;
    private errorMessage: string = '';
    private infoMessage: string = '';

    private availableCompanies: any[];
    private selectConfig: ISelectConfig;

    constructor(
        private _authService: AuthService,
        private _router: Router,
        private http: UniHttp,
        private logger: Logger
    ) {
        this.selectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg selskap',
        };
    }

    public login(event: Event) {
        event.preventDefault();
        this.errorMessage = '';
        this.working = true;
        this.usernameControl.disable();
        this.passwordControl.disable();

        this._authService.authenticate({
            username: this.usernameControl.value,
            password: this.passwordControl.value
        }).subscribe(
            (response) => {
                this.onAuthSuccess();
            },
            (error) => {
                this.working = false;
                this.usernameControl.enable();
                this.passwordControl.enable();

                this.errorMessage = 'Noe gikk galt. Vennligst sjekk brukernavn og passord, og prøv igjen.';
                this.logger.exception(error);
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

                $(this.loginForm.nativeElement).fadeOut(300, () => {
                    $(this.companySelector.nativeElement).fadeIn(300);
                });

                if (response.status !== 200) {
                    this.loginSuccess = false;
                    this.infoMessage =
                     'Du har ikke tilgang til noen selskaper. Kontakt din administrator.';
                    return;
                }

                this.availableCompanies = response.json();

                try {
                    const lastActiveCompanyKey = localStorage.getItem('lastActiveCompanyKey');
                    const lastActiveCompany = this.availableCompanies.find((company) => {
                        return company.Key === lastActiveCompanyKey;
                    });

                    if (lastActiveCompany) {
                        this.onCompanySelected(lastActiveCompany);
                    } else if (this.availableCompanies.length === 1) {
                        this.onCompanySelected(this.availableCompanies[0]);
                    } else if (this.availableCompanies.length > 1) {
                        setTimeout(() => {
                            this.select.focus();
                        });
                    } else {
                        this.infoMessage =
                        'Du har ikke tilgang til noen selskaper. Kontakt din administrator.';
                    }
                } catch (exception) {
                    this.infoMessage =
                    'Du har ikke tilgang til noen selskaper. Kontakt din administrator.';
                }
            });
    }

    private onCompanySelected(company) {
        if (company) {
            const url = localStorage.getItem('lastNavigationAttempt') || '/';
            localStorage.removeItem('lastNavigationAttempt');
            // this._router.navigateByUrl(url);
            this._authService.setActiveCompany(company, url);
        }
    }
}
