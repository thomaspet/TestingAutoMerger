import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService, ItemInterval} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column, ITypeSearch} from '../utils/editable/editable';
import {parseTime, addTime, parseDate} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe, MinutesToHoursPipe} from '../utils/isotime';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {CanDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {Lookupservice} from '../utils/lookup';

declare var moment;

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval;
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
    styles: [`
            .title { font-size: 14pt; padding: 1em 1em 1em 0; }
            .title span { margin-right: 1em;}
            .title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }
            .timeentriesTable { width: 100%; border-collapse: collapse } 
            .timeentriesTable th { text-align:left; border-bottom: 1px solid #c0c0c0; } 
            .timeentriesTable tr { height: 1.8em;}
            .timeentriesTable td { padding: 4px 4px 1px 4px; border-bottom: 1px solid #d0d0d0; border-left: 1px solid #d0d0d0; }
            .alternateRow { background-color: #e4e4e4;}
            .subcontainer { margin-top: 1em;}
            .busy { padding: 7px; color: green; font-size: 14pt; }
            `],
    directives: [Editable, UniSave],
    providers: [WorkerService, TimesheetService, Lookupservice],
    pipes: [IsoTimePipe, MinutesToHoursPipe]
})
export class TimeEntry {    
    view = view;
    busy = true;
    userName = '';
    workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: { name:string, interval: ItemInterval };
    private editable: Editable;

    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre endringer', action: (done)=>this.save(done), main: true, disabled: true }
        ];   
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
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
            new Column('Date','', 'date'),
            new Column('StartTime', '', 'time'),
            new Column('EndTime', '', 'time'),
            new Column('WorkTypeID','', 'int', 'worktypes'),
            new Column('Description'), 
            new Column('Dimensions.ProjectID', '', 'int', 'projects'),
            new Column('CustomerOrderID', 'Ordre', 'int', 'orders')
            ],
        events: {
                onChange: (event) => { return this.onChange(event); },
                onInit: (instance:Editable) => {
                    this.editable = instance; 
                },
                onTypeSearch: (details:ITypeSearch) => this.onTypeSearch(details)            
            }  
    };
            
    constructor(private tabService: TabService, private service:WorkerService, private timesheetService:TimesheetService, private lookup:Lookupservice) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = service.user.name;
        this.currentFilter = this.filters[0];
        this.initUser();
    }
    
    ngAfterViewInit() {

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

        // lookup value?
        if (event.columnDefinition && event.columnDefinition.route) {
            var p = new Promise((resolve, reject)=>{
                
                this.lookup.getSingle<any>(event.columnDefinition.route, event.value).subscribe( (item:any) => {
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

        this.updateChange(event);

    }

    onTypeSearch(details: ITypeSearch) {
        if (details.columnDefinition && details.columnDefinition.route) {
            
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
        this.checkSave().then(() => {
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
                if (confirm('Lagre endringer før du fortsetter?')) {
                    this.save().then((success:boolean) => {
                        if (success) {
                            resolve(true);
                        } else {
                            reject();
                        }
                    });
                    return;
                }
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