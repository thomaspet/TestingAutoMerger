/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {Router, RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from '@angular/router-deprecated';
import {ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';
import {AuthService} from '../framework/core/authService';
import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {UniNavbar} from './components/layout/navbar/navbar';
import {UniHttp} from '../framework/core/http/http';
import {StaticRegisterService} from './services/staticregisterservice';
import {LoginModal} from './components/authentication/loginModal';

import {CompanySettingsService} from './services/common/CompanySettingsService';

@Component({
    selector: 'uni-app',
    templateUrl: './app/app.html',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet, UniNavbar, LoginModal],
    providers: [AuthService, TabService, UniHttp, StaticRegisterService, CompanySettingsService]
})
@RouteConfig(ROUTES)
export class App {
    private isAuthenticated: boolean = false;
    
    @ViewChild(LoginModal)
    private loginModal: LoginModal;
    
    public routes: AsyncRoute[] = ROUTES;
    
    constructor(private authService: AuthService, router: Router, private http: UniHttp,
                private staticRegisterService: StaticRegisterService,
                private companySettingsService: CompanySettingsService) {
        
        // Open login modal if authService requests re-authentication during runtime
        authService.requestAuthentication$.subscribe((event) => {
            if (!this.loginModal.isOpen) {
                this.loginModal.open(event.onAuthenticated);
            }
        });
        
        // Subscribe to event fired when user has authenticated
        // Anything you want to GET on startup should be put here
        // preferably through a service 
        authService.authenticationStatus$.subscribe((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
            
            if (isAuthenticated) {
                this.getCompanySettings();
                this.staticRegisterService.checkForStaticRegisterUpdate();
            }
        });
    }
    
    private getCompanySettings() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('companysettings')
            .send()
            .subscribe(response => localStorage.setItem('companySettings', JSON.stringify(response[0])));
    }
    
}
