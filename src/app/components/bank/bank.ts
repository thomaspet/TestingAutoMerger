import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';

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
    widgetLayout: DefaultWidgetLayout = this.getDefaultLayout();

    constructor (private tabService: TabService) {
        this.tabService.addTab({
             name: 'Bank',
             url: '/bank',
             moduleID: UniModules.Bank,
             active: true
        });
    }

    private getDefaultLayout() {
        return {
            large: [
                // { x: 0, y: 0, widgetID: 'reconciliation_list' },
                { x: 0, y: 0, widgetID: 'payment_no_match' },
                { x: 0, y: 1, widgetID: 'payment_list' },
                { x: 0, y: 2, widgetID: 'shortcut_list_bank', },
                { x: 3, y: 0, widgetID: 'payment_chart', },
                { x: 3, y: 4, widgetID: 'autobank_agreements' },
                { x: 6, y: 4, widgetID: 'customers_with_avtalegiro' },
            ]
        };
    }
}
