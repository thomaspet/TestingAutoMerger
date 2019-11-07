import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'uni-reminder',
    templateUrl: './reminder.html'
})
export class Reminder {
    public childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Klar til purring', path: 'ready'},
            {name: 'Purringer', path: 'reminded'},
            {name: 'Klar til inkasso', path: 'debtcollect'},
            {name: 'Sendt til inkasso', path: 'senttodebtcollect'}
        ];
    }
}
