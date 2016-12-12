import {Component} from '@angular/core';
import {UniTabs, IUniTabsRoute} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-bank-component',
    template: `
    <uni-tabs [routes]="childRoutes" class="horizontal_nav"></uni-tabs>
    <router-outlet></router-outlet>`
})
export class BankComponent {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'Betalingsliste', path: 'payments'},
            {name: 'Betalingsbunter', path: 'batches'}
        ];
    }
}