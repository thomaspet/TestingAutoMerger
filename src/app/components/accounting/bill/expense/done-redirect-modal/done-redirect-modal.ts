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

    constructor() { }

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.withPayment = this.options.data.withPayment;
            this.journalEntryNumber = this.options.data.journalEntryNumber;

            this.url = `/accounting/transquery?JournalEntryNumber=${this.options.data.number}&`
            + `AccountYear=${this.options.data.year}`;

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
