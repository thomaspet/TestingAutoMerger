import {Component} from '@angular/core';
import {IUniTab} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-reminder',
    templateUrl: './reminder.html'
})
export class Reminder {
    private childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Klar til purring', path: 'ready'},
            {name: 'Purringer', path: 'reminded'},
            {name: 'Klar til inkasso', path: 'debtcollect'}
        ];
    }
}
