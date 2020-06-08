import {Component, Output, EventEmitter} from '@angular/core';
import {IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ElsaCustomersService, ErrorService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'give-support-access-modal',
    templateUrl: './give-support-access-modal.html',
    styleUrls: ['./give-support-access-modal.sass']
})
export class GiveSupportAccessModal implements IUniModal {
    @Output()
    onClose = new EventEmitter<any>();

    busy = false;
    emailInput = '';
    hasAgreedToTerms = false;
    showError = false;

    constructor(
        private elsaCustomerService: ElsaCustomersService,
        private authService: AuthService,
        private errorService: ErrorService,
    ) {}

    giveAccess() {
        if (!this.hasAgreedToTerms || !this.emailInput.length) {
            return;
        }
        this.busy = true;
        this.elsaCustomerService.checkSupportUserExists(this.emailInput).subscribe(
            exists => {
                if (exists) {
                    // get companylicenseID from authservice
                    this.authService.authentication$.pipe(
                        takeUntil(this.onClose)
                    ).subscribe(auth => {
                        const user = auth && auth.user;
                        if (user) {
                            // add support user to company
                            this.elsaCustomerService.addSupportUserToCompany(user.License.Company.ID, this.emailInput)
                                .subscribe(() => {
                                    this.busy = false;
                                    this.onClose.emit(true);
                                },
                                err => {
                                    this.busy = false;
                                    this.errorService.handle(err);
                                }
                            );
                        }
                    });
                } else {
                    this.showError = true;
                    this.hasAgreedToTerms = false;
                    this.busy = false;
                }
            },
            () => this.busy = false
        );
    }

    cancel() {
        this.onClose.emit(false);
    }
}
