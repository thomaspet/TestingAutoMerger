import {Component, ViewChild} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {FinancialYearService} from '@app/services/services';
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
    public layout: any[] = [];

    constructor(
        private http: UniHttp,
        private financialYearService: FinancialYearService,
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
                widgetID: 'overview-widget',
            },
            {
                x: 0,
                y: 1,
                widgetID: 'shortcuts_main',
            },
            {
                x: 6,
                y: 1,
                widgetID: 'counters_supplierinvoice',
            },
            {
                x: 10,
                y: 1,
                widgetID: 'sum_hours'
            },
            {
                x: 0,
                y: 2,
                widgetID: 'operatingprofit',
            },
            {
                x: 7,
                y: 2,
                widgetID: 'rss',
            },
        ];
    }
}
