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
import {IUniWidget} from '../../uniWidget';
import {Router} from '@angular/router';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';

interface IPeriode {
    label: string;
    numberOfElements: number;
    timeSpan: 'month' | 'w' | 'd';
    index: number;
}

@Component({
    selector: 'invoiced-widget',
    templateUrl: './invoiced.html',
    styleUrls: ['./invoiced.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoicedWidget implements AfterViewInit {
    @ViewChild('chartCanvas') private canvas: ElementRef;

    widget: IUniWidget;
    header: string = 'Fakturert siste 12 mnd';
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    chartRef: any;
    chartConfig: any;

    tooltip;

    MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];
    currentLabels: string[] = [];
    currentLabelsFull: string[] = [];
    totalInvoiced = [];
    periodes: IPeriode[] = [
        {
            label: 'Siste 12 mnd',
            numberOfElements: 12,
            timeSpan: 'month',
            index: 0
        },
        {
            label: 'Siste 10 uker',
            numberOfElements: 10,
            timeSpan: 'w',
            index: 1
        },
        {
            label: 'Siste 10 dager',
            numberOfElements: 10,
            timeSpan: 'd',
            index: 2
        }
    ];
    totalInvoiceInPeriod: string = '';
    totalPaidInPeriod: string = '';

    currentPeriod = this.periodes[0];

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.prepChartType();
    }

    ngAfterViewInit() {
        if (this.widget) {
            this.getDataAndLoadChart();
        }
    }

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef && this.chartRef.destroy) {
            this.chartRef.destroy();
        }
    }

    private getDataAndLoadChart() {
        Observable.forkJoin(
            this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&select=${this.generateSelect(false)}`),
            this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&select=${this.generateSelect(true)}`)
        ).subscribe(([result, paid]) => {
            this.chartConfig = this.getEmptyResultChart();
            const invoiceData = [];
            const paidInvoiceData = [];
            this.totalInvoiced = [];

            for (const key in result[0]) {
                if (key) {
                    this.totalInvoiced.push(result[0][key]);
                    paidInvoiceData.push(paid[0][key]);
                    invoiceData.push(result[0][key] - paid[0][key] > 0 ? result[0][key] - paid[0][key] : 0);
                }
            }

            this.chartConfig.data.datasets[0].data = paidInvoiceData.map(m => m);
            this.chartConfig.data.datasets[1].data = invoiceData.map(m => m);

            this.totalInvoiceInPeriod = this.numberFormatService.asMoney(this.totalInvoiced.reduce((a, b) => a + b));
            this.totalPaidInPeriod = this.numberFormatService.asMoney(paidInvoiceData.reduce((a, b) => a + b));

            this.drawChart();
        });
    }

    public updateData(index: number) {
        if (index !== this.currentPeriod.index) {
            this.currentPeriod = this.periodes[index];
            this.getDataAndLoadChart();
        }
    }

    public generateSelect(includeStatusCode: boolean = false) {
        this.currentLabels = [];
        this.currentLabelsFull = [];

        const momentNumber = this.currentPeriod.numberOfElements - 1;

        let selectString = '';
        for (let i = 0; i < this.currentPeriod.numberOfElements; i++) {
            let dateString;
            let dateStringTo;

            if (this.currentPeriod.timeSpan === 'w') {
                this.currentLabels.push('Uke ' + moment().subtract(momentNumber - i, 'w').format('W'));
                this.currentLabelsFull.push(
                    moment().subtract(momentNumber - i, 'w').startOf('w').format('DD.MMM') + ' - '
                    + moment().subtract(momentNumber - i, 'w').endOf('w').format('DD.MMM')
                );
            } else if (this.currentPeriod.timeSpan === 'd') {
                this.currentLabels.push(moment().subtract(momentNumber - i, 'd').format('DD.MMM'));
                this.currentLabelsFull.push(moment().subtract(momentNumber - i, 'd').format('DD MMMM YYYY'));
            } else {
                this.currentLabels.push(this.MONTHS[moment().subtract(11 - i, 'month').month()]);
                let fms = moment().subtract(11 - i, 'month').format('MMMM YYYY');
                fms = fms[0].toUpperCase() + fms.substr(1);
                this.currentLabelsFull.push(fms);
            }

            dateString = moment().subtract(momentNumber - i, this.currentPeriod.timeSpan)
                .startOf(this.currentPeriod.timeSpan).format('YYYYMMDD');
            dateStringTo = moment().subtract(momentNumber - i, this.currentPeriod.timeSpan)
                .endOf(this.currentPeriod.timeSpan).format('YYYYMMDD');

            dateStringTo += includeStatusCode ? `' and StatusCode eq '42004' and add(TaxInclusiveAmount, CreditedAmount) ne '0'`
                : `' and StatusCode ne '42001'`;
            selectString += `sum(casewhen(InvoiceDate ge '${dateString}' and ` +
                `InvoiceDate le '${dateStringTo}\,TaxInclusiveAmount\,0) ) as sum` + i + (i !== momentNumber ? ',' : '');
        }
        return selectString;
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
        this.chartRef = new Chart(<any> this.canvas.nativeElement, this.chartConfig);
        this.cdr.markForCheck();
        this.dataLoaded.emit(true);
    }

    private getEmptyResultChart() {
        return {
            type: 'bar',
            data: {
                labels: this.currentLabels,
                datasets: [
                {
                    label: 'Innbetalt',
                    data: [],
                    backgroundColor: '#62B2FF',
                    stack: 1
                },
                {
                    label: 'Fakturert',
                    data: [],
                    backgroundColor: '#4898F3',
                    hoverBackgroundColor: '#4898F3',
                    stack: 1
                }
            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    yAxes: [{
                        // gridLines: { display: false },
                        ticks: {
                            maxTicksLimit: 8,
                            // callback: this.localAsMoney.bind(this)
                            callback: function(value) {
                                if (value === 0 || (value < 999 && value > -999)) {
                                    return value;
                                } else if (value > -1000000 && value < 1000000) {
                                    return (value / 1000) + 'k';
                                } else if (value <= -1000000 || value >= 1000000) {
                                    return (value / 1000000) + 'm';
                                } else {
                                    return value;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        gridLines: { display: false },
                    }]
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const data = tooltip.dataPoints;
                            const index = data[0].index;

                            const paid = data[0].yLabel || 0;
                            const unpaid = data[1].yLabel || 0;

                            this.tooltip = {
                                label: this.currentLabelsFull[index],
                                invoiced: paid + unpaid,
                                paid: paid,
                                unpaid: unpaid,
                                style: {
                                    top: tooltip.y + 'px',
                                    left: tooltip.x + 'px',
                                    opacity: '1'
                                }
                            };
                        } else {
                            this.tooltip = undefined;
                        }

                        this.cdr.markForCheck();
                    }
                },
            }
        };
    }

    private prepChartType() {
        Chart.defaults.groupableBar = Chart.helpers.clone(Chart.defaults.bar);

        Chart.controllers.groupableBar = Chart.controllers.bar.extend({
            calculateBarX: function (index, datasetIndex) {
                // position the bars based on the stack index
                const stackIndex = this.getMeta().stackIndex;
                return Chart.controllers.bar.prototype.calculateBarX.apply(this, [index, stackIndex]);
            },

            hideOtherStacks: function (datasetIndex) {
                const meta = this.getMeta();
                const stackIndex = meta.stackIndex;

                this.hiddens = [];
                for (let i = 0; i < datasetIndex; i++) {
                    const dsMeta = this.chart.getDatasetMeta(i);
                    if (dsMeta.stackIndex !== stackIndex) {
                        this.hiddens.push(dsMeta.hidden);
                        dsMeta.hidden = true;
                    }
                }
            },

            unhideOtherStacks: function (datasetIndex) {
                const meta = this.getMeta();
                const stackIndex = meta.stackIndex;

                for (let i = 0; i < datasetIndex; i++) {
                        const dsMeta = this.chart.getDatasetMeta(i);
                    if (dsMeta.stackIndex !== stackIndex) {
                        dsMeta.hidden = this.hiddens.unshift();
                    }
                }
            },

            calculateBarY: function (index, datasetIndex) {
                this.hideOtherStacks(datasetIndex);
                const barY = Chart.controllers.bar.prototype.calculateBarY.apply(this, [index, datasetIndex]);
                this.unhideOtherStacks(datasetIndex);
                return barY;
            },

            calculateBarBase: function (datasetIndex, index) {
                this.hideOtherStacks(datasetIndex);
                const barBase = Chart.controllers.bar.prototype.calculateBarBase.apply(this, [datasetIndex, index]);
                this.unhideOtherStacks(datasetIndex);
                return barBase;
            },

            getBarCount: function () {
                const stacks = [];

                // put the stack index in the dataset meta
                Chart.helpers.each(this.chart.data.datasets, function (dataset, datasetIndex) {
                    const meta = this.chart.getDatasetMeta(datasetIndex);
                if (meta.bar && this.chart.isDatasetVisible(datasetIndex)) {
                    let stackIndex = stacks.indexOf(dataset.stack);
                    if (stackIndex === -1) {
                    stackIndex = stacks.length;
                    stacks.push(dataset.stack);
                    }
                    meta.stackIndex = stackIndex;
                }
                }, this);

                this.getMeta().stacks = stacks;
                return stacks.length;
            },
        });
    }
}
