import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'journal-entry',
    templateUrl: './journalentry.html'
})
export class JournalEntry {
    public childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Bilagsføring', path: 'manual'},
            {name: 'Innbetalinger', path: 'payments'},
            // {name: 'Leverandørfaktura', path: 'bills'}
        ];
    }
}
