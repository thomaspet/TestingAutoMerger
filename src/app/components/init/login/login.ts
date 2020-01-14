import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../authService';
import { UniHttp } from '../../../../framework/core/http/http';
import {
    UniSelect,
    ISelectConfig
} from '../../../../framework/ui/uniform/index';
import { BrowserStorageService } from '@uni-framework/core/browserStorageService';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html',
    styleUrls: ['./login.sass']
})
export class Login {
    @ViewChild(UniSelect) select: UniSelect;

    isAuthenticated: boolean;
    public errorMessage: string = '';
    public missingCompanies: boolean;

    public availableCompanies: any[];
    public selectConfig: ISelectConfig;

    constructor(
        private _authService: AuthService,
        private http: UniHttp,
        private browserStorage: BrowserStorageService
    ) {
        this.selectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg selskap'
        };

        this._authService.isAuthenticated().then(isAuthenticated => {
            this.isAuthenticated = isAuthenticated;
            if (isAuthenticated) {
                this.getCompanies();
            }
        });

    }

    public login() {
        this._authService.authenticate();
    }

    private getCompanies() {
        this.http
            .asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .subscribe(response => {
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
        this._authService.idsLogout();
        this.isAuthenticated = false;
    }

    public onCompanySelected(company) {
        if (company) {
            const url = this.browserStorage.getItem('lastNavigationAttempt') || '/';
            this.browserStorage.removeItem('lastNavigationAttempt');
            this._authService.setActiveCompany(company, url);
        }
    }
}
