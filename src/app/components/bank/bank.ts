import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-bank',
    template: `
        <uni-widget-canvas
            [defaultLayout]="widgetLayout"
            [layoutName]="'bank'">
        </uni-widget-canvas>
    `,
})

export class UniBank {
    widgetLayout: DefaultWidgetLayout = theme.bankDashboardConfig;

    constructor (private tabService: TabService) {
        this.tabService.addTab({
             name: 'Bank',
             url: '/bank',
             moduleID: UniModules.Bank,
             active: true
        });
    }
}
