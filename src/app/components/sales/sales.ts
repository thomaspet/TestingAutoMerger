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
    public widgetLayout: IUniWidget[] = [];

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
                x: 0,
                y: 0,
                widgetID: 'shortcuts_sales'
            },
            {
                x: 6,
                y: 0,
                widgetID: 'currency',
            },
            {
                x: 8,
                y: 0,
                widgetID: 'sum_overdue_invoices',
            },
            {
                x: 10,
                y: 0,
                widgetID: 'sum_order_reserves',
            },

            {
                x: 0,
                y: 1,
                widgetID: 'transaction_sales',
            },
            {
                x: 8,
                y: 1,
                widgetID: 'topten_customers',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'chart_restamount_per_customer',
            },
            {
                x: 4,
                y: 4,
                widgetID: 'shortcut_list_sales',
            },
        ];
    }
}
