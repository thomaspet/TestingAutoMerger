import {Injectable, Inject, Component} from '@angular/core';
import {WorkItem, Worker, WorkRelation, WorkProfile} from '../../unientities';
import {WorkerService} from './workerService';
import {Observable, Observer} from "rxjs/Rx";
import {parseTime, toIso, addTime, parseDate, ChangeMap} from '../../components/timetracking/utils/utils';
declare var moment;

export class ValueItem {
    constructor(public name:string, public value:any, public rowIndex?:number) { }
}

export class TimeSheet {
    constructor(private ts?:TimesheetService) { }
    currentRelation: WorkRelation;
    items: Array<WorkItem | any> = [];
    changeMap = new ChangeMap();
    
    loadItems():Observable<number> {
        this.changeMap.clear();
        var obs = this.ts.getWorkItems(this.currentRelation.ID);
        return <Observable<number>>obs.flatMap((items:WorkItem[]) => {
            this.items = items; 
            return Observable.of(items.length);
        });
    }
    
    unsavedItems():Array<WorkItem> {
        return this.changeMap.getValues();
    }
    
    saveItems(unsavedOnly = true):Observable<WorkItem> {
        var toSave: Array<WorkItem>;
        if (unsavedOnly) {
            toSave = this.unsavedItems();
        } else {
            toSave = this.items;
        }
        var obs = this.ts.saveWorkItems(toSave);
        return obs.map((result:{ original: WorkItem, saved: WorkItem})=>{
            this.changeMap.remove(result.original.ID);
            return result.saved;
        });
    }
    
    setItemValue(change: ValueItem):boolean {
        var item:WorkItem = this.getRowByIndex(change.rowIndex); 
        switch (change.name) {
            case "Date":
                change.value = toIso(parseDate(change.value));
                break;
            case "EndTime":
            case "StartTime":
                change.value = toIso(parseTime(change.value, true, item.Date),true);
                break;
            case "Worktype":
                item.WorkTypeID = change.value.ID;
                break;                
        }
        item[change.name] = change.value;
        this.changeMap.add(change.rowIndex, item);
        return true;
    }    
    
    private getRowByIndex(index:number, createIfMissing = true):any {
        if (index >= this.items.length) {
            if (!createIfMissing) return;
            this.items.push({ID:0});
            return this.items[this.items.length-1];
        }
        return this.items[index];
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
               var ts = this.newTimeSheet(first);
               this.workRelations = list;
               return Observable.of(ts);
           });
        }
    }

    
    public newTimeSheet(workRelation:WorkRelation): TimeSheet {
        var ts = new TimeSheet(this);
        ts.currentRelation = workRelation;
        return ts;
    }
    
    public getWorkItems(workRelationID:number): Observable<WorkItem[]> {
        return this.workerService.getWorkItems(workRelationID);
    }
    
    public saveWorkItems(items:WorkItem[]): Observable<{ original:WorkItem, saved:WorkItem }> {
        return Observable.from(items).flatMap((item:WorkItem)=>{
            var originalId = item.ID;
            item.ID = item.ID < 0 ? 0 : item.ID;
            this.preSaveWorkItem(item);
            var result = this.workerService.saveWorkItem(item).map((savedItem:WorkItem)=>{
                item.ID = originalId;
                return { original: item, saved: savedItem }; 
            });
            return result;
        });
        
    }
    
    private preSaveWorkItem(item:any): boolean {
        
        // ensure item.StartTime and item.EndTime has same date as item.Date
        if (item.Date) {
            var dt = moment(item.Date);
            if (item.StartTime) {
                item.StartTime = toIso(moment(item.StartTime).year(dt.year()).month(dt.month()).date(dt.date()), true);
            }
            if (item.EndTime) {
                item.EndTime = toIso(moment(item.EndTime).year(dt.year()).month(dt.month()).date(dt.date()), true);
            }    
        }
        return true;
    }
    
}