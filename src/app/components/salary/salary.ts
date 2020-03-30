import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';
import { theme } from '../../../themes/theme';


@Component({
    selector: 'uni-salary',
    template: `
        <uni-widget-canvas
            [defaultLayout]="widgetLayout"
            [layoutName]="'salary'">
        </uni-widget-canvas>
    `,
})
export class UniSalary {
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

