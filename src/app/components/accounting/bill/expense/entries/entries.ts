import { Component, Input } from '@angular/core';
import { BankJournalSession, DebitCreditEntry } from '@app/services/services';

@Component({
    selector: 'expense-entries',
    templateUrl: 'entries.html',
    styleUrls: ['entries.sass']
})
export class ExpenseEntries {
    @Input() session: BankJournalSession;

    addRow() {
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    removeRow(row: DebitCreditEntry) {
        const ix = this.session.items.indexOf(row);
        this.session.items.splice( ix, 1);
    }

    dropClick(mse: MouseEvent) {
        if (mse.offsetX > (<any>mse.target).clientWidth - 35) {
            console.log('Drop it down!');
        }
    }

    onEdit(fieldName: string, item: DebitCreditEntry, value: string) {
        console.log('onEdit:' + fieldName, value);
    }
}
