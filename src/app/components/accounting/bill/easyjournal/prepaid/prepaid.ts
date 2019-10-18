import { Component, Input } from '@angular/core';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'easyjournal-prepaid',
    templateUrl: 'prepaid.html',
    styleUrls: ['prepaid.sass']
})
export class EasyJournalPrepaid {
    @Input() session: BankJournalSession;

}
