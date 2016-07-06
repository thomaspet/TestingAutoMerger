import {Component, AfterViewInit} from "@angular/core";
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, ItemInterval} from '../../../../services/timetracking/workerservice';
import {MinutesToHoursPipe} from '../../utils/pipes';
import {ICol, Column, ColumnType} from '../../utils/editable/interfaces';
import {IFilter} from '../timeentry';

interface IStatSource {
    name:string;
    pivotColName:string;
    label:string;
    join:string;
    filter?:string;
    isSelected?:boolean;
    pivotResultColName?:string;
}

@Component({
    selector: 'regtimetotals',
    templateUrl: 'app/components/timetracking/timeentry/totals/totals.html',
    pipes: [MinutesToHoursPipe]
})
export class RegtimeTotals {
    private timesheet: TimeSheet;
    private config: { columns: Array<ICol>; items: Array<any>; sums:any }
    private filters: Array<IFilter> = [
        { name: 'today', label: 'I dag', interval: ItemInterval.today },
        { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
        { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth },
        { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
        { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
        { name: 'all', label: 'Alt', interval: ItemInterval.all}
    ];
    private currentFilter: IFilter;
    private currentSource: IStatSource;
    private busy = true;

    private sources: Array<IStatSource>;

    constructor(private workerService:WorkerService, private timesheetService: TimesheetService) {  }

    public activate(ts:TimeSheet, filter?: IFilter) {
        if (!this.timesheet) { 
            this.initSources(ts);
            this.currentFilter = this.filters[2]; 
            this.currentSource = this.sources[1];
        }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
    } 

    initSources(ts:TimeSheet) {
        this.sources = [
            { name: 'workers', label: 'Personer', pivotColName: 'businessrelation.name', isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.workrelationid eq workrelation.id and workrelation.workerid eq worker.id and worker.businessrelationid eq businessrelation.id',            
            },
            { name: 'orders', label: 'Ordre (dine)', pivotColName: 'customerorder.customername', pivotResultColName:'CustomerName', 
                isSelected: true,
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id', 
                filter: 'customerorder.ordernumber gt 0 and workrelationid eq ' + ts.currentRelation.ID  
            },
            { name: 'ordersAll', label: 'Ordre (alle)', pivotColName: 'customerorder.customername', pivotResultColName:'CustomerName', 
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.customerorderid eq customerorder.id', 
                filter: 'customerorder.ordernumber gt 0'  
            },
            { name: 'projects', label: 'Prosjekter (dine)', pivotColName: 'project.name', 
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id', 
                filter: 'projectid gt 0 and workrelationid eq ' + ts.currentRelation.ID  
            },
            { name: 'projectsAll', label: 'Prosjekter (alle)', pivotColName: 'project.name', 
                isSelected: false,
                join: 'workitem.worktypeid eq worktype.id and workitem.dimensionsid eq dimensions.id and dimensions.projectid eq project.id', 
                filter: 'projectid gt 0'  
            }        
            
        ];    
    }

    onFilterClick(filter: IFilter) {
        var f:IFilter;
        this.filters.forEach((value:any) => {
            if (value.name === filter.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false
            }
        });        
        this.currentFilter = f;
        this.queryTotals();
    }
    
    onSourceClick(src: IStatSource) {
        var f:IStatSource;
        this.sources.forEach((value:any) => {
            if (value.name === src.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false
            }
        });        
        this.currentSource = f;
        this.queryTotals();        
    }


    showData(items:Array<any>) {
        var cols:ICol[] = [];
        
        // Extract keys (since it has been pivoted with values as columnnames)
        if (items && items.length>0) {
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
        var lineSum:any = {};
        for (var i=0; i<items.length;i++) {
            let sum = 0;
            for (var c=0; c<cols.length; c++) {
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
        }
    }

    private queryTotals() {
        var src = this.currentSource;
        if (!src.pivotResultColName) {
            src.pivotResultColName = src.pivotColName.replace('.', '_');
        }
        this.busy = true;
        var query = "model=workitem";
        var filter = this.workerService.getIntervalFilter(this.currentFilter.interval);
        query += this.createArg('select', 'sum(minutes),name,' + src.pivotColName);
        query += this.createArg('filter', 'deleted eq \'false\'' + (filter ? ' and ( ' +  filter + ' )' : ''));
        if (src.filter) query += ' and ( ' + src.filter + ' )';
        query += this.createArg('pivot', 'true');
        query += this.createArg('join', src.join);
        this.workerService.getStatistics(query).subscribe((items:Array<any>)=>{
            this.busy = false;
            if (items && items.length>0) {
                if (items[0].Success) {
                    this.showData(items[0].Data);
                } else {
                    this.showData([{'label':items[0].Message}]);
                }
            } 
        });
    }

    private createArg(name:string, value:string):string {
        return '&' + name + '=' + value;
    }
}   