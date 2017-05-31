import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkRelation, WorkItem, Worker, WorkBalance, LocalDate} from '../../../unientities';
import {WorkerService, IFilter} from '../../../services/timetracking/workerService';
import {exportToFile, arrayToCsv, safeInt, trimLength} from '../../common/utils/utils';
import {TimesheetService, TimeSheet} from '../../../services/timetracking/timesheetService';
import {IsoTimePipe} from '../../common/utils/pipes';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Lookupservice, BrowserStorageService} from '../../../services/services';
import {RegtimeTotals} from './totals/totals';
import {TimeTableReport} from './timetable/timetable';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {RegtimeBalance} from './balance/balance';
import {ActivatedRoute, Router} from '@angular/router';
import {ErrorService} from '../../../services/services';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {WorkEditor} from '../components/workeditor';
import {DayBrowser, Day, ITimeSpan, INavDirection} from '../components/daybrowser';
import {TeamworkReport, Team} from '../components/teamworkreport';
import {UniFileImport} from '../components/popupfileimport';
import * as moment from 'moment';

type colName = 'Date' | 'StartTime' | 'EndTime' | 'WorkTypeID' | 'LunchInMinutes' |
    'Dimensions.ProjectID' | 'CustomerOrderID';

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    activate?: (ts: TimeSheet, filter: IFilter) => void;
}

interface ISettings {
    useDayBrowser: boolean;
}

export var view = new View('timeentry', 'Timer', 'TimeEntry', false, '', TimeEntry);

@Component({
    selector: view.name,
    templateUrl: './timeentry.html'
})
export class TimeEntry {
    public busy: boolean = true;
    public missingWorker: boolean = false;
    public userName: string = '';
    public workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: IFilter;
    public currentBalance: WorkBalanceDto;
    public incomingBalance: WorkBalance;
    public teams: Array<Team>;
    private settings: ISettings = { 
        useDayBrowser: true 
    };

    @ViewChild(RegtimeTotals) private regtimeTotals: RegtimeTotals;
    @ViewChild(TimeTableReport) private regtimeTools: TimeTableReport;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(RegtimeBalance) private regtimeBalance: RegtimeBalance;
    @ViewChild(WorkEditor) private workEditor: WorkEditor;
    @ViewChild(DayBrowser) private dayBrowser: DayBrowser;
    @ViewChild(TeamworkReport) private teamreport: TeamworkReport;
    @ViewChild(UniFileImport) private fileImport: UniFileImport;

    public preSaveConfig: IPreSaveConfig = {
        askSave: () => this.checkSave(false),
        askReload: () => this.reset(false)
    };

    private actions: IUniSaveAction[] = [
            { label: 'Lagre endringer', action: (done) => this.save(done), main: true, disabled: true }
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
    public tabPositions: Array<number> = [0, 1, 2, 3, 4];

    public toolbarConfig: any = {
        title: 'Registrering av timer',
        omitFinalCrumb: true        
    };

    private initialContextMenu: Array<any> = [
        { label: 'Import', action: (done) => this.import(done), disabled: () => !this.isEntryTab },
        { label: 'Eksport', action: (done) => this.export(done), disabled: () => !this.isEntryTab },
        { label: 'Bytt visning', action: (done) => this.switchView(done), disabled: () => !this.isEntryTab }
    ];
    private isEntryTab: boolean = true;

    public filters: Array<IFilter>;

    constructor(
        private tabService: TabService,
        private service: WorkerService,
        private timesheetService: TimesheetService,
        private lookup: Lookupservice,
        private toast: ToastService,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private router: Router,
        private localStore: BrowserStorageService
    ) {

        this.loadSettings();
        this.filters = service.getIntervalItems();        
        this.initApplicationTab();

        route.queryParams.first().subscribe((item: { workerId; workRelationId; }) => {
            if (item.workerId) {
                this.init(item.workerId);
            } else {
                this.init();
            }
        });

        this.initTabPositions();
        this.approvalCheck();
    }

    private initApplicationTab() {
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
        this.isEntryTab = tab.name === 'timeentry';
    }

    public onAddNew() {
        this.workEditor.editRow(this.timeSheet.items.length - 1);
    }

    public reset(chkSave: boolean = true) {
        if (chkSave) {
            this.checkSave().then( () => {
                this.loadItems();
                this.reloadSums();
            });
        } else {
            this.loadItems();
            this.reloadSums();
        }
    }

    private reloadSums() {
        if (this.settings.useDayBrowser) {
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
            }, () => resolve(false) );
        });
    }

    private initWorker(workerid?: number, autoCreate = false) {
        var obs = workerid ? this.timesheetService.initWorker(workerid) :
            this.timesheetService.initUser(undefined, autoCreate);
        obs.subscribe((ts: TimeSheet) => {
            this.workRelations = this.timesheetService.workRelations;
            if ((!this.workRelations) || (this.workRelations.length === 0)) {
                this.initNewUser();
                return;
            }
            this.timeSheet = ts;
            this.loadItems();
            this.updateToolbar( !workerid ? this.service.user.name : '', this.workRelations );
        }, err => {
            this.errorService.handle(err);
        });
    }

    private initNewUser() {

        this.confirmModal.confirm('Aktivere din bruker for timeføring på denne klienten?',
            `Velkommen, ${this.service.user.name}!`)
            .then( (userChoice: ConfirmActions)  => {
                if (userChoice === ConfirmActions.ACCEPT) {
                    this.initWorker(undefined, true);
                    this.initApplicationTab();
                } else {
                    this.busy = false;
                    this.missingWorker = true;                    
                    this.tabService.removeTabs({ 
                        name: view.label, url: view.url, moduleID: UniModules.Timesheets });
                    this.router.navigateByUrl('/');
                }
            });
    }

    private updateToolbar(name?: string, workRelations?: Array<WorkRelation> ) {

        this.userName = name || this.userName;
        this.checkContextLabels();
        var contextMenus = this.initialContextMenu.slice();
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
                if (this.settings.useDayBrowser) { 
                    this.dayBrowser.current = new Day(dt, true, this.timeSheet.totals.Minutes); 
                }
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
                this.refreshViewItems();
                this.loadFlex(this.timeSheet.currentRelation);
                resolve(true);
            });
        });
    }

    private refreshViewItems() {
        this.loadItems(this.settings.useDayBrowser ? this.dayBrowser.current.date : undefined);
    }

    public export(done?: (msg?: string) => void) {
        var ts = this.timeSheet;
        var list = [];
        var isoPipe = new IsoTimePipe();
        ts.items.forEach((item: WorkItem) => {
            if (item.Date && item.Minutes) {
                var row = {
                    ID: item.ID,
                    Date: moment(item.Date).format().substr(0, 10),
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
        if (done) { done('Fil eksportert'); }
    }

    public import(done?: (msg?: string) => void) {
        this.checkSave().then( () => {
            this.fileImport.open().then( (success) => {
                if (success) { 
                    let ts = this.timeSheet.clone();
                    let importedList = this.fileImport.getWorkItems();
                    if (importedList && importedList.length > 0) {
                        var types = this.workEditor.getWorkTypes();
                        importedList.forEach( (x, index) => {
                            if (x && x.Worktype && x.Worktype.Name ) {
                                x.Worktype = types.find( t => t.Name === x.Worktype.Name);
                            }
                            // x.Worktype = x.Worktype || types[0];
                            x.WorkTypeID = x.Worktype && x.Worktype.ID ? x.Worktype.ID : x.WorkTypeID;
                            if (x.Minutes && !isNaN(x.Minutes)) {
                                ts.addItem(x, false);
                            }
                        });
                        ts.recalc();
                        this.timeSheet = ts;
                        this.flagUnsavedChanged();
                    }                    
                }
                if (done) { done(); }
            });
        });
    }

    private switchView(done) {
        this.checkSave().then( () => {
            this.settings.useDayBrowser = !this.settings.useDayBrowser;
            this.saveSettings();
            this.checkContextLabels();
            setTimeout( () => this.refreshViewItems(), 50 );
        });
        
    }

    private saveSettings() {
        this.localStore.save('timeentry.settings', JSON.stringify(this.settings), false );
    }

    private loadSettings() {
        var js = this.localStore.get('timeentry.settings', false);
        if (js) {
            this.settings = JSON.parse(js);
        }
    }

    private checkContextLabels() {
        this.initialContextMenu[2].label = 
            this.settings.useDayBrowser ? 'Bytt til filtervisning' : 'Bytt til ukevisning';
    }

    private flagUnsavedChanged(reset = false, updateCounter: boolean = false) {
        this.actions[0].disabled = reset;
        if (updateCounter && this.settings.useDayBrowser) {
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
                if (this.dayBrowser) {
                    this.dayBrowser.setDaySums(result.Data, 'WorkItemDate', '1', '12');
                }
            }
        });
    }

    public onNavigateDays(direction: INavDirection) {
        this.checkSave().then( () => {
            var dt = moment(direction.currentDate);
            this.busy = true;
            this.loadItems(dt.add('days', direction.daysInView * (direction.directionLeft ? -1 : 1)).toDate());
        });
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

    public mapTabPosition(index: number) {
        return this.tabPositions[index];
    }

    private initTabPositions() {
        var positions = [];
        this.tabs.forEach( (x, i) => positions.push(i) );
        this.tabPositions = positions;
    }

    private approvalCheck() {
        this.timesheetService.workerService.get('teams?action=my-teams')
            .subscribe( (result: Array<Team>) => {
                if (result && result.length > 0) {
                    this.teams = result;
                    let newKey = this.tabs.length;
                    let newPos = 2;
                    this.tabs.push({
                        name: 'approval', label: 'Godkjenning', counter: this.teams.length,
                        activate: (ts: any, filter: any) => {
                            if (!this.teamreport.isInitialized) {
                                this.teamreport.initialize(<any>this.teams);
                            }
                        }
                    });
                    this.tabPositions.splice(newPos, 0, newKey);
                }
            });
    }

    public onFilterClick(filter: IFilter) {
        this.checkSave().then((success: boolean) => {
            if (!success) { return; }
            this.filters.forEach((value: any) => value.isSelected = false);
            filter.isSelected = true;
            this.currentFilter = filter;
            this.busy = true;
            this.loadItems();
        });
    }



}

// tslint:disable:variable-name

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
