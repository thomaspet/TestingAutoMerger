import {Component, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'done-redirect-modal',
    templateUrl: './done-redirect-modal.html',
    styleUrls: [ '../expense.sass' ]
})
export class DoneRedirectModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<string> = new EventEmitter();

    withPayment: boolean;
    journalEntryNumber: any;
    msg: string = '';
    url: string = '';
    paymentUrl: string = '';
    paymentJournalEntry: string = '';

    constructor() { }

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.withPayment = this.options.data.withPayment;
            this.journalEntryNumber = this.options.data.journalEntryNumber;
            this.paymentJournalEntry = this.options.data.paymentJournalEntry;

            this.url = `/accounting/transquery?JournalEntryNumber=${this.options.data.number}&`
            + `AccountYear=${this.options.data.year}`;

            if (this.paymentJournalEntry) {
                this.paymentUrl = `/accounting/transquery?JournalEntryNumber=${this.paymentJournalEntry.split('-')[0]}&`
                + `AccountYear=${this.paymentJournalEntry.split('-')[1]}`;
            }

            this.msg += this.withPayment
            ? 'Betaling vil ikke bli sendt til bank før du manuelt gjør dette i betalingslisten. '
            + 'Du finner betalingslisten under menyvalget Bank - Utbetalinger, eller du kan tykke på "Gå til betalingsliste" under.'
            : '';
        }
    }

    close(url: string) {
        this.onClose.emit(url);
    }
}
