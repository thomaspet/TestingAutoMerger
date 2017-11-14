import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {BureauAccountingTab} from './bureauAccountingTab';
import {BureauSalarTab} from './bureauSalaryTab';
import {BureauSalesTab} from './bureauSalesTab';
import {BureauHoursTab} from './bureauHoursTab';

export const TABS = [
    BureauAccountingTab,
    BureauSalarTab,
    BureauSalesTab,
    BureauHoursTab
];

@Component({
    selector: 'uni-dashboard-detail-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <header class="horizontal_nav no-print">
        <ul>
            <li class="horizontal_nav" (click)="activateTab(ACCOUNTING)">
                <a [class.router-link-active]="activeTab === ACCOUNTING">
                    Regnskap
                </a>
            </li>
            <li class="horizontal_nav" (click)="activateTab(SALES)">
                <a [class.router-link-active]="activeTab === SALES">
                    Salg
                </a>
            </li>
            <li class="horizontal_nav" (click)="activateTab(SALARY)">
                <a [class.router-link-active]="activeTab === SALARY">
                    Lønn
                </a>
            </li>
            <li class="horizontal_nav" (click)="activateTab(HOURS)">
                <a [class.router-link-active]="activeTab === HOURS">
                    Time
                </a>
            </li>
        </ul>
    </header>
    <uni-bureau-accounting-tab
        *ngIf="activeTab === ACCOUNTING"
        [company]="company">
    </uni-bureau-accounting-tab>
    <uni-bureau-sales-tab
        *ngIf="activeTab === SALES"
        [company]="company">
    </uni-bureau-sales-tab>
    <uni-bureau-salary-tab
        *ngIf="activeTab === SALARY"
        [company]="company">
    </uni-bureau-salary-tab>
    <uni-bureau-hours-tab
        *ngIf="activeTab === HOURS"
        [company]="company">
    </uni-bureau-hours-tab>
`
})
export class BureauDetails {
    @Input() public company: KpiCompany;

    public SALES: string = 'sales';
    public ACCOUNTING: string = 'accounting';
    public SALARY: string = 'salary';
    public HOURS: string = 'hours';

    public activeTab: string = this.ACCOUNTING;

    public activateTab(tab: string) {
        this.activeTab = tab;
    }
}
