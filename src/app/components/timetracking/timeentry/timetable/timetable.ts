import {Component, ViewChild, Input} from '@angular/core';
import {TimeSheet, TimesheetService, WorkerService} from '../../../../services/services';
import {ItemInterval, IFilter} from '../../../../services/timetracking/workerService';
import {toIso} from '../../../common/utils/utils';
import {ErrorService} from '../../../../services/services';
import {UniTimeModal} from '../../components/popupeditor';
import {IPreSaveConfig} from '../timeentry';
import * as moment from 'moment';
import {WorkItemGroup, WorkRelation} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ReportWorkflow} from './pipes';
import {Sums, StatusCode, ReportFlow, IReport, Week, IWorkDay, Month} from './model';
import {UniModalService} from '../../../../../framework/uni-modal';
import {WorkitemGroupService} from './workitemgroupservice';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {UniApproveTaskModal} from './approvetaskmodal';

@Component({
    selector: 'timetracking-timetable',
    templateUrl: './timetable.html',
    providers: [ReportWorkflow, WorkitemGroupService]
})
export class TimeTableReport {
    @Input() public set workrelation(value: WorkRelation ) {
        this.currentRelation = value;
        this.refreshReport(true);
    }
    @Input()
    public eventcfg: IPreSaveConfig;

    @Input()
    public lazy: boolean;

    private currentRelation: WorkRelation;
    private defaultWorkTypeID: number;
    public report: IReport;
    public filters: Array<IFilter>;
    public currentFilter: IFilter;
    public busy: boolean = true;
    private isActivated: boolean = false;
    public actions = [];

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
        this.currentFilter = this.filters[1];

        if (!this.isActivated) {
            this.isActivated = true;
            this.onFilterClick( this.currentFilter );
        }
    }

    private get CurrentRelationID(): number {
        return this.currentRelation ? this.currentRelation.ID : 0;
    }

    public activate() {
        if (!this.isActivated) {
            this.isActivated = true;
            this.onFilterClick( this.currentFilter );
        }
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

            const data = {
                date: day,
                relation: this.currentRelation
            };

            this.modalService.open(UniTimeModal, { data: data }).onClose.subscribe((res) => {
                if (res) {
                    this.onFilterClick( this.currentFilter );
                    this.publishReloadEvent();
                }
            });
        }
    }

    private publishReloadEvent() {
        if (this.eventcfg && this.eventcfg.askReload) { this.eventcfg.askReload(); }
    }

    public getActions(week: Week) {
        switch (week.Sums.Workflow) {

            case ReportFlow.Rejected:
                return [
                    { name: 'comments', label: 'Vis årsak/kommentar', cargo: week },
                    { name: 'reset', label: 'Lås opp denne uken for redigering', cargo: week }
                ];

            case ReportFlow.Draft:
                return [
                    { name: 'assign', label: 'Send til godkjenning', cargo: week }
                ];

            case ReportFlow.PartialAssign:
                return [
                    { name: 'assign', label: 'Send resterende poster til godkjenning', cargo: week },
                    { name: 'reset', label: 'Nullstill innsending for denne uken', cargo: week }
                ];

            case ReportFlow.Approved:
                return [
                    { name: 'reset', label: 'Lås opp denne uken for redigering', cargo: week }
                ];

            case ReportFlow.AwaitingApproval:
                return [
                    { name: 'approve', label: 'Godkjenn', cargo: week },
                    { name: 'reject', label: 'Avvis', cargo: week },
                    { name: 'status', label: 'Vis tildelingsstatus', cargo: week },
                    { name: 'reset', label: 'Nullstill innsending for denne uken', cargo: week }
                ];

            case ReportFlow.NotSet:
                return [
                    { name: 'autofill', label: 'Registrer normaltid for hele uken', cargo: week }
                ];

            default:
                return [
                    { name: 'assign', label: 'Send inn nye timeføringer for perioden', cargo: week },
                    { name: 'reset', label: 'Nullstill innsending for denne perioden', cargo: week },
                    { name: 'regroup', label: 'Send hele uken inn på nytt', cargo: week }
                ];
        }
    }

    public onActionClick(event) {
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
                this.approveOrRejectWeek(event.cargo, true);
                break;
            case 'reject':
                this.approveOrRejectWeek(event.cargo, false);
                break;
            case 'autofill':
                this.autoFillWeek(event.cargo);
                break;
            case 'comments':
                this.showComments(event.cargo);
                break;
        }
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

    public getIconString(index) {
        switch (index) {
            case 4:
                return 'hourglass_empty';
            case 5:
                return 'hourglass_full';
            case 7:
                return 'warning';
            case 8:
                return 'done';
            case 9:
                return 'error_outline';
            case 10:
                return 'done_all';
            default:
                return '';
        }
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

    private approveOrRejectWeek(week: Week, approve: boolean) {

        const rel = this.report.Relation.ID;
        const d1 = week.FirstDay;
        const d2 = week.LastDay;

        week.isBusy = true;

        this.api.GetGroups(rel, d1, d2, StatusCode.AwaitingApproval)
            .subscribe( (list: Array<{ID, StatusCode, TaskID}>) => {

                // Tasks (approve via dialog) ?
                const tasks = list.filter( x => !!x.TaskID);
                if (tasks && tasks.length > 0) {
                    const details = tasks[0];

                    this.modalService.open(UniApproveTaskModal, {
                        data: {
                            taskID: details.TaskID,
                            entityID: details.ID,
                            modelName: 'workitemgroup',
                            rejectMode: !approve
                        }
                    }).onClose.subscribe(approvedOrRejected => {
                        if (approvedOrRejected) {
                            this.refreshReport(false);
                        }

                        week.isBusy = false;
                    });
                    return;
                }

                // Direct approval via 'transitions'
                Observable.forkJoin(
                    list.map( x => {
                        return approve ? this.api.Approve(x.ID) : this.api.Reject(x.ID);
                    })
                )
                .finally( () => week.isBusy = false )
                .subscribe( result => {
                    this.refreshReport(false);
                }, err => {
                    const msg = this.errorService.extractMessage(err);
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
                ).subscribe( (results: Array<Array<{ name: string, email: string, statuscode: number }>>) => {
                    let group: string = '';
                    let activeCount = 0;
                    const approvalStatusActive = 50120;
                    results.forEach( nameList => {
                        nameList.forEach( (y, index) => {
                            group += ((!group) ? '' : ( index === nameList.length - 1 ? ' og ' : ', '))
                            + (y.name ? y.name.trim() : '?') + (y.email ? ` (${y.email})` : '');
                            activeCount += (y.statuscode === approvalStatusActive) ? 1 : 0;
                        });
                    });

                    if (!group) {
                        return;
                    }

                    const msgDetails = {
                        header: 'Uke ' + week.WeekNumber + ' tildelt til:',
                        message: group + ` - ${activeCount} godkjenning${activeCount > 1 ? 'er' : ''} gjenstår.`,
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

        const ts = new TimeSheet(this.timesheetService);
        ts.currentRelationId = this.CurrentRelationID;
        ts.currentRelation = this.currentRelation;
        week.Items.forEach( x => {
            if (x.ExpectedTime > 0) {
                const offset = moment().utcOffset();
                const startTime = moment(x.Date).add(-offset, 'minutes').add(8, 'hours');
                const endTime = moment(startTime).add(x.ExpectedTime, 'hours');
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

        const rel = this.report.Relation.ID;
        const d1 = week.FirstDay;
        const d2 = week.LastDay;
        week.isBusy = true;
        this.busy = true;

        // Locate any open drafts inside this week
        this.api.GetGroups(rel, d1, d2, StatusCode.Draft, StatusCode.Declined)
            .subscribe( (list: Array<WorkItemGroup>) => {
                // Did we find any ?
                if (list && list.length > 0) {
                    // Yes, lets assign them
                    Observable.forkJoin(
                        list.map( x => this.api.AssignGroup(x.ID) )
                    )
                    .finally(() => { week.isBusy = false; this.busy = false; })
                    .subscribe( x => {
                        this.showApprovers(week, true);
                        this.refreshReport(false);
                    }, err => {
                        this.errorService.handle(err);
                        this.busy = false;
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
                            this.busy = false;
                        }, err => {
                            this.errorService.handle(err);
                            this.busy = false;
                        });
                    },
                    err => {
                        week.isBusy = false;
                        this.busy = false;
                        this.errorService.handle(err);
                    });
                }
            });
    }

    private showComments(week: Week) {
        week.isBusy = true;
        this.api.GetGroups(this.CurrentRelationID, week.FirstDay, week.LastDay, StatusCode.Declined)
        .subscribe( (list: Array<WorkItemGroup>) => {
            let idFilter = '';
            list.forEach( (group, index) => {
                idFilter += (index > 0 ? ' or ' : '') + 'entityid eq ' + group.ID;
            });
            this.api.get(`comments?select=text&orderby=id desc&filter=entitytype eq 'workitemgroup'`
                + ` and (${idFilter})`)
                .finally( () => week.isBusy = false )
                .subscribe( (result: Array<{ Text: string }>) => {
                    let output = '';
                    result.forEach( (comment, index) => {
                        output += (index > 0 ? ', ' : '') + comment.Text;
                    });
                    this.toast.addToast('Kommentarer til uke ' + week.WeekNumber + ' :', ToastType.warn, 0, output);
                });
        });
    }

    public onFilterClick(filter: IFilter) {
        this.currentFilter = filter;
        this.refreshReport(true);
    }

    private refreshReport(showBusy: boolean) {
        if (this.lazy && !this.isActivated) {
            return;
        }
        if (!this.CurrentRelationID) {
            this.report = undefined;
            return;
        }
        return new Promise<boolean>( (resolve, reject) => {
            if (showBusy) { this.busy = true; }
            const dt = toIso(moment(this.workerService.getIntervalDate(this.currentFilter.interval))
                .startOf('week').toDate());
            this.api.GetTimeSheet(this.CurrentRelationID, dt)
                .subscribe( result => {
                    this.report = this.groupIntoWeeks(<IReport>result);
                    this.busy = false;
                    resolve(true);
                }, err => {
                    this.errorService.handle(err);
                    resolve(false);
                });
        });
    }

    private groupIntoWeeks(report: IReport): any {
        const weeks = [];
        let week: Week;

        // Move items into each week (for easier templating)
        for (let i = 0; i < report.Items.length; i++) {
            const item = report.Items[i];
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
        const months: Array<Month> = [];
        let month: Month;
        for (let i = 0; i < report.Weeks.length; i++) {
            const week = report.Weeks[i];
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
        sum.ProjectPrc = this.minValue(100, (sum.Projecttime || 0) / (sum.ValidTime || 1) * 100);
        sum.InvoicePrc = this.minValue(100, (sum.Invoicable || 0) / (sum.ValidTime || 1) * 100);
        sum.combineFlow(day.Workflow);
    }

    private minValue(v1: number, v2: number): number {
        return v1 < v2 ? v1 : v2;
    }

}
