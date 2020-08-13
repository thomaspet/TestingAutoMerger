import {Component} from '@angular/core';
import {DashboardConfig} from '../common/dashboard/dashboard';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-sales',
    template: `<dashboard [config]="config"></dashboard>`,
})
export class UniSales {
    config: DashboardConfig = theme.dashboardConfigs?.sales;
}
