import { Injectable } from '@angular/core';
import { BankIntegrationAgreement } from '../../unientities';
import { BankService } from '../accounting/bankService';
import { Observable } from 'rxjs';
import { AutoBankAgreementDetails, BankAgreementServiceProvider } from '@app/models/autobank-models';
import { AuthService } from '@app/authService';


@Injectable()
export class BrunoOnboardingService {
    constructor(
        private bankService: BankService,
        private authService: AuthService
    ) { }

    agreementDetails: AutoBankAgreementDetails = {
        DisplayName: 'Bruno Autobank',
        Phone: '',
        Email: '',
        Bank: '',
        Orgnr: '',
        BankAccountID: 0,
        BankAcceptance: true,
        IsInbound: true,
        IsOutgoing: true,
        IsBankBalance: true,
        BankApproval: true,
        IsBankStatement: true,
        Password: '',
        _confirmPassword: '',
        BankAccountNumber: 0,
        ServiceProvider: BankAgreementServiceProvider.Bruno
    };

    public isPendingAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700001 ? true : false;
    }

    public isNeedConfigOnBankAccounts(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700007 ? true : false;
    }

    public isActiveAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700005 ? true : false;
    }

    public startOnboarding(): Observable<void> {
        return this.getAgreement()
            .map((agreement) => {
                if (!agreement) {
                    this.createNewPendingAgreement(this.agreementDetails)
                        .subscribe((pendingAgreementCreated) => {
                            if (pendingAgreementCreated) {
                                this.authService.reloadCurrentSession().subscribe(() => this.openExternalOnboarding());
                            }
                        });
                } else if (this.isPendingAgreement(agreement)) {
                    this.openExternalOnboarding();
                } else if (this.isNeedConfigOnBankAccounts(agreement)) {
                    // TODO: Do bank account setup
                }
            });
    }

    public getAgreement(): Observable<BankIntegrationAgreement> {
        return this.bankService.getDirectBankAgreement(BankAgreementServiceProvider.Bruno)
            .map((agre: BankIntegrationAgreement[]) => agre[0]);
    }

    private createNewPendingAgreement(agreementDetails): Observable<BankIntegrationAgreement> {
        return this.bankService.createInitialAgreement(agreementDetails)
            .map((res: BankIntegrationAgreement) => res);
    }

    private openExternalOnboarding() {
        window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=DNBRegnskap&kontoinfoval=true&innbetalingerval=true&utbetalingerval=true&userid='
        + this.authService.currentUser.BankIntegrationUserName, '_blank');
    }
}
