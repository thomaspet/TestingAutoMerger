import { Injectable } from '@angular/core';
import { BankIntegrationAgreement } from '../../unientities';
import { BankService } from '../accounting/bankService';
import { Observable } from 'rxjs';
import {AutoBankAgreementDetails, BankAgreementServiceProvider} from '@app/models/autobank-models';

@Injectable()
export class BrunoOnboardingService {
    constructor(
        private bankService: BankService
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

    public IsPendingAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700001 ? true : false;
    }

    public IsActiveAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700005 ? true : false;
    }

    public StartOnboarding() {
        this.GetPendingOrActiveAgreement()
            .subscribe((agreement) => {
                if (!agreement) {
                    this.CreateNewPendingAgreement(this.agreementDetails)
                        .subscribe((pendingAgreementCreated) => {
                            if (pendingAgreementCreated) {
                                this.OpenExternalOnboarding();
                            }
                        });
                } else if (this.IsPendingAgreement(agreement)) {
                    this.OpenExternalOnboarding();
                }
            });
    }

    public GetPendingOrActiveAgreement(): Observable<BankIntegrationAgreement> {
        return this.bankService.getActiveOrPendingDirectAutobankAgreement()
            .map((agre: BankIntegrationAgreement[]) => agre[0]);
    }

    private CreateNewPendingAgreement(agreementDetails): Observable<boolean> {
        return this.bankService.createInitialAgreement(agreementDetails)
            .map((res: BankIntegrationAgreement) => this.IsPendingAgreement(res));
    }

    private OpenExternalOnboarding() {
        // TODO: If pacages has different set of services, make a function here for building the bruno url,
        // inluding the correct services from IAutoBankAgreementDetails parameter
        // TODO: Add Tuser name to end of url
        window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=DNBRegnskap&kontoinfoval=true&innbetalingerval=true&utbetalingerval=true&userid=' + '', '_blank');
    }
}
