import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'approval-flow',
    template: `
        <uni-toolbar [config]="{title: 'Importsentral'}"></uni-toolbar>
        <section class="application uni-redesign">
            <uni-tabs [tabs]="tabs" [useRouterLinkTabs]="true"></uni-tabs>
            <router-outlet></router-outlet>
        </section>
    `
})
export class ImportCentral {
    tabs: IUniTab[] = [
        { name: 'Import', path: 'page' },
        { name: 'Logg', path: `log` }
    ];

}
