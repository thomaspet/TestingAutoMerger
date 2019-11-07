import {Component, ViewChild} from '@angular/core';
import {AuthService} from '@app/authService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ISelectConfig, UniSelect} from '@uni-framework/ui/uniform';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Router} from '@angular/router';
import {Company} from '@uni-entities';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html',
    styleUrls: ['./login.sass']
})
export class Login {
    @ViewChild(UniSelect) select: UniSelect;

    isAuthenticated: boolean = true;
    availableCompanies: any[];

    selectConfig: ISelectConfig = {
        displayProperty: 'Name',
        placeholder: 'Velg selskap'
    };

    constructor(
        private router: Router,
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
                        this.router.navigateByUrl('/init/register-company');
                    }

                    if (this.availableCompanies.length === 1) {
                        this.onCompanySelected(this.availableCompanies[0]);
                    }

                    try {
                        const lastActiveKey = JSON.parse(localStorage.getItem('lastActiveCompanyKey'));
                        if (lastActiveKey) {
                            const lastActive: Company = this.availableCompanies.find(c => c.Key === lastActiveKey);
                            if (lastActive && !lastActive.Deleted) {
                                this.onCompanySelected(lastActive);
                            }
                        }
                    } catch (e) {}

                    setTimeout(() => {
                        if (this.select) {
                            this.select.focus();
                        }
                    }, 100);
                },
                (err) =>  {
                    console.error(err);
                    // TODO: add something saying the get failed and they might need to log in again
                }
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
