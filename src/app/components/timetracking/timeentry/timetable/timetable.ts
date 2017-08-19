import {Component, ViewChild, Input} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetService';
import {WorkerService, ItemInterval, IFilter} from '../../../../services/timetracking/workerService';
import {toIso} from '../../../common/utils/utils';
import {ErrorService} from '../../../../services/services';
import {UniTimeModal} from '../../components/popupeditor';
import {IPreSaveConfig} from '../timeentry';
import * as moment from 'moment';
import {WorkItemGroup} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ReportWorkflow} from './pipes';
import {Sums, StatusCode, ReportFlow, IReport, IWeek, IWorkDay, Month} from './model';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';

@Component({
    selector: 'timetracking-timetable',
    templateUrl: './timetable.html',
    providers: [ReportWorkflow]
})
export class TimeTableReport {
    @ViewChild(UniTimeModal) private timeModal: UniTimeModal;
    @Input() public eventcfg: IPreSaveConfig;
    private timesheet: TimeSheet;
    public config: {
        title: string,
        items: Array<any>,
        sumWork: number,
        sumTotal: number
    };
    public report: IReport;
    public filters: Array<IFilter>;
    public currentFilter: IFilter;
    public busy: boolean = true;

    constructor(
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {
        this.filters = [
            { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
            { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
            { name: 'months2', label: 'Siste 3 måneder', interval: ItemInterval.lastThreeMonths},
            { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear}
        ];

    }

    private get CurrentRelationID(): number {
        return this.report.Relation.ID;
    } 

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) {
            this.currentFilter = this.filters[0];
        }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
    }

    public onDayClick(day: Date, checkSave: boolean = true) {
        if (day) {

            if (this.eventcfg && checkSave) {
                this.eventcfg.askSave().then( () => {
                    this.onDayClick(day, false);
                    this.eventcfg.askReload();
                });
                return;
            }

            this.timeModal.open(this.timesheet.currentRelation, day).then( x => {
                if (x) {
                    this.onFilterClick( this.currentFilter );
                    if (this.eventcfg && this.eventcfg.askReload) { this.eventcfg.askReload(); }
                }
            });
        }
    }

    public onRowActionClicked(week: IWeek) {

        switch (week.Sums.Workflow) {
            case ReportFlow.Rejected:
                this.reAssignWeek(week);
                break;

            case ReportFlow.Draft:
                this.assignWeek(week);
                break;

            case ReportFlow.AwaitingApproval:
                this.approveWeek(week);
                break;
        }
    }

    private reAssignWeek(week: IWeek) {
        this.modalService.confirm({
            header: 'Sende inn på nytt ?',
            message: 'Ønsker du å prøve å sende inn aktuell avvist timeliste på nytt?'
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.api_GetGroups(this.CurrentRelationID, 
                    week.FirstDay, week.Items[week.Items.length - 1].Date,
                    StatusCode.Declined)
                    .subscribe( list => {
                        Observable.forkJoin(
                            list.map( x => this.api_Delete(x.ID) )
                        )
                        .finally( () => this.busy = false )
                        .subscribe( result => {
                            this.assignWeek(week);
                        }, err => this.errorService.handle(err) );
                    }, err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    });    
            }
        });        
    }

    private approveWeek(week: IWeek) {

        var rel = this.report.Relation.ID;
        var d1 = week.FirstDay;
        var d2 = week.Items[week.Items.length - 1].Date;

        this.busy = true;
        this.api_GetGroups(rel, d1, d2, StatusCode.AwaitingApproval)
            .subscribe( list => {                    
                Observable.forkJoin(
                    list.map( x => this.api_Approve(x.ID) )
                )
                .finally( () => this.busy = false )
                .subscribe( result => {
                    this.refreshReport();
                }, err => this.errorService.handle(err) );
            }, err => {
                this.errorService.handle(err);
                this.busy = false;
            });        
    }

    private assignWeek(week: IWeek) {
        
        var rel = this.report.Relation.ID;
        var d1 = week.FirstDay;
        var d2 = week.Items[week.Items.length - 1].Date;
        
        this.busy = true;

        // Locate any open drafts inside this week
        this.api_GetGroups(rel, d1, d2, StatusCode.Draft, StatusCode.Declined)
            .subscribe( (list: Array<WorkItemGroup>) => {
                
                // Did we find any ?
                if (list && list.length > 0) {
                    // Yes, lets assign them
                    Observable.forkJoin(
                        list.map( x => this.api_AssignGroup(x.ID) )
                    )
                    .finally( () => this.busy = false )
                    .subscribe( x => this.refreshReport()
                    , err => this.errorService.handle(err));
                } else {
                    // No, lets create a new one
                    this.api_CreateGroup(rel, d1, d2)
                    .finally( () => this.busy = false )
                    .subscribe( (group: WorkItemGroup) => {
                        this.api_AssignGroup(group.ID)
                        .subscribe( x => this.refreshReport()
                        , err => this.errorService.handle(err) );
                    });
                }
            });
    }

    



    // ==========================================================
    //  API : TODO: MOVE INTO SERVICE
    // ==========================================================

    private api_GetGroups(relationId: number, fromDate, toDate, ... statuses: Array<StatusCode> ) {
        var d1 = toIso(fromDate);
        var d2 = toIso(toDate);
        var route = this.api_RouteBuilder('model=workitemgroup', 
            '&select', 'id as ID,statuscode as StatusCode',
            'expand', 'items', 'filter', `workrelationid eq ${relationId}`
                + ` and items.date ge '${d1}' and items.date le '${d2}'`);
        if (statuses) {
            route += ' AND (';
            statuses.forEach( (x, index) => 
                route += `${(index > 0 ? ' or ' : '')} statuscode eq ${x}`
            );
            route += ')';
        } 
        return this.workerService.getStatistics(route).map( x => x.Data );
    }

    private api_Approve(groupId: number) {
        return this.workerService.post(
            this.api_RouteBuilder('workitemgroups/' + groupId, 'action', 'Approve')
        );
    }

    private api_Reject(groupId: number) {
        return this.workerService.post(
            this.api_RouteBuilder('workitemgroups/' + groupId, 'action', 'Reject')
        );
    }    

    private api_Delete(groupId: number) {
        return this.workerService.deleteByID(groupId, 'workitemgroups');
    }

    private api_CreateGroup(relationId: number, fromDate, toDate) {
        var d1 = toIso(fromDate);
        var d2 = toIso(toDate);
        var rid = this.report.Relation.ID;
        var route = this.api_RouteBuilder('workitemgroups', 
            'action', 'create-from-items', 'workrelationid', rid, 'fromdate', d1, 'todate', d2);
        return this.workerService.post(route);
    }

    private api_AssignGroup(groupId: number) {
        return this.workerService.post(
            this.api_RouteBuilder('workitemgroups/' + groupId, 'action', 'Assign'));
    }

    private api_RouteBuilder(route: string, ... argPairs: any[] ) {
        var result = route;
        for (var i = 0; i < argPairs.length; i += 2 ) {
            result += ( argPairs[i].substr(0, 1) === '&' ? '' : i > 0 ? '&' : '?' ) 
            + argPairs[i] + '=' + argPairs[i + 1];
        }
        return result;
    }

    // ==========================================================


    private onFilterClick(filter: IFilter) {
        var f: IFilter;
        this.filters.forEach( value => {
            if (value.name === filter.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false;
            }
        });
        this.currentFilter = f;
        this.refreshReport();
    }

    private refreshReport() {
        this.busy = true;
        var dt = toIso(moment(this.workerService.getIntervalDate(this.currentFilter.interval))
            .startOf('week').toDate());
        this.workerService.get(`workrelations/${this.timesheet.currentRelation.ID}?action=timesheet&fromdate=${dt}`)
            .subscribe( result => {
                this.report = this.groupIntoWeeks(<IReport>result);
                this.busy = false;
            }, err => this.errorService.handle(err));    
    }

    private groupIntoWeeks(report: IReport): any {
        var weeks = [];
        var week: IWeek;

        // Move items into each week (for easier templating)
        for (var i = 0; i < report.Items.length; i++) {
            let item = report.Items[i];
            if ((week && item.WeekNumber !== week.WeekNumber) || (!week)) {
                week = { WeekNumber: item.WeekNumber, FirstDay: item.Date, Items: [], Sums: new Sums() };
                week.Items.push(item);
                weeks.push(week);
            } else {
                week.Items.push(item);
            }
        }

        // Add empty days at the end of last row?
        if (week && week.Items.length < 7) {
            let start = week.Items.length;             
            for (let ii = start; ii < 7; ii++) { 
                let endDate = moment(week.FirstDay).add(ii, 'days').toDate();
                week.Items.push( { TotalTime: 0, IsWeekend: ii >= 5, Date: endDate } );
            }            
        }

        // Creatsums
        this.sumWeeks(weeks);
        report.Weeks = weeks;

        return this.groupIntoMonths(report);
    }

    private groupIntoMonths(report: IReport): IReport {
        var months: Array<Month> = [];
        var month: Month;
        for (var i = 0; i < report.Weeks.length; i++) {
            let week = report.Weeks[i];
            if (month === undefined || (!month.isInMonth(week))) {
                month = new Month(week.Items[week.Items.length - 1].Date);
                month.Weeks.push(week);
                months.push(month);
            } else {
                month.Weeks.push(week);
            }
            this.addSums(month.Sums, week.Sums);
        }
        report.Months = months;
        return report;
    }

    private sumWeeks(weeks: Array<IWeek>) {
        weeks.forEach( x => x.Items.forEach( y => this.addSums(x.Sums, y)) );
    }

    private addSums(sum: Sums, day: IWorkDay | Sums) {
        sum.TotalTime += day.TotalTime || 0;
        sum.ExpectedTime += day.ExpectedTime || 0;
        sum.Flextime += day.Flextime || 0;
        sum.Overtime += day.Overtime || 0;
        sum.Projecttime += day.Projecttime || 0;
        sum.SickTime += day.SickTime || 0;
        sum.TimeOff += day.TimeOff || 0;
        sum.ValidTime += day.ValidTime || 0;
        sum.Invoicable += day.Invoicable || 0;
        sum.ProjectPrc = this.minValue(100, (sum.Projecttime || 0) / (sum.ExpectedTime || 1) * 100);
        sum.InvoicePrc = this.minValue(100, (sum.Invoicable || 0) / (sum.ExpectedTime || 1) * 100);    
        sum.combineFlow(day.Workflow);
    }

    private minValue(v1: number, v2: number): number {
        return v1 < v2 ? v1 : v2;
    }

}
