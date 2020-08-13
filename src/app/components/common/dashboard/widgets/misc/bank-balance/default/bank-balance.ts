import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AuthService} from '@app/authService';
import {PaymentBatchService, ElsaPurchaseService} from '@app/services/services';

@Component({
    selector: 'bank-balance',
    templateUrl: './bank-balance.html',
    styleUrls: ['./bank-balance.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceWidget {
    onboardingState: 'none' | 'complete';

    constructor(
        private cdr: ChangeDetectorRef,
        private elsaPurchasesService: ElsaPurchaseService,
        private paymentBatchService: PaymentBatchService,
        private authService: AuthService,
    ) {}

    ngAfterViewInit() {
        if (this.authService.activeCompany.IsTest) {
            this.onboardingState = 'complete';
            this.cdr.markForCheck();
        } else {
            this.elsaPurchasesService.getPurchaseByProductName('Autobank').subscribe(autobankPurchase => {
                if (autobankPurchase) {
                    this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
                        this.onboardingState = agreements?.length ? 'complete' : 'none';
                        this.cdr.markForCheck();
                    });
                } else {
                    this.onboardingState = 'none';
                    this.cdr.markForCheck();
                }
            });
        }
    }
}
