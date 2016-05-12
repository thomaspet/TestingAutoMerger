import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {Observable} from "rxjs/Observable";
import {WorkerService} from '../../../services/TimeTracking/workerService';
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
            `],
    providers: [WorkerService]
})
export class TimeEntry {    
    view = view;

    userName = '';
    worker: Worker = new Worker();
    workRelations: Array<WorkRelation> = [];
    profiles: Array<WorkProfile> = [];
    currentWorkRelation: WorkRelation;
    workItems: Array<WorkItem> = [];
    busy = true;

    constructor(private tabService: TabService, private workerService:WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = workerService.user.name;
        this.initUser();
    }
    
    ngAfterViewInit() {

    }
    
    selectWorkRelation(relation:WorkRelation) {
        this.currentWorkRelation = relation;
        this.busy = false;
        this.getWorkItems(relation.ID);
    }
    
    initUser() {
        this.workerService.getCurrentUserId().then((id:number)=> {
            this.getWorker(id);
        });
    }
    
    getWorker(userid:number) {
        this.workerService.getFromUser(userid).subscribe((result:Worker)=> {
            this.worker = result;
            this.getWorkRelations(this.worker.ID);
        });
    }
    
    getWorkRelations(workerId:number, autoCreate = true) {
        var ws = this.workerService;
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
        this.workerService.getWorkItems(workRelationID).then((result:Array<WorkItem>)=> {
            this.workItems = result;
        });
    }
       
    
}