import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem, WorkType} from '../../../unientities';
import {UniTable as NewTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {WorkerService} from '../../../services/timetracking/workerservice';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

declare var moment;

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html',
    directives: [NewTable], 
    styles: ['.title { font-size: 18pt; padding: 1em 1em 1em 0; }',
            '.title span { margin-right: 1em;}',
            '.title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }',
            '.tabtip { color: #606060; margin-left: -15px; }'
            ],
    providers: [WorkerService]
})
export class RegisterTime {    
    public view = view;
    
    private busy = true;
    private userName = '';
    private tableConfig: UniTableConfig;
    private tableData:Array<any> = [];
    private worktypes:Array<WorkType> = [];
    private workRelations: Array<WorkRelation> = [];    
    private currentWorkRelation: WorkRelation;
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];    

    constructor(private tabService: TabService, private service:WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = service.user.name;
        //this.addNewRow();
        this.tableConfig = this.createTableConfig();
        this.initServiceValues();        
    }
    
    loadItems(workRelationID:number) {
        this.service.getWorkItems(workRelationID).subscribe((list:WorkItem[])=>{
            this.busy = false;
            this.tableData = list;
            this.tableConfig = this.createTableConfig();
        });        
    }
    
    defaultType():WorkType {
        var t = new WorkType();
        t.ID = 1;
        t.Name = 'Diverse..';
        return t;
    }
    
    initServiceValues() {
        
        this.service.getCurrentUserId().then((id:number)=>{
            console.log('got the user:' + id);
            this.service.initFromUser(id).subscribe((items:WorkRelation[])=>{
                this.workRelations = items;
                this.selectWorkRelation(items[0]);
            });
        });
        
        this.service.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
            console.log('list returned from service', this.worktypes.length);
        });        
    }
    
    selectWorkRelation(relation:WorkRelation) {
        this.currentWorkRelation = relation;
        this.loadItems(relation.ID);
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
        this.tableData.push(row);
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

        if (event.field === 'Worktype') {
            newRow.WorkTypeID = newRow.WorkType ? newRow.WorkType.ID : 0;            
            console.log(event.fielt, event);
        }
        
        if (event.field)

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
        console.log(`${expandCol}.${expandLabel}`);
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