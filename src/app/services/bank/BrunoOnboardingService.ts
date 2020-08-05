import { Injectable, EventEmitter, Output } from '@angular/core';
import { BankIntegrationAgreement } from '../../unientities';
import { BankService } from '../accounting/bankService';
import { Observable } from 'rxjs';
import { AutoBankAgreementDetails, BankAgreementServiceProvider } from '@app/models/autobank-models';
import { AuthService } from '@app/authService';
import { ConfigBankAccountsModal } from '@uni-framework/uni-modal/modals/bank-accounts-config-modal/bank-accounts-config-modal';
import { BankAccountService } from '../accounting/bankAccountService';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { ConfigBankAccountsInfoModal } from '@uni-framework/uni-modal/modals/config-bank-accounts-info-modal/config-bank-accounts-info-modal';
import { StatisticsService } from '@app/services/common/statisticsService';
import { IModalOptions } from '@uni-framework/uni-modal';
import { ConfirmActions } from '@uni-framework/uni-modal/interfaces';



@Injectable()
export class BrunoOnboardingService {
    @Output() onExternalOnboardingOpened = new EventEmitter();
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

        const orderKidModalOptions: IModalOptions = {
            header: 'Koble sammen regnskap og bank',
            message: 'Trykker du på «Bestill» sender vi deg  til DNB nettbank bedrift for å fullføre bestillingen. I bestillingsløpet må du velge hvilke konto(er) du ønsker å koble. <br/> <br/>'
            + 'Før du sendes videre trenger vi å vite om du ønsker å sette opp en KID-avtale og få innbetalingsdata rett inn i DNB Regnskap?',
            footerCls: 'center',
            checkboxLabel: 'Ja, jeg ønsker innbetalingsavtale/KID',
            modalConfig: {
                checkboxLink: {
                    text: 'se priser',
                    link: 'https://www.dnb.no/bedrift/priser/dnbregnskap.html'
                }
            },
            buttonLabels: {
                accept: 'Bestill',
                reject: 'Lukk'
            },
            buttonIcons: {
                accept: 'launch'
            },
            icon: 'themes/ext02/ext02-success-accountconfig.svg'
        };

        return this.getAgreement()
            .map((agreement) => {
                if (!agreement) {
                    this.modalService.open(ConfigBankAccountsInfoModal, orderKidModalOptions).onClose
                        .subscribe((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT || response === ConfirmActions.REJECT) {
                                this.createNewPendingAgreement(this.agreementDetails)
                                    .subscribe((pendingAgreementCreated) => {
                                        if (pendingAgreementCreated) {
                                            this.authService.reloadCurrentSession()
                                                .subscribe(() => {
                                                    this.onAgreementStatusChanged.emit();
                                                    this.openExternalOnboarding(response === ConfirmActions.ACCEPT);
                                                });
                                        }
                                    });
                            }
                        });
                } else if (this.isPendingAgreement(agreement) && !this.hasNewAccountInfo(agreement)) {

                    this.modalService.open(ConfigBankAccountsInfoModal, orderKidModalOptions).onClose
                        .subscribe((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT || response === ConfirmActions.REJECT) {
                                this.openExternalOnboarding(response === ConfirmActions.ACCEPT);
                            }
                    });
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

                                            const sucsessModalOptions: IModalOptions = {
                                                header: 'Kobling mellom regnskap bank er klar!',
                                                message: 'Alle bankkontoer er nå oppdatert i DNB Regnskap og er klar for bruk',
                                                footerCls: 'center',
                                                buttonLabels: {
                                                    accept: 'OK'
                                                },
                                                icon: 'themes/ext02/ext02-success-accountconfig.svg'
                                            };

                                            this.modalService.open(ConfigBankAccountsInfoModal, sucsessModalOptions);
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

    public openExternalOnboarding(orderKID: boolean) {
        if (orderKID) {
            window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=Bruno&kontoinfoval=true&innbetalingerval=true&utbetalingerval=true&userid=' +
            this.authService.currentUser.BankIntegrationUserName, '_blank');
            this.onExternalOnboardingOpened.emit();
        } else {
            window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=Bruno&kontoinfoval=true&utbetalingerval=true&userid=' +
            this.authService.currentUser.BankIntegrationUserName, '_blank');
            this.onExternalOnboardingOpened.emit();
        }
    }
}
