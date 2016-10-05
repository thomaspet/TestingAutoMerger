import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkRelation, WorkItem, Worker} from '../../../unientities';
import {WorkerService, IFilter} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column, ColumnType, ITypeSearch, ICopyEventDetails, ILookupDetails} from '../utils/editable/editable';
import {parseDate, exportToFile, arrayToCsv, safeInt} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe, MinutesToHoursPipe} from '../utils/pipes';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Lookupservice} from '../utils/lookup';
import {RegtimeTotals} from './totals/totals';
import {RegtimeTools} from './tools/tools';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';
import {Router} from '@angular/router';

declare var moment;

export var view = new View('timeentry', 'Timer', 'TimeEntry', false, '', TimeEntry);

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    activate?: (ts: TimeSheet, filter: IFilter) => void;
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html',
    directives: [Editable, UniSave, RegtimeTotals, RegtimeTools],
    providers: [WorkerService, TimesheetService, Lookupservice],
    pipes: [IsoTimePipe, MinutesToHoursPipe]
})
export class TimeEntry {
    public busy: boolean = true;
    public userName: string = '';
    public workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: IFilter;
    private editable: Editable;

    @ViewChild(RegtimeTotals) private regtimeTotals: RegtimeTotals;
    @ViewChild(RegtimeTools) private regtimeTools: RegtimeTools;

    private actions: IUniSaveAction[] = [
            { label: 'Lagre endringer', action: (done) => this.save(done), main: true, disabled: true },
            { label: 'Eksporter', action: (done) => this.export(done), main: false, disabled: false }
        ];

    public tabs: Array<any> = [ { name: 'timeentry', label: 'Registrering', isSelected: true },
            { name: 'tools', label: 'Timeliste', activate: (ts: any, filter: any) => this.regtimeTools.activate(ts, filter) },
            { name: 'totals', label: 'Totaler', activate: (ts: any, filter: any) => this.regtimeTotals.activate(ts, filter) },
            // { name: 'flex', label: 'Fleksitid', counter: 15 },
            // { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            // { name: 'vacation', label: 'Ferie', counter: 22 },
            // { name: 'offtime', label: 'Fravær', counter: 4 },
            ];


    public filters: Array<IFilter>;

    public tableConfig: IConfig = {
        columns: [
            new Column('Date', '', ColumnType.Date),
            new Column('StartTime', '', ColumnType.Time),
            new Column('EndTime', '', ColumnType.Time),
            new Column('WorkTypeID', 'Timeart', ColumnType.Integer, { route: 'worktypes' }),
            new Column('LunchInMinutes', 'Lunsj', ColumnType.Integer),
            new Column('Description'),
            new Column('Dimensions.ProjectID', 'Prosjekt', ColumnType.Integer, { route: 'projects'}),
            new Column('CustomerOrderID', 'Ordre', ColumnType.Integer,
                { route: 'orders', filter: 'ordernumber gt 0', select: 'OrderNumber,CustomerName', visualKey: 'OrderNumber'}),
            new Column('Actions', '', ColumnType.Action)
            ],
        events: {
                onChange: (event) => {
                    return this.lookup.checkAsyncLookup(event, (e) => this.updateChange(e), (e) => this.asyncValidationFailed(e) ) || this.updateChange(event);
                },
                onInit: (instance: Editable) => {
                    this.editable = instance;
                },
                onTypeSearch: (details: ITypeSearch) => this.lookup.onTypeSearch(details),
                onCopyCell: (details: ICopyEventDetails) => this.onCopyCell(details)
            }
    };

    constructor(private tabService: TabService, private service: WorkerService,
                private timesheetService: TimesheetService, private lookup: Lookupservice,
                private toast: ToastService, private router: Router) {

        this.filters = service.getIntervalItems();

        this.tabService.addTab({ name: view.label, url: view.url, moduleID: UniModules.Timesheets });

        router.routerState.queryParams.first().subscribe((item: { workerId; workRelationId; }) => {
            if (item.workerId) {
                console.info('workerId:' + item.workerId + ', workRelationId:' + item.workRelationId);
                this.init(item.workerId);
            } else {
                this.init();
            }
        });

    }

    private init(workerId?: number) {
        if (workerId) {
            this.service.getByID(workerId, 'workers', 'Info').subscribe( (worker: Worker) => {
                this.userName = worker.Info.Name;
            });
        } else {
            this.userName = this.service.user.name;
        }
        this.currentFilter = this.filters[0];
        this.initWorker(workerId);
    }

    public onWorkrelationChange(event: any) {
        var id = (event && event.target ? safeInt(event.target.value) : 0);
        this.checkSave().then( (value) => {
            if (value && id) {
                this.timeSheet.currentRelationId = id;
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
        this.editable.editRow(this.timeSheet.items.length - 1);
    }

    public reset() {
        if (this.hasUnsavedChanges()) {
            if (confirm('Nullstille alle endringer uten å lagre ?')) {
                this.loadItems();
            }
        }
    }

    public onRowActionClicked(rowIndex: number, item: any) {
        this.editable.closeEditor();
        this.timeSheet.removeRow(rowIndex);
        this.flagUnsavedChanged();

    }

    public canDeactivate() {
        return this.checkSave();
    }

    private initWorker(workerid?: number) {
        var obs = workerid ? this.timesheetService.initWorker(workerid) : this.timesheetService.initUser();
        obs.subscribe((ts: TimeSheet) => {
            this.workRelations = this.timesheetService.workRelations;
            this.timeSheet = ts;
            this.loadItems();
        });
    }

    private loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems(this.currentFilter.interval).subscribe((itemCount: number) => {
                if (this.editable) { this.editable.closeEditor(); }
                this.timeSheet.ensureRowCount(itemCount + 1);
                this.flagUnsavedChanged(true);
                this.busy = false;
            });
        } else {
            alert('Current worker/user has no workrelations!');
        }
    }

    private save(done?: any) {

        if (!this.validate()) {
            if (done) { done('Feil ved validering'); }
            return;
        }

        if (this.busy) { return; }
        return new Promise((resolve, reject) => {
            this.busy = true;
            var counter = 0;
            this.timeSheet.saveItems().subscribe((item: WorkItem) => {
                counter++;
            }, (err) => {
                var msg = this.showErrMsg(err._body || err.statusText, true);
                if (done) { done('Feil ved lagring: ' + msg); }
                this.busy = false;
                resolve(false);
            }, () => {
                this.flagUnsavedChanged(true);
                if (done) { done(counter + ' poster ble lagret.'); }
                this.loadItems();
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

    private flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
    }

    private hasUnsavedChanges(): boolean {
        return !this.actions[0].disabled;
    }

    public onCopyCell(details: ICopyEventDetails) {

        details.copyAbove = true;

        if (details.columnDefinition) {
            var row = details.position.row;
            switch (details.columnDefinition.name) {
                case 'Date':
                    if (row === 0) {
                        details.valueToSet = parseDate('*', true);
                    }
                    break;

                case 'StartTime':
                    if (row > 0) {
                        let d1 = this.timeSheet.items[row].Date;
                        let d2 = this.timeSheet.items[row - 1].Date;
                        if (d1 && d2) {
                            if (d1 === d2 && (this.timeSheet.items[row - 1].EndTime) ) {
                                details.valueToSet = moment(this.timeSheet.items[row - 1].EndTime).format('HH:mm');
                                details.copyAbove = false;
                            }
                        }
                    } else {
                        details.valueToSet = '8';
                        details.copyAbove = false;
                    }
                    break;
            }

            // Lookup column?
            if (details.columnDefinition.lookup) {
                this.timeSheet.copyValueAbove(details.columnDefinition.name, details.position.row);
                details.copyAbove = false;
            }

        }
    }

    private validate(): boolean {
        var result:  { ok: boolean, message?: string, row?: number, fld?: string } = this.timeSheet.validate();
        if (!result.ok) {
            this.toast.addToast('Feil', ToastType.bad, 5, result.message );
            if (result !== undefined && result.row >= 0) {
                let iCol = this.tableConfig.columns.findIndex( (col) => col.name === result.fld );
                this.editable.editRow(result.row, iCol);
            }
            return false;
        }
        return true;
    }

    private asyncValidationFailed(event: IChangeEvent) {
        var droplistItems = this.editable.getDropListItems({ col: event.col, row: event.row});
        if (droplistItems && droplistItems.length === 1 && event.columnDefinition) {
            var lk: ILookupDetails = event.columnDefinition.lookup;
            let item = droplistItems[0];
            event.value = item[lk.colToSave || 'ID'];
            event.lookupValue = item;
            event.userTypedValue = false;
            this.updateChange(event);
        } else {
            this.toast.addToast(event.columnDefinition.label, ToastType.bad, 3, `Ugyldig ${event.columnDefinition.label}: ${event.value}`);
        }
    }

    private updateChange(event: IChangeEvent) {

        // Update value via timesheet
        if (!this.timeSheet.setItemValue(new ValueItem(event.columnDefinition.name, event.value, event.row, event.lookupValue))) {
            event.cancel = true;
            return;
        }

        this.flagUnsavedChanged();

		// Ensure a new row at bottom?
        this.timeSheet.ensureRowCount(event.row + 2);

		// we use databinding instead
        event.updateCell = false;

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

    private checkSave(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.hasUnsavedChanges()) {
                var result = confirm('Fortsette uten å lagre? Du vil miste alle endringer som du har lagt inn dersom du fortsetter !');
                resolve(result);
                return;
            }
            resolve(true);
        });
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        var txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":') > 0) {
                txt = msg.substr(msg.indexOf('"Message":') + 12, 80) + '..';
            }
        }
        alert(txt);
        return txt;
    }

}
