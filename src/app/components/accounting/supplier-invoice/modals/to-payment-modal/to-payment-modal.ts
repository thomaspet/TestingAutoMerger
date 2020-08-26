import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { SupplierInvoice, Payment, JournalEntryLine } from '@uni-entities';
import { SupplierInvoiceService, ErrorService, PaymentService, PaymentBatchService } from '@app/services/services';
import {ActionOnReload} from '../../journal-and-pay-helper';
import { of, Observable } from 'rxjs';
import { RequestMethod } from '@uni-framework/core/http';

@Component({
    selector: 'to-payment-modal',
    templateUrl: './to-payment-modal.html',
    styleUrls: ['./to-payment-modal.sass']
})
export class ToPaymentModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    supplierInvoice: SupplierInvoice;
    payment: Payment;
    journalEntryLine: JournalEntryLine;
    isPaymentOnly: boolean;

    busy = true;
    onlyToPayment = false;
    hasErrors = false;
    errorMessage = '';

    errorOncloseValue = 0;
    total = {
        net: 0,
        vat: 0,
        sum: 0
    };

    VALUE_ITEMS: IValueItem[];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorSerivce: ErrorService,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService
    ) {}

    ngOnInit() {
        this.supplierInvoice = this.options?.data?.supplierInvoice;
        this.payment = this.options?.data?.payment;
        this.journalEntryLine = this.options?.data?.journalEntryLine;
        this.isPaymentOnly = this.options?.data?.isPaymentOnly ?? false;
        this.onlyToPayment = this.options?.data?.onlyToPayment;

        this.VALUE_ITEMS = this.getValueItems();

        this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
            this.supplierInvoice?.JournalEntry.DraftLines.filter(line => line.AmountCurrency > 0).forEach(line => {
                line.Amount = line.AmountCurrency * line.CurrencyExchangeRate;
                const net = !line.VatType ? line.AmountCurrency : line.AmountCurrency / (1 + (line.VatType.VatPercent / 100));
                this.total.vat += line.AmountCurrency - net;
                this.total.sum += line.AmountCurrency || 0;
                this.total.net += net;
            });

            if (this.isPaymentOnly) {
                const net = this.payment.AmountCurrency;

                this.total.vat += this.payment.AmountCurrency - net;
                this.total.sum += this.payment.AmountCurrency || 0;
                this.total.net += net;
            }

            if (!agreements?.length || agreements.filter(a => a.StatusCode === 700005).length === 0) {
                this.VALUE_ITEMS[0].disabled = true;
                this.valueItemSelected(this.VALUE_ITEMS[1]);
            }

            this.busy = false;
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
        const obs = this.onlyToPayment ? of(true) : this.supplierInvoiceService.journal(this.supplierInvoice.ID);
        this.busy = true;

        obs.subscribe(() => {
            if (value === 1) {
                this.createPaymentAndSendToBank();
            } else {
                this.sendToPaymentList();
            }
        }, err => {
            this.busy = false;
            this.errorMessage = 'Noe gikk galt ved bokføring av regningen';
            this.errorSerivce.handle(err);
            this.errorOncloseValue = ActionOnReload.FailedToJournal;
        });
    }

    close() {
        this.onClose.emit(this.errorOncloseValue);
    }

    sendToPaymentList() {
        if (!this.isPaymentOnly) {
            this.supplierInvoiceService.sendForPayment(this.supplierInvoice.ID).subscribe(res => {
                this.onClose.emit(this.onlyToPayment ? ActionOnReload.SentToPaymentList : ActionOnReload.JournaledAndSentToPaymentList);
            }, err => {
                this.busy = false;
                this.errorMessage = 'Noe gikk galt ved oppretting av betaling, kunne ikke sende den til betalingslisten';
                this.errorSerivce.handle(err);
            });
        } else {
            this.savePayment(this.payment).subscribe((savedPayment) => {
                if (savedPayment) {
                    this.onClose.emit(this.onlyToPayment ? ActionOnReload.SentToPaymentList : ActionOnReload.JournaledAndSentToPaymentList);
                }
            }, err => {
                this.busy = false;
                this.errorMessage = 'Noe gikk galt ved oppretting av betaling, kunne ikke sende den til betalingslisten';
                this.errorSerivce.handle(err);
            });
        }
    }

    createPaymentAndSendToBank() {
        if (!this.isPaymentOnly) {
            // Creates a payment for the supplier invoice
            this.supplierInvoiceService.sendForPayment(this.supplierInvoice.ID).subscribe(payment => {
                // Send that batch to the bank directly
                this.sendAutobankPayment(payment);
            }, err => {
                this.busy = false;
                this.errorMessage = 'Noe gikk galt ved oppretting av betaling';
                this.errorSerivce.handle(err);
            });
        } else {
            this.savePayment(this.payment).subscribe((savedPayement) => {
                this.sendAutobankPayment(savedPayement);
            }, err => {
                this.busy = false;
                this.errorMessage = 'Noe gikk galt ved oppretting av betaling';
                this.errorSerivce.handle(err);
            });
        }
    }

    private sendAutobankPayment(payment: Payment) {
        this.paymentBatchService.sendAutobankPayment({ Code: null, Password: null, PaymentIds: [payment.ID] }).subscribe(() => {
            this.onClose.emit(this.onlyToPayment ? ActionOnReload.SentToBank : ActionOnReload.JournaledAndSentToBank);
        }, err => {
            this.busy = false;
            this.errorMessage = 'Betaling ble opprettet, men kunne ikke sende den til banken. Gå til Bank - Utbetalinger og send den på nytt.';
            this.errorSerivce.handle(err);
        });
    }

    private savePayment(payment): Observable<Payment> {
        return this.paymentService.ActionWithBody(
            null, payment, 'create-payment-with-tracelink',
            RequestMethod.Post, 'journalEntryID=' + this.journalEntryLine.JournalEntryID)
            .map((x: Payment) => x);
    }

    private getValueItems() {
        return [
            {
                selected: true,
                label: this.isPaymentOnly ? 'Send betalingen til banken nå' : 'Send regning til banken nå',
                infoText: (this.isPaymentOnly ? 'Betalingen' : 'Regningen') + ' vil bli sendt til banken. Du må logge deg på nettbanken din for å godkjenne utbetalingen',
                value: 1,
                disabled: false
            },
            {
                selected: false,
                label: 'Legg til betalingsliste',
                infoText: (this.isPaymentOnly ? 'Betalingen' : 'Regningen') + ' vil bli lagt til betalingslisten hvor du kan betale den senere eller betale flere samtidig.',
                value: 2,
                disabled: false
            }
        ];
    }
}

interface IValueItem {
    selected: boolean;
    label: string;
    infoText: string;
    value: number;
    disabled: boolean;
}
