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
import {IUniWidget} from '../uniWidget';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';

@Component({
    selector: 'sr-unpaid-doughnut-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header sr-widget-header">
                <span>{{ widget.description }}</span>
            </section>

            <section *ngIf="missingData" class="no-content">
                Mangler tilgang
            </section>

            <div *ngIf="!missingData" class="content">
                <div style="height: calc(100% - 4rem)">
                    <canvas style="max-height: 220px" #unpaidDoughnutChartSR></canvas>
                </div>
                <div class="chart-legend-sr">

                    <section class="legend-top">

                        <section class="result-legend" id="notdue" (click)="addhiddenClass('notdue', 0)">
                            <span class="indicator" [style.background]="colors[0]"></span>
                            Ikke forfalt
                        </section>

                        <section class="result-legend" id="due1" (click)="addhiddenClass('due1', 2)">
                            <span class="indicator" [style.background]="colors[1]"></span>
                            31 - 60 dager
                        </section>

                    </section>

                    <section class="legend-top">

                        <section class="result-legend" id="due2" (click)="addhiddenClass('due2', 1)">
                            <span class="indicator" [style.background]="colors[2]"></span>
                            1 - 30 dager
                        </section>

                        <section class="result-legend" id="due3" (click)="addhiddenClass('due3', 3)">
                            <span class="indicator" [style.background]="colors[3]"></span>
                            Over 60 dager
                        </section>

                    </section>
                </div>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SRUnpaidDoughnutChart implements AfterViewInit {
    @ViewChild('unpaidDoughnutChartSR')
    private unpaidDoughnutChart: ElementRef;

    widget: IUniWidget;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    // colors: string[] = ['#008A00', '#FFF000', '#FF9100', '#DA3D00'];
    colors = ['#008A00', '#FF9100', '#FFF001', '#DA3D00'];
    show = [true, true, true, true];

    chartRef: Chart; //  = new Chart(null, null);
    chartConfig: any;
    totalAmount: number = 0;
    missingData: boolean = false;
    dataHolder: any[] = [];

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private getDataAndLoadChart() {
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

            this.dataHolder = data;

            if (data.some(sum => !!sum)) {
                this.missingData = false;
                this.chartConfig = this.getEmptyResultChart();
                this.chartConfig.data.labels = this.widget.config.labels.slice();
                this.chartConfig.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

                this.chartConfig.data.datasets[0].data = data;
                this.chartConfig.data.datasets[0].backgroundColor = this.colors;
                this.drawChart();
            }

        }, err => {
            this.missingData = true;
            this.cdr.markForCheck();
        });
    }

    addhiddenClass(id: string, index) {
        this.show[index] = !this.show[index];

        const element = document.getElementById(id);

        if (this.show[index]) {
            element.classList.remove('hidden-class');
        } else {
            element.classList.add('hidden-class');
        }
        this.reDrawAfterLegendClick();
    }

    reDrawAfterLegendClick() {
        this.chartRef.config.data.labels = this.widget.config.labels.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            }
        });
        this.chartRef.config.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

        this.chartRef.config.data.datasets[0].backgroundColor = this.colors.map((l, i) => {
            if (this.show[i]) {
                return l;
            }
        });
        this.chartRef.config.data.datasets[0].data = this.dataHolder.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            }
        });

        this.chartRef.update();
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
        // Over 60 dager
        + `sum(casewhen(PaymentDueDate lt '${moment().subtract(61, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 40001 and StatusCode ne 30101\,RestAmount\,0) ) as sum3`;
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
                    backgroundColor: [],
                    label: '',
                    borderColor: 'white'
                }],
                labels: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
                animation: {
                    scale: true,
                    rotate: true,
                    steps: 50,
                    easing: 'easeOutBounce'
                },
                legend: {
                    display: false,
                    position: 'left',
                    reverse: true,
                    labels: {
                        usePointStyle: true
                    }
                },
                plugins: {
                    doughnutlabel: {
                        labels: []
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 5
                    }
                }
            }
        };
    }

    private getUnpaidDoughnutLabels() {
        return [
            {
                text: 'Sum',
                color: '#262626',
                font: { size: '16' }
            },
            {
                text: this.numberFormatService.asMoney(this.totalAmount),
                color: '#262626',
                font: { size: '17', weight: '500' }
            }
        ];
    }
}
