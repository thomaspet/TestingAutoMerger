import {Component, OnDestroy} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'uni-salary',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'salary'">
        </uni-widget-canvas>
    `,
})
export class UniSalary {
    private widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Lønn',
             url: '/salary',
             moduleID: UniModules.Salary,
             active: true
        });

        this.widgetLayout = this.getLayout();
    }

    private getLayout() {
        if (environment.TRAVEL_DEACTIVATED) {
            return this.getDefaultLayout().filter(x => x.widgetID !== 'counter_salary_travels');
        }
        return this.getDefaultLayout();
    }

    private getDefaultLayout(): any[] {
        return [
            {
                x: 0,
                y: 0,
                widgetID: 'shortcut_salary_employees',
            },

            {
                x: 1,
                y: 0,
                widgetID: 'shortcut_salary_wagetypes',
            },

            {
                x: 2,
                y: 0,
                widgetID: 'shortcut_salary_payrollrun',
            },

            {
                x: 3,
                y: 0,
                widgetID: 'shortcut_salary_amelding',
            },
            {
                x: 4,
                y: 0,
                widgetID: 'counter_salary_travels'
            },
            {
                x: 5,
                y: 0,
                widgetID: 'clock',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'chart_employees_per_employment',
            },
            {
                x: 2,
                y: 1,
                widgetID: 'transaction_salary',
            },
            {
                x: 0,
                y: 1,
                widgetID: 'shortcut_list_salary',
            },
            {
                x: 4,
                y: 4,
                widgetID: 'info_shortcut_overview',
            },
            {
                widgetID: 'rss',
            },
        ];
    }
}

