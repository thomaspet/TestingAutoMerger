import { Injectable, EventEmitter, Output } from '@angular/core';
import { BankIntegrationAgreement } from '../../unientities';
import { BankService } from '../accounting/bankService';
import { Observable } from 'rxjs';
import { AutoBankAgreementDetails, BankAgreementServiceProvider } from '@app/models/autobank-models';
import { AuthService } from '@app/authService';
import { ConfigBankAccountsModal } from '@uni-framework/uni-modal/modals/bank-accounts-config-modal/bank-accounts-config-modal';
import { BankAccountService } from '../accounting/bankAccountService';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { ConfigBankAccountsConfirmModal } from '@uni-framework/uni-modal/modals/bank-accounts-config-confirm-modal/bank-accounts-config-confirm-modal';
import { StatisticsService } from '@app/services/common/statisticsService';
import { IModalOptions } from '@uni-framework/uni-modal';



@Injectable()
export class BrunoOnboardingService {
    @Output() onAgreementStatusChanged = new EventEmitter();

    constructor(
        private bankService: BankService,
        private authService: AuthService,
        private modalService: UniModalService,
        private bankAccountService: BankAccountService,
        private statisticsService: StatisticsService
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

    public hasNewAccountInfo(agreement): boolean {
        return agreement?.HasNewAccountInformation ? true : false;
    }

    public isActiveAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700005 ? true : false;
    }

    public isFirstOnboarding(agreement: BankIntegrationAgreement): Observable<boolean> {
        return this.statisticsService.GetAll(
            'model=AuditLog' +
            '&select=count(id)' +
            `&filter=AuditLog.EntityType eq 'BankIntegrationAgreement' and AuditLog.EntityID eq ${agreement.ID} and field eq 'HasNewAccountInformation' and oldValue eq 'true'` +
            '&top=1'
        ).map((data) => data.Data[0].countid < 1);
    }

    public startOnboarding(): Observable<void> {
        return this.getAgreement()
            .map((agreement) => {
                if (!agreement) {
                    this.createNewPendingAgreement(this.agreementDetails)
                        .subscribe((pendingAgreementCreated) => {
                            if (pendingAgreementCreated) {
                                this.authService.reloadCurrentSession()
                                    .subscribe(() => {
                                        this.onAgreementStatusChanged.emit();
                                        this.openExternalOnboarding();
                                    });
                            }
                        });
                } else if (this.isPendingAgreement(agreement) && !this.hasNewAccountInfo(agreement)) {
                    this.openExternalOnboarding();
                } else if (this.hasNewAccountInfo(agreement)) {
                    this.bankAccountService.getBankServiceBankAccounts()
                        .subscribe((accounts) => {
                            this.modalService.open(ConfigBankAccountsModal, {
                                data: accounts
                            }).onClose.subscribe((res) => {
                                if (res !== null) {
                                    this.bankAccountService.createBankAccounts(res)
                                        .subscribe(() => {
                                            this.onAgreementStatusChanged.emit();

                                            const options: IModalOptions = {
                                                header: 'Integrasjonen med banken er klar!',
                                                message: 'Alle bankkontoer er nå oppdatert i DNB Regnskap og er klar for bruk',
                                                buttonLabels: {
                                                    accept: 'OK'
                                                },
                                                icon: 'themes/ext02/ext02-success-accountconfig.svg'
                                            };

                                            this.modalService.open(ConfigBankAccountsConfirmModal, options);
                                        });
                                }
                            });
                        });
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
        window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=DNBRegnskap&kontoinfoval=true&innbetalingerval=true&utbetalingerval=true&userid=' +
        this.authService.currentUser.BankIntegrationUserName, '_blank');
    }
}
