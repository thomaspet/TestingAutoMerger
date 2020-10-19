import {Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {CurrencyService} from '@app/services/services';
import * as moment from 'moment';
import * as Chart from 'chart.js';

@Component({
    selector: 'currency-widget',
    templateUrl: './currency-widget.html',
    styleUrls: ['./currency-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyWidget {
    @ViewChild('canvas', {static: false})
    private canvas: ElementRef<HTMLCanvasElement>;

    chartConfig;

    loading = true;
    hasData = false;
    showChart = true;
    data = [];
    chartData = [];

    currentCurrencyID: number = 2;
    currencyCodes = [];

    chartRef: Chart;
    dateLabel = moment(new Date()).format('DD MMM');

    selectedCodes = [
        { ID: 2, Name: 'USD' },
        { ID: 3, Name: 'GBP' },
        { ID: 4, Name: 'EUR' },
        { ID: 5, Name: 'SEK' },
        { ID: 6, Name: 'DKK' },
        { ID: 11, Name: 'CNY' }
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private currencyService: CurrencyService,
        private dataService: DashboardDataService
    ) {
        this.currentCurrencyID = parseInt(localStorage.getItem('currencyWidgetLastID'), 10) || this.currentCurrencyID;
    }

    ngOnInit() {
        this.currencyService.getAllExchangeRates(1, new Date()).subscribe((currencyCodes) => {
            this.hasData = true;
            this.currencyCodes = currencyCodes.sort((a, b) => a.FromCurrencyCode.ID > b.FromCurrencyCode.ID ? 1 : -1);
            this.getData();
        }, err => {
            this.hasData = false;
        });
    }

    getData() {
        this.dataService.get(this.getEndpoint(), false).subscribe((currentRates) => {
            this.data = currentRates.Data;
            this.chartData = this.data.map(cr => (cr.ExchangeRate / (cr.Factor || 1)).toFixed(4));
            this.chartConfig = this.getChartConfig();
            this.loading = false;

            this.chartRef?.destroy();

            setTimeout(() => {
                if (this.canvas) {
                    this.chartRef = new Chart(this.canvas.nativeElement, this.chartConfig);
                }
            }, 200);
            this.cdr.markForCheck();

        }, err => this.showChart = false);
    }

    reloadChart() {
        this.chartRef?.destroy();
        setTimeout(() => {
            this.chartRef = new Chart(this.canvas.nativeElement, this.chartConfig);
        }, 200);
        this.cdr.markForCheck();
    }

    showCode(code) {
        this.currentCurrencyID = code.ID;
        localStorage.setItem('currencyWidgetLastID', code.ID + '');
        this.getData();
    }

    getChartConfig() {
        return {
            type: 'line',
            data:
            {
                labels: this.data.map(d => moment(d.CurrencyDate).format('DD MMMM YYYY')),
                datasets: [{
                    label: this.data[0].Name + ` (${this.data[0].Code})`,
                    data: this.chartData,
                    borderColor: '#3e95cd',
                    backgroundColor: '#E8F1F9',
                    fill: true,
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                  display: true,
                  position: 'bottom',
                  fontSize: 13,
                  lineHeight: 1.4,
                  fontFamily: `'Roboto', sans-serif, arial`,
                  fontStyle: 'bold',
                  text: [
                    this.data[0].Name + ` (${this.data[0].Code})`,
                    'Nyeste kurs (' + moment(this.data[this.data.length - 1].CurrencyDate).format('DD MMMM') + ') - '
                    + this.chartData[this.chartData.length - 1]
                ]
                },
                elements: {
                    point: {
                        radius: 1
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
                            borderDash: [4, 4],
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    }],
                }
              }
        };
    }


    getEndpoint() {
        const date = moment(new Date()).add('d', -60).toISOString();
        return `/api/statistics?model=Currency&select=CurrencyDate as CurrencyDate,ExchangeRate as ExchangeRate,FromCurrencyCodeID as FromCurrencyCodeID,FromCurrencyCode.Name as Name,`
        + `FromCurrencyCode.Code as Code,Factor as Factor`
        + `&expand=FromCurrencyCode`
        + `&filter=FromCurrencyCodeID eq ${this.currentCurrencyID} and CurrencyDate gt '${date}'`
        + `&orderby=CurrencyDate`;
    }
}
