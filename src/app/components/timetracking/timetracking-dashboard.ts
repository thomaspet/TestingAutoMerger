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
    public widgetLayout: IUniWidget[] = [];

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
                widgetID: 'shortcuts_timetracking',
                y: 0,
                x: 0
            },
            {
                widgetID: 'sum_hours',
                y: 0,
                x: 5
            },
            {
                widgetID: 'clock',
                y: 0,
                x: 7
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
                y: 1,
                x: 5,
                widgetID: 'info_shortcut_videos',
            },
            {
                y: 1,
                x: 7,
                widgetID: 'info_shortcut_overview',
            },
        ];
    }
}
