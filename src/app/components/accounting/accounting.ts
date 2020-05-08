import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-accounting',
    template: `
        <uni-widget-canvas
            [defaultLayout]="widgetLayout"
            [layoutName]="'accounting'">
        </uni-widget-canvas>
    `,
})
export class UniAccounting {
    widgetLayout: DefaultWidgetLayout = theme.accountingDashboardConfig;

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Regnskap',
             url: '/accounting',
             moduleID: UniModules.Accounting,
             active: true
        });
    }
}
