import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';

@Component({
    selector: 'journalentries',
    templateUrl: 'app/components/accounting/journalentry/journalentries/journalentries.html'
})
export class JournalEntries {
    @ViewChild(JournalEntryManual) private journalEntryManual;

    private toolbarConfig = {
        title: 'Bilagsregistrering'
    }

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Bilagsregistrering', url: '/accounting/journalentry/manual', moduleID: UniModules.Accounting, active: true });
    }
}
