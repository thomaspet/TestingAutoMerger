import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';
import {ToastService} from '../../../framework/uniToast/toastService';

@Component({
    selector: 'uni-sales',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'sales'">
        </uni-widget-canvas>
    `,
})
export class UniSales {
    private widgetLayout: IUniWidget[] = [];

    constructor(
        private tabService: TabService,
        private toastService: ToastService
    ) {
        this.tabService.addTab({
             name: 'Salg',
             url: '/sales',
             moduleID: UniModules.Sales,
             active: true
        });

        this.widgetLayout = this.getDefaultLayout();
    }

    private getDefaultLayout(): any[] {
        return [
            {
                x: 3,
                y: 0,
                widgetID: 'shortcut_sales_customers',
            },
            {
                x: 4,
                y: 0,
                widgetID: 'shortcut_sales_products',
            },
            {
                x: 5,
                y: 0,
                widgetID: 'shortcut_overview',
            },
            {
                x: 0,
                y: 0,
                widgetID: 'shortcut_sales_quotes',
            },
            {
                x: 1,
                y: 0,
                widgetID: 'shortcut_sales_orders',
            },
            {
                x: 2,
                y: 0,
                widgetID: 'shortcut_sales_invoices',
            },
            {
                x: 6,
                y: 0,
                widgetID: 'sum_overdue_invoices',
            },
            {
                x: 9,
                y: 0,
                widgetID: 'clock',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'chart_restamount_per_customer',
            },
            {
                x: 4,
                y: 4,
                widgetID: 'topten_customers',
            },
            {
                x: 0,
                y: 1,
                widgetID: 'transaction_sales',
            },
            {
                x: 8,
                y: 1,
                widgetID: 'shortcut_list_sales',
            },
            {
                x: 10,
                y: 1,
                widgetID: 'currency',
            },
            {
                x: 10,
                y: 2,
                widgetID: 'sum_order_reserves',
            },
            {
                widgetID: 'rss',
            },
        ];
    }
}
