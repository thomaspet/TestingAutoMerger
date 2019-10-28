import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../authService';
import { UniHttp } from '../../../../framework/core/http/http';
import {
    UniSelect,
    ISelectConfig
} from '../../../../framework/ui/uniform/index';
import { Logger } from '../../../../framework/core/logger';
import * as $ from 'jquery';
import { BrowserStorageService } from '@uni-framework/core/browserStorageService';
import { UserManager } from 'oidc-client';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html',
    styleUrls:['./login.sass']
})
export class Login {
    @ViewChild('loginForm')
    private loginForm: ElementRef;
    @ViewChild(UniSelect)
    private select: UniSelect;
    @ViewChild('companySelector')
    private companySelector: ElementRef;

    public working: boolean;
    public errorMessage: string = '';
    public missingCompanies: boolean;

    public availableCompanies: any[];
    public selectConfig: ISelectConfig;

    constructor(
        private _authService: AuthService,
        private _router: Router,
        private http: UniHttp,
        private logger: Logger,
        private browserStorage: BrowserStorageService
    ) {
        this.selectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg selskap'
        };
        // If user Authenticated
        this._authService.isAuthenticated().then(isAuthenticated => {
            if (isAuthenticated) {
                this.selectCompany();
            }
        });

    }

    public login() {
        this._authService.authenticate();
    }

    private selectCompany() {
        this.http
            .asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .subscribe(response => {
                this.working = false;

                $(this.loginForm.nativeElement).fadeOut(300, () => {
                    $(this.companySelector.nativeElement).fadeIn(300);
                });

                if (response.status !== 200) {
                    this.missingCompanies = true;
                    return;
                }

                this.availableCompanies = response.body;

                try {
                    const lastActiveCompanyKey = this.browserStorage.getItem(
                        'lastActiveCompanyKey'
                    );
                    const lastActiveCompany = this.availableCompanies.find(
                        company => {
                            return company.Key === lastActiveCompanyKey;
                        }
                    );

                    if (lastActiveCompany) {
                        this.onCompanySelected(lastActiveCompany);
                    } else if (this.availableCompanies.length === 1) {
                        this.onCompanySelected(this.availableCompanies[0]);
                    } else if (this.availableCompanies.length > 1) {
                        setTimeout(() => {
                            this.select.focus();
                        });
                    } else {
                        this.missingCompanies = true;
                    }
                } catch (exception) {
                    this.missingCompanies = true;
                }
            });
    }

    public resetLogin() {
        this.missingCompanies = false;
        this._authService.clearAuthAndGotoLogin();
    }

    public onCompanySelected(company) {
        if (company) {
            const url =
                this.browserStorage.getItem('lastNavigationAttempt') || '/';
            this.browserStorage.removeItem('lastNavigationAttempt');
            this._authService.setActiveCompany(company, url);
        }
    }
}
