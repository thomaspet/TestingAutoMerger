import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {StatisticsService, NumberFormat} from '@app/services/services';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';

@Component({
    selector: 'uni-unpaid-doughnut-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>{{ widget.description }}</span>
            </section>

            <section *ngIf="missingData" class="no-content">
                {{ missingDataMsg }}
            </section>

            <div *ngIf="!missingData" class="content">
                <div style="height: 100%">
                    <canvas style="max-height: 220px" #unpaidDoughnutChart></canvas>
                </div>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniUnpaidDoughnutChart implements AfterViewInit {
    @ViewChild('unpaidDoughnutChart')
    private unpaidDoughnutChart: ElementRef;

    widget: IUniWidget;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();

    chartRef: any;
    chartConfig: any;
    totalAmount: number = 0;
    missingData: boolean;
    missingDataMsg: string = 'Mangler data'

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private widgetDataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private getDataAndLoadChart() {
        if (this.widgetDataService.hasAccess(this.widget.permissions[0])) {
            const queryString = this.widget.config.dataEndpoint
            ? this.widget.config.dataEndpoint
            : `model=${this.widget.config.model}&select=${this.generateSelect()}`;

            this.statisticsService.GetAllUnwrapped(queryString).subscribe(result => {

                this.totalAmount = 0;
                const data = [];
                for (const key in result[0]) {
                    if (key) {
                        data.push(result[0][key]);
                        this.totalAmount += result[0][key];
                    }
                }

                if (data.some(sum => !!sum)) {
                    this.missingData = false;
                    this.chartConfig = this.getEmptyResultChart();
                    this.chartConfig.data.labels = this.widget.config.labels;
                    if (this.widget.config.function === 'unpaid') {
                        this.chartConfig.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();
                    } else {
                        this.chartConfig.options.plugins.doughnutlabel.labels = [
                            {
                                text: 'Prosjektprosent',
                                font: { size: '14' }
                            },
                            {
                                text: (data[0] / this.totalAmount * 100).toFixed(2) + ' %',
                                font: { size: '20' }
                            }
                        ];
                        this.chartConfig.options.legend.display = false;
                        this.chartConfig.data.datasets[0].backgroundColor = ['#0a83a5', '#ecf5f8'];
                        this.chartConfig.options.tooltips = {
                            callbacks: {
                                label: (tooltipItem, array) => {
                                    return array.labels[tooltipItem.index] + ': '
                                    + (array.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] / 60).toFixed(2) + ' timer';
                                }
                            }
                        };
                    }

                    this.chartConfig.data.datasets[0].data = data;
                    this.drawChart();
                } else {
                    this.missingData = true;
                    this.cdr.markForCheck();
                }

            });
        } else {
            this.missingData = true;
            this.missingDataMsg = 'Mangler tilgang';
            this.cdr.markForCheck();
        }
    }

    public generateSelect() {
        // Ikke forfalt
        return `sum(casewhen(PaymentDueDate gt '${moment().format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum,`
        // 0 - 30 dager
        + `sum(casewhen(PaymentDueDate ge '${moment().subtract(30, 'd').format('YYYYMMDD')}' and `
        + `PaymentDueDate le '${moment().format('YYYYMMDD')}' and RestAmount gt 0 and `
        + `StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum1,`
        // 30 - 60 dager
        + `sum(casewhen(PaymentDueDate ge '${moment().subtract(60, 'd').format('YYYYMMDD')}' and `
        + `PaymentDueDate le '${moment().subtract(31, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum2,`
        // 60 - 90 dager
        + `sum(casewhen(PaymentDueDate ge '${moment().subtract(90, 'd').format('YYYYMMDD')}' and `
        + `PaymentDueDate le '${moment().subtract(61, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum3,`
        // Over 90 dager
        + `sum(casewhen(PaymentDueDate lt '${moment().subtract(90, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum4`;
    }

    public ngAfterViewInit() {
        if (this.widget) {
            this.getDataAndLoadChart();
        }
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }

        this.chartRef = new Chart(<any> this.unpaidDoughnutChart.nativeElement, this.chartConfig);
        this.cdr.markForCheck();
        this.dataLoaded.emit(true);
    }

    private getEmptyResultChart() {
        return {
            type: 'pie',
            plugins: [doughnutlabel],
            data: {
                datasets: [{
                    data: [],
                    backgroundColor: ['#94E4FF', '#7BCBFF', '#62B2FF', '#4898F3', '#2F7FDA'],
                    label: '',
                    borderColor: 'white'
                }],
                labels: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 80,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'left',
                    labels: {
                        usePointStyle: true
                    }
                },
                plugins: {
                    doughnutlabel: {
                        labels: []
                    }
                }
            }
        };
    }

    private getUnpaidDoughnutLabels() {
        return [
            {
                text: 'Utestående',
                font: { size: '14' }
            },
            {
                text: this.numberFormatService.asMoney(this.totalAmount),
                font: { size: '20' }
            }
        ];
    }
}
