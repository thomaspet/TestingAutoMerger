﻿import {Component, ElementRef, ViewChild} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetService';
import {WorkerService, IFilter} from '../../../../services/timetracking/workerService';
import {ICol, Column, ColumnType} from '../../../common/utils/editable/interfaces';
import {ErrorService} from '../../../../services/services';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import * as Chart from 'chart.js';


interface IStatSource {
    name: string;
    pivotColName: string;
    label: string;
    join?: string;
    filter?: string;
    pivotResultColName?: string;
    expand?: string;
}

@Component({
    selector: 'regtimetotals',
    templateUrl: './totals.html'
})
export class RegtimeTotals {
    @ViewChild('worktypeChart')
    private chartElement: ElementRef;

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public BAR_CHART_COLORS =
        ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585', '#9067a7', '#ab6857', '#ccc274', '#FFFFFF', '#000000'];
    public LINE_CHART_COLORS =
        ['#396bb1', '#da7c30', '#3e9651', '#cc2529', '#535154', '#6b4c9a', '#922428', '#948b3d', '#FFFFFF', '#000000'];
    public CUSTOM_COLORS = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4DD0E1',
        '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFF176 ', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE'];
    // public CUSTOM_COLORS = ['#FFCC66', '#FF9966', '#FF6666', '#FF3366', '#FF0066', '#990066', '#996666', '#999966',
    //     '#99CC66', '#99FF66', '#33FF66', '#33CC66', '#339966 ', '#336666', '#333366', '#330066'];
    private timesheet: TimeSheet;
    public config: { columns: Array<ICol>; items: Array<any>; sums: any };
    public busy: boolean = true;
    public showChart: boolean = true;
    private myChart: any;

    public filters: Array<IFilter>;
    public currentFilter: IFilter;

    // Leave in for later
    public charts: Array<any> = [
        {
            name: 'bar',
            label: 'Bar-chart',
            isSelected: false
        },
        {
            name: 'pie',
            label: 'Pie-chart',
            isSelected: true
        }
    ];

    public chart: any = this.charts[0];

    public sources: Array<IStatSource>;
    public currentSource: IStatSource;

    public tableConfig: UniTableConfig;
    public tableData: any[] = [];

    constructor(
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService
    ) {
        this.filters = workerService.getFilterIntervalItems();
    }

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) {
            this.initSources(ts);
            this.currentFilter = this.filters[3];
            this.currentSource = this.sources[0];
        }

        this.timesheet = ts;
        this.queryTotals();
    }

    private initSources(ts: TimeSheet) {
        this.sources = [
            {
                name: 'worktypes',
                label: 'Timeart',
                pivotColName: 'WorkType.Name',
                pivotResultColName: 'WorkTypeName',
                join: 'workitem.worktypeid eq worktype.id',
                filter: 'workrelationid eq ' + ts.currentRelation.ID
            }, {
                name: 'customers',
                label: 'Kunder (dine)',
                pivotColName: 'Info.Name',
                pivotResultColName: 'InfoName',
                expand: 'worktype,customer.info',
                filter: 'customerid gt 0 and workrelationid eq ' + ts.currentRelation.ID
            }, {
                name: 'orders',
                label: 'Ordre (dine)',
                pivotColName: 'CustomerOrder.CustomerName',
                pivotResultColName: 'CustomerOrderCustomerName',
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id',
                filter: 'customerorder.ordernumber gt 0 and workrelationid eq ' + ts.currentRelation.ID
            }, {
                name: 'ordersAll',
                label: 'Ordre (alle)',
                pivotColName: 'CustomerOrder.CustomerName',
                pivotResultColName: 'CustomerOrderCustomerName',
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id',
                filter: 'customerorder.ordernumber gt 0'
            }, {
                name: 'projects',
                label: 'Prosjekter (dine)',
                pivotColName: 'Project.Name',
                pivotResultColName: 'ProjectName',
                join: 'workitem.worktypeid eq worktype.id '
                    + 'and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id',
                filter: 'dimensions.projectid gt 0 and workrelationid eq ' + ts.currentRelation.ID
            }, {
                name: 'projectsAll',
                label: 'Prosjekter (alle)',
                pivotColName: 'Project.Name',
                pivotResultColName: 'ProjectName',
                join: 'workitem.worktypeid eq worktype.id '
                    + 'and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id',
                filter: 'dimensions.projectid gt 0'
            }, {
                name: 'tags',
                label: 'Merke/etikett',
                pivotColName: 'Label',
                pivotResultColName: 'WorkItemLabel',
                join: 'workitem.worktypeid eq worktype.id',
                filter: '( not isnull(label,\'\') eq \'\' ) and workrelationid eq ' + ts.currentRelation.ID
            }
        ];
    }

    public onFilterClick(filter: IFilter) {
        this.currentFilter = filter;
        this.queryTotals();
    }

    public onSourceClick(source: IStatSource) {
        this.currentSource = source;
        this.queryTotals();
    }

    public showHideChart() {
        this.showChart = !this.showChart;
        document.getElementById('totals-grid-container').style.maxWidth = this.showChart ? '50%' : 'none';
        setTimeout(() => {
            this.buildChart();
        }, 100);
    }


    private showData(items: Array<any>) {
        const cols: ICol[] = [];

        // Extract keys (since it has been pivoted with values as columnnames)
        if (items && items.length > 0) {
            for (const key in items[0]) {
                if (items[0].hasOwnProperty(key)) {
                    const col = new Column(key, key, ColumnType.Integer);
                    switch (key) {
                        case this.currentSource.pivotResultColName:
                            break;
                        default:
                            cols.push(col);
                            break;
                    }
                }
            }
        }

        // Make sums
        const lineSum: any = {};
        for (let i = 0; i < items.length; i++) {
            let sum = 0;
            for (let c = 0; c < cols.length; c++) {
                const col = cols[c];
                const value = items[i][col.name];
                const itemSum = value ? parseInt(value, 10) : 0;
                sum += itemSum;
                lineSum[col.name] = (lineSum[col.name] || 0) + itemSum;
            }
            lineSum.Total = (lineSum.sum || 0) + sum;
            items[i].Total = sum;
        }
        lineSum[this.currentSource.pivotResultColName] = 'Total';

        this.config = {
            columns: cols,
            items: items,
            sums: lineSum
        };

        if (this.showChart) {
            setTimeout(() => {
                this.buildChart();
            });
        }
    }

    private queryTotals() {
        const src = this.currentSource;
        if (!src.pivotResultColName) {
            src.pivotResultColName = src.pivotColName.replace('.', '_');
        }
        this.busy = true;
        const queryBool  = this.currentSource.name !== 'worktypes';
        let query = 'model=workitem';
        const filter = this.workerService.getIntervalFilter(this.currentFilter.interval, new Date());
        query += this.createArg('select', 'sum(minutes) as Total,WorkType.Name' + (queryBool ? ',' + src.pivotColName : ''));
        query += this.createArg('filter', filter);
        if (src.filter) { query += (filter ? ' and ' : '') + '( ' + src.filter + ' )'; }
        query += queryBool ? this.createArg('pivot', 'true') : '';
        query += src.join ? this.createArg('join', src.join) : '';
        query += src.expand ? this.createArg('expand', src.expand) : '';
        this.workerService.getStatistics(query).subscribe((result) => {
            this.busy = false;
            if (result) {
                if (result.Success) {
                    this.showData(result.Data);
                    this.tableData = result.Data;
                    this.buildTableConfig();
                } else {
                    this.showData([{'label': result.Message}]);
                }
            }
        }, err => this.errorService.handle(err));
    }

    private createArg(name: string, value: string): string {
        return '&' + name + '=' + value;
    }

    public onChartFilterClick(chart) {
        this.chart = chart;
        this.buildChart();
    }

    public buildTableConfig() {
        let cols = [];

        const elem = this.tableData[0];

        if (!!elem && this.currentSource.name !== 'worktypes') {
            for (const item in elem) {
                if (elem.hasOwnProperty(item) && item.substr(0, 1) !== '_') {
                    let col;
                    if (item === this.currentSource.pivotResultColName) {
                        col = new UniTableColumn(item, this.currentSource.label, UniTableColumnType.Text);
                        col.setWidth('12rem');
                    } else {
                        col = new UniTableColumn(item, item, UniTableColumnType.Number)
                        .setTemplate((row) => {
                            return row[item] ? (row[item] / 60).toFixed(2) : '';
                        });
                    }
                    cols.push(col);
                }
            }
            cols[cols.length - 1].setCls('totals-bold');
            cols[cols.length - 1].setIsSumColumn(true);
        } else {
            const worktypeCol = new UniTableColumn('WorkTypeName', 'Timeart', UniTableColumnType.Text);
            const sumCol = new UniTableColumn('Total', 'Timer', UniTableColumnType.Number).setTemplate(
                (item) => '' + (item.Total  / 60).toFixed(2))
            .setIsSumColumn(true)
            .setWidth('20%');

            cols = [worktypeCol, sumCol];
        }

        this.tableConfig = new UniTableConfig('hourreg.totals.newtable', false)
            .setDeleteButton(false)
            .setColumns(cols)
            .setColumnMenuVisible(false);
    }

    public buildChart() {
        if (!this.chartElement) {
            return;
        }

        if (this.myChart) {
            this.myChart.destroy();
        }

        const data = this.tableData;
        let labels = data.map(item => item.WorkTypeName);
        const legendPosition = (this.chart.name === 'doughnut' || this.chart.name === 'pie') ? 'left' : 'bottom';
        let myDataSet: any = [{
            label: 'Timer jobbet på gitt timeart',
            data: data.map(item => item.Total / 60),
            backgroundColor: this.chart.name !== 'line' ? this.CUSTOM_COLORS.slice(0, labels.length) : 'transparent',
            borderColor: this.chart.name === 'line' ? this.CUSTOM_COLORS[0] : 'white'
        }];

        if (this.currentSource.name !== 'worktypes') {
            labels = data.map(element => element[this.currentSource.pivotResultColName]);
            myDataSet = [];
            const elem = data[0];
            const keys = [];

            const datas = [];

            for (const item in elem) {
                if (elem.hasOwnProperty(item) && item.substr(0, 1) !== '_' && item !== 'Total'
                    && item !== this.currentSource.pivotResultColName) {
                    keys.push(item);
                }
            }

            keys.forEach(item => datas.push([]));

            data.forEach((element) => {
                keys.forEach((key, index) => {
                    datas[index].push(element[key]);
                });
            });

            keys.forEach((key, index) => {
                const colors =
                    this.chart.name === 'pie' ? this.CUSTOM_COLORS.slice(0, datas[index].length) : this.CUSTOM_COLORS[index];
                myDataSet.push({
                    label: key,
                    backgroundColor: colors,
                    data: datas[index]
                });
            });
        }

        this.myChart = new Chart(<any> this.chartElement.nativeElement, {
            type: this.chart.name,
            data: {
                labels: labels,
                datasets: myDataSet
            },
            options: {
                cutoutPercentage: this.chart.name === 'doughnut' ? 70 : 0,
                legend: {
                    position: legendPosition
                },
                tooltips: this.currentSource.name === 'worktypes' ? {} : {
                    callbacks: {
                        label: function(i, d) {
                            return d.labels[i.index] + ' - ' + d.datasets[i.datasetIndex].label
                                + ' ' + (d.datasets[i.datasetIndex].data[i.index] / 60).toFixed(2) + ' timer';
                        }
                    }
                }
            }
        });
    }
}
