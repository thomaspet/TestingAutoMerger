import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';
import {AuthService} from './authService';
import {UniHttp} from '../framework/core/http/http';
import {ErrorService, StatisticsService, BrunoOnboardingService} from './services/services';
import {ToastService, ToastTime, ToastType} from '../framework/uniToast/toastService';
import {UserDto} from '@app/unientities';
import {ConfirmActions, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {NavbarLinkService} from './components/layout/navbar/navbar-link-service';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {
    UniModalService,
    UserLicenseAgreementModal,
    LicenseAgreementModal,
    MissingRolesModal,
    ConfigBankAccountsInfoModal
} from '@uni-framework/uni-modal';

// Do not change this import! Since we don't use rx operators correctly
// we depend on having at least one import getting EVERYTHING in rxjs
import {Observable} from 'rxjs/Rx';

import {LicenseManager} from 'ag-grid-enterprise';
import { ChatBoxService } from './components/layout/chat-box/chat-box.service';
// tslint:disable-next-line
LicenseManager.setLicenseKey('Uni_Micro__Uni_Economy_1Devs_1Deployment_4_March_2020__MTU4MzI4MDAwMDAwMA==63c1793fa3d1685a93e712c2d20cc2a6');
import {theme, THEMES} from 'src/themes/theme';
import {FeaturePermissionService} from './featurePermissionService';

const HAS_ACCEPTED_USER_AGREEMENT_KEY = 'has_accepted_user_agreement';

@Component({
    selector: 'uni-app',
    templateUrl: './app.html',
})
export class App {
    private licenseAgreementModalOpen: boolean;
    private userlicenseModalOpen: boolean;
    private missingRolesModalOpen: boolean;

    isAuthenticated: boolean;
    isOnInitRoute: boolean;
    isPendingApproval: boolean;

    constructor(
        private titleService: Title,
        private authService: AuthService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private uniHttp: UniHttp,
        private errorService: ErrorService,
        public navbarService: NavbarLinkService,
        private browserStorage: BrowserStorageService,
        private router: Router,
        private statisticsService: StatisticsService,
        public chatBoxService: ChatBoxService,
        private brunoOnboardingService: BrunoOnboardingService
    ) {
        if (!this.titleService.getTitle()) {
            const title = theme.appName;
            this.titleService.setTitle(title);
        }

        // prohibit dropping of files unless otherwise specified
        document.addEventListener('dragover', function( event: any ) {
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

        authService.authentication$.subscribe((authDetails) => {
            this.isAuthenticated = !!authDetails.user;
            if (this.isAuthenticated) {
                this.toastService.clear();
                const contractType = authDetails.user.License.ContractType.TypeName;

                if (authDetails.user.License.Company['StatusCode'] === 3) {
                    this.isPendingApproval = true;
                    return;
                }

                const shouldShowLicenseDialog = !this.licenseAgreementModalOpen
                    && theme.theme !== THEMES.SR
                    && contractType !== 'Demo'
                    && !this.hasAcceptedCustomerLicense(authDetails.user);

                if (shouldShowLicenseDialog) {
                    this.licenseAgreementModalOpen = true;
                    this.modalService.open(LicenseAgreementModal, {
                        hideCloseButton: true,
                        closeOnClickOutside: false,
                        closeOnEscape: false
                    }).onClose.subscribe(
                        () => this.licenseAgreementModalOpen = false
                    );
                }

                const permissions = authDetails.user['Permissions'];
                if ((!permissions || !permissions.length) && !this.missingRolesModalOpen) {
                    this.missingRolesModalOpen = true;
                    this.modalService.open(MissingRolesModal).onClose.subscribe(() => {
                        this.missingRolesModalOpen = false;
                    });
                }

                if (theme.theme !== THEMES.EXT02 && !this.userlicenseModalOpen && !this.hasAcceptedUserLicense(authDetails.user)) {
                    this.showUserLicenseModal();
                }

                if (!browserStorage.getItemFromCompany('isNotInitialLogin')) {
                    this.showInitLoginModal();
                    browserStorage.setItemOnCompany('isNotInitialLogin', true);
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

        this.checkForInitRoute();
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.checkForInitRoute();
            }
        });
    }

    private checkForInitRoute() {
        if (this.router.url) {
            this.isOnInitRoute = this.router.url.startsWith('/init');
        }
    }

    private hasAcceptedCustomerLicense(user: UserDto): boolean {
        return (user && user.License && user.License.CustomerAgreement) ?
            (!!user.License.CustomerAgreement.HasAgreedToLicense || user.License.CustomerAgreement.AgreementId === 0) : true;
    }

    private hasAcceptedUserLicense(user: UserDto): boolean {
        return (user && user.License && user.License.UserLicenseAgreement) ?
            (!!user.License.UserLicenseAgreement.HasAgreedToLicense || user.License.UserLicenseAgreement.AgreementId === 0) : true;
    }

    goToExternalSignup() {
        if (theme.theme === THEMES.SR) {
            let url = 'https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/kjop/bli-kunde-bankregnskap.html';
            this.statisticsService.GetAllUnwrapped(
                'model=CompanySettings&select=OrganizationNumber as OrganizationNumber'
            ).subscribe(
                settings => {
                    const orgNumber = settings && settings[0] && settings[0].OrganizationNumber;
                    if (orgNumber) {
                        url += `?bm-orgNumber=${orgNumber}`;
                    }

                    window.open(url, '_blank');
                },
                () => window.open(url, '_blank')
            );
        }
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
                        () => {},
                        err => this.errorService.handle(err),
                    );
            } else {
                this.authService.clearAuthAndGotoLogin();
            }
        });
    }

    private showInitLoginModal() {
        const options: IModalOptions = {
            header: 'DNB regnskap er nå aktivert og klart for bruk',
            message: '<b>Vil du koble DNB regnskap til nettbank bedrift? (anbefales)</b> <section>Du kan alltids sette det opp ved en senere anledning</section>',
            footerCls: 'center',
            buttonLabels: {
                accept: 'Ja',
                reject: 'Nei takk'
            },
            buttonIcons: {
                accept: 'launch'
            },
            icon: 'themes/ext02/EXT02-companyInitDone-modal-icon.svg',
            modalConfig: {
                iconConfig: {
                    size: 3
                }
            }
        };

        this.modalService.open(ConfigBankAccountsInfoModal, options).onClose
            .subscribe((action: ConfirmActions) => {
                if (action === ConfirmActions.ACCEPT) {
                    this.brunoOnboardingService.startOnboarding().subscribe(() => {
                        this.brunoOnboardingService.onAgreementStatusChanged.subscribe(() => {
                            // TODO: Open ComapnyActionsModal
                        });
                    });
                } else {
                    // TODO: Open ComapnyActionsModal
                }
            });
    }
}
