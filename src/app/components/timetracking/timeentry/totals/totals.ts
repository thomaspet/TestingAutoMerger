import {Component} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, IFilter} from '../../../../services/timetracking/workerservice';
import {ICol, Column, ColumnType} from '../../utils/editable/interfaces';
import {ErrorService} from '../../../../services/services';

interface IStatSource {
    name: string;
    pivotColName: string;
    label: string;
    join: string;
    filter?: string;
    isSelected?: boolean;
    pivotResultColName?: string;
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
        this.filters = workerService.getIntervalItems();
    }

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) {
            this.initSources(ts);
            this.currentFilter = this.filters[3];
            this.currentSource = this.sources[1];
        }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
    }

    private initSources(ts: TimeSheet) {
        this.sources = [
            { name: 'workers', label: 'Personer', pivotColName: 'BusinessRelation.Name', isSelected: false, pivotResultColName: 'BusinessRelationName',
                join: 'workitem.worktypeid eq worktype.id and workitem.workrelationid eq workrelation.id and workrelation.workerid eq worker.id and worker.businessrelationid eq businessrelation.id',
            },
            { name: 'orders', label: 'Ordre (dine)', pivotColName: 'CustomerOrder.CustomerName', pivotResultColName: 'CustomerOrderCustomerName',
                isSelected: true,
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id',
                filter: 'customerorder.ordernumber gt 0 and workrelationid eq ' + ts.currentRelation.ID
            },
            { name: 'ordersAll', label: 'Ordre (alle)', pivotColName: 'CustomerOrder.CustomerName', pivotResultColName: 'CustomerOrderCustomerName',
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id',
                filter: 'customerorder.ordernumber gt 0'
            },
            { name: 'projects', label: 'Prosjekter (dine)', pivotColName: 'Project.Name', pivotResultColName: 'ProjectName',
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id',
                filter: 'dimensions.projectid gt 0 and workrelationid eq ' + ts.currentRelation.ID
            },
            { name: 'projectsAll', label: 'Prosjekter (alle)', pivotColName: 'Project.Name', pivotResultColName: 'ProjectName',
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id',
                filter: 'dimensions.projectid gt 0'
            }

        ];
    }

    private onFilterClick(filter: IFilter) {
        var f: IFilter;
        this.filters.forEach((value: any) => {
            if (value.name === filter.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false;
            }
        });
        this.currentFilter = f;
        this.queryTotals();
    }

    public onSourceClick(src: IStatSource) {
        var f: IStatSource;
        this.sources.forEach((value: any) => {
            if (value.name === src.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false;
            }
        });
        this.currentSource = f;
        this.queryTotals();
    }


    private showData(items: Array<any>) {
        var cols: ICol[] = [];

        // Extract keys (since it has been pivoted with values as columnnames)
        if (items && items.length > 0) {
            for (var key in items[0]) {
                if (items[0].hasOwnProperty(key)) {
                    let col = new Column(key, key, ColumnType.Integer);
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
        var lineSum: any = {};
        for (var i = 0; i < items.length; i++) {
            let sum = 0;
            for (var c = 0; c < cols.length; c++) {
                let col = cols[c];
                let value = items[i][col.name];
                let itemSum = value ? parseInt(value) : 0;
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
        var src = this.currentSource;
        if (!src.pivotResultColName) {
            src.pivotResultColName = src.pivotColName.replace('.', '_');
        }
        this.busy = true;
        var query = 'model=workitem';
        var filter = this.workerService.getIntervalFilter(this.currentFilter.interval);
        query += this.createArg('select', 'sum(minutes),WorkType.Name,' + src.pivotColName);
        query += this.createArg('filter', 'deleted eq \'false\'' + (filter ? ' and ( ' +  filter + ' )' : ''));
        if (src.filter) { query += ' and ( ' + src.filter + ' )'; }
        query += this.createArg('pivot', 'true');
        query += this.createArg('join', src.join);
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
