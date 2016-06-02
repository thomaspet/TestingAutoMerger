import {Injectable, Inject, Component} from '@angular/core';
import {WorkItem, Worker, WorkRelation, WorkProfile} from '../../unientities';
import {WorkerService} from './workerService';
import {Observable} from "rxjs/Rx";
import {parseTime, addTime, parseDate} from '../../components/timetracking/utils/utils';

export class ValueItem {
    cancel = false;
    constructor(public name:string, public value:any, public ID = 0, public rowItem?:any) { }
}

export class TimeSheet {
    constructor(private ts?:TimesheetService) { }
    currentRelation: WorkRelation;
    items: Array<WorkItem | any> = [];
    
    loadItems():Observable<number> {
        var obs = this.ts.getWorkItems(this.currentRelation.ID);
        return <Observable<number>>obs.flatMap((items:WorkItem[]) => {
            this.items = items; 
            return Observable.of(items.length);
        });
    }
    
    save():Observable<number> {
        var toSave: Array<WorkItem> = [];
        debugger;
        return this.ts.saveWorkItems(this.items);
    }
    
    setItemValue(change: ValueItem):boolean {
        var rowIndex = this.findRow(change.ID);
        var item:WorkItem = this.items[rowIndex];
        switch (change.name) {
            case "Date":
                change.value = parseDate(change.value);
                break;
            case "EndTime":
            case "StartTime":
                change.value = parseTime(change.value);
                break;
            case "Worktype":
                item.WorkTypeID = change.value.ID;
                break;                
        }
        debugger;
        item[change.name] = change.value;
        item["changeFlag"] = true;
        change.ID = item.ID;
        return true;
    }    
    
    private findRow(ID:number):number {
        if (!ID) {
            var id = -(this.items.length + 1);
            var item:any = { ID: id }
            this.items.push(item);            
            return this.items.length - 1;
        }
        for (var i=0; i<this.items.length; i++) {
            if (this.items[i].ID===ID) {
                return i;
            }
        }
        return -1;
    }
}

@Injectable()
export class TimesheetService {
    
    private workerService:WorkerService;
    public workRelations:Array<WorkRelation>;
    
    constructor() {} 

    // Requires "manual" init of workerservice since angular2 cant import it directly 
    // since a service can not declare local service providers.
    initService(ws:WorkerService) {
        this.workerService = ws;
    }

    initUser(userid=0): Observable<TimeSheet> {
        if (userid===0) {
            var p = this.workerService.getCurrentUserId();
            return Observable.fromPromise(p).flatMap((id:number)=> this.initUser(id));
        } else {
           return this.workerService.getRelationsForUser(userid).flatMap((list:WorkRelation[])=>{
               var first = list[0];
               var ts = this.NewTimeSheet(first);
               this.workRelations = list;
               return Observable.of(ts);
           });
        }
    }

    
    public NewTimeSheet(workRelation:WorkRelation): TimeSheet {
        var ts = new TimeSheet(this);
        ts.currentRelation = workRelation;
        return ts;
    }
    
    public getWorkItems(workRelationID:number): Observable<WorkItem[]> {
        return this.workerService.getWorkItems(workRelationID);
    }
    
    public saveWorkItems(items:WorkItem[]): Observable<number> {
        /*
        return Observable.of(items).map((item:WorkItem)=>{
            return this.workerService.saveWorkItem(item);    
        }).merge();
        */
        return null;
    }
    
}