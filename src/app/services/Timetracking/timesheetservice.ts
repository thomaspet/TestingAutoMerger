import {Injectable, Inject, Component} from '@angular/core';
import {WorkItem, Worker, WorkRelation, WorkProfile, Dimensions} from '../../unientities';
import {WorkerService, ItemInterval} from './workerService';
import {Observable, Observer} from "rxjs/Rx";
import {parseTime, toIso, addTime, parseDate, ChangeMap} from '../../components/timetracking/utils/utils';
import {Dimension} from '../common/dimensionservice';
declare var moment;

export class ValueItem {
    constructor(public name:string, public value:any, public rowIndex?:number, public lookupValue?:any) { }
}

export class TimeSheet {
    constructor(private ts?:TimesheetService) { }
    currentRelation: WorkRelation;
    items: Array<WorkItem | any> = [];
    changeMap = new ChangeMap();

    public totals = {
        Minutes:0
    }
    
    public loadItems(interval?:ItemInterval):Observable<number> {
        this.changeMap.clear();
        var obs = this.ts.getWorkItems(this.currentRelation.ID, interval);
        return <Observable<number>>obs.flatMap((items:WorkItem[]) => {
            this.analyzeItems(items);
            this.items = items; 
            return Observable.of(items.length);
        });
    }
    
    public unsavedItems():Array<WorkItem> {
        return this.changeMap.getValues();
    }
    
    public saveItems(unsavedOnly = true):Observable<WorkItem> {
        var toSave: Array<WorkItem>;
        if (unsavedOnly) {
            toSave = this.unsavedItems();
        } else {
            toSave = this.items;
        }

        var obs = this.ts.saveWorkItems(toSave, this.changeMap.getRemovables());
        return obs.map((result:{ original: WorkItem, saved: WorkItem})=>{
            if (result.saved) {
                var item:any = result.original;
                this.changeMap.remove(item._rowIndex, true);
            } else {
                this.changeMap.removables.remove(result.original.ID, false);
            }            
            return result.saved;
        });
    }
    
    public setItemValue(change: ValueItem):boolean {
        var item:WorkItem = this.getRowByIndex(change.rowIndex);
        var ignore = false; 
        var recalc = false;
        switch (change.name) {
            case "Date":
                change.value = toIso(parseDate(change.value), true);
                recalc = true;
                break;
            case "EndTime":
            case "StartTime":
                change.value = toIso(parseTime(change.value, true, item.Date),true);
                recalc = true;
                break;
            case "Worktype":
                item.WorkTypeID = change.value.ID;
                break;       
            case "WorkTypeID":
                item.Worktype = change.value ? change.lookupValue || item.Worktype : undefined;
                break;
            case "Dimensions.ProjectID":
                if (change.value) {
                    item.Dimensions = item.Dimensions || new Dimension();
                    Dimension.setProject(item.Dimensions, change.value);
                    item.Dimensions.Project = change.lookupValue || item.Dimensions.Project;
                } else {
                    if (item.Dimensions) {
                        item.Dimensions.ProjectID = undefined;
                        item.Dimensions.Project = undefined;
                    }
                }
                ignore = true;
                break;         
            case "CustomerOrderID":
                item.CustomerOrder = change.value ? change.lookupValue || item.CustomerOrder : undefined;
                if (!change.value) {
                    item.CustomerOrderID = undefined;
                    ignore = true;
                }
                break;
        }
        if (!ignore) {
            item[change.name] = change.value;
        }
        if (!item.WorkRelationID) {
            item.WorkRelationID = this.currentRelation.ID
        }
        if (recalc) {
            item.Minutes = this.calcMinutes(item);
            this.analyzeItems(this.items);
        }

        this.changeMap.add(change.rowIndex, item);
        return true;
    }    

    public copyValueAbove(colName:string, rowIndex:number) {
        var src = this.items[rowIndex-1];
        var lookupIItem:any;
        var value = src.hasOwnProperty(colName) ? src[colName] : 0;
        switch (colName) {
            case 'CustomerOrderID':
                lookupIItem = src.CustomerOrder;
                break;
            case 'WorkTypeID':
                lookupIItem = src.Worktype;
                break;
            case 'Dimensions.ProjectID':
                value = src.Dimensions ? src.Dimensions.ProjectID : value;
                lookupIItem = src.Dimensions ? src.Dimensions.Project : undefined;
                break;        
        }
        var item = new ValueItem(colName, value, rowIndex, lookupIItem);
        this.setItemValue(item);
    }
    
    public removeRow(index:number) {
        var item = this.getRowByIndex(index);
        if (item.ID>0) {
            this.changeMap.addRemove(item.ID, item);
        } else {
            this.changeMap.remove(index, true);
        }
        this.items.splice(index,1);
    }

    public ensureRowCount(rows:number) {
        var n = this.items.length;
        for (var i=n; i<rows; i++)
            this.addRow();
    }

    public addRow() {
        this.items.push({ID:0});
    }

    private getRowByIndex(index:number, createIfMissing = true):any {
        if (index >= this.items.length) {
            if (!createIfMissing) return;
            this.items.push({ID:0});
            return this.items[this.items.length-1];
        }
        return this.items[index];
    }


    private analyzeItems(items:Array<any>) {
        var prevDate='';
        var alternate = true;
        var minuteCount = 0;
        // look for alternate days + calc total
        for (var i=0; i<items.length; i++) {
            let item = items[i];
            if (item.Date &&  !this.isSameDate(item.Date, prevDate)) {
                alternate = !alternate;
                prevDate = item.Date;
            }
            item._alternate = alternate;
            minuteCount += item.Minutes || 0;
        }
        this.totals.Minutes = minuteCount;
    }

    private isSameDate(d1:any, d2:any): boolean {
        if (typeof(d1)==='string' && typeof(d2)==='string') {
            if (d1.length>=10 && d2.length>=10) {
                if (d1.substr(0,10) === d2.substr(0,10)) return true;
            }
        }
        return d1 === d2;
    }

    private calcMinutes(item:WorkItem):number {
        var minutes = 0;
        if (item.StartTime && item.EndTime) {
            let st = moment(item.StartTime);
            let et = moment(item.EndTime);
            minutes = et.diff(st,'minutes');
        }
        return minutes || 0;
    }
    
}

@Injectable()
export class TimesheetService {
    
    public workRelations:Array<WorkRelation>;
    
    constructor(private workerService:WorkerService) {} 

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
    
    public getWorkItems(workRelationID:number, interval?:ItemInterval): Observable<WorkItem[]> {
        return this.workerService.getWorkItems(workRelationID, interval);
    }
    
    public saveWorkItems(items:WorkItem[], deletables?:WorkItem[]): Observable<{ original:WorkItem, saved:WorkItem }> {
        
        var obsSave = Observable.from(items).flatMap((item:WorkItem)=>{
            var originalId = item.ID;
            item.ID = item.ID < 0 ? 0 : item.ID;
            this.preSaveWorkItem(item);
            return this.workerService.saveWorkItem(item).map((savedItem:WorkItem)=>{
                item.ID = originalId;
                return { original: item, saved: savedItem }; 
            });
        });

        if (deletables) {
            let obsDel = Observable.from(deletables).flatMap( (item:WorkItem) => {                
                console.log('sending delete for ' + item.ID);
                return this.workerService.deleteWorkitem(item.ID).map((event)=>{
                    console.log('delete completed for ' + item.ID);
                    return { original: item, saved: null };
                });
            });
            return items.length>0 ? Observable.merge(obsSave, obsDel) : obsDel;
        }

        return obsSave;
        
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