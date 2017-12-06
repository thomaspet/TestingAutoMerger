import {Component, ChangeDetectionStrategy} from '@angular/core';
import {BureauAccountingTab} from './bureauAccountingTab';
import {BureauSalaryTab} from './bureauSalaryTab';
import {BureauSalesTab} from './bureauSalesTab';
import {BureauHoursTab} from './bureauHoursTab';
import {BureauCompanyTab} from './bureauCompanyTab';
import {BureauTaskTab} from './bureauTasksTab';

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
    <header class="horizontal_nav no-print">
        <ul>
            <li class="horizontal_nav">
                <a routerLink="tasks" routerLinkActive="router-link-active">
                    Oppgaver
                </a>
            </li>
            <li class="horizontal_nav">
                <a routerLink="company" routerLinkActive="router-link-active">
                    Firma
                </a>
            </li>
            <li class="horizontal_nav">
                <a routerLink="accounting" routerLinkActive="router-link-active">
                    Regnskap
                </a>
            </li>
            <li class="horizontal_nav">
                <a routerLink="sales" routerLinkActive="router-link-active">
                    Salg
                </a>
            </li>
            <li class="horizontal_nav">
                <a routerLink="salary" routerLinkActive="router-link-active">
                    Lønn
                </a>
            </li>
            <li class="horizontal_nav">
                <a routerLink="hours" routerLinkActive="router-link-active">
                    Time
                </a>
            </li>
        </ul>
    </header>
    <ng-content></ng-content>
`
})
export class BureauDetails {}
