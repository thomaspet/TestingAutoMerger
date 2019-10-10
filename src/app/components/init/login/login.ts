import {Component, ViewChild} from '@angular/core';
import {AuthService} from '@app/authService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ISelectConfig, UniSelect} from '@uni-framework/ui/uniform';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html',
    styleUrls: ['./login.sass']
})
export class Login {
    @ViewChild(UniSelect) select: UniSelect;

    isAuthenticated: boolean;
    missingCompanies: boolean;
    availableCompanies: any[];

    selectConfig: ISelectConfig = {
        displayProperty: 'Name',
        placeholder: 'Velg selskap'
    };

    constructor(
        public authService: AuthService,
        private http: UniHttp,
        private browserStorage: BrowserStorageService
    ) {
        this.authService.isAuthenticated().then(isAuthenticated => {
            this.isAuthenticated = isAuthenticated;

            if (isAuthenticated) {
                this.loadCompanies();
            }
        });
    }

    private loadCompanies() {
        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .subscribe(
                res => {
                    this.availableCompanies = res.body;
                    if (!this.availableCompanies || !this.availableCompanies.length) {
                        this.missingCompanies = true;
                    }

                    setTimeout(() => {
                        if (this.select) {
                            this.select.focus();
                        }
                    }, 100);
                },
                () => this.missingCompanies = true
            );
    }

    onCompanySelected(company) {
        if (company) {
            const url = this.browserStorage.getItem('lastNavigationAttempt') || '/';
            this.browserStorage.removeItem('lastNavigationAttempt');
            this.authService.setActiveCompany(company, url);
        }
    }
}
