import {Component} from '@angular/core';
import {theme} from '../../../themes/theme';
import {DashboardConfig} from '../common/dashboard/dashboard';


@Component({
    selector: 'uni-salary',
    template: `<dashboard [config]="config"></dashboard>`,
})
export class UniSalary {
    config: DashboardConfig = theme.dashboardConfigs?.salary;
}

