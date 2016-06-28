import {Component} from '@angular/core';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'journalentries',
    templateUrl: 'app/components/accounting/journalentry/journalentries/journalentries.html',
    directives: [JournalEntryManual],    
})
export class JournalEntries {    
    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Bilagsregistrering', url: '/accounting/journalentry/manual', moduleID: 7, active: true });
    }
}