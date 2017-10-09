import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';

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
`
})
export class BureauDetails {
    @Input() public company: KpiCompany;

    public SALES = 'sales';
    public ACCOUNTING = 'accounting';

    public activeTab: string = this.ACCOUNTING;

    public activateTab(tab: string) {
        this.activeTab = tab;
    }
}
