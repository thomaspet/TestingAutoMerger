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
    public widgetLayout: IUniWidget[];

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
                widgetID: 'shortcuts_salary'
            },
            {
                x: 6,
                y: 0,
                widgetID: 'counter_salary_travels'
            },
            {
                x: 9,
                y: 0,
                widgetID: 'shortcut_list_salary',
            },
            // {
            //     x: 8,
            //     y: 0,
            //     widgetID: 'info_shortcut_videos',
            // },
            // {
            //     x: 10,
            //     y: 0,
            //     widgetID: 'info_shortcut_overview',
            // },
            {
                x: 0,
                y: 1,
                widgetID: 'transaction_salary',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'chart_employees_per_employment',
            },

        ];
    }
}

