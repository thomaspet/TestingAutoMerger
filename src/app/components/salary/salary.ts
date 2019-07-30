import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';

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
    widgetLayout: DefaultWidgetLayout = this.getDefaultLayout();

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Lønn',
             url: '/salary',
             moduleID: UniModules.Salary,
             active: true
        });
    }

    private getDefaultLayout() {
        return {
            large: [
                {
                    x: 5,
                    y: 0,
                    widgetID: 'shortcut_list_salary',
                },
                {
                    x: 0,
                    y: 3,
                    widgetID: 'transaction_salary',
                },
                {
                    x: 0,
                    y: 0,
                    widgetID: 'chart_employees_per_employment',
                },
                {
                    x: 8,
                    y: 0,
                    widgetID: 'sum_employees',
                },
                {
                    x: 8,
                    y: 1,
                    widgetID: 'sum_employments',
                },
                {
                    x: 8,
                    y: 2,
                    widgetID: 'sum_wagetypes',
                },
                {
                    x: 8,
                    y: 3,
                    widgetID: 'counter_salary_travels'
                },
            ]
        };
    }
}

