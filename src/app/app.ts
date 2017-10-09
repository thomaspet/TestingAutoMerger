import {Component, ViewChild} from '@angular/core';
import {AuthService} from './authService';
import {UniHttp} from '../framework/core/http/http';
import {LoginModal} from './components/init/loginModal';
import {CompanySyncModal} from './components/init/companySyncModal';
import {ErrorService} from './services/services';
import {UniModalService} from '../framework/uniModal/barrel';
import {ToastService} from '../framework/uniToast/toastService';

@Component({
    selector: 'uni-app',
    templateUrl: './app.html',
})
export class App {
    @ViewChild(CompanySyncModal)
    private companySyncModal: CompanySyncModal;

    private isAuthenticated: boolean = false;
    private loginModalOpen: boolean;

    constructor(
        private authService: AuthService,
        private http: UniHttp,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService
    ) {
        // prohibit dropping of files unless otherwise specified
        document.addEventListener('dragover', function( event ) {
            if (event.toElement && event.toElement.className === 'uni-image-upload') {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
            } else {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'none';
            }
        }, false);

        document.addEventListener('drop', function( event ) {
            event.preventDefault();
        }, false);

        // Open login modal if authService requests re-authentication during runtime
        authService.requestAuthentication$.subscribe((event) => {
            if (!this.loginModalOpen && (location.href.indexOf('login') === -1)) {
                this.loginModalOpen = true;
                this.modalService.open(LoginModal, {
                    closeOnEscape: false,
                    closeOnClickOutside: false
                }).onClose.subscribe(() => {
                    this.loginModalOpen = false;
                });
            }
        });

        authService.authentication$.subscribe((authDetails) => {
            this.isAuthenticated = authDetails.token && authDetails.activeCompany;
            if (this.isAuthenticated) {
                this.toastService.clear();
                this.initialize();
            }
        } /* don't need error handling */);
    }

    private initialize() {
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
            }, err => this.errorService.handle(err));

    }
}
