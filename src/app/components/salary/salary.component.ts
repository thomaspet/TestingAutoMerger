import {Component} from '@angular/core';
import { DefaultWidgetLayout } from '../widgets/widgetCanvas';
import { theme } from 'dist/themes/theme.ext01';
import { TabService, UniModules } from '../layout/navbar/tabstrip/tabService';


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

