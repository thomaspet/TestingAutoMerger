import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkRelation, WorkItem, Worker, WorkBalance} from '../../../unientities';
import {WorkerService, IFilter, ItemInterval} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column, ColumnType, ITypeSearch, 
    ICopyEventDetails, ILookupDetails, IStartEdit} from '../utils/editable/editable';
import {parseDate, exportToFile, arrayToCsv, safeInt, trimLength, roundTo} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe} from '../utils/pipes';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Lookupservice} from '../utils/lookup';
import {RegtimeTotals} from './totals/totals';
import {RegtimeTools} from './tools/tools';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';
import {ActivatedRoute} from '@angular/router';
import {ErrorService} from '../../../services/common/ErrorService';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

declare var moment;

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
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html'
})
export class TimeEntry {
    public busy: boolean = true;
    public userName: string = '';
    public workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: IFilter;
    private editable: Editable;
    public currentBalance: any;

    @ViewChild(RegtimeTotals) private regtimeTotals: RegtimeTotals;
    @ViewChild(RegtimeTools) private regtimeTools: RegtimeTools;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private actions: IUniSaveAction[] = [
            { label: 'Lagre endringer', action: (done) => this.save(done), main: true, disabled: true },
            { label: 'Eksporter', action: (done) => this.export(done), main: false, disabled: false }
        ];

    public tabs: Array<any> = [ { name: 'timeentry', label: 'Registrering', isSelected: true },
            { name: 'tools', label: 'Timeliste', activate: (ts: any, filter: any) => 
                this.regtimeTools.activate(ts, filter) },
            { name: 'totals', label: 'Totaler', activate: (ts: any, filter: any) => 
                this.regtimeTotals.activate(ts, filter) },
            { name: 'flex', label: 'Fleksitid', counter: 0 }
            // { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            // { name: 'vacation', label: 'Ferie', counter: 22 },
            // { name: 'offtime', label: 'Fravær', counter: 4 },
            ];

    public toolbarConfig: any = {
        title: 'Registrering av timer',
        omitFinalCrumb: true             
    };

    public filters: Array<IFilter>;

    public tableConfig: IConfig = {
        columns: [
            new Column('Date', '', ColumnType.Date),
            new Column('StartTime', '', ColumnType.Time),
            new Column('EndTime', '', ColumnType.Time),
            new Column('WorkTypeID', 'Timeart', ColumnType.Integer, { route: 'worktypes' }),
            new Column('LunchInMinutes', 'Lunsj', ColumnType.Integer),
            new Column('Description'),
            new Column('Dimensions.ProjectID', 'Prosjekt', ColumnType.Integer, 
                { route: 'projects', select: 'ProjectNumber,Name', visualKey: 'ProjectNumber' }),
            new Column('CustomerOrderID', 'Ordre', ColumnType.Integer,
                { route: 'orders', filter: 'ordernumber gt 0', select: 'OrderNumber,CustomerName', 
                visualKey: 'OrderNumber'}),
            new Column('Actions', '', ColumnType.Action)
            ],
        events: {
                onChange: (event) => {
                    return this.lookup.checkAsyncLookup(event, (e) => this.updateChange(e), 
                    (e) => this.asyncValidationFailed(e) ) || this.updateChange(event);
                },
                onInit: (instance: Editable) => {
                    this.editable = instance;
                },
                onTypeSearch: (details: ITypeSearch) => this.lookup.onTypeSearch(details),
                onCopyCell: (details: ICopyEventDetails) => this.onCopyCell(details),
                onStartEdit: (details: IStartEdit) => this.onStartEdit(details)
            }
    };

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
        this.toast.addToast('setWorkRelationById', ToastType.warn, 3, 'id = ' + id  );
        this.checkSave().then( (value) => {
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
        this.editable.editRow(this.timeSheet.items.length - 1);
    }

    public reset() {
        this.checkSave().then( (x: boolean) => {
            if (x) { this.loadItems(); }
        });
    }

    public onRowActionClicked(rowIndex: number, item: any) {
        this.editable.closeEditor();
        this.timeSheet.removeRow(rowIndex);
        this.flagUnsavedChanged();
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave().then( (success: boolean) => {
                resolve(success);
                if (!success) { 
                    this.initTab(); 
                } 
            });
        });
    }

    private initWorker(workerid?: number) {
        var obs = workerid ? this.timesheetService.initWorker(workerid) : this.timesheetService.initUser();
        obs.subscribe((ts: TimeSheet) => {
            this.workRelations = this.timesheetService.workRelations;
            this.timeSheet = ts;
            this.loadFlex(ts.currentRelation.ID);
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

    private loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems(this.currentFilter.interval).subscribe((itemCount: number) => {
                if (this.editable) { this.editable.closeEditor(); }
                this.timeSheet.ensureRowCount(itemCount + 1);
                this.flagUnsavedChanged(true);
                this.busy = false;
            }, err => this.errorService.handle(err));
        } else {
            alert('Current worker/user has no workrelations!');
        }
    }

    private loadFlex(workRelationId: number) {
        if (!workRelationId) {
            this.tabs[3].counter = 0;
            this.currentBalance = new WorkBalance();
        } else {
            this.timesheetService.getFlexBalance(workRelationId).subscribe( x => {
                this.currentBalance = x;
                this.currentBalance.hours = roundTo( x.Minutes / 60, 1 );
                this.currentBalance.expectedHours = roundTo( x.ExpectedMinutes / 60, 1);
                this.currentBalance.actualHours = roundTo( x.ActualMinutes / 60, 1);
                this.currentBalance.offHours = roundTo( x.ValidTimeOff / 60, 1);
                this.tabs[3].counter = this.currentBalance.hours;
            }, (err) => {
                console.log('Unable to fetch balance');
            });
        }
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
                this.loadItems();
                this.loadFlex(this.timeSheet.currentRelation.ID);
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
                            if (this.isSameDate(d1, d2) && (this.timeSheet.items[row - 1].EndTime) ) {
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

    private onStartEdit(details: IStartEdit) {
        var name: colName = <colName>details.columnDefinition.name;
        var row = details.row;
        if (!details.value) {
            switch (name) {
                case 'Date':
                    details.value = moment(this.getDefaultDate()).format('l'); 
                    details.flagChanged = true;
                    break;

                case 'StartTime':
                    if (row > 0) {
                        let d1 = this.timeSheet.items[row].Date;
                        let d2 = this.timeSheet.items[row - 1].Date;
                        if (d1 && d2) {
                            if (this.isSameDate(d1, d2) && (this.timeSheet.items[row - 1].EndTime) ) {
                                details.value = moment(this.timeSheet.items[row - 1].EndTime).format('HH:mm');
                                details.flagChanged = true;
                            }
                        }
                    } else {
                        details.value = '08:00';
                        details.flagChanged = true;
                    }                
                    break;
            }
        }
    }

    private getDefaultDate(): Date {
        switch (this.currentFilter.interval) {

            case ItemInterval.yesterday:
                var dt = moment(new Date());
                return dt.subtract( (dt.isoWeekday() === 1) ? 3 : 1, 'days').toDate();

            case ItemInterval.today:
                return moment(new Date()).toDate();

            default:
                return moment(new Date()).toDate();
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
        if (droplistItems && droplistItems.length > 0 && event.columnDefinition) {
            var lk: ILookupDetails = event.columnDefinition.lookup;
            let item = droplistItems[0];
            event.value = item[lk.colToSave || 'ID'];
            event.lookupValue = item;
            event.userTypedValue = false;
            this.updateChange(event);
        } else {
            this.toast.addToast(event.columnDefinition.label, ToastType.bad, 3, 
                `Ugyldig ${event.columnDefinition.label}: ${event.value}`);
        }
    }

    private updateChange(event: IChangeEvent) {

        // Update value via timesheet
        if (!this.timeSheet.setItemValue(new ValueItem(event.columnDefinition.name, 
            event.value, event.row, event.lookupValue))) {
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
                this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Lagre endringer?', true)
                .then( (userChoice: ConfirmActions) => {                    
                    switch (userChoice) {
                        case ConfirmActions.ACCEPT:
                            this.save().then( x => {
                                resolve(x);
                            });
                            break;

                        case ConfirmActions.CANCEL:
                            resolve(false);
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


    private isSameDate(d1: any, d2: any): boolean {
        if (d1 === d2) { return true; }
        if ((d1.length && d1.length >= 10) && (d2.length && d2.length >= 10)) {
            return d1.substr(0, 10) === d2.substr(0, 10);
        }
        return false;
    }
}
