import {Component} from '@angular/core';
import {IUniTabsRoute} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'journal-entry',
    templateUrl: './journalentry.html'
})
export class JournalEntry {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'Bilagsregistrering', path: 'manual'},
            {name: 'Innbetalinger', path: 'payments'},
            {name: 'Fakturamottak', path: 'bills'}
        ];
    }
}
