import {Component} from '@angular/core';
import {DashboardConfig} from '../common/dashboard/dashboard';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'timetracking-dashboard',
    template: `<dashboard [config]="config"></dashboard>`,
})
export class TimetrackingDashboard {
    config: DashboardConfig = theme.dashboardConfigs?.timetracking;
}
