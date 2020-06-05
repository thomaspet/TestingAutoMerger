import {Component} from '@angular/core';
import { DefaultWidgetLayout } from '../widgets/widgetCanvas';
import { TabService, UniModules } from '../layout/navbar/tabstrip/tabService';
import { theme } from 'src/themes/theme';


@Component({
    selector: 'uni-salary',
    template: `
        <uni-widget-canvas
            [defaultLayout]="widgetLayout"
            [layoutName]="'salary'">
        </uni-widget-canvas>
    `,
})
export class SalaryComponent {
    widgetLayout: DefaultWidgetLayout = theme.salaryDashboardConfig;

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Lønn',
             url: '/salary',
             moduleID: UniModules.Salary,
             active: true
        });
    }
}

