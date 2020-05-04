import {Component, ChangeDetectionStrategy} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'uni-dashboard-detail-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <uni-tabs [tabs]="tabs" [useRouterLinkTabs]="true"></uni-tabs>
        <ng-content></ng-content>
    `
})
export class BureauDetails {
    public tabs: IUniTab[] = [
        {name: 'Oppgaver', path: 'tasks'},
        {name: 'Firma', path: 'company'},
        {name: 'Regnskap', path: 'accounting'},
        {name: 'Salg', path: 'sales'},
        {name: 'Lønn', path: 'salary'},
        {name: 'Time', path: 'hours'},
    ];
}
