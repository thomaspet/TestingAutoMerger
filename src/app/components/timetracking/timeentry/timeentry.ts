import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService} from '../../../services/timetracking/workerservice';
//import {UniTabs} from '../../layout/uniTabs/uniTabs';

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
            `],
    //providers: [WorkerService]
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
            { name: 'flex', label: 'Fleksitid' },
            { name: 'profiles', label: 'Arbeidsgivere' },
            { name: 'vacation', label: 'Ferie' },
            { name: 'offtime', label: 'Fravær' },
            ];

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
        });
    }
       
    
}