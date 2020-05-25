import {Component, Output, EventEmitter} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {IUniModal} from '../../interfaces';
import {AuthService} from '@app/authService';
import {take} from 'rxjs/operators';
import {ElsaCustomersService, ErrorService} from '@app/services/services';
import {ElsaCustomer} from '@app/models';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'license-agreement-modal',
    templateUrl: './license-agreement-modal.html',
    styleUrls: ['./license-agreement-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseAgreementModal implements IUniModal {
    @Output() onClose = new EventEmitter();

    agreementUrl: SafeUrl;
    canAgreeToLicense: boolean;
    customer: ElsaCustomer;
    hasAgreed: boolean;
    busy: boolean;

    constructor(
        private sanitizer: DomSanitizer,
        private errorService: ErrorService,
        private toastService: ToastService,
        private authService: AuthService,
        private elsaCustomerService: ElsaCustomersService,
        private http: UniHttp
    ) {
        this.agreementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.LICENSE_AGREEMENT_URL);

        this.authService.authentication$.pipe(take(1)).subscribe(auth => {
            try {
                this.canAgreeToLicense = !!auth.user.License.CustomerAgreement.CanAgreeToLicense;
                const contractID = auth.user.License.Company.ContractID;

                if (!this.canAgreeToLicense && contractID) {
                    this.elsaCustomerService.getByContractID(contractID, 'Managers').subscribe(customer => {
                        this.customer = customer;
                    });
                }
            } catch (e) {
                console.error(e);
                this.onClose.emit();
            }
        });
    }

    confirmAgreement() {
        this.busy = true;
        this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('users?action=accept-CustomerAgreement')
            .send()
            .subscribe(
                () => this.onClose.emit(),
                err => {
                    this.busy = false;
                    this.errorService.handle(err);
                },
            );
    }

    logout() {
        this.onClose.emit();
        this.authService.clearAuthAndGotoLogin();
    }
}
