import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '@app/authService';
import {PaymentBatchService, ElsaPurchaseService} from '@app/services/services';
import { UniAutobankAgreementModal, UniModalService } from '@uni-framework/uni-modal';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'bank-balance',
    templateUrl: './bank-balance.html',
    styleUrls: ['./bank-balance.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceWidget {
    onboardingState: 'none' | 'complete' | 'pending';

    constructor(
        private cdr: ChangeDetectorRef,
        private elsaPurchasesService: ElsaPurchaseService,
        private paymentBatchService: PaymentBatchService,
        private modalService: UniModalService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.authService.activeCompany.IsTest) {
            this.onboardingState = 'complete';
            this.cdr.markForCheck();
        } else {
            this.getData();
        }
    }

    getData() {
        this.elsaPurchasesService.getPurchaseByProductName('Autobank').subscribe(autobankPurchase => {
            if (autobankPurchase) {
                this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
                    this.onboardingState = agreements?.length ? 'complete' : 'pending';
                    this.cdr.markForCheck();
                });
            } else {
                this.onboardingState = 'none';
                this.cdr.markForCheck();
            }
        });
    }

    connectBank() {
        if (theme.theme === THEMES.SR) {
            this.router.navigateByUrl('/bank/ticker');
        } else if (this.onboardingState === 'none') {
            this.router.navigateByUrl('/marketplace/modules');
        } else {
            this.modalService.open(UniAutobankAgreementModal, {
                data: { agreements: [] },
                closeOnClickOutside: false
            }).onClose.subscribe((res) => {
                if (res) {
                    this.getData();
                }
            });
        }
    }
}
