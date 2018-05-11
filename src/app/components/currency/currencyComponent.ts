import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-currency-component',
    template: `
    <uni-tabs class="application" [tabs]="childRoutes"></uni-tabs>
    <router-outlet></router-outlet>`
})
export class CurrencyComponent {
    private childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Valutakurser', path: 'exchange'},
            {name: 'Valutaoverstyring', path: 'overrides'}
        ];
    }
}
