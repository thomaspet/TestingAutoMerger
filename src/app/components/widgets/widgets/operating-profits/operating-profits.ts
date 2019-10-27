import {
    Component,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {IUniWidget} from '../../uniWidget';
import {FinancialYearService, StatisticsService} from '@app/services/services';
import * as Chart from 'chart.js';
import {AuthService} from '@app/authService';

@Component({
    selector: 'uni-operating-chart',
    templateUrl: './operating-profits.html',
    styleUrls: ['./operating-profits.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatingProfitWidget {
    @ViewChild('operatingProfit') operatingProfit: ElementRef;

    months: string[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];
    widget: IUniWidget;
    chartRef: Chart;
    chartConfig: any;
    currentYear: number;
    years: number[] = [];
    income: number;
    cost: number;
    sum: number;
    resultText: string = '';
    showAccumulatedResult: boolean = false;
    accumulatedResult: any[] = [];
    runningResult: any[] = [];
    isLineChart: boolean = false;
    lineColors = ['#008A00', '#008ED2', '#FF9100'];
    barColors = ['#0071CD', '#7FC6E8', 'rgba(89, 104, 121, .75)'];
    show = [true, true, true];
    dataHolder: any[] = [];

    tooltip: any; // type me

    unauthorized: boolean;
    busy: boolean = true;

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private financialYearService: FinancialYearService,
        private statisticsService: StatisticsService
    ) {}

    ngAfterViewInit() {
        let hasAccess = true;
        if (this.widget.permissions && this.widget.permissions.length) {
            const user = this.authService.currentUser;
            hasAccess = this.widget.permissions.some(p => this.authService.hasUIPermission(user, p));
        }

        if (hasAccess) {
            this.init();
        } else {
            this.unauthorized = true;
            this.busy = false;
            this.cdr.markForCheck();
        }
    }

    init() {
        this.prepChartType();
        this.currentYear = this.financialYearService.getActiveFinancialYear().Year;
        const year = new Date().getFullYear();
        this.years.push(year);
        this.years.push(year - 1);

        if (this.currentYear !== new Date().getFullYear()  &&
            this.currentYear !== new Date().getFullYear() - 1) {
            this.years.push(this.currentYear);
        } else {
            this.years.push(year - 2);
        }

        this.getDataAndLoadChart();
        const ShadowLineElement = (<any> Chart).elements.Line.extend({
            draw () {
                const { ctx } = this._chart;
                const originalStroke = ctx.stroke;

                ctx.stroke = function () {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, .05)';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    originalStroke.apply(this, arguments);
                    ctx.restore();
                };

                (<any> Chart).elements.Line.prototype.draw.apply(this, arguments);

                ctx.stroke = originalStroke;
            }
          });

        Chart.defaults.ShadowLine = Chart.defaults.line;
        Chart.controllers.ShadowLine = Chart.controllers.line.extend({
            datasetElementType: ShadowLineElement
        });
    }

    ngOnDestroy() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    ngOnChanges() {
        if (this.operatingProfit && this.widget) {
            this.getDataAndLoadChart();
        }
    }

    public yearChange(year) {
        this.currentYear = year;
        this.getDataAndLoadChart();
    }

    public changeResultLine(value: boolean) {
        this.showAccumulatedResult = value;

        if (this.showAccumulatedResult) {
            this.chartConfig.data.datasets[0].data = this.accumulatedResult;
        } else {
            this.chartConfig.data.datasets[0].data = this.runningResult;
        }
        this.drawChart();
    }

    private getDataAndLoadChart() {
        this.isLineChart = this.widget && this.widget.config && this.widget.config.type === 'line';
        const multiplier = (this.widget && this.widget.config && this.widget.config.costMultiplier) || 1;
        this.statisticsService.GetAllUnwrapped(
            'model=JournalEntryLine&select=Period.No,multiply(-1,sum(amount)) as Sum,' +
            'multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber eq 3\,amount\,0))) as Income,' +
            'multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber ge 4\,amount\,0))) as Cost' +
            `&filter=TopLevelAccountGroup.GroupNumber ge 3 and TopLevelAccountGroup.GroupNumber lt 8 ` +
            `and Period.No ge 1 and Period.No le 12 and ` +
            `Period.AccountYear eq ${this.currentYear}&join=&orderby=Period.No&Range=PeriodNo` +
            '&expand=Period,Account.TopLevelAccountGroup')
        .subscribe(
            result => {
                this.chartConfig = this.isLineChart ?  this.getEmptyLineChartConfig() : this.getEmptyResultChart();
                this.chartConfig.data.datasets[1].data = result.map(res => res.Income || 0);
                this.chartConfig.data.datasets[2].data = result.map(res => (res.Cost * multiplier) || 0);
                this.runningResult = result.map(res => res.Sum || 0);

                let sum = 0;
                let cost = 0;
                let inc = 0;
                this.accumulatedResult = [];

                result.forEach(res => {
                    inc += res.Income;
                    cost += res.Cost;
                    sum += res.Sum;
                    this.accumulatedResult.push(sum);
                });

                if (this.showAccumulatedResult) {
                    this.chartConfig.data.datasets[0].data = this.accumulatedResult;
                } else {
                    this.chartConfig.data.datasets[0].data = this.runningResult;
                }

                if (sum >= 0) {
                    this.resultText = 'Overskudd';
                } else {
                    this.resultText = 'Underskudd';
                }

                this.income = inc;
                this.cost = cost;
                this.sum = sum;

                this.dataHolder = this.chartConfig.data.datasets;

                this.drawChart();
                this.busy = false;
                this.cdr.markForCheck();
            },
            err => {
                if (err.status === 403) {
                    this.unauthorized = true;
                    this.busy = false;
                    this.cdr.markForCheck();
                } else {
                    console.error(err);
                }
            }
        );
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }

        this.chartRef = new Chart(<any> this.operatingProfit.nativeElement, this.chartConfig);
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
        // this.chartRef.config.data.labels = this.widget.config.labels.map((l, i) =>  {
        //     if (this.show[i]) {
        //         return l;
        //     }
        // });

        // this.chartRef.config.data.datasets = this.lineColors.map((l, i) => {
        //     if (this.show[i]) {
        //         return l;
        //     }
        // });
        this.chartRef.config.data.datasets = this.dataHolder.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            } else {
                return [];
            }
        });

        console.log(this.chartRef.config.data);

        this.chartRef.update();
    }

    private getEmptyResultChart() {
        return {
            type: 'groupableBar',
            data: {
                labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ],
                datasets: [{
                    label: 'Resultat',
                    data: [],
                    borderColor: this.barColors[2],
                    pointBorderColor: '#fff',
                    pointBackgroundColor: (context) => {
                        let value = 0;
                        try {
                            value = context.dataset.data[context.dataIndex];
                        } catch (e) {
                            console.error(e);
                        }

                        // return value >= 0 ? '#62B2FF' : '#FCD292';
                        return value >= 0 ? this.barColors[0] : this.barColors[1];
                    },
                    borderWidth: 1.25,
                    pointBorderWidth: 1.25,
                    pointRadius: 4,
                    lineTension: 0,
                    type: 'ShadowLine',
                    fill: false,
                    options: {
                        fill: false
                    }
                },
                {
                    label: 'Inntekter',
                    data: [],
                    backgroundColor: this.barColors[0],
                    borderWidth: 0,
                    stack: 1,
                },
                {
                    label: 'Kostnader',
                    data: [],
                    backgroundColor: this.barColors[1],
                    borderWidth: 0,
                    stack: 1
                }
            ]
            },
            plugins: [{
                beforeDraw: chart => {
                    const ctx = chart.chart.ctx;
                    const chartArea = chart.chartArea;

                    ctx.save();
                    ctx.fillStyle = '#fbfbfb';
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

                    ctx.restore();
                },
            }],
            options: {
                barRoundness: 0.2,
                elements: { point: { radius: 1 } },
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            this.tooltip = {
                                month: tooltip.dataPoints[0].xLabel,
                                result: tooltip.dataPoints[0].yLabel || 0,
                                income: tooltip.dataPoints[1].yLabel || 0,
                                cost: (tooltip.dataPoints[2].yLabel || 0) * -1,
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
                scales: {
                    yAxes: [
                        {
                            gridLines: {
                                // color: 'rgba(0, 0, 0, 0.1)'
                                zeroLineColor: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                maxTicksLimit: 8,
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
                        },
                        {
                            // This axes is just to get a border on the right side of the chart
                            position: 'right',
                            ticks: {
                                display: false
                            },
                            gridLines: {
                                display: false,
                                drawTicks: false
                            }
                        }
                    ],
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        };
    }

    private getEmptyLineChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ],
                datasets: [{
                    label: 'Resultat',
                    data: [],
                    backgroundColor: this.lineColors[2],
                    borderColor: this.lineColors[2],
                    borderWidth: 4,
                    fill: false,
                    options: {
                        fill: false
                    },
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                    lineTension: 0,
                },
                {
                    label: 'Salg',
                    data: [],
                    backgroundColor: this.lineColors[0],
                    borderColor: this.lineColors[0],
                    borderWidth: 4,
                    fill: false,
                    options: {
                        fill: false
                    },
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                    lineTension: 0,
                },
                {
                    label: 'Driftskostnader',
                    data: [],
                    backgroundColor: this.lineColors[1],
                    borderColor: this.lineColors[1],
                    borderWidth: 4,
                    lineTension: 0,
                    fill: false,
                    options: {
                        fill: false
                    },
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                }
            ]},
            options: {
                legend: { display: false },
                scaleShowVerticalLines: false,
                scales: {
                    yAxes: [
                        {
                            gridLines: {
                                // color: 'rgba(0, 0, 0, 0.1)'
                                zeroLineColor: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                maxTicksLimit: 6,
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
                        },
                        {
                            // This axes is just to get a border on the right side of the chart
                            position: 'right',
                            ticks: {
                                display: false
                            },
                            gridLines: {
                                display: false,
                                drawTicks: false
                            }
                        }
                    ],
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            this.tooltip = {
                                month: tooltip.dataPoints[0].xLabel,
                                result: tooltip.dataPoints[0].yLabel || 0,
                                income: tooltip.dataPoints[1].yLabel || 0,
                                cost: (tooltip.dataPoints[2].yLabel || 0) * -1,
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
            calculateBarX: function (index) {
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
