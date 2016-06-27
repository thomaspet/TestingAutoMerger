import {Component} from '@angular/core';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'payments',
    templateUrl: 'app/components/accounting/journalentry/payments/payments.html',
    directives: [JournalEntryManual],    
})
export class Payments {    
    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Betalinger', url: '/accounting/journalentry/payments', moduleID: 7, active: true });
    }
}