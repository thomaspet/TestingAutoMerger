/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {AuthService} from '../framework/core/authService';
import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {UniNavbar} from './components/layout/navbar/navbar';
import {UniHttp} from '../framework/core/http/http';
import {StaticRegisterService} from './services/staticregisterservice';
import {LoginModal} from './components/init/loginModal';
import {CompanySyncModal} from './components/init/companySyncModal';
import {UniToastList} from '../framework/uniToast/toastList';
import {UniFeedback} from './components/common/feedback/feedback';

@Component({
    selector: 'uni-app',
    templateUrl: 'app/app.html',
    directives: [
        ROUTER_DIRECTIVES, UniNavbar, LoginModal,
        CompanySyncModal, UniToastList, UniFeedback
    ],
    providers: [TabService, UniHttp, StaticRegisterService]
})
export class App {
    private isAuthenticated: boolean = false;

    @ViewChild(LoginModal)
    private loginModal: LoginModal;

    @ViewChild(CompanySyncModal)
    private companySyncModal: CompanySyncModal;

    constructor(private authService: AuthService,
                private http: UniHttp,
                private staticRegisterService: StaticRegisterService) {

        // prohibit dropping of files unless otherwise specified
        document.addEventListener('dragover', function( event ) {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'none';
        }, false);
        document.addEventListener('drop', function( event ) {
            event.preventDefault();
        }, false);

        // Open login modal if authService requests re-authentication during runtime
        authService.requestAuthentication$.subscribe((event) => {
            if (!this.loginModal.isOpen && (location.href.indexOf('login') === -1)) {
                this.loginModal.open(event.onAuthenticated);
            }
        });

        // Check if selected company needs to be initialized
        authService.companyChanged$.subscribe((event) => {
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint('companysettings?action=exists')
                .send()
                .map(response => response.json())
                .subscribe((isActive: boolean) => {
                    // TODO: Switch to !isActive after testing!
                    if (!isActive) {
                        this.companySyncModal.open();
                    }
                });
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
            .map(response => response.json())
            .subscribe(response => localStorage.setItem('companySettings', JSON.stringify(response[0])));
    }

}
