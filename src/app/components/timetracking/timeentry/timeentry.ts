import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkRelation, WorkItem, Worker, WorkBalance, LocalDate} from '../../../unientities';
import {WorkerService, IFilter} from '../../../services/timetracking/workerService';
import {exportToFile, arrayToCsv, safeInt, trimLength} from '../utils/utils';
import {TimesheetService, TimeSheet} from '../../../services/timetracking/timesheetService';
import {IsoTimePipe} from '../utils/pipes';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Lookupservice} from '../utils/lookup';
import {RegtimeTotals} from './totals/totals';
import {TimeTableReport} from './timetable/timetable';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {RegtimeBalance} from './balance/balance';
import {ActivatedRoute} from '@angular/router';
import {ErrorService} from '../../../services/services';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {WorkEditor} from '../components/workeditor';
import {DayBrowser, Day, ITimeSpan, INavDirection} from '../components/daybrowser';
import * as moment from 'moment';

type colName = 'Date' | 'StartTime' | 'EndTime' | 'WorkTypeID' | 'LunchInMinutes' |
    'Dimensions.ProjectID' | 'CustomerOrderID';

export var view = new View('timeentry', 'Timer', 'TimeEntry', false, '', TimeEntry);

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    activate?: (ts: TimeSheet, filter: IFilter) => void;
}

@Component({
    selector: view.name,
    templateUrl: './timeentry.html'
})
export class TimeEntry {
    public busy: boolean = true;
    public userName: string = '';
    public workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: IFilter;
    public currentBalance: WorkBalanceDto;
    public incomingBalance: WorkBalance;

    @ViewChild(RegtimeTotals) private regtimeTotals: RegtimeTotals;
    @ViewChild(TimeTableReport) private regtimeTools: TimeTableReport;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(RegtimeBalance) private regtimeBalance: RegtimeBalance;
    @ViewChild(WorkEditor) private workEditor: WorkEditor;
    @ViewChild(DayBrowser) private dayBrowser: DayBrowser;

    public preSaveConfig: IPreSaveConfig = { 
        askSave: () => this.checkSave(false),
        askReload: () => this.reset(false)
    };

    private actions: IUniSaveAction[] = [
            { label: 'Lagre endringer', action: (done) => this.save(done), main: true, disabled: true },
            { label: 'Eksporter', action: (done) => this.export(done), main: false, disabled: false }
        ];

    public tabs: Array<any> = [ { name: 'timeentry', label: 'Registrering', isSelected: true },
            { name: 'tools', label: 'Timeliste', activate: (ts: any, filter: any) =>
                this.regtimeTools.activate(ts, filter) },
            { name: 'totals', label: 'Totaler', activate: (ts: any, filter: any) =>
                this.regtimeTotals.activate(ts, filter) },
            { name: 'flex', label: 'Timesaldo', counter: 0 },
            { name: 'vacation', label: 'Ferie', activate: (ts: any, filter: any) => {
                this.tabs[4].activated = true; } },
            ];

    public toolbarConfig: any = {
        title: 'Registrering av timer',
        omitFinalCrumb: true
    };

    public filters: Array<IFilter>;   

    constructor(
        private tabService: TabService,
        private service: WorkerService,
        private timesheetService: TimesheetService,
        private lookup: Lookupservice,
        private toast: ToastService,
        private route: ActivatedRoute,
        private errorService: ErrorService
    ) {

        this.filters = service.getIntervalItems();
        this.initTab();

        route.queryParams.first().subscribe((item: { workerId; workRelationId; }) => {
            if (item.workerId) {
                this.init(item.workerId);
            } else {
                this.init();
            }
        });

    }

    private initTab() {
        this.tabService.addTab({ name: view.label, url: view.url, moduleID: UniModules.Timesheets });
    }

    private init(workerId?: number) {
        if (workerId) {
            this.service.getByID(workerId, 'workers', 'Info').subscribe( (worker: Worker) => {
                this.updateToolbar(worker.Info.Name);
            }, err => this.errorService.handle(err));
        } else {
            this.userName = this.service.user.name;
        }
        this.currentFilter = this.filters[0];
        this.initWorker(workerId);
    }

    public onWorkrelationChange(event: any) {
        var id = (event && event.target ? safeInt(event.target.value) : 0);
        this.setWorkRelationById(id);
    }

    private setWorkRelationById(id: number) {
        this.checkSave().then( () => {
            if (id) {
                this.timeSheet.currentRelationId = id;
                this.updateToolbar();
                this.loadItems();
            }
        });
    }

    public onTabClick(tab: ITab) {
        if (tab.isSelected) { return; }
        this.tabs.forEach((t: any) => {
            if (t.name !== tab.name) { t.isSelected = false; }
        });
        tab.isSelected = true;
        if (tab.activate) {
            tab.activate(this.timeSheet, this.currentFilter);
        }
    }

    public onAddNew() {
        this.workEditor.editRow(this.timeSheet.items.length - 1);
    }

    public reset(chkSave: boolean = true) {
        if (chkSave) {
            this.checkSave().then( () => {
                this.loadItems();
                this.dayBrowser.reloadSums();
            });
        } else {
            this.loadItems();
            this.dayBrowser.reloadSums();
        }
    }

    public onRowActionClicked(rowIndex: number, item: any) {
        this.timeSheet.removeRow(rowIndex);
        this.flagUnsavedChanged();
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( () => {
                resolve(true);
                this.initTab();
            }, () => resolve(false) );
        });
    }

    private initWorker(workerid?: number) {
        var obs = workerid ? this.timesheetService.initWorker(workerid) : this.timesheetService.initUser();
        obs.subscribe((ts: TimeSheet) => {
            this.workRelations = this.timesheetService.workRelations;
            this.timeSheet = ts;
            this.loadItems();
            this.updateToolbar( !workerid ? this.service.user.name : '', this.workRelations );
        }, err => this.errorService.handle(err));
    }

    private updateToolbar(name?: string, workRelations?: Array<WorkRelation> ) {

        this.userName = name || this.userName;

        var contextMenus = [];
        var list = workRelations || this.workRelations;
        if (list && list.length > 1) {
            list.forEach( x => {
                var label = `Stilling: ${x.Description || ''} ${x.WorkPercentage}%`;
                contextMenus.push( { label: label, action: () => this.setWorkRelationById(x.ID) });
            });
        }

        var subTitle = '';
        if (this.timeSheet && this.timeSheet.currentRelation) {
            let ts = this.timeSheet.currentRelation;
            subTitle = `${ts.Description || ''} ${ts.WorkPercentage}%`;
        }

        this.toolbarConfig = {
            title: trimLength(this.userName, 20),
            subheads: [
                { title: subTitle }
            ],
            omitFinalCrumb: true,
            navigation: {
                add: () => {
                    this.onAddNew();
                }
            },
            contextmenu: contextMenus
        };
    }

    private loadItems(date?: Date) {
        this.workEditor.EmptyRowDetails.Date = new LocalDate(date);        
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            var obs: any;
            var dt: Date;
            if (!!date) { 
                obs = this.timeSheet.loadItemsByPeriod(date, date); 
                dt = date;
            } else {
                obs = this.timeSheet.loadItems(this.currentFilter.interval);
                dt = this.timesheetService.workerService.getIntervalDate(this.currentFilter.interval);
            }
            obs.subscribe((itemCount: number) => {
                if (this.workEditor) { this.workEditor.closeEditor(); }
                this.dayBrowser.current = new Day(dt, true, this.timeSheet.totals.Minutes);
                this.flagUnsavedChanged(true, false);
                this.suggestTime();
                this.busy = false;
            }, err => this.errorService.handle(err));
        } else {
            alert('Current worker/user has no workrelations!');
        }
    }

    public onEditChanged(rowDeleted: boolean) {
        this.suggestTime();
        this.flagUnsavedChanged(false, true);
    }

    private suggestTime() {
        var def = moment().hours(8).minutes(0).seconds(0).toDate();
        if (this.timeSheet && this.timeSheet.items && this.timeSheet.items.length > 0) {
            def = this.timeSheet.items[this.timeSheet.items.length - 1].EndTime;
        }
        this.workEditor.EmptyRowDetails.StartTime = def;
    }

    public onVacationSaved() {
        this.loadFlex(this.timeSheet.currentRelation);
    }

    public onBalanceChanged(value: number) {
        this.tabs[3].counter = value;
    }

    private loadFlex(rel: WorkRelation) {
        console.log('loadFlex');
        this.regtimeBalance.refresh(rel);
    }

    private save(done?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {

            if (this.busy) { resolve(false); return; }

            if (!this.validate()) {
                if (done) { done('Feil ved validering'); }
                resolve(false);
                return;
            }

            this.busy = true;
            var counter = 0;
            this.timeSheet.saveItems().subscribe((item: WorkItem) => {
                counter++;
            }, (err) => {
                this.errorService.handle(err);
                if (done) { done('Feil ved lagring'); }
                this.busy = false;
                resolve(false);
            }, () => {
                this.flagUnsavedChanged(true);
                if (done) { done(counter + ' poster ble lagret.'); }
                this.loadItems(this.dayBrowser.current.date);
                this.loadFlex(this.timeSheet.currentRelation);
                resolve(true);
            });
        });
    }

    public export(done?: (msg?: string) => void) {
        var ts = this.timeSheet;
        var list = [];
        var isoPipe = new IsoTimePipe();
        ts.items.forEach((item: WorkItem) => {
            if (item.Date && item.Minutes) {
                var row = {
                    ID: item.ID,
                    Date: isoPipe.transform(item.Date, undefined),
                    StartTime: isoPipe.transform(item.StartTime, 'HH:mm'),
                    EndTime: isoPipe.transform(item.EndTime, 'HH:mm'),
                    WorkTypeID: item.WorkTypeID,
                    WorkType: item.Worktype ? item.Worktype.Name : '',
                    Minutes: item.Minutes,
                    LunchInMinutes: item.LunchInMinutes || 0,
                    Description: item.Description || '',
                    Project: item.Dimensions && item.Dimensions.Project ? item.Dimensions.Project.Name : ''
                    };
                list.push(row);
            }
        });

        exportToFile(arrayToCsv(list), `Timeentries_${this.userName}.csv`);
        done('Fil eksportert');
    }

    private flagUnsavedChanged(reset = false, updateCounter: boolean = false) {
        this.actions[0].disabled = reset;
        if (updateCounter) {
            this.dayBrowser.setDayCounter( this.dayBrowser.current.date, this.timeSheet.totals.Minutes);
        }
    }

    public onClickDay(event: Day) {
        this.checkSave().then( () => {
            this.busy = true;
            this.loadItems(event.date);
            event.selected = true;
        });
    }

    public onRequestDaySums(interval: ITimeSpan) {
        var wid = this.timeSheet.currentRelation.ID;
        var d1 = moment(interval.fromDate).format('YYYY-MM-DD');
        var d2 = moment(interval.toDate).format('YYYY-MM-DD');
        if (!wid) {
            return; // Nothing to do here yet..
        }
        var query = `model=workitem&select=sum(minutes),WorkType.SystemType,Date&filter=workrelationid eq ${wid}`
            + ` and ( not setornull(deleted) ) and ( date ge '${d1}' and date le '${d2}' )`
            + `&join=workitem.worktypeid eq worktype.id&pivot=true`;
        this.timesheetService.workerService.getStatistics(query).subscribe( (result: any) => {
            if (result && result.Data) {
                this.dayBrowser.setDaySums(result.Data, 'WorkItemDate', '1', '12');
            }
        });
    }

    public onNavigateDays(direction: INavDirection) {
        var dt = moment(direction.currentDate);
        this.busy = true;
        this.loadItems(dt.add('days', direction.daysInView * (direction.directionLeft ? -1 : 1)).toDate());
    }

    private hasUnsavedChanges(): boolean {
        return !this.actions[0].disabled;
    }

    private validate(): boolean {
        var result:  { ok: boolean, message?: string, row?: number, fld?: string } = this.timeSheet.validate();
        if (!result.ok) {
            this.toast.addToast('Feil', ToastType.bad, 5, result.message );
            if (result !== undefined && result.row >= 0) {
                // todo: focus cell that needs input
            }
            return false;
        }
        return true;
    }



    private checkSave(rejectIfFail: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.hasUnsavedChanges()) {
                this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Lagre endringer?', true)
                .then( (userChoice: ConfirmActions) => {
                    switch (userChoice) {
                        case ConfirmActions.ACCEPT:
                            this.save().then( x => {
                                if (x) { resolve(true); } else { if (rejectIfFail) { reject(); } }
                            });
                            break;

                        case ConfirmActions.CANCEL:
                            if (rejectIfFail) { reject(); }
                            break;

                        default:
                            resolve(true);
                            break;
                    }
                });
            } else {
                resolve(true);
            }
        });
    }

}

class WorkBalanceDto extends WorkBalance {
    public LastDayExpected: number;
    public LastDayActual: number;
    public expectedHours: number;
    public actualHours: number;
    public offHours: number;
    public hours: number;
    public lastDayBalanceHours: number;
    public lastDayBalance: number;
    public relationIsClosed: boolean;
    public Previous: any;
}

export interface IPreSaveConfig {
    askSave(): Promise<boolean>;
    askReload?(): void;
}
