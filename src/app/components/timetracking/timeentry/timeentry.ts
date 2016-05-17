import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column} from '../utils/editable/editable';
import {parseTime, addTime, parseDate} from '../utils/utils';

declare var moment;

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
    styles: [`
            .title { font-size: 18pt; padding: 1em 1em 1em 0; }
            .title strong { margin-right: 1em;}
            .title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }
            .timeentriesTable { width: 100% }
            .subcontainer { margin-top: 1em;}
            .bubble { position: relative; border: 1px solid green; background-color: white; border-radius: 7px; margin: 3px; left: 85px; top: -44px; width: 20px;  }
            .tabtip { color: #606060; margin-left: -15px; }
            `],
    directives: [Editable],
    providers: [WorkerService]
})
export class TimeEntry {    
    view = view;

    userName = '';
    worker: Worker = new Worker();
    workers: Array<Worker> = [];
    workRelations: Array<WorkRelation> = [];
    profiles: Array<WorkProfile> = [];
    currentWorkRelation: WorkRelation;
    workItems: Array<WorkItem> = [];
    busy = true;
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];
            
    tableConfig: IConfig = {
        columns: [
            new Column('Description'), 
            new Column('StartTime', '', 'time'),
            new Column('EndTime', '', 'time'),
            new Column('Date','', 'date'),
            new Column('WorkTypeID','', 'lookup'),
            new Column('Project', '', 'lookup')
            ],
        events: {
            onChange: (event) => { this.onChange(event); }
        }  
    };
            
    constructor(private tabService: TabService, private service:WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = service.user.name;
        this.initUser();
    }
    
    ngAfterViewInit() {
        this.service.getWorkers().subscribe((result:Array<Worker>)=>{
            this.workers = result;
        });
    }
    
    selectWorkRelation(relation:WorkRelation) {
        this.currentWorkRelation = relation;
        this.busy = false;
        this.getWorkItems(relation.ID);
    }
    
    initUser() {
        this.service.getCurrentUserId().then((id:number)=> {
            this.getWorker(id);
        });
    }
    
    getWorker(userid:number) {
        this.service.getFromUser(userid).subscribe((result:Worker)=> {
            this.worker = result;
            this.getWorkRelations(this.worker.ID);
        });
    }
    
    getWorkRelations(workerId:number, autoCreate = true) {
        var ws = this.service;
        ws.getWorkRelations(workerId).subscribe((result:Array<WorkRelation>) => {
            if (result.length>0) {
                this.workRelations = result;
                this.selectWorkRelation( result[0] );
            } else {
                if (autoCreate) {
                    ws.getWorkProfiles().subscribe((result: Array<WorkProfile>)=> {
                        if (result.length>0) {
                            ws.createInitialWorkRelation(workerId, result[0]).subscribe((result:WorkRelation)=>{
                                this.getWorkRelations(workerId, false);
                            });
                        }    
                    });
                }                
            }
        });
    }
    
    getWorkItems(workRelationID: number) {
        this.workItems.length = 0;
        this.service.getWorkItems(workRelationID).then((result:Array<WorkItem>)=> {
            this.workItems = result;
            this.addNewRow();
        });
    }
	
	addNewRow(text = 'Fyll inn beskrivelse') {
        this.workItems.push(<WorkItem>{ Description: text});		
	}
       
    onChange(event: IChangeEvent ) {
        var item = this.workItems[event.row];
        switch (event.columnDefiniton.name) {
            case 'Description':
                item.Description = event.value;
                break;
            case 'StartTime': 
                item.StartTime = parseTime(event.value);
				item.EndTime = addTime(item.StartTime, 30, 'minutes');
                break;
            case 'EndTime':
                item.EndTime = parseTime(event.value);
                break;
			case 'Date':
				item.Date = parseDate(event.value);
				break;
            default:
                event.cancel = true;
                break;
        }

		// Ensure a new row at bottom?
		if ((event.row === this.workItems.length-1) && (!event.cancel)) {			
            this.addNewRow();
		}
		
		// we use databinding instead
        event.updateCell = false;       
		
    }
    
    
    
}