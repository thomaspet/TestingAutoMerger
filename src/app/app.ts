/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {AuthService} from '../framework/core/authService';
import {UniHttp} from '../framework/core/http/http';
import {StaticRegisterService} from './services/staticregisterservice';
import {LoginModal} from './components/init/loginModal';
import {CompanySyncModal} from './components/init/companySyncModal';

@Component({
    selector: 'uni-app',
    templateUrl: 'app/app.html'
})
export class App {
    private isAuthenticated: boolean = false;

    @ViewChild(LoginModal) private loginModal: LoginModal;
    @ViewChild(CompanySyncModal) private companySyncModal: CompanySyncModal;

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
                this.loginModal.open();
            }
        });

        authService.authentication$.subscribe((authDetails) => {
            this.isAuthenticated = authDetails.token && authDetails.activeCompany;
            if (this.isAuthenticated) {
                this.initialize();
            }
        });
    }

    private initialize() {
        // Get companysettings
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('companysettings')
            .send()
            .map(response => response.json())
            .subscribe(response => localStorage.setItem('companySettings', JSON.stringify(response[0])));

        // Check if company needs to be initialized
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('companysettings?action=exists')
            .send()
            .map(response => response.json())
            .subscribe((isActive: boolean) => {
                if (!isActive) {
                    this.companySyncModal.open();
                }
            });

        // KE: For now, don't load static registers - these are slow because of to much data in local storage
        // this.staticRegisterService.checkForStaticRegisterUpdate();
    }
}
