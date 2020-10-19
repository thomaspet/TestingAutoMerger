import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { SupplierInvoice, Payment, InvoicePaymentData, JournalEntryLine } from '@uni-entities';
import { SupplierInvoiceService, ErrorService, PaymentService, PaymentBatchService } from '@app/services/services';
import {ActionOnReload} from '../../journal-and-pay-helper';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { RequestMethod } from '@uni-framework/core/http';
import { UniFieldLayout } from '@uni-framework/ui/uniform/interfaces';
import { FieldType } from '@uni-framework/ui/uniform';
import * as moment from 'moment';

@Component({
    selector: 'to-payment-modal',
    templateUrl: './to-payment-modal.html',
    styleUrls: ['./to-payment-modal.sass']
})
export class ToPaymentModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    supplierInvoice: SupplierInvoice;
    current$ = new BehaviorSubject(null);
    fields$ = [];
    payment: InvoicePaymentData;
    journalEntryLine: JournalEntryLine;
    isPaymentOnly: boolean;

    busy = true;
    onlyToPayment = false;
    hasErrors = false;
    errorMessage = '';
    errorOncloseValue = 0;
    accounts: any[] = [];
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
        this.accounts = this.options?.data?.accounts;
        this.fields$ = this.getFormFields();
        this.payment = this.options?.data?.payment;
        this.current$.next(this.payment);
        this.journalEntryLine = this.options?.data?.journalEntryLine;
        this.isPaymentOnly = this.options?.data?.isPaymentOnly ?? false;
        this.onlyToPayment = this.options?.data?.onlyToPayment;

        this.supplierInvoice['_mainAccount'] = this.supplierInvoice['_mainAccount'] || this.accounts[0];

        this.VALUE_ITEMS = this.getValueItems();

        this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
            this.supplierInvoice?.JournalEntry?.DraftLines.filter(line => line.AmountCurrency > 0).forEach(line => {
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
            this.supplierInvoiceService.sendForPaymentWithData(this.supplierInvoice.ID, this.payment).subscribe(res => {
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
            this.supplierInvoiceService.sendForPaymentWithData(this.supplierInvoice.ID, this.payment).subscribe(payment => {
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

    getFormFields() {
        return [
            {
                Property: 'Amount',
                FieldType: FieldType.NUMERIC,
                Label: 'Sum til betaling',
                Classes: 'bill-small-field right',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'PaymentDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato',
                Classes: 'bill-small-field right',
            },
            {
                Property: 'FromBankAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Betal fra konto',
                Hidden: !this.accounts.length,
                Options: {
                    source: this.accounts,
                    valueProperty: 'ID',
                    template: (item) => item.AccountNumber + ' - ' + item.AccountName,
                    debounceTime: 200,
                    searchable: false,
                    hideDeleteButton: true,
                }
            },
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
