import {Component, EventEmitter} from '@angular/core';
import {of as observableOf, forkJoin} from 'rxjs';
import {switchMap, catchError, tap} from 'rxjs/operators';

import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {SupplierInvoiceService, ErrorService} from '@app/services/services';
import {SupplierInvoice} from '@uni-entities';

export enum BillMassTransition {
    Journal = 1,
    ToPayment = 2,
    JournalAndToPayment = 3
}

@Component({
    selector: 'bill-transition-modal',
    templateUrl: './bill-transition-modal.html',
    styleUrls: ['./bill-transition-modal.sass']
})
export class BillTransitionModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();

    headerText: string = 'Oppdaterer';
    busy: boolean;
    transition: BillMassTransition;

    updates: {
        invoice: SupplierInvoice;
        state: 'working' | 'success' | 'error';
        errorMessages?: string[];
    }[];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.transition = data.transition;

        if (this.transition && data.invoices) {
            this.headerText = this.getHeaderText();
            this.startTransitions(data.invoices);
        } else {
            console.error('Missing either transition or invoices in bill-transition-modal');
            this.onClose.emit();
        }
    }

    private startTransitions(invoices) {
        this.updates = invoices.map(invoice => {
            return { invoice: invoice, state: 'working' };
        });

        const requests = this.updates.map(update => {
            return this.getTransitionObservable(update.invoice).pipe(
                tap(() => update.state = 'success'),
                catchError(err => {
                    update.state = 'error';
                    const errorMessage = this.errorService.extractMessage(err);
                    if (errorMessage) {
                        update.errorMessages = errorMessage.split('<br />');
                    }
                    return observableOf(false);
                })
            );
        });

        this.busy = true;
        forkJoin(requests).subscribe(
            () => this.busy = false,
            () => this.busy = false,
        );
    }

    private getTransitionObservable(invoice: SupplierInvoice) {
        switch (this.transition) {
            case BillMassTransition.Journal:
                return this.supplierInvoiceService.journal(invoice.ID);

            case BillMassTransition.ToPayment:
                return this.supplierInvoiceService.PostAction(invoice.ID, 'sendForPayment');

            case BillMassTransition.JournalAndToPayment:
                return this.supplierInvoiceService.journal(invoice.ID).pipe(
                    switchMap(() => this.supplierInvoiceService.PostAction(invoice.ID, 'sendForPayment'))
                );
        }
    }

    private getHeaderText() {
        switch (this.transition) {
            case BillMassTransition.Journal:
                return 'Bokfører fakturaer';

            case BillMassTransition.ToPayment:
                return 'Sender til betalingsliste';

            case BillMassTransition.JournalAndToPayment:
                return 'Bokfører og sender til betalingsliste';
        }
    }
}
