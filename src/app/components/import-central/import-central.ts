import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'approval-flow',
    template: `
        <uni-toolbar [config]="{title: 'Importsentral'}"></uni-toolbar>
        <section style="width: calc(100% - 4rem);" class="application uni-redesign">
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
