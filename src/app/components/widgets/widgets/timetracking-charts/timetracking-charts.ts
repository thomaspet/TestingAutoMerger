import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {WidgetDataService} from '../../widgetDataService';
import {IUniWidget} from '../../uniWidget';
import {theme} from 'src/themes/theme';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';

@Component({
    selector: 'timetracking-chart-widget',
    templateUrl: './timetracking-charts.html',
    styleUrls: ['./timetracking-charts.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniTimetrackingCharts implements AfterViewInit {
    @ViewChild('chartCanvas') private canvas: ElementRef;

    widget: IUniWidget;
    showPeriodSelector: boolean = false;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    chartRef: any;
    chartConfig: any;
    workrelationID: number;
    wagetypePeriods: any[] = this.getPeriods();
    currentPeriod = this.wagetypePeriods[1];

    constructor(private dataService: WidgetDataService, private cdr: ChangeDetectorRef) {}

    ngAfterViewInit() {
        if (this.widget) {
            this.getWorkRelationIDOnInit();
        }
    }

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef && this.chartRef.destroy) {
            this.chartRef.destroy();
        }
    }

    private getWorkRelationIDOnInit() {
        this.dataService.getData('/api/statistics?model=workrelation&select=ID as ID&filter=Worker.userid eq <userID>&top=1&expand=Worker')
            .subscribe((result) => {
                if (result && result.Data && result.Data.length) {
                    this.workrelationID = result.Data[0].ID;
                    this.getDataAndLoadChart();
                }
            });
    }

    private getDataAndLoadChart() {
        if (!this.workrelationID) {
            return;
        }

        switch (this.widget.config.type) {
            case 'wagetype_pie':
                this.showPeriodSelector = true;
                this.dataService.getData('/api/statistics?model=workitem&select=sum(minutes) as Sum,worktype.Name as Name&expand=worktype'
                + `&filter=( workrelationid eq ${this.workrelationID} ) ${this.buildDateFilter()}`).subscribe((data) => {
                    if (data && data.Data) {
                        this.chartConfig = this.getPieConfig(data.Data, 'Sum', 'Name');
                        this.drawChart();
                    }
                });
            break;
            case 'project_percent':
                this.dataService.getData(`/api/statistics?model=workitem&select=`
                    + `sum(casewhen(isnull(Dimensions.ProjectID,0) gt 0,Minutes,0) ) as project,`
                    + `sum(casewhen(isnull(Dimensions.ProjectID,0) eq 0,Minutes,0) ) as noProject`
                    + `&top=&expand=Dimensions`
                    + `&filter=workrelationid eq ${this.workrelationID}`
                ).subscribe((data) => {
                    if (data && data.Data && data.Data[0]) {
                        const projectAmount = data.Data[0].project || 0;
                        const noProjectAmount = data.Data[0].noProject || 0;

                        const chartData = [projectAmount, noProjectAmount];
                        const totalAmount = projectAmount + noProjectAmount;

                        if (totalAmount > 0) {
                            this.chartConfig = this.getPieConfig();
                            this.chartConfig.options.plugins.doughnutlabel.labels = [
                                {
                                    text: 'Prosjektprosent',
                                    font: { size: '14' }
                                },
                                {
                                    text: (projectAmount / totalAmount * 100).toFixed(1) + ' %',
                                    font: {
                                        size: '20',
                                        weight: 500
                                    }
                                }
                            ];
                            this.chartConfig.options.legend.display = false;
                            this.chartConfig.options.cutoutPercentage = 85;
                            this.chartConfig.data.datasets[0].backgroundColor = [
                                theme.widgets.kpi.c2a,
                                theme.widgets.kpi.background
                            ];
                            this.chartConfig.data.labels = ['Ført med prosent', 'Ført uten prosent'],
                            this.chartConfig.data.datasets[0].data = chartData;
                            this.drawChart();
                        }
                    }
                });
            break;
        }
    }

    public buildDateFilter() {
        let filter = '';
        if (this.currentPeriod.toDate && this.currentPeriod.fromDate) {
            filter += ` and date ge '${this.currentPeriod.fromDate}' and date le '${this.currentPeriod.toDate}'`;
        }
        return filter;
    }

    public updateData(period: any) {
        if (!period || period.label === this.currentPeriod.label) {
            return;
        }

        this.currentPeriod = period;
        this.getDataAndLoadChart();
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
        this.chartRef = new Chart(<any> this.canvas.nativeElement, this.chartConfig);
        this.cdr.markForCheck();
        this.dataLoaded.emit(true);
    }

    private getPieConfig(data?: any[], valueKey?: string, labelKey?: string) {
        const labels = [];
        const dataset = [];

        if (valueKey && labelKey) {
            let rest = [];

            let sorted = data.sort((a, b) => {
                return (a[valueKey] <= b[valueKey]) ? 1 : -1;
            });

            sorted = sorted.filter(x => x[valueKey] > 0);

            if (sorted.length > 5) {
                rest = sorted.splice(5 - 1);
            }

            sorted.forEach((item) => {
                labels.push((item[labelKey] || '').slice(0, 40));
                dataset.push(item[valueKey]);
            });

            if (rest.length) {
                labels.push('Resterende');
                dataset.push(rest.reduce((sum, item) => {
                    return sum + item[valueKey];
                }, 0));
            }
        }

        return {
            type: 'pie',
            plugins: [doughnutlabel],
            data: {
                datasets: [{
                    data: dataset,
                    backgroundColor: theme.widgets.pie_colors,
                    label: '',
                    borderColor: 'white'
                }],
                labels: labels
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'left',
                    labels: { usePointStyle: true }
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, array) => {
                            return array.labels[tooltipItem.index] + ': '
                            + (array.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] / 60).toFixed(2) + ' timer';
                        }
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

    private getPeriods() {
        return [
            {
                label: 'Denne uken',
                fromDate: moment().startOf('week').format('YYYY-MM-DD'),
                toDate: moment().endOf('week').format('YYYY-MM-DD')
            },
            {
                label: 'Denne måneden',
                fromDate: moment().startOf('month').format('YYYY-MM-DD'),
                toDate: moment().endOf('month').format('YYYY-MM-DD')
            },
            {
                label: 'I år',
                fromDate: moment().startOf('year').format('YYYY-MM-DD'),
                toDate: moment().endOf('year').format('YYYY-MM-DD')
            },
            {
                label: 'Totalt',
                fromDate: null,
                toDate: null
            }
        ];
    }
}
