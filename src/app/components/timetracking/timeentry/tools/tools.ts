import {Component} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetservice';
import {WorkerService, IFilter} from '../../../../services/timetracking/workerservice';
import {safeInt} from '../../utils/utils';
import {ErrorService} from '../../../../services/services';

declare var moment;

@Component({
    selector: 'regtimetools',
    templateUrl: 'app/components/timetracking/timeentry/tools/tools.html'
})
export class RegtimeTools {
    private timesheet: TimeSheet;
    public config: {
        title: string,
        items: Array<any>,
        sumWork: number,
        sumTotal: number
    };
    public filters: Array<IFilter>;
    public currentFilter: IFilter;
    public busy: boolean = true;

    public sumColumns: any = [
        { types: [10, 11], name: 'Timeoff', label: 'Fri', sum: 0 },
        { types: [13], name: 'Vacation', label: 'Ferie', sum: 0 },
        { types: [20], name: 'Sickleave', label: 'Sykdom', sum: 0 }
    ];

    constructor(
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService
    ) {
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
        var compactedList = this.filterItems(items);
        var sums = this.sumItems(items);
        this.config = {
            title: ( compactedList && compactedList.length > 0 ) ? compactedList[0].Name : '',
            items: sums.report,
            sumWork: sums.sumWork,
            sumTotal: sums.sumTotal
        };
    }

    private filterItems(items: Array<any>): Array<any> {
        for (var i = items.length - 1; i >= 0; i--) {
            this.filterItem(items, i);
        }
        return items;
    }

    private filterItem(items: Array<any>, index: number) {
        var item = items[index];
        var systemType = safeInt(item.WorkTypeSystemType);
        var isHours = (systemType < 10 || systemType === 12);
        item.OffTime = item.OffTime || 0;
        if (!isHours) {
            let canMerge = index > 0 && item.WorkItemDate === items[index - 1].WorkItemDate;
            if (canMerge) {
                this.mergeItem(item, items[index - 1]);
                items.splice(index, 1);
            } else {
                this.mergeItem(item);
            }
        }
    }

    private mergeItem(item: any, target: any = undefined) {
        if (target) {
            this.createMergeSumsOnItem(item, target);
            if ( target.maxendtime < item.maxendtime ) {
                target.maxendtime = item.maxendtime;
            }
            if ( target.minstarttime > item.minstarttime ) {
                target.minstarttime = item.minstarttime;
            }
        } else {
            this.createMergeSumsOnItem(item, item);
            item.summinutes = 0;
            item.sumlunchinminutes = 0;
        }
    }

    private createMergeSumsOnItem(item: any, target: any) {
        var sysType = safeInt( item.WorkTypeSystemType );
        var minutes = safeInt( item.summinutes );
        this.sumColumns.forEach((sum) => {
            if (sum.types.indexOf(sysType) >= 0) {
                target[sum.name] = safeInt( (target[sum.name] || 0) ) + minutes;
            }
        });
    }

    private sumItems(items: Array<any>): { sumWork: number, sumTotal: number, report: Array<any> } {
        var prevWeek = 0;
        var totals = { sumWork: 0, sumTotal: 0, report: [] };
        this.sumColumns.forEach((col) => { col.sum = 0; });

        var week: { weekNumber: number, label: string, total: number, summinutes: number };

        for (var i = 0; i < items.length; i++) {
            let element = items[i];
            let itemSum = safeInt(element.summinutes || 0);
            let weekNumber = moment(element.WorkItemDate).isoWeek();
            if ( (i === 0) || weekNumber !== prevWeek) {
                if (week) {
                    totals.report.push(week);
                }
                week = { weekNumber: weekNumber, label: 'Uke ' + weekNumber, total: 0, summinutes: 0 };
            }
            totals.sumWork += itemSum;
            week.summinutes += itemSum;
            element.total = itemSum;
            this.sumColumns.forEach((col) => {
                if (element[col.name]) {
                    col.sum += safeInt(element[col.name]);
                    element.total += safeInt(element[col.name]);
                    week[col.name] = ( week[col.name] || 0 ) + safeInt(element[col.name]);
                }
            });
            totals.sumTotal += element.total;
            week.total += element.total;
            prevWeek = weekNumber;
            totals.report.push(element);
        }
        if (week) {
            totals.report.push(week);
        }
        return totals;
    }

    private queryTotals() {
        this.busy = true;
        var query = 'model=workitem';
        var filter = this.workerService.getIntervalFilter(this.currentFilter.interval);
        query += this.createArg('select', 'WorkRelation.WorkerId,BusinessRelation.Name,WorkRelation.Description,Date,WorkType.SystemType,min(starttime),max(endtime),sum(minutes),sum(lunchinminutes)');
        query += this.createArg('filter', 'workrelationid eq ' + this.timesheet.currentRelation.ID + ' and ( not setornull(deleted) )' + (filter ? ' and ( ' +  filter + ' )' : ''));
        query += this.createArg('join', 'workitem.worktypeid eq worktype.id and workitem.workrelationid eq workrelation.id and workrelation.workerid eq worker.id and worker.businessrelationid eq businessrelation.id');
        query += this.createArg('orderby', 'date');
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
