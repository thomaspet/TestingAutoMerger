import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SupplierInvoiceService, ErrorService} from '@app/services/services';
import {ConfirmActions, UniModalService, UniConfirmModalV2} from '@uni-framework/uni-modal';
import { SupplierInvoice, Payment } from '@uni-entities';
import { switchMap } from 'rxjs/operators';

export enum ActionOnReload {
    DoNothing = 0,
    JournaledAndSentToBank = 1,
    JournaledAndSentToPaymentList = 2,
    SentToBank = 3,
    SentToPaymentList = 4,
    FailedToJournal = 5,
    FailedToSendToBank = 6,
    FailedToSendToPaymentList = 7
}

// HELPER CLASS FOR JOURNALING AND PAYMENT FUNCTIONS
@Injectable()
export class JournalAndPaymentHelper {

    constructor (
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService,
        private errorSerivce: ErrorService,
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

    cleanJournal(ID): Observable<any> {
        return this.supplierInvoiceService.journal(ID);
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
