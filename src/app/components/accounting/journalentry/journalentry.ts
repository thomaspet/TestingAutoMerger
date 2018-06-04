import {Component} from '@angular/core';
import {IUniTab} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'journal-entry',
    templateUrl: './journalentry.html'
})
export class JournalEntry {
    public childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Bilagsregistrering', path: 'manual'},
            {name: 'Innbetalinger', path: 'payments'},
            {name: 'Fakturamottak', path: 'bills'}
        ];
    }
}
