import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {BrunoOnboardingService} from '@app/services/services';
import {Subject} from 'rxjs';
import {AuthService} from '@app/authService';
import {BankIntegrationAgreement} from '@uni-entities';

@Component({
    selector: 'ext02-bank-balance',
    templateUrl: './ext02-bank-balance.html',
    styleUrls: ['./ext02-bank-balance.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ext02BankBalanceWidget {
    componentDestroyed$ = new Subject();
    agreement: BankIntegrationAgreement;
    onboardingState: 'none' | 'pending' | 'connectAccounts' | 'complete';
    isTestCompany: boolean;
    svgLoaded = true;

    constructor(
        private authService: AuthService,
        private onboardingService: BrunoOnboardingService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.isTestCompany = this.authService.activeCompany?.IsTest;
        if (this.isTestCompany) {
            this.onboardingState = 'complete';
        } else {
            this.getOnboardingState();
        }

        this.onboardingService.agreementStatusChanged.subscribe(() => {
            this.getOnboardingState();
        });
    }

    ngOnDestroy() {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
        this.onboardingService.agreementStatusChanged.complete();
    }

    private getOnboardingState() {
        this.onboardingService.getAgreement().subscribe(agreement => {
            if (agreement) {
                this.agreement = agreement;
                if (this.onboardingService.isPendingAgreement(agreement)) {
                    this.onboardingState = 'pending';
                } else {
                    this.onboardingState = this.onboardingService.hasNewAccountInfo(agreement) ? 'connectAccounts' : 'complete';
                }
            } else {
                this.onboardingState = 'none';
            }

            this.cdr.markForCheck();
        });
    }

    runOnboarding() {
        if (this.onboardingState === 'none') {
            this.onboardingService.createAgreement().subscribe(() => {
                this.getOnboardingState();
            });
        } else if (this.onboardingState === 'pending') {
            this.onboardingService.restartOnboarding(this.agreement);
        } else if (this.onboardingState === 'connectAccounts') {
            this.onboardingService.connectBankAccounts().subscribe((configSaved) => {
                if (configSaved) {
                    this.getOnboardingState();
                }
            });
        }
    }
}
