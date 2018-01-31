import {Component} from '@angular/core';
import {IUniTabsRoute} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-marketplace',
    template: `
    <section class="title">
        <span>uni</span><span>Economy</span><span>markedsplass</span>
    </section>
    <uni-tabs [routes]="childRoutes" class="horizontal_nav"></uni-tabs>
    <router-outlet></router-outlet>
`
})
export class Marketplace {
    private childRoutes: IUniTabsRoute[];

    constructor() {
        this.childRoutes = [
            {name: 'MODULER', path: 'add-ons'},
            {name: 'WEBINARER', path: 'webinars'},
            {name: 'INTEGRASJONER', path: 'integrations'}
        ];
    }
}
