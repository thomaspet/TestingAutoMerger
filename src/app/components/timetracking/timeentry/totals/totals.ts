import {Component, AfterViewInit} from "@angular/core";
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, ItemInterval} from '../../../../services/timetracking/workerservice';
import {MinutesToHoursPipe} from '../../utils/isotime';
import {ICol, Column, ColumnType} from '../../utils/editable/interfaces';
import {IFilter} from '../timeentry';

@Component({
    selector: 'regtimetotals',
    templateUrl: 'app/components/timetracking/timeentry/totals/totals.html',
    pipes: [MinutesToHoursPipe]
})
export class RegtimeTotals {
    private timesheet: TimeSheet;
    private config: { columns: Array<ICol>; items: Array<any>; }
    private filters: Array<IFilter> = [
        { name: 'today', label: 'I dag', interval: ItemInterval.today },
        { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
        { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth },
        { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
        { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
        { name: 'all', label: 'Alt', interval: ItemInterval.all}
    ];
    private currentFilter: IFilter;
    private busy = true;

    constructor(private workerService:WorkerService, private timesheetService: TimesheetService) {  }

    public activate(ts:TimeSheet, filter?: IFilter) {
        if (!this.timesheet) { this.currentFilter = this.filters[2]; }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
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
    

    showData(items:Array<any>) {
        var cols:ICol[] = [];
        
        // Extract keys (since it has been pivoted with values as columnnames)
        if (items && items.length>0) {
            for (var key in items[0]) {
                if (items[0].hasOwnProperty(key)) {
                    let col = new Column(key, key, ColumnType.Integer);
                    switch (key) {
                        case 'businessrelation_name':
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
            items[i].sum = sum;            
        }
        lineSum['businessrelation_name'] = 'Sum';
        items.push(lineSum);

        this.config = {
            columns: cols,
            items: items
        }
    }

    private queryTotals() {
        this.busy = true;
        var query = "model=workitem";
        query += this.createArg('select', 'sum(minutes),name,businessrelation.name');
        query += this.createArg('filter', this.workerService.getIntervalFilter(this.currentFilter.interval));
        query += this.createArg('pivot', 'true');
        query += this.createArg('join', 'workitem.worktypeid eq worktype.id and workitem.workrelationid eq workrelation.id and workrelation.workerid eq worker.id and worker.businessrelationid eq businessrelation.id');
        query += this.createArg('orderby', '');
        this.workerService.getStatistics(query).subscribe((items:Array<any>)=>{
            this.busy = false;
            if (items && items.length>0) {
                if (items[0].Success) {
                    this.showData(items[0].Data);
                } else {
                    this.showData([{'businessrelation_name':items[0].Message}]);
                }
            } 
        });
    }

    private createArg(name:string, value:string):string {
        return '&' + name + '=' + value;
    }
}   