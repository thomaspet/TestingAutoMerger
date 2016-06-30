import {Component, AfterViewInit, ViewChild} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService, ItemInterval} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column, ColumnType, ITypeSearch, ICopyEventDetails} from '../utils/editable/editable';
import {parseTime, addTime, parseDate, toIso} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe, MinutesToHoursPipe} from '../utils/isotime';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {CanDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {Lookupservice} from '../utils/lookup';
import {RegtimeTotals} from './totals/totals';

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
    view = view;
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
            new Column('WorkTypeID','', ColumnType.Integer, { route:'worktypes' }),
            new Column('Description'), 
            new Column('Dimensions.ProjectID', '', ColumnType.Integer, { route:'projects'}),
            new Column('CustomerOrderID', 'Ordre', ColumnType.Integer, 
                { route:'orders', filter:'ordernumber gt 0', select: 'OrderNumber,CustomerName', visualKey: 'OrderNumber'}),
            new Column('Actions', '', ColumnType.Action)
            ],
        events: {
                onChange: (event) => { return this.onChange(event); },
                onInit: (instance:Editable) => {
                    this.editable = instance; 
                },
                onTypeSearch: (details:ITypeSearch) => this.onTypeSearch(details),
                onCopyCell: (details: ICopyEventDetails) => this.onCopyCell(details)
            }  
    };
            
    constructor(private tabService: TabService, private service:WorkerService, private timesheetService:TimesheetService, private lookup:Lookupservice) {
        this.tabService.addTab({ name: view.label, url: view.route, moduleID: 18 });
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
        this.editable.editRow(this.timeSheet.items.length);
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

    onChange(event: IChangeEvent ) {
        
        if (event.columnDefinition && event.columnDefinition.lookup) {
        
            var lookupDef = event.columnDefinition.lookup;

            // Remove "label" from key-value ?
            var key = event.columnDefinition.columnType === ColumnType.Integer ? parseInt(event.value) : event.value;

            // Blank value (clear current value) ?
            if (!key) {
                event.value = key;
                this.updateChange(event);
                return;
            }

            // Did user just type a "visual" key value himself (customernumber, ordernumber etc.) !?
            if (event.userTypedValue && lookupDef.visualKey) {                
                var p = new Promise((resolve, reject)=> {
                    var filter= `?filter=${lookupDef.visualKey} eq ${key}`;
                    this.lookup.getSingle<any>(lookupDef.route, filter).subscribe((rows:any)=> {
                        var item = (rows && rows.length > 0) ? rows[0] : {};
                        event.value = item[lookupDef.colToSave || 'ID'];
                        event.lookupValue = item;
                        this.updateChange(event);
                        resolve(item);
                    }, (err)=>{
                        reject(err.statusText);
                    });
                });
                event.updateCell = false;
                return p;
            }

            // Normal lookup value (by foreignKey) ?
            var p = new Promise((resolve, reject)=>{                
                this.lookup.getSingle<any>(lookupDef.route, key).subscribe( (item:any) => {
                    event.lookupValue = item;
                    event.value = key;
                    this.updateChange(event);
                    resolve(item);
                }, (err)=>{
                    reject(err.statusText);
                });
            });
            event.updateCell = false;
            return p;
        }

        this.updateChange(event);

    }

    onTypeSearch(details: ITypeSearch) {
        if (details.columnDefinition && details.columnDefinition.lookup) {
            let lookup = details.columnDefinition.lookup;
            details.ignore = false;
            details.itemPropertyToSet = lookup.colToSave || 'ID';
            // Build combo-template
            var searchCols = lookup.select || 'ID,Name'
            var cols = searchCols.split(',');
            details.renderFunc = (item:any)=> { var ret = ''; for (var i=0;i<cols.length;i++) ret += (i>0 ? ' - ' : '') + item[cols[i]]; return ret; }
            details.promise = this.lookup.query(lookup.route, details.value, searchCols, undefined, searchCols, lookup.filter).toPromise();
        }
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