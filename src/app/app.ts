import {Component} from '@angular/core';
import {AuthService} from './authService';
import {UniHttp} from '../framework/core/http/http';
import {LoginModal} from './components/init';
import {ErrorService} from './services/services';
import {UniModalService} from '../framework/uni-modal';
import {ToastService, ToastTime, ToastType} from '../framework/uniToast/toastService';
import {LicenseAgreementModal} from '@uni-framework/uni-modal/modals/licenseAgreementModal';
import {UniConfirmModalV2} from '@uni-framework/uni-modal/modals/confirmModal';
import {UserDto} from '@app/unientities';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-app',
    templateUrl: './app.html',
})
export class App {
    private isAuthenticated: boolean = false;
    private loginModalOpen: boolean;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private uniHttp: UniHttp,
        private errorService: ErrorService,
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
                if (!this.hasAcceptedLicense(authDetails.user)) {
                    if (this.canAcceptLicense(authDetails.user)) {
                        this.showLicenseModal();
                    } else {
                        this.showCanNotAcceptLicenseModal(authDetails.user);
                    }
                }
            }
        } /* don't need error handling */);
    }

    private hasAcceptedLicense(user: UserDto): boolean {
        return (user && user.License && user.License.Agreement) ?
            (!!user.License.Agreement.HasAgreededToLicense || user.License.Agreement.AgreementId === 0) : true;
    }

    private canAcceptLicense(user: UserDto): boolean {
        return !!user.License.Agreement.CanAgreeToLicense;
    }

    private showLicenseModal() {
        this.modalService
            .open(LicenseAgreementModal)
            .onClose
            .subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.uniHttp.asPOST()
                        .usingBusinessDomain()
                        .withEndPoint('users?action=accept-agreement')
                        .send()
                        .map(res => res.json())
                        .subscribe(
                            success => this.toastService.addToast(
                                'Suksess',
                                ToastType.good,
                                ToastTime.short,
                                'Lisens-godkjenning lagret',
                            ),
                            err => this.errorService.handle(err),
                        );
                } else {
                    this.authService.clearAuthAndGotoLogin();
                }
            });
    }

    private showCanNotAcceptLicenseModal(user: UserDto) {
        const company = user.License.Company;

        this.modalService
            .open(UniConfirmModalV2, {
                message: `Lisensavtale for ${company.Name} må være godtatt før du kan ta Uni Economy i bruk.<br />
                          Vennligst kontakt din systemeier for godkjenning av avtale.<br /><br />
                          <b>Kontaktinfo:</b><br />
                          ${company.ContactPerson}<br />
                          ${company.ContactEmail}`,
                header: `Lisens må godkjennes`,
                buttonLabels: {
                    accept: 'OK'
                }
            })
            .onClose
            .subscribe(()=>{});
    }
}
