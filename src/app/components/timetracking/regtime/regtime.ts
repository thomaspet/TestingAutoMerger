import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem, WorkType} from '../../../unientities';
import {UniTable as NewTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {WorkerService} from '../../../services/timetracking/workerservice';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

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
    private tableData:Array<WorkItem> = [];
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
        //this.addNewRow();
        this.tableConfig = this.createTableConfig();
        
        this.initServiceValues();        
    }
    
    initServiceValues() {
        this.service.getWorkTypes().subscribe((result:Array<WorkType>)=>{
            this.worktypes = result;
            console.log('list returned from service', this.worktypes.length);
            //this.addNewRow();
            //this.addNewRow();
            //this.tableConfig = this.createTableConfig();
        });        
    }
    
	addNewRow(text = 'Fyll inn beskrivelse') {
        var row = new WorkItem();
        row.Description = text;
        row.Date = new Date();
        row.StartTime = new Date();
        row.EndTime = new Date();
        row.WorkTypeID = 1;
        row.Worktype = this.getWorkType(row.WorkTypeID);
        this.tableData.push(row);
	}    
    
    getWorkType(id:number): WorkType {
        return this.worktypes.find((item:WorkType)=> {
           return item.ID === id;  
        });        
    }
    
    findWorkType(searchValue:string):Observable<any> {
        debugger;
        var list = this.worktypes || [this.getWorkType(1)]; 
        console.log('list with ' + list.length + ' items');
        return Observable.from(list);
    }
    
    createTableConfig():UniTableConfig {        
        //console.log('test...', this.findWorkType('1') );
        var cols = [
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, true).setWidth('40vw'),
            new UniTableColumn('StartTime', 'Fra kl.', UniTableColumnType.Text, true),
            new UniTableColumn('EndTime', 'Til kl.', UniTableColumnType.Text, true),
            new UniTableColumn('Date', 'Dato', UniTableColumnType.Date, true),
            this.createLookupColumn('WorkTypeID', 'Timeart', 'WorkType', 'ID', 'Name', (txt)=>{
                var x = this.findWorkType(txt);
                console.log('workitems:', x); 
                return x; })            
        ];

        return new UniTableConfig(true, true, 25).setColumns(cols);
    }
    
    createLookupColumn(name:string, label: string, expandCol:string, expandKey = 'ID', expandLabel = 'Name', lookupFn?: any): UniTableColumn {
        var col = new UniTableColumn(name, label, UniTableColumnType.Lookup)
                .setTemplate((rowModel)=>{
                    var fk = rowModel[name];
                    if (rowModel[expandCol]) {
                        let subEntity = rowModel[expandCol];
                        return subEntity[expandKey] + ' - ' + subEntity[expandLabel];
                    }
                    return fk;
                })
                //.setDisplayField(`${expandCol}.${expandLabel}`)
                .setEditorOptions({
                    itemTEmplate: (item) => {
                        return item[expandKey] + ' - ' + item[expandLabel];
                    },
                    lookupFunction: lookupFn
                })
        return col;
    }

}