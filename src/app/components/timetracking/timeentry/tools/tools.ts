import {Component} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, IFilter} from '../../../../services/timetracking/workerservice';
import {MinutesToHoursPipe} from '../../utils/pipes';
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
    private filters: Array<IFilter>;
    private currentFilter: IFilter;
    private busy: boolean = true;

    constructor(private workerService: WorkerService, private timesheetService: TimesheetService) {  
        this.filters = workerService.getIntervalItems();
    }

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) { 
            this.currentFilter = this.filters[3]; 
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
        var compactedList = this.extractSystemTypes(items);
        this.config = {
            title: compactedList[0].Name,
            items: compactedList,
            sums: this.sumItems(compactedList)
        };
    }

    private extractSystemTypes(items: Array<any>): Array<any> {
        var item: any;
        var systemType: number = 0;
        var isHours = false;
        for (var i = items.length - 1; i >= 0; i--) {
            item = items[i];
            systemType = parseInt(item.SystemType);
            isHours = (systemType <= 10 || systemType === 12);
            item.OffTime = item.OffTime || 0;
            if (!isHours) {
                if (i > 0 && item.Date === items[i - 1].Date) {
                    items[i - 1].OffTime = parseInt( items[i - 1].OffTime || 0 ) + parseInt( item.summinutes );
                    items.splice(i, 1);
                } else {
                    item.OffTime = parseInt( item.summinutes );
                    item.summinutes = 0;
                    item.sumlunchinminutes = 0;
                }
            }
        }
        return items;
    }

    private sumItems(items: Array<any>) {
        var sum = 0;
        var sum2 = 0;
        items.forEach(element => {
            sum += safeInt(element.summinutes || 0);
            sum2 += element.OffTime;    
        });
        return { minutes: sum, OffTime: sum2 };
    }

    private queryTotals() {
        this.busy = true;
        var query = 'model=workitem';
        var filter = this.workerService.getIntervalFilter(this.currentFilter.interval);
        query += this.createArg('select', 'workerid,businessrelation.name,workrelation.description,date,systemtype,min(starttime),max(endtime),sum(minutes),sum(lunchinminutes)');
        query += this.createArg('filter', 'workrelationid eq ' + this.timesheet.currentRelation.ID + ' and ( not setornull(deleted) )' + (filter ? ' and ( ' +  filter + ' )' : ''));
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
