import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { SupplierInvoice } from '@uni-entities';

@Component({
    selector: 'to-payment-modal',
    templateUrl: './to-payment-modal.html',
    styleUrls: ['./to-payment-modal.sass']
})
export class ToPaymentModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean = false;
    current: SupplierInvoice;
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
            value: '1',
            disabled: false
        },
        {
            selected: false,
            label: 'Legg til betalingsliste',
            infoText: 'Regningen vil bli lagt til betalingslisten hvor du kan betale den senere eller betale flere samtidig.',
            value: '2',
            disabled: false
        }
    ];

    constructor( ) {}

    ngOnInit() {
        this.current = this.options?.data?.current;

        this.current.JournalEntry.DraftLines.filter(line => line.AmountCurrency > 0).forEach(line => {

            const vat = !line.VatType ? 0 : line.AmountCurrency * (line.VatType.VatPercent / 100);
            this.total.vat += vat || 0;
            this.total.net += (line.AmountCurrency - vat) || 0;
            this.total.sum += line.AmountCurrency || 0;
        });

        if (!this.options?.data?.canSendToPayment) {
            this.VALUE_ITEMS[0].disabled = true;
            this.valueItemSelected(this.VALUE_ITEMS[1]);
        }

    }

    valueItemSelected(item: any) {
        if (item.selected || item.disabled) {
            return;
        } else {
            this.VALUE_ITEMS.forEach(i => i.selected = false);
            item.selected = true;
        }
    }

    close() {
        const value = parseInt(this.VALUE_ITEMS.find(i => i.selected).value, 10);
        this.onClose.emit(value);
    }

    cancel() {
        this.onClose.emit(null);
    }
}
