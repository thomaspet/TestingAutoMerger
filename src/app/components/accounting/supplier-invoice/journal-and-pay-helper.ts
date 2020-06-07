import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SupplierInvoiceService, ErrorService, PaymentBatchService, PaymentService} from '@app/services/services';
import {ConfirmActions, UniModalService, UniConfirmModalV2, IModalOptions} from '@uni-framework/uni-modal';
import { SupplierInvoice, Payment } from '@uni-entities';
import {ToPaymentModal} from './modals/to-payment-modal/to-payment-modal';
import { switchMap } from 'rxjs/operators';

export enum ActionOnReload {
    DoNothing = 0,
    SentToBank = 1,
    SentToPaymentList = 2
}

// HELPER CLASS FOR JOURNALING AND PAYMENT FUNCTIONS
@Injectable()
export class JournalAndPaymentHelper {

    constructor (
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService,
        private errorSerivce: ErrorService,
        private paymentBatchService: PaymentBatchService,
        private paymentService: PaymentService
    ) { }

    journal(current: SupplierInvoice, ask: boolean): Observable<any> {
        return this.openAskBeforeJournalModal(current, ask).pipe(
            switchMap(response => {
                return response
                ? this.supplierInvoiceService.journal(current.ID)
                    .switchMap(res => of(true))
                    .catch((err) => {
                        this.errorSerivce.handle(err);
                        return of(false);
                    })
                : of(false);
            })
        ).catch((err, obs) => of(null));
    }

    journalAndToPayment(current: SupplierInvoice): Observable<ActionOnReload> {
        return this.openSelectPaymentMethodModal(false, current).pipe(
            switchMap(response => {
                if (!response) {
                    return of(null);
                }

                return this.journal(current, false).switchMap(journaled => {
                    if (journaled) {
                        return response === 1
                            ? this.createPaymentAndSendToBank(current).switchMap(res => of(response))
                            : this.sendToPaymentList(current).switchMap(res => of(response));
                    } else {
                        return of(null);
                    }
                }).catch(err => of(false));
            })
        );
    }

    toPayment(current: SupplierInvoice) {
        return this.openSelectPaymentMethodModal(true, current).pipe(
            switchMap((response) => !response
                ? of(null)
                : response === 1 ? this.createPaymentAndSendToBank(current) : this.sendToPaymentList(current))
        );
    }

    sendToPaymentList(current: SupplierInvoice): Observable<boolean> {
        return this.supplierInvoiceService.sendForPayment(current.ID)
            .switchMap(res => of(true))
            .catch((err) => {
                this.errorSerivce.handle(err);
                return of(false);
            });
    }

    createPaymentAndSendToBank(current: SupplierInvoice) {
        return this.supplierInvoiceService.sendForPayment(current.ID)
            .switchMap((payment: Payment) => {
                return !!payment ? this.paymentService.createPaymentBatch([payment.ID], false) : of(null);
            }).pipe(switchMap(batch => {
                return this.paymentBatchService.sendToPayment(batch.ID, {Code: null, Password: null});
            })).catch(err => of(err));
    }

    openSelectPaymentMethodModal(justSendToPayment: boolean = true, current: SupplierInvoice): Observable<any> {
        return this.paymentBatchService.checkAutoBankAgreement().switchMap(agreements => {
            const options = {
                buttonLabels: {
                    accept: justSendToPayment ? 'Betal' : 'Bokfør og betal',
                },
                data: {
                    current: current,
                    canSendToPayment: agreements?.length && agreements.filter(a => a.StatusCode === 700005).length > 0
                }
            };

            return this.modalService.open(ToPaymentModal, options).onClose.pipe(
                switchMap(response => of(response))
            );
        });


    }

    openAskBeforeJournalModal(current: SupplierInvoice, ask?) {
        return !ask ? of(true) : this.modalService.open(UniConfirmModalV2, {
            header: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_SUPPLIER_NAME~' + current.Supplier.Info.Name,
            message: 'ACCOUNTING.SUPPLIER_INVOICE.BOOK_WITH_AMOUNT~' + current.TaxInclusiveAmountCurrency.toFixed(2),
            buttonLabels: {
                accept: 'Bokfør',
                cancel: 'Avbryt'
            }
        }).onClose.pipe(switchMap(response => of(response === ConfirmActions.ACCEPT)));
    }
}
