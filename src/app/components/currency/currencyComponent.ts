import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'uni-currency-component',
    template: `
        <section class="fixed-position-toolbar">
            <uni-tabs
                class="application"
                [tabs]="childRoutes"
                [useRouterLinkTabs]="true">
            </uni-tabs>

            <router-outlet></router-outlet>
        </section>
    `
})
export class CurrencyComponent {
    public childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'Valutakurser', path: 'exchange'},
            {name: 'Valutaoverstyring', path: 'overrides'}
        ];
    }
}
