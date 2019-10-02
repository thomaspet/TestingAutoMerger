import {Component, ViewChild} from '@angular/core';
import {UniWidgetCanvas, DefaultWidgetLayout} from '../widgets/widgetCanvas';
import {UniTranslationService} from '@app/services/services';
import * as Chart from 'chart.js';
import {AuthService} from '@app/authService';
import { Subscription } from 'rxjs';

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    @ViewChild(UniWidgetCanvas) widgetCanvas: UniWidgetCanvas;

    layout: DefaultWidgetLayout; // = this.getLayout();
    companyName: string;
    localeValue: string = 'NO_UNI';
    localeSub: Subscription;

    constructor(
        private authService: AuthService,
        private translationService: UniTranslationService
    ) {
        this.localeSub = this.translationService.locale.subscribe((locale) => {
            this.localeValue = locale;
            console.log('1');
            this.layout = this.getLayout();
        });
        let companyName = this.authService.activeCompany && this.authService.activeCompany.Name;
        companyName = (companyName || '').substring(0, 40);
        if (companyName.length === 40) {
            companyName += '...';
        }
        this.companyName = companyName;

        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;
    }

    ngOnDestroy() {
        if (this.localeSub) {
            this.localeSub.unsubscribe();
        }
    }

    public getLayout() {
        console.log('2');
        if (this.localeValue === 'NO_UNI') {
            return {
                large: [
                    {x: 0, y: 0, widgetID: 'kpi_profitability'},
                    {x: 3, y: 0, widgetID: 'kpi_liquidity'},
                    {x: 6, y: 0, widgetID: 'kpi_solidity'},

                    {x: 9, y: 0, widgetID: 'sum_inbox'},
                    {x: 9, y: 1, widgetID: 'sum_order_reserves'},
                    {x: 9, y: 2, widgetID: 'sum_overdue_invoices'},
                    {x: 9, y: 3, widgetID: 'sum_hours'},

                    {x: 0, y: 1, widgetID: 'operatingprofit' },

                    {x: 6, y: 1, widgetID: 'assignments'},

                    {x: 6, y: 4, widgetID: 'events_widget'},
                    {x: 9, y: 4, widgetID: 'report_shortcuts'},
                ],
                small: [
                    {x: 0, y: 0, widgetID: 'sum_order_reserves'},
                    {x: 3, y: 0, widgetID: 'sum_overdue_invoices'},
                    {x: 0, y: 1, widgetID: 'sum_inbox'},
                    {x: 3, y: 1, widgetID: 'sum_hours'},

                    {x: 0, y: 2, widgetID: 'operatingprofit' },

                    {x: 0, y: 6, widgetID: 'kpi_profitability'},
                    {x: 0, y: 7, widgetID: 'kpi_liquidity'},
                    {x: 0, y: 8, widgetID: 'kpi_solidity'},
                    {x: 3, y: 6, widgetID: 'assignments'},

                    {x: 0, y: 9, widgetID: 'events_widget'},
                    {x: 3, y: 9, widgetID: 'report_shortcuts'},
                ],
                xs: [
                    {x: 0, y: 0, widgetID: 'sum_order_reserves'},
                    {x: 0, y: 1, widgetID: 'sum_overdue_invoices'},
                    {x: 0, y: 2, widgetID: 'sum_inbox'},
                    {x: 0, y: 3, widgetID: 'sum_hours'},
                    {x: 0, y: 4, widgetID: 'assignments'},
                    {x: 0, y: 7, widgetID: 'operatingprofit' },
                    {x: 0, y: 11, widgetID: 'kpi_profitability'},
                    {x: 0, y: 12, widgetID: 'kpi_liquidity'},
                    {x: 0, y: 13, widgetID: 'kpi_solidity'},
                    {x: 0, y: 14, widgetID: 'events_widget'},
                    {x: 0, y: 17, widgetID: 'report_shortcuts'},
                ]
            };
        } else {
            return {
                large: [
                    {x: 0, y: 0, widgetID: 'chart_and_table_customers'},
                    {x: 7, y: 0, widgetID: 'public_duedates'},
                    {x: 0, y: 3, widgetID: 'reminder_list'},
                    {x: 3, y: 3, widgetID: 'operatingprofit_line' },
                    {x: 0, y: 6, widgetID: 'unpaid_customerinvoice_sr'},
                    // {x: 0, y: 3, widgetID: 'chart_and_table_accounts'}
                ],
            };
        }
    }
}
