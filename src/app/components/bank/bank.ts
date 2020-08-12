import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {DashboardConfig} from '../common/dashboard/dashboard';

@Component({
    selector: 'uni-bank',
    template: `<dashboard [config]="config"></dashboard>`,
})

export class UniBank {
    config: DashboardConfig = theme.dashboardConfigs?.bank;
}
