import {Component} from '@angular/core';
import {UniTabs, IUniTabsRoute} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-reminder',
    templateUrl: 'app/components/sales/reminder/reminder.html'
})
export class Reminder {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'Klar til purring', path: 'ready'},
            {name: 'Purringer', path: 'reminded'},
            {name: 'Klar til inkasso', path: 'debtcollect'}
        ];
    }
}
