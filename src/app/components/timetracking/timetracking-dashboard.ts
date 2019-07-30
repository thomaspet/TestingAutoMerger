import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';

@Component({
    selector: 'timetracking-dashboard',
    template: `
    <uni-widget-canvas
        [defaultLayout]="widgetLayout"
        [layoutName]="'timetracking'">
    </uni-widget-canvas>
    `,
})
export class TimetrackingDashboard {
    widgetLayout: DefaultWidgetLayout = this.getDefaultLayout();

    constructor(private tabService: TabService) {
        this.tabService.addTab({
             name: 'Timer',
             url: '/timetracking',
             moduleID: UniModules.Timesheets,
             active: true
        });
    }

    private getDefaultLayout() {
        return {
            large: [
                { x: 0, y: 0, widgetID: 'sum_hours' },
                { x: 0, y: 1, widgetID: 'timetracking_calendar' },

                { x: 3, y: 0, widgetID: 'project_percent' },
                { x: 7, y: 0, widgetID: 'chart_minutes_per_wagetype' },
            ]
        };
    }
}
