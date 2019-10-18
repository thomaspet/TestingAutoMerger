import { Component, Input } from '@angular/core';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'easyjournal-payable',
    templateUrl: 'payable.html',
    styleUrls: ['payable.sass']
})
export class EasyJournalPayable {
    @Input() session: BankJournalSession;
}
