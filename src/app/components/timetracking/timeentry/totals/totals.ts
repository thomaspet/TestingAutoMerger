import {Component} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetService';
import {WorkerService, IFilter} from '../../../../services/timetracking/workerService';
import {ICol, Column, ColumnType} from '../../../common/utils/editable/interfaces';
import {ErrorService} from '../../../../services/services';

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
    private timesheet: TimeSheet;
    private config: { columns: Array<ICol>; items: Array<any>; sums: any };
    private filters: Array<IFilter>;
    private currentFilter: IFilter;
    private currentSource: IStatSource;
    private busy: boolean = true;

    private sources: Array<IStatSource>;

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
            this.currentSource = this.sources[1];
        }

        this.timesheet = ts;
        this.queryTotals();
    }

    private initSources(ts: TimeSheet) {
        this.sources = [
            {
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

    private onFilterClick(filter: IFilter) {
        this.currentFilter = filter;
        this.queryTotals();
    }

    public onSourceClick(source: IStatSource) {
        this.currentSource = source;
        this.queryTotals();
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
            lineSum.sum = (lineSum.sum || 0) + sum;
            items[i].sum = sum;
        }
        lineSum[this.currentSource.pivotResultColName] = 'Sum';

        this.config = {
            columns: cols,
            items: items,
            sums: lineSum
        };
    }

    private queryTotals() {
        const src = this.currentSource;
        if (!src.pivotResultColName) {
            src.pivotResultColName = src.pivotColName.replace('.', '_');
        }
        this.busy = true;
        let query = 'model=workitem';
        const filter = this.workerService.getIntervalFilter(this.currentFilter.interval, new Date());
        query += this.createArg('select', 'sum(minutes),WorkType.Name,' + src.pivotColName);
        query += this.createArg('filter', filter);
        if (src.filter) { query += (filter ? ' and ' : '') + '( ' + src.filter + ' )'; }
        query += this.createArg('pivot', 'true');
        query += src.join ? this.createArg('join', src.join) : '';
        query += src.expand ? this.createArg('expand', src.expand) : '';
        this.workerService.getStatistics(query).subscribe((result) => {
            this.busy = false;
            if (result) {
                if (result.Success) {
                    this.showData(result.Data);
                } else {
                    this.showData([{'label': result.Message}]);
                }
            }
        }, err => this.errorService.handle(err));
    }

    private createArg(name: string, value: string): string {
        return '&' + name + '=' + value;
    }
}
