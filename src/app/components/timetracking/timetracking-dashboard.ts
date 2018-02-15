import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'timetracking-dashboard',
    template: `
    <uni-widget-canvas [defaultLayout]="widgetLayout"
        [layoutName]="'timetracking'">
    </uni-widget-canvas>
    `,
})
export class TimetrackingDashboard {
    private widgetLayout: IUniWidget[] = [];

    constructor(private tabService: TabService) {
        this.tabService.addTab({
             name: 'Timer',
             url: '/timetracking',
             moduleID: UniModules.Timesheets,
             active: true
        });

        this.widgetLayout = this.getDefaultLayout();
    }

    private getDefaultLayout(): any[] {
        return [
            {
                widgetID: 'shortcut_timetracking_worktypes',
                y: 0,
                x: 0
            },
            {
                widgetID: 'shortcut_timetracking_workers',
                y: 0,
                x: 1
            },
            {
                widgetID: 'shortcut_timetracking_invoice_hours',
                y: 0,
                x: 2
            },
            {
                widgetID: 'shortcut_timetracking_reports',
                y: 0,
                x: 3
            },
            {
                widgetID: 'shortcut_timetracking_timeentry',
                y: 0,
                x: 4
            },
            {
                widgetID: 'clock',
                y: 0,
                x: 5
            },
            {
                y: 1,
                x: 0,
                widgetID: 'chart_minutes_per_wagetype',
            },
            {
                y: 1,
                x: 3,
                widgetID: 'shortcut_list_timetracking',
            },

            {
                y: 4,
                x: 0,
                widgetID: 'info_shortcut_videos',
            },
            {
                y: 4,
                x: 2,
                widgetID: 'info_shortcut_help',
            },
            {
                y: 4,
                x: 4,
                widgetID: 'info_shortcut_overview',
            },
            {
                widgetID: 'rss',
            },
        ];
    }
}
