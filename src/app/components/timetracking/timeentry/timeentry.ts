import {Component, AfterViewInit, ViewChild} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService, ItemInterval} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column, ColumnType, ITypeSearch, ICopyEventDetails, ILookupDetails} from '../utils/editable/editable';
import {parseTime, addTime, parseDate, toIso} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe, MinutesToHoursPipe} from '../utils/pipes';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {CanDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {Lookupservice} from '../utils/lookup';
import {RegtimeTotals} from './totals/totals';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';

declare var moment;

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

export interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval;
}

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    activate?: (ts:TimeSheet, filter:IFilter) => void;
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
    directives: [Editable, UniSave, RegtimeTotals],
    providers: [WorkerService, TimesheetService, Lookupservice],
    pipes: [IsoTimePipe, MinutesToHoursPipe]
})
export class TimeEntry {    
    busy = true;
    userName = '';
    workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: IFilter;
    private editable: Editable;
    
    @ViewChild(RegtimeTotals) regtimeTotals:RegtimeTotals; 

    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre endringer', action: (done)=>this.save(done), main: true, disabled: true }
        ];   
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler', activate: (ts:any, filter:any)=> this.regtimeTotals.activate(ts, filter) },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];


    filters: Array<IFilter> = [
        { name: 'today', label: 'I dag', isSelected: true, interval: ItemInterval.today },
        { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
        { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
        { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
        { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
        { name: 'all', label: 'Alt', interval: ItemInterval.all}
    ];
            
    tableConfig: IConfig = {
        columns: [
            new Column('Date','', ColumnType.Date),
            new Column('StartTime', '', ColumnType.Time),
            new Column('EndTime', '', ColumnType.Time),
            new Column('WorkTypeID','Timeart', ColumnType.Integer, { route:'worktypes' }),
            new Column('Description'), 
            new Column('Dimensions.ProjectID', 'Prosjekt', ColumnType.Integer, { route:'projects'}),
            new Column('CustomerOrderID', 'Ordre', ColumnType.Integer, 
                { route:'orders', filter:'ordernumber gt 0', select: 'OrderNumber,CustomerName', visualKey: 'OrderNumber'}),
            new Column('Actions', '', ColumnType.Action)
            ],
        events: {
                onChange: (event) => { 
                    return this.lookup.checkAsyncLookup(event, (event)=> this.updateChange(event), (event)=> this.asyncValidationFailed(event) ) || this.updateChange(event);
                },
                onInit: (instance:Editable) => {
                    this.editable = instance; 
                },
                onTypeSearch: (details:ITypeSearch) => this.lookup.onTypeSearch(details),
                onCopyCell: (details: ICopyEventDetails) => this.onCopyCell(details)
            }  
    };
            
    constructor(private tabService: TabService, private service:WorkerService, 
            private timesheetService:TimesheetService, private lookup:Lookupservice, private toast:ToastService) {
        this.tabService.addTab({ name: view.label, url: view.url, moduleID: 18 });
        this.userName = service.user.name;
        this.currentFilter = this.filters[0];
        this.initUser();
    }
    
    onTabClick(tab: ITab) {
        if (tab.isSelected) return;
        this.tabs.forEach((t:any)=>{
            if (t.name!==tab.name) t.isSelected = false;
        });
        tab.isSelected = true;
        if (tab.activate) {
            tab.activate(this.timeSheet, this.currentFilter);
        }
    }

    onAddNew() {
        this.editable.editRow(this.timeSheet.items.length-1);
    }

    reset() {
        if (this.hasUnsavedChanges()) {
            if (confirm('Nullstille alle endringer uten å lagre ?')) {
                this.loadItems();
            }
        }
    }

    onRowActionClicked(rowIndex:number, item:any) {
        this.editable.closeEditor();
        this.timeSheet.removeRow(rowIndex);
        this.flagUnsavedChanged();
        
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction):any {
        return this.checkSave();
    }
    
    initUser() {
        this.timesheetService.initUser().subscribe((ts:TimeSheet)=>{
            this.workRelations = this.timesheetService.workRelations;
            this.timeSheet = ts;
            this.loadItems();
        })
    }
    
    loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems(this.currentFilter.interval).subscribe((itemCount:number)=>{
                if (this.editable) this.editable.closeEditor();                
                this.timeSheet.ensureRowCount(itemCount + 1);
                this.flagUnsavedChanged(true);
                this.busy = false;
            })    
        } else {
            alert("Current worker/user has no workrelations!");
        }
    }

    save(done?:any) {
        
        if (!this.validate()) { 
            if (done) { done('Feil ved validering'); } 
            return; 
        }

        if (this.busy) return;
        return new Promise((resolve, reject) => {
            this.busy = true;
            var counter = 0;
            this.timeSheet.saveItems().subscribe((item:WorkItem)=>{            
                counter++;                
            }, (err)=>{
                var msg = this.showErrMsg(err._body || err.statusText, true);
                if (done) { done('Feil ved lagring: ' + msg); }
                this.busy = false;
                resolve(false);                   
            }, ()=> {
                this.flagUnsavedChanged(true);
                if (done) { done(counter + " poster ble lagret."); }
                this.loadItems();
                resolve(true);
            });
        });
    }

    flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
    }
       
    hasUnsavedChanges():boolean {
        return !this.actions[0].disabled;
    }

    onCopyCell(details: ICopyEventDetails) { 

        details.copyAbove = true;

        if (details.columnDefinition) {
            var row = details.position.row;
            switch (details.columnDefinition.name) {
                case 'Date':
                    if (row===0) {
                        details.valueToSet = parseDate('*', true);
                    }
                    break;

                case 'StartTime':
                    if (row > 0) {
                        let d1 = this.timeSheet.items[row].Date;
                        let d2 = this.timeSheet.items[row-1].Date;
                        if (d1 && d2) { 
                            if (d1 === d2 && (this.timeSheet.items[row-1].EndTime) ) {
                                details.valueToSet = moment(this.timeSheet.items[row-1].EndTime).format('HH:mm');
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

    validate():boolean {
        var result:  { ok: boolean, message?: string, row?: number, fld?: string } = this.timeSheet.validate();
        if (!result.ok) {
            this.toast.addToast('Feil', ToastType.bad, 1000, result.message );
            if (result !== undefined && result.row >= 0) {
                let iCol = this.tableConfig.columns.findIndex( (col)=>col.name === result.fld );
                this.editable.editRow(result.row, iCol);
            }
            return false;
        }
        return true;
    }

    asyncValidationFailed(event: IChangeEvent) {
        var droplistItems = this.editable.getDropListItems({ col: event.col, row: event.row});
        if (droplistItems && droplistItems.length === 1 && event.columnDefinition) {
            var lk: ILookupDetails = event.columnDefinition.lookup;
            let item = droplistItems[0];
            event.value = item[lk.colToSave|| 'ID'];
            event.lookupValue = item;
            event.userTypedValue = false;
            this.updateChange(event);        
        } else {
            this.toast.addToast(event.columnDefinition.label, ToastType.bad, 600, `Ugyldig ${event.columnDefinition.label}: ${event.value}`);
        }
    }

    updateChange(event: IChangeEvent) {

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
    
    onFilterClick(filter: IFilter) {
        this.checkSave().then((success:boolean) => {
            if (!success) return;
            this.filters.forEach((value:any) => value.isSelected = false);        
            filter.isSelected = true;
            this.currentFilter = filter;
            this.busy = true;
            this.loadItems();
        });
    }

    checkSave():Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.hasUnsavedChanges()) {
                var result = confirm('Fortsette uten å lagre ? Du vil miste alle endringer som du har lagt inn dersom du fortsetter !');
                resolve(result);
                return;
            } 
            resolve(true);
        });
    }

    showErrMsg(msg:string, lookForMsg = false):string {
        var txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":')>0) {
                txt = msg.substr(msg.indexOf('"Message":') + 12, 80) + "..";
            }
        }
        alert(txt);
        return txt;
    } 
    
    
}