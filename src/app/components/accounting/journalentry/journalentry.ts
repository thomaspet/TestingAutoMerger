import {Component} from '@angular/core';
import {UniTabs, IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
@Component({
    selector: 'journal-entry',
    templateUrl: 'app/components/accounting/journalentry/journalentry.html'
})
export class JournalEntry {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'Bilagsregistrering', path: 'manual'},
            {name: 'Betaling', path: 'payments'},
            {name: 'Leverandørfaktura', path: 'supplierinvoices'},
        ];
    }
}
