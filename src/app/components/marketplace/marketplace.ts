import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-marketplace',
    template: `
    <section class="title">
        <span>uni</span><span>Economy</span><span>markedsplass</span>
    </section>

    <section class="application">
        <uni-tabs [tabs]="childRoutes"></uni-tabs>
        <section class="uni-container">
            <router-outlet></router-outlet>
        </section>
    </section>
`
})
export class Marketplace {
    private childRoutes: IUniTab[];

    constructor() {
        this.childRoutes = [
            {name: 'MODULER', path: 'add-ons'},
            {name: 'WEBINARER', path: 'webinars'},
            {name: 'INTEGRASJONER', path: 'integrations'}
        ];
    }
}
