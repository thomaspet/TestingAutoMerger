import { Injectable, EventEmitter, Output } from '@angular/core';
import { BankIntegrationAgreement } from '../../unientities';
import { BankService } from '../accounting/bankService';
import { Observable, of } from 'rxjs';
import { AutoBankAgreementDetails, BankAgreementServiceProvider } from '@app/models/autobank-models';
import { AuthService } from '@app/authService';
import { ConfigBankAccountsModal } from '@uni-framework/uni-modal/modals/bank-accounts-config-modal/bank-accounts-config-modal';
import { BankAccountService } from '../accounting/bankAccountService';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { ConfigBankAccountsInfoModal } from '@uni-framework/uni-modal/modals/config-bank-accounts-info-modal/config-bank-accounts-info-modal';
import { StatisticsService } from '@app/services/common/statisticsService';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BrunoBankOnboardingModal } from '@uni-framework/uni-modal/modals/bruno-bank-onboarding-modal/bruno-bank-onboarding-modal';

@Injectable()
export class BrunoOnboardingService {
    constructor(
        private bankService: BankService,
        private authService: AuthService,
        private modalService: UniModalService,
        private bankAccountService: BankAccountService,
        private statisticsService: StatisticsService,
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
        return agreement?.StatusCode === 700001;
    }

    public hasNewAccountInfo(agreement): boolean {
        return agreement?.HasNewAccountInformation;
    }

    public isActiveAgreement(agreement?: BankIntegrationAgreement): boolean {
        return agreement?.StatusCode === 700005;
    }

    public isFirstOnboarding(agreement: BankIntegrationAgreement): Observable<boolean> {
        return this.statisticsService.GetAll(
            'model=AuditLog' +
            '&select=count(id)' +
            `&filter=AuditLog.EntityType eq 'BankIntegrationAgreement' and AuditLog.EntityID eq ${agreement.ID} and field eq 'HasNewAccountInformation' and oldValue eq 'true'` +
            '&top=1'
        ).map((data) => data.Data[0].countid < 1);
    }

    getAgreement(): Observable<BankIntegrationAgreement> {
        return this.bankService.getDirectBankAgreement(BankAgreementServiceProvider.Bruno).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            }),
            map(agreements => agreements && agreements.find(a => a.IsOutgoing))
        );
    }

    createAgreement() {
        return new Observable(observer => {
            this.bankService.createInitialAgreement(this.agreementDetails).subscribe(
                agreement => {
                    this.modalService.open(BrunoBankOnboardingModal, {
                        data: agreement
                    }).onClose.subscribe(externalOnboardingOpened => {
                        if (externalOnboardingOpened) {
                            this.authService.reloadCurrentSession().subscribe(() => {
                                observer.next(agreement);
                                observer.complete();
                            });
                        } else {
                            // Remove the newly created agreement if the user just closed
                            // the dialog without going to the external onboarding step.
                            this.bankService.deleteAgreement(agreement).subscribe(
                                () => {
                                    observer.next(null);
                                    observer.complete();
                                },
                                err => {
                                    console.error(err);
                                    observer.next(null);
                                    observer.complete();
                                }
                            );
                        }
                    });
                },
                err => {
                    observer.error(err);
                    observer.complete();
                }
            );
        });
    }

    restartOnboarding(agreement: BankIntegrationAgreement) {
        return this.modalService.open(BrunoBankOnboardingModal, {
            data: agreement
        }).onClose;
    }

    connectBankAccounts(): Observable<boolean> {
        return this.bankAccountService.getBankServiceBankAccounts().pipe(
            switchMap(accounts => {
                return this.modalService.open(ConfigBankAccountsModal, {
                    data: accounts
                }).onClose.pipe(
                    map(configurationSaved => {
                        if (configurationSaved) {
                            this.modalService.open(ConfigBankAccountsInfoModal, {
                                header: 'Integrasjonen med banken er klar!',
                                message: 'Alle bankkontoer er nå oppdatert i DNB Regnskap og er klar for bruk',
                                buttonLabels: {
                                    accept: 'OK'
                                },
                                icon: 'themes/ext02/ext02-success-accountconfig.svg'
                            });
                        }

                        return !!configurationSaved;
                    })
                );
            })
        );
    }

    public RequestBankintegrationChange(agreement: BankIntegrationAgreement) {
        return new Observable(observer => {
            if (!agreement['HasOrderedIntegrationChange']) {
                this.bankService.setBankIntegrationChangeAgreement(true).subscribe(() => {
                    this.modalService.open(BrunoBankOnboardingModal, {
                        data: agreement
                    }).onClose.subscribe((externalOnboardingOpened) => {
                        if (externalOnboardingOpened) {
                            this.authService.reloadCurrentSession().subscribe(() => {
                                observer.next(agreement);
                                observer.complete();
                            });
                        } else {
                            // Reset the newly changed agreement if the user just closed
                            // the dialog without going to the external onboarding step.
                            this.bankService.setBankIntegrationChangeAgreement(false).subscribe(
                                () => {
                                    observer.next();
                                    observer.complete();
                                },
                                err => {
                                    console.error(err);
                                    observer.next();
                                    observer.complete();
                                }
                            );
                        }
                    });
                });
            } else {
                this.modalService.open(BrunoBankOnboardingModal, {
                    data: agreement
                }).onClose.subscribe((externalOnboardingOpened) => {
                    if (externalOnboardingOpened) {
                        observer.next(agreement);
                        observer.complete();
                    } else {
                        observer.next();
                        observer.complete();
                    }
                });
            }
        });
    }
}
