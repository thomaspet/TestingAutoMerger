import {Component, Output, EventEmitter} from '@angular/core';
import {IUniModal} from '../../interfaces';
import {AuthService} from '@app/authService';
import {take} from 'rxjs/operators';
import {ElsaCustomersService, ErrorService} from '@app/services/services';
import {ElsaCustomer} from '@app/models';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'license-agreement-modal',
    templateUrl: './license-agreement-modal.html',
    styleUrls: ['./license-agreement-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseAgreementModal implements IUniModal {
    @Output() onClose = new EventEmitter();

    canAgreeToLicense: boolean; // = true;
    customer: ElsaCustomer;
    hasAgreed: boolean;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private toastService: ToastService,
        private authService: AuthService,
        private elsaCustomerService: ElsaCustomersService,
        private http: UniHttp
    ) {
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
            .map(res => res.json())
            .subscribe(
                () => {
                    this.toastService.addToast(
                        'Selskapslisens godkjent',
                        ToastType.good,
                        ToastTime.short
                    );

                    this.onClose.emit();
                },
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
