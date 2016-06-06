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
    styles: ['.title { font-size: 18pt; padding: 1em 1em 1em 0; }',
            '.title span { margin-right: 1em;}',
            '.title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }',
            '.tabtip { color: #606060; margin-left: -15px; }'
            ],
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
            
    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre', action: (done)=>this.save(done), main: true, disabled: true }
        ];            

    constructor(private tabService: TabService, private workerService:WorkerService, private timesheetService: TimesheetService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = workerService.user.name;
        this.tableConfig = this.createTableConfig();
        this.timesheetService.initService(workerService);
        this.initServiceValues();        
    }
    
    onReloadClick() {
        this.busy = true;
        this.initServiceValues();            
    }
    
    save(done) {
        this.busy = true;
        var counter = 0;
        this.timeSheet.saveItems().subscribe((item:WorkItem)=>{            
            counter++;                
        }, (err)=>{
            debugger;
            done('Feil ved lagring:' + err.statusText);
            alert(err.statusText);
            this.busy = false;            
        }, ()=>{
            //debugger;
            this.flagUnsavedChanged(true);
            done(counter + " poster ble lagret.");
            this.loadItems();
            //this.busy = false;
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
            alert("Current worker/user has no workrelations!");
        }
    }

    
    initServiceValues() {
        
        this.timesheetService.initUser().subscribe((ts:TimeSheet) => {
            this.timeSheet = ts;
            this.selectWorkRelation(ts.currentRelation);
            this.workRelations = this.timesheetService.workRelations;
        });
        
        this.workerService.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
        }, (err)=>{
            console.log("errors in getworktypes!");
        });   
        
    }
    
    selectWorkRelation(relation:WorkRelation) {
        this.timeSheet.currentRelation = relation;
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
            //new UniTableColumn('ID', 'ID', UniTableColumnType.Number, false),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, true).setWidth('40vw'),
            this.createTimeColumn('StartTime', 'Fra kl.'),
            this.createTimeColumn('EndTime', 'Til kl.'),
            new UniTableColumn('Date', 'Dato', UniTableColumnType.Date, true),            
            this.createLookupColumn('Worktype', 'Type arbeid', 'Worktype', (txt) => this.filterWorkTypes(txt))                      
        ];

        var ctx: Array<IContextMenuItem> = [];
        ctx.push({
            label: 'Slett post',
            action: (rowModel) => {
                //this.workerService
                //this.dataTable.removeRow(event.ori)
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        return new UniTableConfig(true, true, 25).setColumns(cols).setChangeCallback((event)=>this.onEditChange(event)).setContextMenu(ctx);
    }
    
    onEditChange(event) {
        
        var newRow = event.rowModel;
        var change = new ValueItem(event.field, newRow[event.field], event.originalIndex);        
        if (this.timeSheet.setItemValue(change)) {             
            this.flagUnsavedChanged();
            newRow[event.field] = change.value;
            //console.log('changes', this.timeSheet.unsavedItems());
            return newRow; 
        }
 
    }
    
    flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
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
        //console.log(`${expandCol}.${expandLabel}`);
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