import {Component} from '@angular/core';
import {AuthService} from './authService';
import {UniHttp} from '../framework/core/http/http';
import {LoginModal} from './components/init';
import {ErrorService} from './services/services';
import {ToastService, ToastTime, ToastType} from '../framework/uniToast/toastService';
import {UserDto} from '@app/unientities';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {NavbarLinkService} from './components/layout/navbar/navbar-link-service';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {
    UniModalService,
    CustomerLicenseAgreementModal,
    UserLicenseAgreementModal,
    UniConfirmModalV2,
    UniChangelogModal
} from '@uni-framework/uni-modal';

import * as moment from 'moment';

@Component({
    selector: 'uni-app',
    templateUrl: './app.html',
})
export class App {
    public isAuthenticated: boolean = false;
    private loginModalOpen: boolean;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private uniHttp: UniHttp,
        private errorService: ErrorService,
        public navbarService: NavbarLinkService,
        private browserStorage: BrowserStorageService
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
                if (!this.hasAcceptedUserLicense(authDetails.user)) {
                    this.showUserLicenseModal();
                } else if (!this.hasAcceptedCustomerLicense(authDetails.user)) {
                    if (this.canAcceptCustomerLicense(authDetails.user)) {
                        this.showCustomerLicenseModal();
                    } else {
                        this.showCanNotAcceptCustomerLicenseModal(authDetails.user);
                    }
                }

                this.checkForChangelog(authDetails.user);
            }

        } /* don't need error handling */);
    }

    private hasAcceptedCustomerLicense(user: UserDto): boolean {
        return (user && user.License && user.License.CustomerAgreement) ?
            (!!user.License.CustomerAgreement.HasAgreedToLicense || user.License.CustomerAgreement.AgreementId === 0) : true;
    }

    private canAcceptCustomerLicense(user: UserDto): boolean {
        return !!user.License.CustomerAgreement.CanAgreeToLicense;
    }

    private hasAcceptedUserLicense(user: UserDto): boolean {
        return (user && user.License && user.License.UserLicenseAgreement) ?
            (!!user.License.UserLicenseAgreement.HasAgreedToLicense || user.License.UserLicenseAgreement.AgreementId === 0) : true;
    }

    private checkForChangelog(user: UserDto) {
        /*
            This functionality is not implemented yet.
            It's intended for informing about certain news on first login
            after the changes. The content (and hasBeenDisplayed check)
            should come from "the outside", but since the application design
            goes live in ~2 days we need to hard code something here.
        */
        const oldUser = moment(user.CreatedAt).isBefore(moment(new Date('06.01.2018')));
        const hasSeenDesignChanges = this.browserStorage.getItem('informedAboutDesignChanges');

        if (oldUser && !hasSeenDesignChanges) {
            this.modalService.open(UniChangelogModal, {
                closeOnClickOutside: false,
                closeOnEscape: false,
                hideCloseButton: true
            }).onClose.subscribe(() => {
                this.browserStorage.setItem('informedAboutDesignChanges', true);
            });
        }
    }

    private showCustomerLicenseModal() {
        this.modalService
            .open(CustomerLicenseAgreementModal)
            .onClose
            .subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.uniHttp.asPOST()
                        .usingBusinessDomain()
                        .withEndPoint('users?action=accept-CustomerAgreement')
                        .send()
                        .map(res => res.json())
                        .subscribe(
                            success => this.toastService.addToast(
                                'Suksess',
                                ToastType.good,
                                ToastTime.short,
                                'Selskaps-Lisens godkjenning lagret',
                            ),
                            err => this.errorService.handle(err),
                        );
                } else {
                    this.authService.clearAuthAndGotoLogin();
                }
            });
    }

    private showCanNotAcceptCustomerLicenseModal(user: UserDto) {
        const company = user.License.Company;

        this.modalService
            .open(UniConfirmModalV2, {
                message: `Lisensavtale for ${company.Name} må være godtatt før du kan ta Uni Economy i bruk.<br />
                          Vennligst kontakt din systemeier for godkjenning av avtale.<br /><br />
                          <b>Kontaktinfo:</b><br />
                          ${company.ContactPerson}<br />
                          ${company.ContactEmail}`,
                header: `Kunde-Lisens må godkjennes`,
                buttonLabels: {
                    accept: 'OK'
                }
            })
            .onClose
            .subscribe(()=>{});
    }

    private showUserLicenseModal() {
        this.modalService.open(UserLicenseAgreementModal, {
            hideCloseButton: true,
            closeOnClickOutside: false,
            closeOnEscape: false
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.uniHttp.asPOST()
                    .usingBusinessDomain()
                    .withEndPoint('users?action=accept-UserLicenseAgreement')
                    .send()
                    .map(res => res.json())
                    .subscribe(
                        success => this.toastService.addToast(
                            'Suksess',
                            ToastType.good,
                            ToastTime.short,
                            'Brukerlisens godkjenning lagret',
                        ),
                        err => this.errorService.handle(err),
                    );
            } else {
                this.authService.clearAuthAndGotoLogin();
            }
        });
    }
}
