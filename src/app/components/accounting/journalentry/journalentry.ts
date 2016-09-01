import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {UniTabs, IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
@Component({
    selector: 'journal-entry',
    templateUrl: 'app/components/accounting/journalentry/journalentry.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
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
