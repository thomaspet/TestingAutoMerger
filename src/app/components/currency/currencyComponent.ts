import {Component} from '@angular/core';
import {UniTabs, IUniTabsRoute} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-currency-component',
    template: `
    <uni-tabs [routes]="childRoutes" class="horizontal_nav"></uni-tabs>
    <router-outlet></router-outlet>`
})
export class CurrencyComponent {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'Valutakurser', path: 'exchange'},
            {name: 'Valutaoverstyring', path: 'overrides'}
        ];
    }
}