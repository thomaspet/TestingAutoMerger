import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Subscription, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {theme} from 'src/themes/theme';
import {DashboardDataService} from '../../../dashboard-data.service';

@Component({
    selector: 'operating-profits',
    templateUrl: './operating-profits.html',
    styleUrls: ['./operating-profits.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatingProfitsWidget {
    colors = [theme.widgets.primary, theme.widgets.bar_negative, theme.widgets.warn];
    year = new Date().getFullYear();
    years = [this.year, this.year - 1, this.year - 2, this.year - 3];

    loading = true;
    hasData = false;

    data: {PeriodNo: number; Sum: number; Income: number; Cost: number}[];
    legend: {label: string; value: number; color: string}[];

    showAccumulatedResult: boolean;
    dataSubscription: Subscription;
    chartConfig;
    tooltip;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService
    ) {}

    ngOnInit() {
        this.initChart();
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    setShowAccumulatedResult(showAccumulatedResult) {
        this.showAccumulatedResult = showAccumulatedResult;
        this.chartConfig = this.getChartConfig();
        this.cdr.markForCheck();
    }

    initChart() {
        this.dataSubscription?.unsubscribe();
        this.dataSubscription = this.loadData().subscribe(data => {
            this.hasData = data?.length && data.some(item => item.Sum || item.Income || item.Cost);

            if (this.hasData) {
                this.data = data || [];
                this.updateLegend();

                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private loadData() {
        const selects = [
            `Period.No`,
            `multiply(-1,sum(amount)) as Sum`,
            `multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber eq 3,amount,0))) as Income`,
            `multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber ge 4,amount,0))) as Cost`,
        ];

        const filter = `TopLevelAccountGroup.GroupNumber ge 3 and TopLevelAccountGroup.GroupNumber lt 8 and Period.No ge 1 and Period.No le 12 and Period.AccountYear eq ${this.year}`;

        const endpoint = `/api/statistics?model=JournalEntryLine`
            + `&select=${selects.join(',')}`
            + `&filter=${filter}`
            + `&expand=Period,Account.TopLevelAccountGroup`
            + `&Range=PeriodNo&orderby=Period.No&wrap=false`;

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            })
        );
    }

    private updateLegend() {
        let incomeSum = 0, costSum = 0, resultSum = 0;

        this.data.forEach(item => {
            incomeSum += item.Income || 0;
            costSum += item.Cost || 0;
            resultSum += item.Sum || 0;
        });

        costSum = costSum * -1;

        this.legend = [
            {label: 'Inntekter', value: incomeSum, color: this.colors[0]},
            {label: 'Kostnader', value: costSum, color: this.colors[1]},
            {label: 'Resultat', value: resultSum, color: this.colors[2]},
        ];
    }

    private getChartConfig() {
        const resultData = [];
        let accumulatedSum = 0;

        this.data.forEach(item => {
            if (this.showAccumulatedResult) {
                accumulatedSum += (item.Sum || 0);
                resultData.push(accumulatedSum);
            } else {
                resultData.push(item.Sum || 0);
            }
        });

        return {
            type: 'roundedBarChart',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [
                    {
                        label: 'Resultat',
                        data: resultData,
                        borderColor: '#b3b3b3',
                        pointBackgroundColor: this.colors[2],
                        borderWidth: 1,
                        pointBorderWidth: 0,
                        pointRadius: 4,
                        lineTension: 0,
                        type: 'line',
                        fill: false,
                        options: {
                            fill: false
                        }
                    },
                    {
                        label: 'Inntekter',
                        data: this.data.map(item => item.Income),
                        backgroundColor: this.colors[0],
                        borderWidth: 0,
                        stack: 1,
                        barThickness: 16
                    },
                    {
                        label: 'Kostnader',
                        data: this.data.map(item => item.Cost),
                        backgroundColor: this.colors[1],
                        borderWidth: 0,
                        stack: 1,
                        barThickness: 16
                    }
                ]
            },
            plugins: [{
                beforeDraw: chart => {
                    const ctx = chart.chart.ctx;
                    const chartArea = chart.chartArea;

                    ctx.save();
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

                    ctx.restore();
                },
            }],
            options: {
                barRoundness: .75,
                elements: {point: {radius: 1}},
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false,
                    position: 'right',
                    align: 'center'
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            this.tooltip = {
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
                    yAxes: [{
                        gridLines: {
                            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
                            borderDash: [4, 4],
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function (value) {
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
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        };
    }

    onYearSelected(year) {
        this.year = year;
        this.initChart();
    }
}
