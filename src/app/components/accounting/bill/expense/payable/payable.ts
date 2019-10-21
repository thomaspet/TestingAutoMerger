import { Component, Input } from '@angular/core';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'expense-payable',
    templateUrl: 'payable.html',
    styleUrls: ['payable.sass']
})
export class ExpensePayable {
    @Input() session: BankJournalSession;
}
