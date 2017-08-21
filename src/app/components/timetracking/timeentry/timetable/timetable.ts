import {Component, ViewChild, Input} from '@angular/core';
import {TimeSheet, TimesheetService, WorkerService} from '../../../../services/services';
import {ItemInterval, IFilter} from '../../../../services/timetracking/workerService';
import {toIso} from '../../../common/utils/utils';
import {ErrorService} from '../../../../services/services';
import {UniTimeModal} from '../../components/popupeditor';
import {IPreSaveConfig} from '../timeentry';
import * as moment from 'moment';
import {WorkItemGroup} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ReportWorkflow} from './pipes';
import {Sums, StatusCode, ReportFlow, IReport, Week, IWorkDay, Month} from './model';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {WorkitemGroupService} from './workitemgroupservice';
import {PopupMenu} from './popupmenu';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

@Component({
    selector: 'timetracking-timetable',
    templateUrl: './timetable.html',
    providers: [ReportWorkflow, WorkitemGroupService, PopupMenu]
})
export class TimeTableReport {
    @ViewChild(UniTimeModal) private timeModal: UniTimeModal;
    @Input() public eventcfg: IPreSaveConfig;
    @ViewChild(PopupMenu) private popup: PopupMenu;
    private timesheet: TimeSheet;
    public config: {
        title: string,
        items: Array<any>,
        sumWork: number,
        sumTotal: number
    };
    private defaultWorkTypeID: number;
    public report: IReport;
    public filters: Array<IFilter>;
    public currentFilter: IFilter;
    public busy: boolean = true;

    constructor(
        private workerService: WorkerService,
        private api: WorkitemGroupService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toast: ToastService
    ) {
        this.filters = [
            { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
            { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
            { name: 'months2', label: 'Siste 3 måneder', interval: ItemInterval.lastThreeMonths},
            { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear}
        ];

    }

    private get CurrentRelationID(): number {
        return this.timesheet.currentRelation.ID;
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
                    this.publishReloadEvent();
                });
                return;
            }

            this.timeModal.open(this.timesheet.currentRelation, day).then( x => {
                if (x) {
                    this.onFilterClick( this.currentFilter );
                    this.publishReloadEvent();
                }
            });
        }
    }

    private publishReloadEvent() {
        if (this.eventcfg && this.eventcfg.askReload) { this.eventcfg.askReload(); }
    }

    public onRowActionClicked(week: Week, event: MouseEvent) {

        var src: Element = <any>(event.target || event.srcElement);

        switch (week.Sums.Workflow) {
            case ReportFlow.Rejected:
                this.reAssignWeek(week);
                break;

            case ReportFlow.Draft:
                this.popup.clear();                
                this.popup.addItem('assign', 'Send til godkjenning', week);
                this.popup.activate(src, week.WeekNumber);
                break;

            case ReportFlow.PartialAssign:
                this.modalService.confirm( { 
                    header: 'Send inn ikke-godkjente timer?',
                    message: 'Ønsker du å sende inn timer som ikke er godkjent?'
                }).onClose.subscribe( response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.assignWeek(week);
                    }
                });
                break;
            
            case ReportFlow.Approved:
                this.modalService.confirm( { 
                    header: 'Låse opp godkjente timer ?',
                    message: 'Ønsker du å låse opp alle timene for denne uken ?'
                }).onClose.subscribe( response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.deleteAllGroupsForWeek(week);
                    }
                });
                break;

            case ReportFlow.AwaitingApproval:
                this.popup.clear();                
                this.popup.addItem('approve', 'Godkjenn', week);
                this.popup.addItem('reject', 'Avvis', week);
                this.popup.addItem('status', 'Vis tildelingsstatus', week);
                this.popup.addItem('reset', 'Nullstill innsending for denne uken', week);
                this.popup.activate(src, week.WeekNumber);                
                break;
                
            case ReportFlow.NotSet:
                this.popup.clear();
                this.popup.addItem('autofill', 'Registrer normaltid for hele uken', week);
                this.popup.activate(src, week.WeekNumber);
                break;

            default:
                this.popup.clear();                
                this.popup.addItem('assign', 'Send inn nye timeføringer for perioden', week);
                this.popup.addItem('reset', 'Nullstill innsending for perioden', week);
                this.popup.addItem('regroup', 'Send hele uken inn på nytt', week);
                this.popup.activate(src, week.WeekNumber);
                break;
        }
    }

    public onPopupMenuClick(event) {
        switch (event.name) {
            case 'assign':
                this.assignWeek(event.cargo);
                break;
            case 'reset':
                this.deleteAllGroupsForWeek(event.cargo);
                break;
            case 'regroup':
                this.reSendWeek(event.cargo);
                break;
            case 'status':
                this.showApprovers(event.cargo);
                break;
            case 'approve':
                this.approveWeek(event.cargo, true);
                break;
            case 'reject':
                this.approveWeek(event.cargo, false);
                break;
            case 'autofill':
                this.autoFillWeek(event.cargo);
                break;
        }
        console.log(event.name, event.cargo);
    }    

    private reAssignWeek(week: Week) {
        this.modalService.confirm({
            header: 'Sende inn på nytt ?',
            message: 'Ønsker du å prøve å sende inn aktuell avvist timeliste på nytt?'
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.api.GetGroups(this.CurrentRelationID, week.FirstDay, week.LastDay, StatusCode.Declined)
                    .subscribe( list => {
                        Observable.forkJoin(
                            list.map( x => this.api.Delete(x.ID) )
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

    private reSendWeek(week: Week) {
        this.api.GetGroups(this.CurrentRelationID, week.FirstDay, week.LastDay)
        .subscribe( list => {
            Observable.forkJoin(
                list.map( x => this.api.Delete(x.ID) )
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

    private deleteAllGroupsForWeek(week: Week) {
        week.isBusy = true;
        this.api.GetGroups(this.CurrentRelationID, week.FirstDay, week.LastDay)
        .subscribe( list => {
            Observable.forkJoin(
                list.map( x => this.api.Delete(x.ID) )
            )
            .finally( () => week.isBusy = false )
            .subscribe( result => {
                this.refreshReport(false);
            }, err => this.errorService.handle(err) );
        }, err => {
            this.errorService.handle(err);
            week.isBusy = false;
        });         
    }

    private approveWeek(week: Week, approve: boolean) {

        var rel = this.report.Relation.ID;
        var d1 = week.FirstDay;
        var d2 = week.LastDay;

        week.isBusy = true;

        this.api.GetGroups(rel, d1, d2, StatusCode.AwaitingApproval)
            .subscribe( list => {                    
                Observable.forkJoin(
                    list.map( x => { 
                        return approve ? this.api.Approve(x.ID) : this.api.Reject(x.ID); 
                    })
                )
                .finally( () => week.isBusy = false )
                .subscribe( result => {
                    this.refreshReport(false);
                }, err => {
                    var msg = this.errorService.extractMessage(err);
                    if (msg && msg.indexOf('exists an active approval task')) {
                        this.errorService.addErrorToast('Denne listen må godkjennes via'
                            + ' oppgavelisten til teamleder.');
                        return;
                    }
                    this.errorService.handle(err);
                });
            }, err => {
                this.errorService.handle(err);
                week.isBusy = false;
            });        
    }

    private showApprovers(week: Week, asToast: boolean = false) {
        this.api.GetGroups(this.CurrentRelationID, week.FirstDay, week.LastDay, StatusCode.AwaitingApproval)
            .subscribe( list => {
                Observable.forkJoin(
                    list.map( x => this.api.GetApprovers(x.ID) )
                ).subscribe( (results: Array<Array<{ name: string, email: string }>>) => {
                    var group: string = '';
                    results.forEach( nameList => {
                        nameList.forEach( (y, index) => {
                            group += ((!group) ? '' : ( index === nameList.length - 1 ? ' og ' : ', ')) 
                            + y.name.trim() + (y.email ? ` (${y.email})` : '');
                        });
                    });

                    if (!group) {
                        return;
                    }

                    var msgDetails = {
                        header: 'Godkjenningstatus for Uke ' + week.WeekNumber,
                        message: 'Tildelt til: ' + group,
                        buttonLabels: {
                            reject: 'Lukk',
                        }
                    };

                    if (asToast) {
                        this.toast.addToast(msgDetails.header, ToastType.good, 5, msgDetails.message);
                    } else {
                        this.modalService.confirm(msgDetails);
                    }
                });
            });
    }

    private autoFillWeek(week: Week, workTypeId: number = 0) {

        workTypeId = workTypeId || this.defaultWorkTypeID;

        if (!workTypeId) {
            // Fetch the workers most used worktype
            this.api.getStatistics('model=workitem&select=worktypeid as id,count(id)'
                + '&top=1&orderby=count(id) desc'
                + '&filter=workrelationid eq ' + this.CurrentRelationID)
                .map( x => x.Data )
                .subscribe( (list: Array<{ id: number}>) => {
                    if (list && list.length > 0 && list[0].id) {
                        this.autoFillWeek(week, list[0].id);
                        return;                 
                    }
                    // Not found... ok, lets fetch the first normal worktype:
                    this.api.get('worktypes?filter=systemtype eq 1&top=1&orderby=ID&select=ID,Name&hateoas=false')
                        .subscribe( (items: Array<{ID: number, Name: string }>) => {
                            if (items && items.length > 0 && items[0].ID) {
                                this.autoFillWeek(week, items[0].ID);
                            }
                        });
                });
            return;
        } 
        this.defaultWorkTypeID = workTypeId;

        var ts = new TimeSheet(this.timesheetService);
        ts.currentRelationId = this.CurrentRelationID;
        week.Items.forEach( x => {
            if (x.ExpectedTime > 0) {
                var offset = moment().utcOffset();
                var startTime = moment(x.Date).add(-offset, 'minutes').add(8, 'hours');
                var endTime = moment(startTime).add(x.ExpectedTime, 'hours');
                ts.addItem( <any>{ Date: x.Date, Minutes: x.ExpectedTime * 60, 
                    Description: 'Normaltid', WorkTypeID: workTypeId, LunchInMinutes: 0,
                    StartTime: toIso(startTime.toDate(), true), EndTime: toIso(endTime.toDate(), true) });
            }
        });
        week.isBusy = true;
        Observable.forkJoin(ts.saveItems(true))
            .finally( () => week.isBusy = false )
            .subscribe( x => {
                this.refreshReport(false);
                this.publishReloadEvent();
            }, err => this.errorService.handle(err));
    }

    private assignWeek(week: Week) {
        
        var rel = this.report.Relation.ID;
        var d1 = week.FirstDay;
        var d2 = week.LastDay;
        
        week.isBusy = true;

        // Locate any open drafts inside this week
        this.api.GetGroups(rel, d1, d2, StatusCode.Draft, StatusCode.Declined)
            .subscribe( (list: Array<WorkItemGroup>) => {
                // Did we find any ?
                if (list && list.length > 0) {
                    // Yes, lets assign them
                    Observable.forkJoin(
                        list.map( x => this.api.AssignGroup(x.ID) )
                    )
                    .finally(() => week.isBusy = false)
                    .subscribe( x => {
                        this.showApprovers(week, true);
                        this.refreshReport(false);
                    }, err => { 
                        this.errorService.handle(err); 
                    });
                } else {
                    // No, lets create a new one
                    this.api.CreateGroup(rel, d1, d2)
                    .subscribe( (group: WorkItemGroup) => {
                        this.api.AssignGroup(group.ID)
                        .finally(() => week.isBusy = false)
                        .subscribe( (x: WorkItemGroup) => {
                            this.showApprovers(week, true);
                            this.refreshReport(false);
                        }, err => { 
                            this.errorService.handle(err); 
                        });
                    },
                    err => { 
                        week.isBusy = false;
                        this.errorService.handle(err);
                    });
                }
            });
    }
    
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
        this.refreshReport(true);
    }

    private refreshReport(showBusy: boolean) {
        if (showBusy) { this.busy = true; }
        var dt = toIso(moment(this.workerService.getIntervalDate(this.currentFilter.interval))
            .startOf('week').toDate());
        this.api.GetTimeSheet(this.CurrentRelationID, dt)
            .subscribe( result => {
                this.report = this.groupIntoWeeks(<IReport>result);
                this.busy = false;
            }, err => this.errorService.handle(err));    
    }

    private groupIntoWeeks(report: IReport): any {
        var weeks = [];
        var week: Week;

        // Move items into each week (for easier templating)
        for (var i = 0; i < report.Items.length; i++) {
            let item = report.Items[i];
            if ((week && item.WeekNumber !== week.WeekNumber) || (!week)) {
                week = new Week(item.WeekNumber, item.Date);
                week.Items.push(item);
                weeks.push(week);
            } else {
                week.Items.push(item);
            }
        }

        // Ensure week is complete
        if (week) {
            week.addMissingDays();
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
                month = new Month(week.LastDay);
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

    private sumWeeks(weeks: Array<Week>) {
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
