import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem, WorkType} from '../../../unientities';
import {UniTable as NewTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Rx';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {TimesheetService, TimeSheet} from '../../../services/timetracking/timesheetservice';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

declare var moment;

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html',
    directives: [NewTable, UniSave], 
    styles: ['.title { font-size: 18pt; padding: 1em 1em 1em 0; }',
            '.title span { margin-right: 1em;}',
            '.title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }',
            '.tabtip { color: #606060; margin-left: -15px; }'
            ],
    providers: [WorkerService, TimesheetService]
})
export class RegisterTime {    
    public view = view;
    
    private busy = true;
    private userName = '';
    private tableConfig: UniTableConfig;
    private worktypes:Array<WorkType> = [];  
    
    private timeSheet: TimeSheet = new TimeSheet();
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 12 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];    
            
    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre', action: (done)=>this.save(done), main: true, disabled: false },
            { label: 'Test', action: (done)=> { this.save(done); }, main: true, disabled: true } 
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
        this.timeSheet.save().subscribe((result:number)=>{
            done(result + " poster ble lagret ok");    
        });
    }
    
    loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems().subscribe((itemCount:number)=>{
                this.busy = false;
                console.log("got " + itemCount + " workitems");
                this.tableConfig = this.createTableConfig();
            })    
        } else {
            console.log("Current worker/user has no workrelations!");
        }
    }
    
    defaultType():WorkType {
        var t = new WorkType();
        t.ID = 1;
        t.Name = 'Diverse..';
        return t;
    }
    
    initServiceValues() {
        
        this.timesheetService.initUser().subscribe((ts:TimeSheet) => {
            this.timeSheet = ts;
            this.selectWorkRelation(ts.currentRelation);
        });
        
        this.workerService.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
        });        
    }
    
    selectWorkRelation(relation:WorkRelation) {
        this.timeSheet.currentRelation = relation;
        this.loadItems();
    }    
    
	addNewRow(text = 'Fyll inn beskrivelse') {
        var workType = this.defaultType();
        var row = {
            Description: text,
            Date: new Date(),
            StartTime: moment().hours(8).minutes(0).toDate(),
            EndTime: new Date(),
            WorkTypeID: workType.ID,
            Worktype: workType
        };
        this.timeSheet.items.push(row);
	}    
    
    getWorkTypeByID(id:number): WorkType {
        var tp = this.worktypes.find((item:WorkType)=> {
           return item.ID === id;  
        });     
        return tp || this.defaultType();
    }
    
    filterWorkTypes(txt:string):Observable<any> {
        var list = this.worktypes || [this.getWorkTypeByID(1)]; 
        var lcaseText = txt.toLowerCase();
        var sublist = list.filter((item:WorkType)=>
            { return (item.ID.toString() == txt || item.Name.toLowerCase().indexOf(lcaseText)>=0); } );
        return Observable.from([sublist]);
    }
    
    createTableConfig():UniTableConfig {        
        
        var cols = [
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, true).setWidth('40vw'),
            this.createTimeColumn('StartTime', 'Fra kl.'),
            this.createTimeColumn('EndTime', 'Til kl.'),
            new UniTableColumn('Date', 'Dato', UniTableColumnType.Date, true),            
            this.createLookupColumn('Worktype', 'Type arbeid', 'Worktype', (txt) => this.filterWorkTypes(txt))                      
        ];

        return new UniTableConfig(true, true, 25).setColumns(cols).setChangeCallback((event)=>this.onEditChange(event));
    }
    
    onEditChange(event) {
        var newRow = event.rowModel;
        
        newRow.ID = this.timeSheet.setItemValue(event.field, newRow[event.field], newRow.ID);
 
        return newRow; 
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