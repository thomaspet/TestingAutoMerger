import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';

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
    widgetLayout: DefaultWidgetLayout = this.getDefaultLayout();

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Regnskap',
             url: '/accounting',
             moduleID: UniModules.Accounting,
             active: true
        });
    }

    private getDefaultLayout() {
        return {
            large: [
                { x: 0, y: 0, widgetID: 'operatingprofit' },
                { x: 6, y: 0, widgetID: 'expenses' },

                { x: 9, y: 0, widgetID: 'sum_inbox' },
                { x: 9, y: 1, widgetID: 'sum_payment_list' },
                { x: 9, y: 2, widgetID: 'payment_no_match' },

                { x: 0, y: 4, widgetID: 'balance' },
                { x: 5, y: 4, widgetID: 'unpaid_supplierinvoice' }
            ],
            medium: [
                { x: 0, y: 0, widgetID: 'sum_inbox' },
                { x: 3, y: 0, widgetID: 'sum_payment_list' },
                { x: 6, y: 0, widgetID: 'payment_no_match' },

                { x: 0, y: 1, widgetID: 'operatingprofit' },
                { x: 6, y: 1, widgetID: 'expenses' },

                { x: 0, y: 5, widgetID: 'balance' },
                { x: 5, y: 5, widgetID: 'unpaid_supplierinvoice' },
            ],
            small: [
                { x: 0, y: 0, widgetID: 'expenses' },

                { x: 3, y: 0, widgetID: 'sum_inbox' },
                { x: 3, y: 1, widgetID: 'sum_payment_list' },
                { x: 3, y: 2, widgetID: 'payment_no_match' },

                { x: 0, y: 4, widgetID: 'operatingprofit' },
                { x: 0, y: 8, widgetID: 'balance' },
                { x: 0, y: 11, widgetID: 'unpaid_supplierinvoice' }
            ],
            xs: [
                { x: 0, y: 0, widgetID: 'sum_inbox' },
                { x: 0, y: 1, widgetID: 'sum_payment_list' },
                { x: 0, y: 2, widgetID: 'payment_no_match' },

                { x: 0, y: 3, widgetID: 'expenses' },
                { x: 0, y: 7, widgetID: 'balance' },
                { x: 0, y: 10, widgetID: 'operatingprofit' },
                { x: 0, y: 15, widgetID: 'unpaid_supplierinvoice' }
            ]
        };
    }
}
