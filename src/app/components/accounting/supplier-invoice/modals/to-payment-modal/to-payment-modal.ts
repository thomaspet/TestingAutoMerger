import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { SupplierInvoice } from '@uni-entities';
import { SupplierInvoiceService, ErrorService, PaymentService, PaymentBatchService } from '@app/services/services';
import {ActionOnReload} from '../../journal-and-pay-helper';
import { of } from 'rxjs';

@Component({
    selector: 'to-payment-modal',
    templateUrl: './to-payment-modal.html',
    styleUrls: ['./to-payment-modal.sass']
})
export class ToPaymentModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    current: SupplierInvoice;
    busy = true;
    onlyToPayment = false;
    hasErrors = false;
    errorMessage = '';
    shouldReloadOnClose = false;
    total = {
        net: 0,
        vat: 0,
        sum: 0
    };

    VALUE_ITEMS = [
        {
            selected: true,
            label: 'Send regning til banken nå',
            infoText: 'Regningen vil bli sendt til banken. Du må logge deg på nettbanken din for å godkjenne utbetalingen',
            value: 1,
            disabled: false
        },
        {
            selected: false,
            label: 'Legg til betalingsliste',
            infoText: 'Regningen vil bli lagt til betalingslisten hvor du kan betale den senere eller betale flere samtidig.',
            value: 2,
            disabled: false
        }
    ];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorSerivce: ErrorService,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService
    ) {}

    ngOnInit() {
        this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
            this.current = this.options?.data?.current;
            this.onlyToPayment = this.options?.data?.onlyToPayment;
            this.busy = false;

            this.current.JournalEntry.DraftLines.filter(line => line.AmountCurrency > 0).forEach(line => {

                line.Amount = line.AmountCurrency * line.CurrencyExchangeRate;
                const net = !line.VatType ? line.AmountCurrency : line.AmountCurrency / ( 1 + ( line.VatType.VatPercent / 100 ) );
                this.total.vat += line.AmountCurrency - net;
                this.total.sum += line.AmountCurrency || 0;
                this.total.net += net;
            });

            if (!agreements?.length || agreements.filter(a => a.StatusCode === 700005).length === 0) {
                this.VALUE_ITEMS[0].disabled = true;
                this.valueItemSelected(this.VALUE_ITEMS[1]);
            }
        }, err => {
            this.VALUE_ITEMS[0].disabled = true;
            this.valueItemSelected(this.VALUE_ITEMS[1]);
            this.busy = false;
        });
    }

    valueItemSelected(item: any) {
        if (item.selected || item.disabled || !!this.errorMessage) {
            return;
        } else {
            this.VALUE_ITEMS.forEach(i => i.selected = false);
            item.selected = true;
        }
    }

    send() {
        const value = this.VALUE_ITEMS.find(i => i.selected).value;
        const obs = this.onlyToPayment ? of(true) : this.supplierInvoiceService.journal(this.current.ID);
        this.busy = true;

        obs.subscribe(() => {
            this.shouldReloadOnClose = !this.onlyToPayment;
            if (value === 1) {
                this.createPaymentAndSendToBank();
            } else {
                this.sendToPaymentList();
            }
        }, err => {
            this.busy = false;
            this.errorMessage = 'Noe gikk galt ved bokføring av regningen';
            this.errorSerivce.handle(err);
        });
    }

    close() {
        // This emits true of false, and is only called when somehting went wrong.. Emits true when it
        // fails on step > 1 and should reload invoice when the modal is closed.
        this.onClose.emit(this.shouldReloadOnClose);
    }

    sendToPaymentList() {
        this.supplierInvoiceService.sendForPayment(this.current.ID).subscribe(res => {
            this.onClose.emit(this.onlyToPayment ? ActionOnReload.SentToPaymentList : ActionOnReload.JournaledAndSentToPaymentList);
        }, err => {
            this.busy = false;
            this.errorMessage = 'Noe gikk galt ved oppretting av betaling, kunne ikke sende den til betalingslisten';
            this.errorSerivce.handle(err);
        });
    }

    createPaymentAndSendToBank() {
        // Creates a payment for the supplier invoice
        this.supplierInvoiceService.sendForPayment(this.current.ID).subscribe(payment => {
            this.shouldReloadOnClose = true;
            // Send that batch to the bank directly
            this.paymentBatchService.sendAutobankPayment({Code: null, Password: null, PaymentIds: [payment.ID]}).subscribe(() => {
                this.onClose.emit(this.onlyToPayment ? ActionOnReload.SentToBank : ActionOnReload.JournaledAndSentToBank);
            }, err => {
                this.busy = false;
                this.errorMessage = 'Betaling ble opprettet, men kunne ikke sende den til banken. Gå til Bank - Utbetalinger og send den på nytt.';
                this.errorSerivce.handle(err);
            });
        }, err => {
            this.busy = false;
            this.errorMessage = 'Noe gikk galt ved oppretting av betaling';
            this.errorSerivce.handle(err);
        });
    }

    // createPaymentAndSendToBank() {
    //     // Creates a payment for the supplier invoice
    //     this.supplierInvoiceService.sendForPayment(this.current.ID).subscribe(payment => {
    //         // Use that payment to create a payment batch
    //         this.paymentService.createPaymentBatch([payment.ID], false).subscribe(batch => {
    //             // Send that batch to the bank directly
    //             this.paymentBatchService.sendToPayment(batch.ID, {Code: null, Password: null}).subscribe(() => {
    //                 this.onClose.emit(1);
    //             }, err => {
    //                 this.busy = false;
    //                 this.errorMessage = 'Betalingsbunt ble opprettet, men kunne ikke sende den til banken. ' +
    //                 'Gå til Bank - Utbetalingsbunter, legg den tilbake til ubetalt og send betalingen på nytt fra Utbetalinger.';
    //                 this.errorSerivce.handle(err);
    //             });
    //         }, err => {
    //             this.busy = false;
    //             this.errorMessage = 'Betaling ble opprettet men kunne ikke sende den til banken.' +
    //                  'Gå til Bank - Utbetalinger for å sende den igjen.';
    //             this.errorSerivce.handle(err);
    //         });
    //     }, err => {
    //         this.busy = false;
    //         this.errorMessage = 'Noe gikk galt ved oppretting av betaling';
    //         this.errorSerivce.handle(err);
    //     });
    // }
}
