import {
    Component,
    ViewChild,
    ElementRef,
    EventEmitter,
    ChangeDetectionStrategy
} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {FinancialYearService, StatisticsService, NumberFormat} from '../../../services/services';
import * as Chart from 'chart.js';

@Component({
    selector: 'uni-operating-chart',
    template: `
        <section class="uni-widget-header">
            {{ widget.description }}
        </section>

        <section class="uni-widget-content" [attr.aria-busy]="!(dataLoaded | async)" style="padding-top: 0" id="profit-container">
            <div class="uni-operatiing-profit-years-container" style="display: flex; color: #638ab2;">
                <div style="flex: 1;"></div>
                <div class="year-button" *ngFor="let year of years" [class.selected]="year === currentYear" (click)="yearChange(year)">
                    {{ year }}
                </div>
                <div class="operating-profit-result-view-dropdown">
                    <i class="material-icons" [matMenuTriggerFor]="contextMenu"
                    title="Trykk her for å velge visning for resultat
                    (Grønn linje i graf)"> settings </i>
                    <mat-menu #contextMenu="matMenu">
                        <ul class="dropdown-list-result-view">
                            <li (click)="changeResultLine(false)">
                                Vis resultatlinje som månedlig resultat
                            </li>
                            <li (click)="changeResultLine(true)">
                                Vis resultatlinje som akkumulert resultat
                            </li>
                        </ul>
                    </mat-menu>
                </div>
            </div>
            <div style="height: calc(100% - 7rem); margin-top: .5rem">
                <canvas #operatingProfit></canvas>
            </div>

            <div class="uni-operating-profit-number-container">
                <div class="operating-profif-income">
                    Inntekter: {{ income }}
                </div>

                <div class="operating-profif-cost">
                    Utgifter: {{ cost }}
                 </div>

                <div class="operating-profif-result">
                    {{ resultText }}: {{ sum }}
                </div>
            </div>

        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniOperatingProfitWidget {
    @ViewChild('operatingProfit')
    private operatingProfit: ElementRef;

    months: string[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];
    widget: IUniWidget;
    myChart: any;
    chart: any;
    currentYear: number;
    years: number[] = [];
    income: string;
    cost: string;
    sum: string;
    resultText: string = '';
    showAccumulatedResult: boolean = true;
    accumulatedResult: any[] = [];
    runningResult: any[] = [];

    public dataLoaded: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private financialYearService: FinancialYearService,
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat
    ) {
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
    }

    public ngAfterViewInit() {
        if (this.widget) {
            this.getDataAndLoadChart();
        }
    }

    public ngOnChanges() {
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
            this.chart.data.datasets[0].data = this.accumulatedResult;
        } else {
            this.chart.data.datasets[0].data = this.runningResult;
        }
        this.drawChart();
    }

    private getDataAndLoadChart() {
        this.statisticsService.GetAllUnwrapped(
            'model=JournalEntryLine&select=Period.No,multiply(-1,sum(amount)) as Sum,' +
            'multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber eq 3\,amount\,0))) as Income,' +
            'multiply(-1,sum(casewhen(toplevelaccountgroup.GroupNumber ge 4\,amount\,0))) as Cost' +
            `&filter=TopLevelAccountGroup.GroupNumber ge 3 and Period.No ge 1 and Period.No le 12 and ` +
            `Period.AccountYear eq ${this.currentYear}&join=&orderby=Period.No&Range=PeriodNo` +
            '&expand=Period,Account.TopLevelAccountGroup')
        .subscribe(result => {
            this.chart = this.getEmptyResultChart();
            this.chart.data.datasets[1].data = result.map(res => res.Income);
            this.chart.data.datasets[2].data = result.map(res => res.Cost);
            this.runningResult = result.map(res => res.Sum);

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
                this.chart.data.datasets[0].data = this.accumulatedResult;
            } else {
                this.chart.data.datasets[0].data = this.runningResult;
            }

            if (sum >= 0) {
                this.resultText = 'Overskudd';
            } else {
                this.resultText = 'Underskudd';
            }

            this.income = this.localAsMoney(inc);
            this.cost = this.localAsMoney(cost);
            this.sum = this.localAsMoney(sum);

            this.drawChart();
        });
    }

    private drawChart() {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.myChart = new Chart(<any> this.operatingProfit.nativeElement, this.chart);
        this.dataLoaded.emit(true);
    }

    private getEmptyResultChart() {
        return {
            type: 'groupableBar',
            data: {
                labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ],
                datasets: [{
                    label: 'Resultat',
                    data: [],
                    borderColor: 'rgba(9,112,84, .5)',
                    backgroundColor: 'rgba(9,112,84, .5)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false,
                    options: {
                        fill: false
                    }
                },
                {
                    label: 'Inntekter',
                    data: [],
                    backgroundColor: 'rgba(42,143,252, .5)',
                    borderWidth: 1,
                    stack: 1
                },
                {
                    label: 'Utgifter',
                    data: [],
                    backgroundColor: 'rgba(250,165,38, .5)',
                    borderWidth: 1,
                    stack: 1
                }
            ]
            },
            options: {
                elements: {
                    point: {
                        radius: 1
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: this.labelFormat.bind(this)
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            maxTicksLimit: 12,
                            // callback: this.localAsMoney.bind(this)
                            callback: function(value) {
                                if (value === 0 || (value < 999 && value > -999)) {
                                    return value;
                                } else if (value > -1000000 && value < 1000000) {
                                    return (value / 1000) + 'k';
                                } else if (value <= -1000000 || value >= 1000000) {
                                    return (value / 1000000) + 'mill.';
                                } else {
                                    return value;
                                }
                            }
                        }
                    }]
                 }
            }
        };
    }

    private localAsMoney(value) {
        return this.numberFormatService.asMoney(value, { decimalLength: 0 });
    }

    private labelFormat (tooltipItem, array) {
        const datasetLabel = array.datasets[tooltipItem.datasetIndex].label || 'Other';
        return datasetLabel.split(':')[0] + ': ' + this.numberFormatService.asMoney(tooltipItem.yLabel);
    }

    private prepChartType() {
        Chart.defaults.groupableBar = Chart.helpers.clone(Chart.defaults.bar);

        const helpers = Chart.helpers;
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
