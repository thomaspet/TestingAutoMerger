import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {DefaultWidgetLayout} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-sales',
    template: `
        <uni-widget-canvas
            [defaultLayout]="widgetLayout"
            [layoutName]="'sales'">
        </uni-widget-canvas>
    `,
})
export class UniSales {
    widgetLayout: DefaultWidgetLayout = this.getDefaultLayout();

    constructor(private tabService: TabService) {
        this.tabService.addTab({
             name: 'Salg',
             url: '/sales',
             moduleID: UniModules.Sales,
             active: true
        });
    }

    private getDefaultLayout() {
        return {
            large: [
                { x: 0, y: 0, widgetID: 'invoiced' },
                { x: 5, y: 0, widgetID: 'chart_restamount_per_customer' },
                { x: 5, y: 3, widgetID: 'unpaid_customerinvoice' },
                { x: 0, y: 3, widgetID: 'topten_customers' },

                { x: 9, y: 0, widgetID: 'sum_order_reserves' },
                { x: 9, y: 1, widgetID: 'sum_overdue_invoices' },
                { x: 9, y: 2, widgetID: 'count_customer' },
                { x: 9, y: 3, widgetID: 'sum_products' },
                { x: 0, y: 6, widgetID: 'transaction_sales' }
            ],
            medium: [
                { x: 0, y: 0, widgetID: 'sum_order_reserves' },
                { x: 3, y: 0, widgetID: 'sum_overdue_invoices' },
                { x: 6, y: 0, widgetID: 'count_customer' },

                { x: 0, y: 1, widgetID: 'invoiced' },
                { x: 5, y: 1, widgetID: 'unpaid_customerinvoice' },
                { x: 0, y: 4, widgetID: 'topten_customers' },
                { x: 5, y: 4, widgetID: 'chart_restamount_per_customer' },
                { x: 0, y: 7, widgetID: 'transaction_sales' }
            ],
            // small: [
            //     { x: 0, y: 0, widgetID: 'sum_order_reserves' },
            //     { x: 3, y: 0, widgetID: 'sum_overdue_invoices' },
            //     { x: 0, y: 1, widgetID: 'count_customer' },
            //     { x: 3, y: 1, widgetID: 'sum_products' },

            //     { x: 0, y: 1, widgetID: 'invoiced' },
            //     { x: 5, y: 1, widgetID: 'unpaid_customerinvoice' },
            //     { x: 0, y: 4, widgetID: 'topten_customers' },
            //     { x: 5, y: 4, widgetID: 'chart_restamount_per_customer' },
            //     { x: 0, y: 7, widgetID: 'transaction_sales' }
            // ]
        };
    }
}
