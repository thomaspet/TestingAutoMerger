import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    private layout: IUniWidget[];

    constructor(private tabService: TabService) {
        this.tabService.addTab({
            name: 'Klienter',
            url: '/bureau',
            moduleID: UniModules.BureauDashboard,
            active: true,
            sticky: true
        });

        this.layout = this.getWidgetLayout();
    }

    public getWidgetLayout(): IUniWidget[] {
        return [
            {
                height: 8,
                width: 9,
                x: 0,
                y: 0,
                widgetType: 'companyList',
                config: {}
            },
            {
                width: 3,
                height: 1,
                x: 9,
                y: 0,
                widgetType: 'clock',
                config: {
                    dateColor: '#7698bd',
                    showSeconds: true
                }
            },
        ];
    }
}
