import { Injectable } from '@angular/core';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import { ConfirmTwoFactorModal} from '@uni-framework/uni-modal/modals/confirmTwofactor-modal/confirm-twofactor-modal';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { PaymentBatch } from '@uni-entities';
import { UniNumberFormatPipe } from '@uni-framework/pipes/uniNumberFormatPipe';
import { PaymentBatchService } from '../accounting/paymentBatchService';
import { ErrorService } from '../common/errorService';
import { UserService } from '../common/userService';
import {AuthService} from '@app/authService';

@Injectable()
export class ZDataPaymentService {
    constructor(
        private modalService: UniModalService,
        private toastService: ToastService,
        private numberformat: UniNumberFormatPipe,
        private paymentBatchService: PaymentBatchService,
        private errorService: ErrorService,
        private userService: UserService,
        private authService: AuthService,
    ) { }


    /*
    * Check if BankID is verified, return or redirect to ZData IDS
    */

    public redirectIfNotVerifiedWithBankId(parameters: string) {
        return new Promise<void>((resolve, reject) => {
            let bankIdToast = this.toastService.addToast("Sjekker BankID hos ZData", ToastType.info, ToastTime.short);
            this.userService.isBankIdVerified().subscribe(verified => {
                this.toastService.removeToast(bankIdToast);

                if (verified) {
                    resolve();
                } else {
                    this.authService.authentication$.subscribe(auth => {
                        this.modalService.confirm({
                            header: 'BankID ikke verifisert eller utløpt',
                            message: `Regnskapsgodkjente betalinger krever at pålogget bruker "${auth?.user?.UserName}" blir knyttet sammen med BankID hos ZData. 
                                    Bruk kun pålogget bruker sin BankID. BankID innloggingen er gyldig i 90 dager. 
                                    Trykk "Gå til BankID" for å fortsette til BankID pålogging. Etter pålogging kommer man tilbake og utbetaling vil bli sendt.`,
                            buttonLabels: {
                                accept: 'Gå til BankID',
                            }
                        }).onClose.subscribe(confirm => {
                            if (confirm === ConfirmActions.ACCEPT) {
                                let path = `${window.location.href.split('/#')[1]}&${parameters}`;
                                window.location.href = this.userService.getBankIdRedirectUrl(path);
                            }
                            else {
                                reject();
                            }
                        });    
                    });
                }
            }, err => {
                this.errorService.handle(err);
                reject();
            });    
        });
    }

    /*
    * Approve with two factor
    */

    public approveBatchWithTwoFactor(paymentBatchId: string | number) {
        return new Promise<void>((resolve, reject) => {
            const modal = this.modalService.open(ConfirmTwoFactorModal, {
                header: 'Godkjenn utbetaling'
            });
        
            modal.onClose.subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    this.paymentBatchService.approveBatch(Number(paymentBatchId)).subscribe(() => {
                        this.toastService.addToast('Godkjenning fullført', ToastType.good, 3);
                        resolve();
                    }, (err) => {
                        this.errorService.handle(err);
                    });
                } else if (result === ConfirmActions.REJECT) {                    
                    reject();
                }
            }); 
        });
    }

    /*
    * Send two factor payments
    */
    public sendPaymentWithTwoFactor(paymentBatch: PaymentBatch) { 
        return new Promise((resolve, reject) => {
            this.modalService.open(ConfirmTwoFactorModal, {
                header: 'Godkjenn betaling med to-faktor',
                buttonLabels: {
                    accept: 'Godkjenn og betal',
                    cancel: 'Avbryt'
                },
                data: {
                    reference: paymentBatch.PaymentReferenceID
                },
                message: `Send ${paymentBatch.NumberOfPayments} ${paymentBatch.NumberOfPayments > 1 ? 'betalinger' : 'betaling'} med totalsum på <strong>${this.numberformat.transform(paymentBatch.TotalAmount, 'money')}</strong> til bank og godkjenn med to-faktor`
            }).onClose.subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    const body = {
                        HashValue: paymentBatch.HashValue
                    };
        
                    this.paymentBatchService.sendToPayment(paymentBatch.ID, body).subscribe(() => {
                        this.toastService.addToast('Sendt til bank', ToastType.good, 8, `Betalingsbunt er opprettet og sendt til bank`);
                        resolve(true);
                    }, err => {
                        this.toastService.addToast('Kunne ikke sende til bank', ToastType.warn, 15, 
                            'Betaling ble opprettet, men kunne ikke sende den til banken. Gå til Bank - Utbetalinger og send den på nytt.');
                        this.errorService.handle(err);
                        resolve(false);
                    });
                } else {
                    reject();
                }
            });    
        });
    }
}
