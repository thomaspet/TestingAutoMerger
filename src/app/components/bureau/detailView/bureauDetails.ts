import {Component, ChangeDetectionStrategy} from '@angular/core';
import {BureauAccountingTab} from './bureauAccountingTab';
import {BureauSalaryTab} from './bureauSalaryTab';
import {BureauSalesTab} from './bureauSalesTab';
import {BureauHoursTab} from './bureauHoursTab';
import {BureauCompanyTab} from './bureauCompanyTab';
import {BureauTaskTab} from './bureauTasksTab';
import { IUniTab } from '@uni-framework/uni-tabs';

export const TABS = [
    BureauTaskTab,
    BureauCompanyTab,
    BureauAccountingTab,
    BureauSalaryTab,
    BureauSalesTab,
    BureauHoursTab,
];

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
