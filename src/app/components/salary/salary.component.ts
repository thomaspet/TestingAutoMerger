import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {DashboardConfig} from '../common/dashboard/dashboard';

@Component({
    selector: 'uni-salary',
    template: `<dashboard [config]="config"></dashboard>`,
})
export class SalaryComponent {
    config: DashboardConfig = theme.dashboardConfigs?.salary;
}

