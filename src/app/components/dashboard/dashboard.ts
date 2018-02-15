import {Component, ViewChild} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {YearService} from '../../services/services';
import {UniWidgetCanvas} from '../widgets/widgetCanvas';

import * as Chart from 'chart.js';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

export interface IChartDataSet {
    label: string;
    labels: string[];
    chartType: string;
    backgroundColor: string[] | string;
    borderColor: any; // String or null
    data: number[];
}

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    @ViewChild(UniWidgetCanvas)
    public widgetCanvas: UniWidgetCanvas;

    public welcomeHidden: boolean = this.browserStorage.getItem('welcomeHidden');
    private layout: any[] = [];

    constructor(
        private http: UniHttp,
        private yearService: YearService,
        private browserStorage: BrowserStorageService,
    ) {
        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;
        this.layout = this.initLayout();
    }

    public initLayout() {
        return [
            {
                x: 0,
                y: 0,
                widgetID: 'shortcut_accounting'
            },
            {
                x: 1,
                y: 0,
                widgetID: 'shortcut_sales'
            },
            {
                x: 2,
                y: 0,
                widgetID: 'shortcut_salary'
            },
            {
                x: 3,
                y: 0,
                widgetID: 'shortcut_bank'
            },
            {
                x: 4,
                y: 0,
                widgetID: 'shortcut_timetracking'
            },
            {
                x: 5,
                y: 0,
                widgetID: 'shortcut_overview'
            },
            {
                x: 6,
                y: 0,
                widgetID: 'clock'
            },
            {
                x: 9,
                y: 0,
                widgetID: 'companylogo',
            },
            {
                x: 8,
                y: 1,
                widgetID: 'counter_email',
            },
            {
                x: 9,
                y: 1,
                widgetID: 'counter_ehf',
            },
            {
                x: 10,
                y: 1,
                widgetID: 'counter_assigned_invoices',
            },
            {
                x: 11,
                y: 1,
                widgetID: 'counter_notifications',
            },
            {
                x: 8,
                y: 2,
                widgetID: 'sum_hours',
            },
            {
                x: 10,
                y: 2,
                widgetID: 'sum_overdue_invoices',
            },
            {
                x: 0,
                y: 1,
                widgetID: 'chart_operating_profits',
            },
            {
                x: 4,
                y: 1,
                widgetID: 'kpi',
            },
            {
                x: 0,
                y: 4,
                widgetID: 'chart_employees_per_employment'
            },

            {
                x: 4,
                y: 4,
                widgetID: 'chart_restamount_per_customer',
            },
            {
                x: 8,
                y: 3,
                widgetID: 'rss',
            },
        ];
    }
}
