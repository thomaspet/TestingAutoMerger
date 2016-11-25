import {Component} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'journalentries',
    templateUrl: 'app/components/accounting/journalentry/journalentries/journalentries.html'
})
export class JournalEntries {

    private toolbarConfig = {
        title: 'Bilagsregistrering'
    }

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Bilagsregistrering', url: '/accounting/journalentry/manual', moduleID: UniModules.Accounting, active: true });
    }
}
