import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {DashboardConfig} from '../common/dashboard/dashboard';

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    config: DashboardConfig = theme.dashboardConfigs?.main;
}
