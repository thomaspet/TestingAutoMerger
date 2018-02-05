import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-accounting',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'accounting'">
        </uni-widget-canvas>
    `,
})
export class UniAccounting {
    private widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Regnskap',
             url: '/accounting',
             moduleID: UniModules.Accounting,
             active: true
        });

        this.widgetLayout = this.getDefaultLayout();
    }

    private getDefaultLayout(): any[] {
        return [
            {
                x: 0,
                y: 0,
                widgetID: 'shortcut_accounting_journalentry',
            },
            {
                x: 1,
                y: 0,
                widgetID: 'shortcut_accounting_bills',
            },
            {
                x: 2,
                y: 0,
                widgetID: 'shortcut_accounting_transquery',
            },
            {
                x: 3,
                y: 0,
                widgetID: 'shortcut_accounting_accountingreports',
            },
            {
                x: 4,
                y: 0,
                widgetID: 'shortcut_accounting_vatreport',
            },
            {
                x: 5,
                y: 0,
                widgetID: 'shortcut_overview',
            },
            {
                x: 6,
                y: 0,
                widgetID: 'counter_email',
            },
            {
                x: 7,
                y: 0,
                widgetID: 'counter_ehf',
            },
            {
                x: 8,
                y: 0,
                widgetID: 'counter_assigned_invoices',
            },
            {
                x: 9,
                y: 0,
                widgetID: 'counter_notifications',
            },
            {
                x: 4,
                y: 4,
                widgetID: 'chart_operating_profits',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'kpi',
            },
            {
                x: 0,
                y: 1,
                widgetID: 'transaction_accounting',
            },
            {
                x: 8,
                y: 1,
                widgetID: 'shortcut_list_accounting',
            },
            {
                x: 10,
                y: 0,
                widgetID: 'info_shortcut_overview',
            },
            {
                x: 10,
                y: 2,
                widgetID: 'info_shortcut_videos',
            },
            {
                x: 10,
                y: 4,
                widgetID: 'info_shortcut_help',
            }
        ];
    }

}
