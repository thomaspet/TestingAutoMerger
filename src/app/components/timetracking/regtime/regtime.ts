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
    styles: [`.tabtip { color: #606060; margin-left: -15px; }`],
    providers: [WorkerService]
})
export class RegisterTime {    
    public view = view;
    
    private tableConfig: UniTableConfig;
    private tableData:Array<any> = [];
    private worktypes:Array<WorkType> = [];
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];    

    constructor(private tabService: TabService, private service:WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.addNewRow();
        this.tableConfig = this.createTableConfig();
        
        this.initServiceValues();        
    }
    
    defaultType():WorkType {
        var t = new WorkType();
        t.ID = 1;
        t.Name = 'Diverse..';
        return t;
    }
    
    initServiceValues() {
        this.service.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
            console.log('list returned from service', this.worktypes.length);
        });        
    }
    
	addNewRow(text = 'Fyll inn beskrivelse') {
        var workType = this.defaultType();
        var row = {
            Description: text,
            Date: new Date(),
            StartTime: moment().hours(8).toDate(),
            EndTime: new Date(),
            WorkTypeID: workType.ID,
            Worktype: workType
        };
        debugger;
        this.tableData.push(row);
	}    
    
    getWorkType(id:number): WorkType {
        var tp = this.worktypes.find((item:WorkType)=> {
           return item.ID === id;  
        });     
        return tp || this.defaultType();
    }
    
    findWorkType(txt:string):Observable<any> {
        var list = this.worktypes || [this.getWorkType(1)]; 
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
            this.createLookupColumn('Worktype', 'Type arbeid', 'Worktype', (txt) => this.findWorkType(txt))                      
        ];

        return new UniTableConfig(true, true, 25).setColumns(cols).setChangeCallback((event)=>this.onEditChange(event));
    }
    
    onEditChange(event) {
        var newRow = event.rowModel;

        if (event.field === 'Worktype') {
            debugger;
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