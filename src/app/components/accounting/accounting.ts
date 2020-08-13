import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {DashboardConfig} from '../common/dashboard/dashboard';

@Component({
    selector: 'uni-accounting',
    template: `<dashboard [config]="config"></dashboard>`,
})
export class UniAccounting {
    config: DashboardConfig = theme.dashboardConfigs?.accounting;
}
