import { Component, Input } from '@angular/core';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'expense-prepaid',
    templateUrl: 'prepaid.html',
    styleUrls: ['prepaid.sass']
})
export class ExpensePrepaid {
    @Input() session: BankJournalSession;

}
