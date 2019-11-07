import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'expense-summary',
    templateUrl: 'summary.html',
    styleUrls: ['summary.sass']
})
export class ExpenseSummaryModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    session: BankJournalSession;
    withPayment: boolean;
    vatSummary: { sum: number, details: Array<{ vatPercent: number, sum: number }> };
    accList: Array<{ name: string, sum: number }>;

    ngOnInit() {
        this.session = this.options.data.session;
        this.withPayment = this.options.data.withPayment;
        this.vatSummary = this.session.getVatSummary();
        this.accList = this.session.items.map( x => ({ name: x.Debet.superLabel, sum: x.Amount }) );
    }

    complete() {
        this.onClose.emit(true);
    }
}
