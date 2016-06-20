import {Component, ViewChild} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem, WorkType} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, IContextMenuItem} from 'unitable-ng2/main';
import {Observable, Observer} from 'rxjs/Rx';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

declare var moment;

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html',
    directives: [UniTable, UniSave],
    providers: [WorkerService, TimesheetService]
})
export class RegisterTime {    
    public view = view;
    @ViewChild(UniTable) private dataTable:UniTable; 
    
    private busy = true;
    private userName = '';
    private tableConfig: UniTableConfig;
    private worktypes:Array<WorkType> = [];  
    private workRelations:Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 12 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];    

    filters = [
        { name: 'today', label: 'I dag', isSelected: true},
        { name: 'week', label: 'Denne uke'},
        { name: 'month', label: 'Denne måned'},
        { name: 'months', label: 'Siste 2 måneder'},
        { name: 'year', label: 'Dette år'},
        { name: 'all', label: 'Alt'}
    ];
            
    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre', action: (done) => this.save(done), main: true, disabled: true }
        ];            

    constructor(private tabService: TabService, private workerService:WorkerService, private timesheetService: TimesheetService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = workerService.user.name;
        this.tableConfig = this.createTableConfig();
        this.initServiceValues();        
    }
    
    save(done) {
        this.busy = true;
        var counter = 0;
        this.timeSheet.saveItems().subscribe((item:WorkItem)=>{            
            counter++;                
        }, (err)=>{
            var msg = this.showErrMsg(err._body || err.statusText, true);
            done('Feil ved lagring: ' + msg);
            this.busy = false;            
        }, ()=>{
            this.flagUnsavedChanged(true);
            done(counter + " poster ble lagret.");
            this.loadItems();
        });
    }
    
    loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems().subscribe((itemCount:number)=>{
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

    onFilterClick(filter: {name:string, isSelected:boolean }) {
        this.filters.forEach((value:any) => value.isSelected = false);
        filter.isSelected = true;
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