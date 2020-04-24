import {Component, ViewChild, HostBinding} from '@angular/core';
import {AuthService} from '@app/authService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ISelectConfig, UniSelect} from '@uni-framework/ui/uniform';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Router} from '@angular/router';
import {Company} from '@uni-entities';
import {environment} from 'src/environments/environment';
import {Subscription} from 'rxjs';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-login',
    templateUrl: './login.html',
    styleUrls: ['./login.sass']
})
export class Login {
    @ViewChild(UniSelect) select: UniSelect;
    @HostBinding('class.sr-login') srLogin = environment.isSrEnvironment;

    isAuthenticated: boolean;
    availableCompanies: any[];

    background = theme.init.login_background || theme.init.background;
    backgroundHeight = theme.init.login_background_height;
    illustration = environment.isSrEnvironment ? undefined : theme.init.illustration;

    selectConfig: ISelectConfig = {
        displayProperty: 'Name',
        placeholder: 'Velg selskap',
        hideDeleteButton: true
    };

    tokenSubscription: Subscription;

    constructor(
        private router: Router,
        public authService: AuthService,
        private http: UniHttp,
        private browserStorage: BrowserStorageService
    ) {
        this.tokenSubscription = this.authService.token$.subscribe(token => {
            this.isAuthenticated = !!token;
            if (this.isAuthenticated) {
                this.loadCompanies();
            }
        });
    }

    ngOnDestroy() {
        if (this.tokenSubscription) {
            this.tokenSubscription.unsubscribe();
        }
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
                        return;
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
                err =>  {
                    console.error(err);
                    this.isAuthenticated = false;
                    this.authService.idsLogout();
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
