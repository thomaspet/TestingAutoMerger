import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './authService';
import {UniHttp} from '../framework/core/http/http';
import {LoginModal} from './components/init';
import {ErrorService, UniTranslationService} from './services/services';
import {ToastService, ToastTime, ToastType} from '../framework/uniToast/toastService';
import {UserDto} from '@app/unientities';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {NavbarLinkService} from './components/layout/navbar/navbar-link-service';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {
    UniModalService,
    UserLicenseAgreementModal,
    LicenseAgreementModal
} from '@uni-framework/uni-modal';

// Do not change this import! Since we don't use rx operators correctly
// we depend on having at least one import getting EVERYTHING in rxjs
import {Observable} from 'rxjs/Rx';

import {LicenseManager} from 'ag-grid-enterprise';
import { ChatBoxService } from './components/layout/chat-box/chat-box.service';
// tslint:disable-next-line
LicenseManager.setLicenseKey('Uni_Micro__Uni_Economy_1Devs_1Deployment_4_March_2020__MTU4MzI4MDAwMDAwMA==63c1793fa3d1685a93e712c2d20cc2a6');

const HAS_ACCEPTED_USER_AGREEMENT_KEY = 'has_accepted_user_agreement';

@Component({
    selector: 'uni-app',
    templateUrl: './app.html',
})
export class App {
    public isAuthenticated: boolean = false;
    private loginModalOpen: boolean;
    private licenseAgreementModalOpen: boolean;
    private userlicenseModalOpen: boolean;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private uniHttp: UniHttp,
        private errorService: ErrorService,
        public navbarService: NavbarLinkService,
        private browserStorage: BrowserStorageService,
        private router: Router,
        private translationService: UniTranslationService,
        public chatBoxService: ChatBoxService,
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
            if (!this.loginModalOpen && (location.href.indexOf('init') === -1)) {
                this.loginModalOpen = true;
                this.modalService.open(LoginModal, {
                    closeOnEscape: false,
                    closeOnClickOutside: false,
                    hideCloseButton: true
                }).onClose.subscribe(() => {
                    this.loginModalOpen = false;
                });
            }
        });

        authService.authentication$.subscribe((authDetails) => {
            this.isAuthenticated = !!authDetails.user;

            if (this.isAuthenticated) {
                this.toastService.clear();
                const contractType = authDetails.user.License.ContractType.TypeName;
                if (!this.hasAcceptedCustomerLicense(authDetails.user) && contractType !== 'Demo' && !this.licenseAgreementModalOpen) {
                    this.licenseAgreementModalOpen = true;
                    this.modalService.open(LicenseAgreementModal, {
                        hideCloseButton: true,
                        closeOnClickOutside: false,
                        closeOnEscape: false
                    }).onClose.subscribe(
                        () => this.licenseAgreementModalOpen = false
                    );
                }

                if (!this.userlicenseModalOpen && !this.hasAcceptedUserLicense(authDetails.user)) {
                    this.showUserLicenseModal();
                }
            }
        });

        Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            const keyCode = event.which || event.keyCode;
            const character = String.fromCharCode(keyCode);
            if (event.ctrlKey && event.altKey && character === 'B') {
                this.router.navigateByUrl('/bureau');
            }
        });
    }

    private hasAcceptedCustomerLicense(user: UserDto): boolean {
        return (user && user.License && user.License.CustomerAgreement) ?
            (!!user.License.CustomerAgreement.HasAgreedToLicense || user.License.CustomerAgreement.AgreementId === 0) : true;
    }

    private hasAcceptedUserLicense(user: UserDto): boolean {
        return (user && user.License && user.License.UserLicenseAgreement) ?
            (!!user.License.UserLicenseAgreement.HasAgreedToLicense || user.License.UserLicenseAgreement.AgreementId === 0) : true;
    }

    private showUserLicenseModal() {
        this.userlicenseModalOpen = true;
        this.modalService.open(UserLicenseAgreementModal, {
            hideCloseButton: true,
            closeOnClickOutside: false,
            closeOnEscape: false
        }).onClose.subscribe(response => {
            this.userlicenseModalOpen = true;
            if (response === ConfirmActions.ACCEPT) {
                this.browserStorage.setItem(HAS_ACCEPTED_USER_AGREEMENT_KEY, true);
                this.uniHttp.asPOST()
                    .usingBusinessDomain()
                    .withEndPoint('users?action=accept-UserLicenseAgreement')
                    .send()
                    .map(res => res.body)
                    .subscribe(
                        () => this.toastService.addToast(
                            'Suksess',
                            ToastType.good,
                            ToastTime.short,
                            'Brukerlisens godtatt',
                        ),
                        err => this.errorService.handle(err),
                    );
            } else {
                this.authService.clearAuthAndGotoLogin();
            }
        });
    }


    applyUeTheme() {
        document.body.classList.remove('sr-theme');
        this.translationService.setLocale('NO_UNI');
        const route = this.router.url;
        this.router.navigateByUrl('/reload', {skipLocationChange: true}).then(() => {
            this.router.navigateByUrl(route);
        });
    }

    applySrTheme() {
        document.body.classList.add('sr-theme');
        this.translationService.setLocale('NO_SR');
        const route = this.router.url;
        this.router.navigateByUrl('/reload', {skipLocationChange: true}).then(() => {
            this.router.navigateByUrl(route);
        });
    }
}
