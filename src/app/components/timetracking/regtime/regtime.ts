import {Component, ViewChild} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem, WorkType} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, IContextMenuItem} from 'unitable-ng2/main';
import {Observable, Observer} from 'rxjs/Rx';
import {WorkerService, ItemInterval} from '../../../services/timetracking/workerservice';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {CanDeactivate, ComponentInstruction} from '@angular/router-deprecated';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

declare var moment;

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval;
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html',
    directives: [UniTable, UniSave],
    providers: [WorkerService, TimesheetService]
})
export class RegisterTime implements CanDeactivate {    
    public view = view;
    @ViewChild(UniTable) private dataTable:UniTable; 
    
    private busy = true;
    private userName = '';
    private tableConfig: UniTableConfig;
    private worktypes:Array<WorkType> = [];  
    private workRelations:Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: { name:string, interval: ItemInterval };
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 12 },
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
            
    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre', action: (done) => this.save(done), main: true, disabled: true }
        ];            

    constructor(private tabService: TabService, private workerService:WorkerService, private timesheetService: TimesheetService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = workerService.user.name;
        this.tableConfig = this.createTableConfig();
        this.currentFilter = this.filters[0];
        this.initServiceValues();        
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction):any {
        if (this.hasUnsavedChanges()) {
            if (confirm('Lagre endringer før du fortsetter?')) {
                return this.saveData();
            }
        }
        return true;
    }
    
    save(done?:any) {
        this.saveData(done);
    }

    saveData(done?:any) {
        return new Promise((resolve, reject)=>{
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
    
    loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems(this.currentFilter.interval).subscribe((itemCount:number)=>{
                this.busy = false;
                this.tableConfig = this.createTableConfig();
                this.actions[0].disabled = true;
            })    
        } else {
            this.showErrMsg("Current worker/user has no workrelations!");
        }
    }

    
    initServiceValues() {
        
        this.timesheetService.initUser().subscribe((ts:TimeSheet) => {
            this.timeSheet = ts;
            this.loadItems();
            this.workRelations = this.timesheetService.workRelations;
        });
        
        this.workerService.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
        }, (err)=>{
            this.showErrMsg("errors in getworktypes!");
        });   
        
    }

    onFilterClick(filter: IFilter) {
        this.filters.forEach((value:any) => value.isSelected = false);        
        filter.isSelected = true;
        this.currentFilter = filter;
        this.busy = true;
        this.loadItems();
    }
    
    filterWorkTypes(txt:string):Observable<any> {
        var list = this.worktypes;  
        var lcaseText = txt.toLowerCase();
        var sublist = list.filter((item:WorkType)=>
            { return (item.ID.toString() == txt || item.Name.toLowerCase().indexOf(lcaseText)>=0); } );
        return Observable.from([sublist]);
    }
    
    createTableConfig():UniTableConfig {        
        
        var cols = [
            new UniTableColumn('Date', 'Dato', UniTableColumnType.Date, true),            
            this.createTimeColumn('StartTime', 'Fra kl.'),
            this.createTimeColumn('EndTime', 'Til kl.'),
            this.createLookupColumn('Worktype', 'Type arbeid', 'Worktype', (txt) => this.filterWorkTypes(txt)),                      
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, true).setWidth('40vw')
        ];

        var ctx: Array<IContextMenuItem> = [];
        ctx.push({
            label: 'Slett post',
            action: (rowModel) => {
                var rowIndex = rowModel._originalIndex;
                if (rowIndex>=0) {
                    this.timeSheet.removeRow(rowIndex);
                    this.dataTable.removeRow(rowIndex);
                    if (rowModel.ID) {
                        this.flagUnsavedChanged();
                    }
                }
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        return new UniTableConfig(true, true, 25).setColumns(cols).setChangeCallback((event)=>this.onEditChange(event)).setContextMenu(ctx).setFilters([]);
    }
    
    onEditChange(event) {
        
        var newRow = event.rowModel;
        var change = new ValueItem(event.field, newRow[event.field], event.originalIndex);        
        if (this.timeSheet.setItemValue(change)) {             
            this.flagUnsavedChanged();
            newRow[event.field] = change.value;
            return newRow; 
        }
 
    }
    
    flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
    }

    hasUnsavedChanges():boolean {
        return !this.actions[0].disabled;
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
    
    // UniTable helperes:
    
    createTimeColumn(name:string, label:string): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Text)
            .setTemplate((item:any)=>{
                var value =item[name];
                if (value) {
                    return moment(value).format("HH:mm");
                }
                return '';                    
            });        
    }
    
    createLookupColumn(name:string, label: string, expandCol:string, lookupFn?: any, expandKey = 'ID', expandLabel = 'Name'): UniTableColumn {
        var col = new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(`${expandCol}.${expandLabel}`)
            .setEditorOptions({
                itemTemplate: (item)=> {
                    return item[expandKey] + ' - ' + item[expandLabel];
                },
                lookupFunction: lookupFn
            });
        return col;
    }

}