import {Component} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, ItemInterval} from '../../../../services/timetracking/workerservice';
import {MinutesToHoursPipe} from '../../utils/pipes';
import {IFilter} from '../timeentry';
import {IsoTimePipe} from '../../utils/pipes';
import {safeInt} from '../../utils/utils';

@Component({
    selector: 'regtimetools',
    templateUrl: 'app/components/timetracking/timeentry/tools/tools.html',
    pipes: [MinutesToHoursPipe, IsoTimePipe]
})
export class RegtimeTools {
    private timesheet: TimeSheet;
    private config: {
        title: string, 
        items: Array<any>,
        sums: { minutes: number }
    };
    private filters: Array<IFilter> = [
        { name: 'today', label: 'I dag', interval: ItemInterval.today },
        { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
        { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth },
        { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
        { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
        { name: 'all', label: 'Alt', interval: ItemInterval.all}
    ];
    private currentFilter: IFilter;
    private busy: boolean = true;

    constructor(private workerService: WorkerService, private timesheetService: TimesheetService) {  }

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) { 
            this.currentFilter = this.filters[2]; 
        }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
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
    

    private showData(items: Array<any>) {
        this.config = {
            title: items[0].Name,
            items: items,
            sums: this.sumItems(items)
        };
    }

    private sumItems(items: Array<any>) {
        var sum = 0;
        items.forEach(element => {
            sum += safeInt(element.summinutes || 0);    
        });
        return { minutes: sum };
    }

    private queryTotals() {
        this.busy = true;
        var query = 'model=workitem';
        var filter = this.workerService.getIntervalFilter(this.currentFilter.interval);
        query += this.createArg('select', 'workerid,businessrelation.name,workrelation.description,date,min(starttime),max(endtime),sum(minutes),sum(lunchinminutes)');
        query += this.createArg('filter', 'workrelationid eq ' + this.timesheet.currentRelation.ID + ' and deleted eq \'false\'' + (filter ? ' and ( ' +  filter + ' )' : ''));
        query += this.createArg('join', 'workitem.worktypeid eq worktype.id and workitem.workrelationid eq workrelation.id and workrelation.workerid eq worker.id and worker.businessrelationid eq businessrelation.id');
        query += this.createArg('orderby', 'date');
        this.workerService.getStatistics(query).subscribe((items: Array<any>) => {
            this.busy = false;
            if (items && items.length > 0) {
                if (items[0].Success) {
                    this.showData(items[0].Data);
                } else {
                    this.showData([{'label': items[0].Message}]);
                }
            } 
        });
    }

    private createArg(name: string, value: string): string {
        return '&' + name + '=' + value;
    }
}   
