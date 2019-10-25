import {Component, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {StatisticsService} from '@app/services/services';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'done-redirect-modal',
    templateUrl: './done-redirect-modal.html',
    styleUrls: [ '../expense.sass' ]
})
export class DoneRedirectModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    withPayment: boolean;
    journalEntryNumber: any;
    msg: string = '';
    url: string = '';

    constructor( private router: Router ) { }

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

    close() {
        this.onClose.emit(false);
    }

    navigate(url: string) {

        this.router.navigateByUrl(url);
        this.close();
    }
}
