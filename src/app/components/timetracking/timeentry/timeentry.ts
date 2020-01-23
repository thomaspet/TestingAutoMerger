import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {WorkRelation, WorkItem, Worker, WorkBalance, LocalDate} from '../../../unientities';
import { exportToFile, arrayToCsv, safeInt, trimLength, parseTime } from '../../common/utils/utils';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IsoTimePipe} from '../../common/utils/pipes';
import {IUniSaveAction} from '@uni-framework/save/save';
import {RegtimeTotals} from './totals/totals';
import {TimeTableReport} from './timetable/timetable';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {RegtimeBalance} from './balance/balance';
import {ActivatedRoute, Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {WorkEditor} from '@app/components/common/timetrackingCommon';
import {SideMenu, ITemplate, ITimeTrackingTemplate} from '../sidemenu/sidemenu';
import {TeamworkReport, Team} from '../components/teamworkreport';
import {TimeentryImportModal} from '../components/file-import-modal';
import {View as Vacation} from './vacation/vacation';
import {UniHttp} from '@uni-framework/core/http/http';

import {WorkerService, IFilter, IFilterInterval} from '@app/services/timetracking/workerService';
import {TimesheetService, TimeSheet, ValueItem} from '@app/services/timetracking/timesheetService';
import {ProjectService, ErrorService, PageStateService} from '@app/services/services';
import {IUniTab} from '@uni-framework/uni-tabs';

import * as moment from 'moment';

type colName = 'Date' | 'StartTime' | 'EndTime' | 'WorkTypeID' | 'LunchInMinutes' |
    'Dimensions.ProjectID' | 'CustomerOrderID';

@Component({
    selector: 'timeentry',
    templateUrl: './timeentry.html'
})
export class TimeEntry {
    busy: boolean = true;
    missingWorker: boolean = false;
    mode: string = '';
    userName: string = '';
    workRelations: Array<WorkRelation> = [];
    timeSheet: TimeSheet = new TimeSheet();
    currentBalance: WorkBalanceDto;
    incomingBalance: WorkBalance;
    teams: Array<Team>;
    percentage: number = 0;
    flexData: any = [];
    initialized: boolean = false;
    workedToday: string = '';

    private customDateSelected: Date = null;
    private currentDate: Date = new Date();
    private getTotalsFromQueryParams: boolean = false;

    @ViewChild(RegtimeTotals, { static: true })
    private regtimeTotals: RegtimeTotals;

    @ViewChild(TimeTableReport, { static: false })
    private timeTable: TimeTableReport;

    @ViewChild(RegtimeBalance, { static: true })
    private regtimeBalance: RegtimeBalance;

    @ViewChild(WorkEditor, { static: false })
    private workEditor: WorkEditor;

    @ViewChild(SideMenu, { static: false })
    private sideMenu: SideMenu;

    @ViewChild(TeamworkReport, { static: false })
    private teamreport: TeamworkReport;

    @ViewChild(Vacation, { static: false })
    private vacation: Vacation;

    public preSaveConfig: IPreSaveConfig = {
        askSave: () => this.checkSave(),
        askReload: () => this.reset(false)
    };

    actions: IUniSaveAction[] = [ { label: 'Lagre endringer', action: (done) => this.save(done), main: true, disabled: true }];
    saveActions: IUniSaveAction[] = [];

    public toolbarConfig: IToolbarConfig = {
        title: 'Registrere timer'
    };

    private initialContextMenu: Array<any> = [
        { label: 'Import', action: (done) => this.import(done) },
        { label: 'Eksport', action: (done) => this.export(done) }
    ];

    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {
            name: 'Registrering',
            onClick: () => {
                this.updateTabUrl('Registrering');
            }
        },
        {
            name: 'Timeliste',
            onClick: () => {
                this.updateTabUrl('Timeliste');
            }
        },
        {
            name: 'Totaler',
            onClick: () => {
                this.regtimeTotals.activate(this.timeSheet);
                this.updateTabUrl('Totaler');
            }
        },
        {
            name: 'Timesaldo',
            count: 0,
            onClick: () => {
                this.updateTabUrl('Timesaldo');
            }
        },
        {
            name: 'Ferie',
            onClick: () => {
                this.updateTabUrl('Ferie');
            }
        },
    ];

    public currentFilter: IFilter;
    private project;

    public filters: IFilter[];

    constructor(
        private tabService: TabService,
        private service: WorkerService,
        private timesheetService: TimesheetService,
        private toast: ToastService,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private http: UniHttp,
        private modalService: UniModalService,
        private projectService: ProjectService,
        private pageStateService: PageStateService,
        private toastService: ToastService,
    ) {

        this.filters = service.getFilterIntervalItems();
        this.initApplicationTab();


        this.route.queryParamMap.subscribe(paramMap => {
            if (paramMap.has('workerId')) {
                this.init(+paramMap.get('workerId'));
            } else {
                this.init();
            }
            if (paramMap.has('projectID')) {
                this.tabService.addTab({
                    name: 'Timer',
                    url: '/timetracking/timeentry?mode=Registrering&projectID=' + paramMap.get('projectID'),
                    moduleID: UniModules.Timesheets
                });
                this.projectService.Get(+paramMap.get('projectID')).subscribe(project => this.project = project);
            }

            if (paramMap.has('mode') || 'Registrering') {
                this.mode = paramMap.get('mode');
                if (paramMap.get('mode') === 'Totaler') {
                    this.getTotalsFromQueryParams = true;
                } else {
                    const tempIndex = this.tabs.findIndex((tab) => {
                        return tab.name === paramMap.get('mode');
                    });
                    this.activeTabIndex = tempIndex > 0 ? tempIndex : this.activeTabIndex;
                }
            }

            this.updateTabUrl(this.mode);
        });

        this.approvalCheck();
    }

    private updateTabUrl(mode: string) {
        this.mode = mode || this.mode;
        this.tabService.currentActiveTab.url = `/timetracking/timeentry?mode=${mode}`;
        this.pageStateService.setPageState('mode', mode);
        this.updateToolbar();
    }

    private initApplicationTab() {
        this.tabService.addTab({
            name: 'Timer',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Timesheets,
            active: true
        });
    }

    private init(workerId?: number) {
        if (workerId) {
            this.service.getByID(workerId, 'workers', 'Info').subscribe((worker: Worker) => {
                this.updateToolbar(worker.Info.Name);
            }, err => this.errorService.handle(err));
        } else {
            this.userName = this.service.user.name;
        }

        this.currentFilter = this.filters[0];
        this.initWorker(workerId);
    }

    private setWorkRelationById(id: number) {
        this.checkSave().then((canDeactivate) => {
            if (canDeactivate && id) {
                this.timeSheet.currentRelationId = id;
                this.updateToolbar();
                this.loadItems();
                if (this.timeTable) {
                    this.timeTable.activate();
                }
            }
        });
    }

    public onDateSelected(event) {
        this.checkSave().then(() => {
            if (event.date) {
                this.currentDate = event.date;
                this.busy = true;
                let toDate;
                let fromDate;
                if (moment(event.date) < moment(event.firstDate)) {
                    fromDate = event.date;
                    toDate = event.firstDate;
                } else {
                    toDate = event.date;
                    fromDate = event.firstDate;
                }
                this.currentFilter.bigLabel = moment(fromDate).format('DD.MM.YYYY')
                    + '  -  ' + moment(toDate).format('DD.MM.YYYY');
                this.customDateSelected = new Date(fromDate);
                this.loadItems(fromDate, toDate);
                this.showProgress(fromDate, toDate);
            } else {
                this.currentDate = event;
                this.busy = true;
                this.customDateSelected = new Date(event);
                this.currentFilter.isSelected = false;
                this.currentFilter = this.filters[0];
                this.currentFilter.isSelected = true;

                this.loadItems(event);
                this.currentFilter.bigLabel = moment(event).format('Do MMMM YYYY');
                this.showProgress(event);
            }

        });
    }

    public onMonthChanged(event) {
        let endpoint;
        if (event.month() === new Date().getMonth() && event.year() === new Date().getFullYear()) {
            endpoint = 'workrelations/' + this.workRelations[0].ID + '?action=timesheet&fromdate='
                + moment().startOf('month').startOf('week').format().slice(0, 10)
                + '&todate=' + moment().format().slice(0, 10);
        } else if (event.year() >= new Date().getFullYear() && event.month() > new Date().getMonth()) {
            this.prepFlexData({ Items: []});
            return;
        } else {
            endpoint = 'workrelations/' + this.workRelations[0].ID + '?action=timesheet&fromdate='
                + moment().year(event.year()).month(event.month())
                    .startOf('month').startOf('week').format().slice(0, 10)
                + '&todate=' + moment().year(event.year()).month(event.month())
                    .endOf('month').add(1, 'week').endOf('week').format().slice(0, 10);
        }


        this.getProgressData(endpoint).subscribe((data: any) => {
            this.prepFlexData(data);
        });
    }

    public onTemplateSelected(event: ITemplate) {
        event.Items.forEach((item: ITimeTrackingTemplate) => {
            this.timeSheet.addItem(this.mapTemplateToWorkItem({}, item));
            if (item && item.Project && item.Project.ID) {
                const value: ValueItem = {
                    name: 'Dimensions.ProjectID',
                    value: item.Project,
                    isParsed: false,
                    rowIndex: this.timeSheet.items.length - 1
                };
                this.timeSheet.setItemValue(value);
            }
        });

        this.timeSheet.recalc();
        this.flagUnsavedChanged();
        this.workEditor.refreshData();
    }

    private mapTemplateToWorkItem(workItem: any, template: ITimeTrackingTemplate) {
        const types = this.workEditor.getWorkTypes();
        if (this.customDateSelected) {
            workItem.Date = new LocalDate(this.customDateSelected);
        } else {
            workItem.Date = new LocalDate(this.currentFilter.date);
        }
        workItem.StartTime = template.StartTime ? parseTime(template.StartTime) : parseTime('8');
        workItem.EndTime = template.EndTime ? parseTime(template.EndTime) : parseTime('8');
        workItem.Minutes = template.Minutes;
        workItem.LunchInMinutes = template.LunchInMinutes;
        workItem.Description = template.Description;
        if (template.Worktype && template.Worktype.ID) {
            workItem.Worktype = types.find(t => t.ID === template.Worktype.ID);
        } else {
            workItem.Worktype = types[0];
        }
        workItem.WorkTypeID = workItem.Worktype.ID;
        return workItem;
    }

    public refresh() {
        this.changeDetectorRef.markForCheck();
    }

    public onAddNew() {
        this.workEditor.editRow(this.timeSheet.items.length - 1);
    }

    public reset(checkSave: boolean = true) {
        if (checkSave) {
            this.checkSave().then((canDeactivate) => {
                if (canDeactivate) {
                    this.loadItems();
                }
            });
        } else {
            this.loadItems();
            this.reloadFlex();
        }
    }

    public canDeactivate() {
        return this.checkSave();
    }

    private initWorker(workerid?: number, autoCreate = false) {
        const obs = workerid
            ? this.timesheetService.initWorker(workerid)
            : this.timesheetService.initUser(undefined, autoCreate);

        obs.subscribe((ts: TimeSheet) => {
            this.workRelations = this.timesheetService.workRelations;
            if ((!this.workRelations) || (this.workRelations.length === 0)) {
                this.initNewUser();
                return;
            }

            this.getFlexDataForCurrentMonth();

            this.timeSheet = ts;
            this.loadItems();

            // Wait to navigate to totals because this needs to Timesheet to work
            if (this.getTotalsFromQueryParams) {
                this.activeTabIndex = 2;
            }

            this.updateToolbar(!workerid ? this.service.user.name : '', this.workRelations);
            this.showProgress();
        }, err => {
            this.errorService.handle(err);
        });
    }

    private initNewUser() {
        this.modalService.confirm({
            header: 'Aktivere timeføring',
            message: 'Ønsker du å aktivere din bruker for timeføring på denne klienten?'
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.initWorker(undefined, true);
                this.initApplicationTab();
            } else {
                this.busy = false;
                this.missingWorker = true;
                this.tabService.closeTab();
            }
        });
    }

    private getFlexDataForCurrentMonth() {
        const endpoint = 'workrelations/' + this.workRelations[0].ID + '?action=timesheet&fromdate='
            + moment().startOf('month').startOf('week').format().slice(0, 10)
            + '&todate=' + moment().format().slice(0, 10);


        this.getProgressData(endpoint).subscribe((data: any) => {
            this.prepFlexData(data);
        });
    }

    private updateToolbar(name?: string, workRelations?: Array<WorkRelation>) {

        this.userName = name || this.userName;
        const contextMenus = this.initialContextMenu.slice();
        const list = workRelations || this.workRelations;

        // sorting list by IsActive in workrelation
        list.sort((a, b) =>  (a.IsActive === b.IsActive) ? 0 : a.IsActive ? -1 : 1);

        if (list && list.length > 1) {
            list.forEach(x => {
                const label = `Stilling: ${x.Description || ''} ${x.WorkPercentage}%`;
                contextMenus.push({ label: label, action: () => this.setWorkRelationById(x.ID) });
            });
        }

        let subTitle = '';
        if (this.timeSheet && this.timeSheet.currentRelation) {
            const ts = this.timeSheet.currentRelation;
            subTitle = `${ts.Description || ''} ${ts.WorkPercentage}%`;
        }

        this.toolbarConfig = {
            title: trimLength(this.userName, 20),
            subheads: [
                { title: subTitle }
            ]
        };

        if (this.mode === 'Registrering') {
            this.toolbarConfig.contextmenu = contextMenus;
            if (this.flexData && this.flexData.Items && this.initialized) {
                this.prepFlexData(this.flexData);
            }
        }

        this.saveActions = this.mode === 'Registrering' ? this.actions : [];

        if (this.mode === 'Ferie') {
            this.toolbarConfig.buttons = [{
                icon: 'beach_access',
                label: 'Ny ferie',
                action: () => this.vacation.openEditModal(null),
                tooltip: 'Opprett ny ferie'
            }];
        }
        this.initialized = true;
    }

    private loadItems(date?: Date, toDate?: Date) {
        if (this.workEditor) {
            this.workEditor.EmptyRowDetails.Date = new LocalDate(date);
        }

        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            let obs: any;
            let dt: Date;
            if (!!toDate) {
                obs = this.timeSheet.loadItemsByPeriod(date, toDate);
                dt = date;
            } else if (!!date) {
                obs = this.timeSheet.loadItemsByPeriod(date, date);
                dt = date;
            } else {
                obs = this.timeSheet.loadItems(this.currentFilter.interval, this.currentDate);
                dt = this.timesheetService.workerService.getFilterIntervalDate(
                    this.currentFilter.interval, this.currentDate
                );
            }
            obs.subscribe((itemCount: number) => {
                if (this.workEditor) { this.workEditor.closeEditor(); }
                this.flagUnsavedChanged(true, false);
                this.busy = false;
            }, err => this.errorService.handle(err));
        } else {
            alert('Current worker/user has no workrelations!');
        }
    }

    public onEditChanged(rowDeleted: boolean, event) {
        if (event) {
            const row = <WorkItem>this.timeSheet.items[event.rowIndex];
            if (!row.Dimensions && this.project && this.project.ID) {
                const value: ValueItem = {
                    name: 'Dimensions.ProjectID',
                    value: this.project,
                    isParsed: false,
                    rowIndex: event.rowIndex
                };
                this.timeSheet.setItemValue(value);
            }
        }
        this.flagUnsavedChanged(false, true);
    }

    public reloadFlex() {
        this.loadFlex(this.timeSheet.currentRelation);
    }

    public onBalanceChanged(value: number) {
        this.tabs[3].count = value;
    }

    private loadFlex(rel: WorkRelation) {
        if (this.regtimeBalance) {
            this.regtimeBalance.refresh(rel);
        }
    }

    // Formats flex data and sends it to calendar component
    private prepFlexData(data: any) {
        const flexDays = [];
        const flexWeeks = [];
        this.flexData = data;
        data.Items.forEach((item) => {
            if (item.IsWeekend) {
                flexDays.push('');
            } else {
                // Dont show deep red user has registered more then 3 hours
                if (item.Flextime < 0) {
                    const percentWorked = (item.ExpectedTime + item.Flextime) / (item.ExpectedTime || 1) * 100;
                    flexDays.push(percentWorked >= 50 ? 'calendar_flexminus_light' : 'calendar_flexminus');
                } else {
                    flexDays.push('calendar_flexplus');
                }
            }
        });

        // Fill the month up
        for (let indexInFlexDays = flexDays.length - 1; indexInFlexDays < 42; indexInFlexDays++) {
            flexDays.push('');
        }

        for (let i = 0; i <= 5; i++) {
            flexWeeks.push(flexDays.splice(0, 7));
        }

        if (this.sideMenu  && this.sideMenu.calendarConfig) {
            this.sideMenu.calendarConfig.dailyProgress = flexWeeks;
        }
    }

    private save(done?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {

            if (this.busy) { resolve(false); return; }

            if (!this.timeSheet.currentRelation.IsActive) {
                if (done) { done('Arbeidstidsmal er ikke aktiv, lagring avbrutt'); }
                this.toastService.addToast('Kan ikke lagre timer på inaktiv arbeidstidsmal', ToastType.bad, 5);
                return resolve(false);
            }

            if (!this.validate()) {
                if (done) { done('Feil ved validering'); }
                resolve(false);
                return;
            }

            this.busy = true;
            let counter = 0;
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
                this.refreshViewItems(this.customDateSelected || this.currentFilter.date);
                // Update the sidemenu calendar
                this.onMonthChanged(moment(this.customDateSelected || this.currentFilter.date));
                this.loadFlex(this.timeSheet.currentRelation);
                resolve(true);
                this.showProgress(this.customDateSelected);
            });
        });
    }

    private refreshViewItems(date?: Date) {
        this.loadItems(date);
    }

    public export(done?: (msg?: string) => void) {
        const ts = this.timeSheet;
        const list = [];
        const isoPipe = new IsoTimePipe();
        ts.items.forEach((item: WorkItem) => {
            if (item.Date && item.Minutes) {
                const row = {
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
        this.checkSave().then(() => {
            this.modalService.open(TimeentryImportModal, {}).onClose.subscribe(
                workItems => {
                    if (workItems && workItems.length) {
                        const timeSheet = this.timeSheet.clone();
                        const types = this.workEditor.getWorkTypes();

                        workItems.forEach((item, index) => {
                            if (item && item.Worktype && item.Worktype.Name ) {
                                item.Worktype = types.find(t => t.Name === item.Worktype.Name);
                            }

                            item.WorkTypeID = item.Worktype && item.Worktype.ID ? item.Worktype.ID : item.WorkTypeID;
                            if (item.Minutes && !isNaN(item.Minutes)) {
                                timeSheet.addItem(item, false);
                            }
                        });

                        timeSheet.recalc();
                        this.timeSheet = timeSheet;
                        this.flagUnsavedChanged();
                    }
                },
                err => console.error(err)
            );
        });
    }

    private flagUnsavedChanged(reset = false, updateCounter: boolean = false) {
        this.actions[0].disabled = reset;
    }

    private hasUnsavedChanges(): boolean {
        return !this.actions[0].disabled;
    }

    private validate(): boolean {
        const result:  { ok: boolean, message?: string, row?: number, fld?: string } = this.timeSheet.validate();
        if (!result.ok) {
            this.toast.addToast('Feil', ToastType.bad, 5, result.message );
            return false;
        }
        return true;
    }

    private checkSave(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.hasUnsavedChanges()) {
                resolve(true);
                return;
            }

            this.modalService.confirm({
                header: 'Ulagrede endringer',
                message: 'Ønsker du å lagre endringer før vi fortsetter?',
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                        this.save()
                            .then(() => resolve(true))
                            .catch(() => resolve(false));
                    break;
                    case ConfirmActions.REJECT:
                        resolve(true); // discard changes
                    break;
                    default:
                        resolve(false);
                    break;
                }
            });
        });
    }

    private approvalCheck() {
        this.timesheetService.workerService.get('teams?action=my-teams')
            .subscribe( (result: Array<Team>) => {
                if (result && result.length > 0) {
                    this.teams = result;
                    const newKey = this.tabs.length;
                    const newPos = 2;

                    const approvalTab = {
                        name: 'Godkjenning',
                        count: this.teams.length,
                        onClick: () => {
                            if (!this.teamreport.isInitialized) {
                                this.teamreport.initialize(this.teams);
                            }
                            this.updateTabUrl('Godkjenning');
                        }
                    };

                    this.tabs = [...this.tabs, approvalTab];
                }
            });
    }

    public onFilterClick(filter: IFilter) {
        if (filter === this.currentFilter) {
            return;
        }

        this.checkSave().then((success: boolean) => {
            if (success) {
                filter.bigLabel = this.service.getBigLabel(filter.interval, this.currentDate || new Date());
                filter.date = this.currentDate;
                this.currentFilter = filter;
                this.busy = true;
                this.sideMenu.calendar.onFilterChange(this.currentFilter);
                this.loadItems();
                this.customDateSelected = null;
                this.showProgress();
            }
        });
    }

    private showProgress(date?: any, toDate?: any) {
        let endpoint = 'workrelations/' + this.workRelations[0].ID + '?action=timesheet&fromdate=';

        if (toDate) {
            endpoint += moment(new Date(date)).format().slice(0, 10)
                + '&todate=' + moment(new Date(toDate)).format().slice(0, 10);
        } else if (date) {
            endpoint += moment(new Date(date)).format().slice(0, 10)
                + '&todate=' + moment(new Date(date)).format().slice(0, 10);
        } else {
            switch (this.currentFilter.interval) {
                case IFilterInterval.day:
                    endpoint += moment(this.currentDate).format().slice(0, 10)
                        + '&todate=' + moment(this.currentDate).format().slice(0, 10);
                    break;
                case IFilterInterval.week:
                    endpoint += moment(this.currentDate).startOf('week').format().slice(0, 10)
                        + '&todate=' + moment(this.currentDate).endOf('week').format().slice(0, 10);
                    break;
                case IFilterInterval.twoweeks:
                    endpoint += moment(this.currentDate).subtract(1, 'week').startOf('week').format().slice(0, 10)
                        + '&todate=' + moment(this.currentDate).endOf('week').format().slice(0, 10);
                    break;
                case IFilterInterval.month:
                    endpoint += moment(this.currentDate).startOf('month').format().slice(0, 10)
                        + '&todate=' + moment(this.currentDate).endOf('month').format().slice(0, 10);
                    break;
                case IFilterInterval.year:
                    endpoint += moment(this.currentDate).startOf('year').format().slice(0, 10)
                        + '&todate=' + moment(this.currentDate).endOf('year').format().slice(0, 10);
                    break;
                case IFilterInterval.all:
                    endpoint += '2016-01-01';
                    break;
                default:
                    endpoint += moment().format().slice(0, 10);
                    break;
            }
        }

        let expectedTime = 0;
        let totalTime = 0;

        this.getProgressData(endpoint).subscribe((data) => {
            // Loop data and sum up expected time and total time worked
            data.Items.forEach((item) => {
                expectedTime += item.ExpectedTime;
                totalTime += item.TotalTime;
            });
            this.workedToday = totalTime + ' timer';

            // Find percentage of hours worked (Max 100)
            let percentageWorked = totalTime / ((expectedTime || 1) / 100);
            percentageWorked = isNaN(percentageWorked) ? 0 : percentageWorked;

            this.percentage = Math.round(percentageWorked);
        });
    }

    private getProgressData(endpoint: string) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(endpoint)
            .send()
            .map(response => response.body);
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
