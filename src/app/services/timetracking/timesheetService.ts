import {Injectable} from '@angular/core';
import {WorkItem, WorkRelation, WorkBalance} from '../../unientities';
import {WorkerService, ItemInterval} from './workerService';
import {Observable} from 'rxjs/Observable';
import {parseTime, toIso, parseDate, ChangeMap, safeInt, safeDec} from '../../components/common/utils/utils';
import {Dimension} from '../common/dimensionService';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';

export class ValueItem {
    constructor(
        public name: string, public value: any, public rowIndex?: number,
        public lookupValue?: any, public tag?: string, public isParsed: boolean = false ) { }
}

export class TimeSheet {
    public currentRelation: WorkRelation;
    public items: Array<WorkItem | any> = [];
    public changeMap: ChangeMap = new ChangeMap();

    public allowLunchCalculations: boolean = true;

    public totals: any = {
        Minutes: 0
    };

    constructor(private ts?: TimesheetService) { }

    public set currentRelationId(value: number) {
        this.ts.workRelations.forEach(element => {
            if (element.ID === value) {
                this.currentRelation = element;
            }
        });
    }

    public loadItems(interval?: ItemInterval): Observable<number> {
        this.changeMap.clear();
        var filter = this.ts.workerService.getIntervalFilter(interval);
        var obs = this.ts.getWorkItems(this.currentRelation.ID, filter);
        return <Observable<number>>obs.mergeMap((items: WorkItem[]) => {
            this.analyzeItems(items);
            this.items = items;
            return Observable.of(items.length);
        });
    }

    public loadItemsByPeriod(fromDate: Date, toDate: Date): Observable<number> {
        this.changeMap.clear();
        var filter = this.ts.workerService.getIntervalFilterPeriod(fromDate, toDate);
        var obs = this.ts.getWorkItems(this.currentRelation.ID, filter);
        return <Observable<number>>obs.mergeMap((items: WorkItem[]) => {
            this.analyzeItems(items);
            this.items = items;
            return Observable.of(items.length);
        });
    }

    public unsavedItems(): Array<WorkItem> {
        return this.changeMap.getValues();
    }

    public saveItems(unsavedOnly = true): Observable<WorkItem> {
        var toSave: Array<WorkItem>;
        if (unsavedOnly) {
            toSave = this.unsavedItems();
        } else {
            toSave = this.items;
        }
        var toDelete = this.changeMap.getRemovables();

        // Nothing to do ?
        if (toSave && toSave.length === 0 && toDelete && toDelete.length === 0) {
            return Observable.from([new WorkItem()]);
        }

        var obs = this.ts.saveWorkItems(toSave, toDelete);
        return obs.map((result: { original: WorkItem, saved: WorkItem}) => {
            if (result.saved) {
                var item: any = result.original;
                this.changeMap.remove(item._rowIndex, true);
            } else {
                this.changeMap.removables.remove(result.original.ID, false);
            }
            return result.saved;
        });
    }

    public hasPaidLunch(): boolean {
        if (this.currentRelation && this.currentRelation.WorkProfile) {
            return !!this.currentRelation.WorkProfile.LunchIncluded;
        }
        return false;
    }

    public validate(): { ok: boolean, message?: string, row?: number, fld?: string } {
        var result = { ok: true, message: undefined, row: undefined, fld: undefined };
        var item: WorkItem;
        var list = this.changeMap.getKeys();
        for (var i = 0; i < list.length; i++) {
            let rowIndex = list[i];
            item = this.items[rowIndex];
            if (!item.WorkTypeID) {
                result.ok = false;
                result.message = 'Du må fylle ut timeart på rad ' + (rowIndex + 1);
                result.fld = 'WorkTypeID';
                result.row = rowIndex;
                break;
            }
        }
        return result;
    }

    public setItemValue(change: ValueItem): boolean {
        var item: WorkItem = this.getRowByIndex(change.rowIndex);
        var ignore = false;
        var recalc = false;
        var reSum = false;
        switch (change.name) {
            case 'Date':
                change.value = change.isParsed ? change.value : toIso(parseDate(change.value), true, true);
                recalc = true;
                break;
            case 'EndTime':
            case 'StartTime':
                change.value = change.isParsed ? change.value : toIso(parseTime(change.value, true, item.Date), true);
                recalc = true;
                break;
            case 'Worktype':
                item.WorkTypeID = change.value ? change.value.ID : 0;
                change.value = (!item.WorkTypeID) ? null : change.value;
                break;
            case 'WorkTypeID':
                item.Worktype = change.value ? change.lookupValue || item.Worktype : undefined;
                break;
            case 'LunchInMinutes':
                change.value = safeInt(change.value);
                recalc = true;
                break;
            case 'Minutes':
                if (change.value === '*') {
                    recalc = true;
                } else {
                    change.value = change.isParsed ? change.value : (change.tag === 'Hours') ?
                        safeDec(change.value) * 60 : safeInt(change.value);
                    reSum = true;
                }
                break;
            case 'MinutesToOrder':
                change.value = change.isParsed ? change.value : (change.tag === 'Hours') ?
                    safeDec(change.value) * 60 : safeInt(change.value);
                item.Invoiceable = safeInt(change.value) > 0;
                break;
            case 'Dimensions.ProjectID':
            case 'Dimensions.DepartmentID':
                let dimFkName = change.name.split('.')[1];
                let dimType = dimFkName.substr(0, dimFkName.length - 2);
                if (change.value) {
                    item.Dimensions = item.Dimensions || <any>{}; // new Dimension();
                    Dimension.setValue(item.Dimensions, change.value, dimType);
                    item.Dimensions[dimType] = change.lookupValue || item.Dimensions[dimType];
                } else {
                    if (item.Dimensions) {
                        item.Dimensions[dimFkName] = null;
                        item.Dimensions[dimType] = undefined;
                    }
                }
                ignore = true;
                break;
            case 'CustomerOrder':
                item.CustomerOrder = change.value;
                item.CustomerOrderID = change && change.value && change.value.ID ? change.value.ID : 0;
                if (!change.value) {
                    item.CustomerOrderID = null;
                    item.CustomerOrder = undefined;
                    ignore = true;
                }
                break;
            case 'CustomerOrderID':
                item.CustomerOrder = change.value ? change.lookupValue || item.CustomerOrder : undefined;
                if (!change.value) {
                    item.CustomerOrderID = null;
                    ignore = true;
                }
                break;
        }
        if (!ignore) {
            item[change.name] = change.value;
        }
        if (!item.WorkRelationID) {
            item.WorkRelationID = this.currentRelation.ID;
        }
        if (recalc) {
            this.ts.checkTimeOnItem(item);
            item.Minutes = this.calcMinutes(item);

        }
        if (reSum || recalc) {
            this.analyzeItems(this.items);
        }

        this.changeMap.add(change.rowIndex, item);
        return true;
    }

    public copyValueAbove(colName: string, rowIndex: number) {
        if (rowIndex < 1) {  return; }
        var src = this.items[rowIndex - 1];
        var lookupIItem: any;
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

    public removeRow(index: number) {
        var item = this.getRowByIndex(index);
        if (item.ID > 0) {
            this.changeMap.addRemove(item.ID, item);
            this.changeMap.remove(index, true);
        } else {
            this.changeMap.remove(index, true);
        }
        this.items.splice(index, 1);
        this.analyzeItems(this.items);
    }

    public ensureRowCount(rows: number) {
        var n = this.items.length;
        for (var i = n; i < rows; i++) {
            this.addRow();
        }
    }

    public addRow() {
        this.items.push({ID: 0});
    }

    private getRowByIndex(index: number, createIfMissing = true): any {
        if (index >= this.items.length) {
            if (!createIfMissing) { return; }
            this.items.push({ID: 0});
            return this.items[this.items.length - 1];
        }
        return this.items[index];
    }


    private analyzeItems(items: Array<any>) {
        var prevDate = '';
        var alternate = true;
        var minuteCount = 0;
        // look for alternate days + calc total
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.Date &&  !this.isSameDate(item.Date, prevDate)) {
                alternate = !alternate;
                prevDate = item.Date;
            }
            item._alternate = alternate;
            minuteCount += (item.Minutes || 0);
        }
        this.totals.Minutes = minuteCount;
    }

    private isSameDate(d1: any, d2: any): boolean {
        if (typeof(d1) === 'string' && typeof(d2) === 'string') {
            if (d1.length >= 10 && d2.length >= 10) {
                if (d1.substr(0, 10) === d2.substr(0, 10)) { return true; }
            }
        }
        return d1 === d2;
    }

    private calcMinutes(item: WorkItem): number {
        var minutes = 0;
        var lunch = item.LunchInMinutes || 0;
        if (item.StartTime && item.EndTime) {
            let st = moment(item.StartTime);
            let et = moment(item.EndTime);
            let flip = 0;
            if (et.diff(st, 'minutes') < 0) {
                flip = (et.minutes() + et.hours() * 60);
                et.add((60 * 24) - flip, 'minutes');
            }
            // Calculate lunch ?
            if (this.allowLunchCalculations && (!this.hasPaidLunch())) {
                if ((item.LunchInMinutes === undefined) && this.containsLunch(item)) {
                    item.LunchInMinutes = 30;
                    lunch = 30;
                }
            }
            minutes = flip + et.diff(st, 'minutes') - lunch;
        }
        return minutes || 0;
    }

    private containsLunch(item: WorkItem): boolean {
        var st = moment(item.StartTime);
        var et = moment(item.EndTime);
        var sh = st.hours();
        var sm = st.minutes();
        var eh = et.hours();
        var em = et.minutes();
        // between 11:10 and 12:30 ?
        if ( (sh < 11 || (sh === 11 && sm < 10) ) && (eh > 12 || (eh === 12 && em > 30)) ) {
            return true;
        }
        return false;
    }

}

@Injectable()
export class TimesheetService {

    public workRelations: Array<WorkRelation>;

    constructor(public workerService: WorkerService) {}

    public initUser(userid = 0, autoCreate = false): Observable<TimeSheet> {
        if (userid === 0) {
            var p = this.workerService.getCurrentUserId();
            return Observable.fromPromise(p).mergeMap((id: number) => this.initUser(id, autoCreate));
        } else {
            var result;
            if (autoCreate) {
                result = this.workerService.getRelationsForUser(userid);
            } else {
                let route = `workrelations?expand=worker&filter=worker.userid eq ${userid}&hateoas=false`;
                result = this.workerService.get<Observable<WorkRelation[]>>(route);
            }
            return result.mergeMap((list: WorkRelation[]) => {
               var first = list[0];
               var ts = this.newTimeSheet(first);
               this.workRelations = list;
               return Observable.of(ts);
           });
        }
    }

    public initWorker(workerId: number): Observable<TimeSheet> {
        return this.workerService.getRelationsForWorker(workerId).mergeMap((list: WorkRelation[]) => {
               var first = list[0];
               var ts = this.newTimeSheet(first);
               this.workRelations = list;
               return Observable.of(ts);
        });
    }

    public newTimeSheet(workRelation: WorkRelation): TimeSheet {
        var ts = new TimeSheet(this);
        ts.currentRelation = workRelation;
        return ts;
    }

    public getWorkItems(workRelationID: number, filter: string): Observable<WorkItem[]> {
        //  var intervalFilter = this.workerService.getIntervalFilter(interval)
        return this.workerService.getWorkItems(workRelationID, filter);
    }

    public saveWorkItems(items: WorkItem[], deletables?: WorkItem[]):
        Observable<{ original: WorkItem, saved: WorkItem }> {

        var obsSave = Observable.from(items).mergeMap((item: WorkItem) => {
            var originalId = item.ID;
            item.ID = item.ID < 0 ? 0 : item.ID;
            this.preSaveWorkItem(item);
            return this.workerService.saveWorkItem(item).map((savedItem: WorkItem) => {
                item.ID = originalId;
                return { original: item, saved: savedItem };
            });
        });

        if (deletables) {
            let obsDel = Observable.from(deletables).mergeMap( (item: WorkItem) => {
                return this.workerService.deleteWorkitem(item.ID).map((event) => {
                    return { original: item, saved: null };
                });
            });
            return items.length > 0 ? Observable.merge(obsSave, obsDel) : obsDel;
        }

        return obsSave;

    }

    private preSaveWorkItem(item: any): boolean {

        this.checkTimeOnItem(item);
        return true;
    }

    public checkTimeOnItem(item: any) {
        if (item.Date) {
            // ensure item.StartTime and item.EndTime has same date as item.Date
            var dt = moment(item.Date);
            if (item.StartTime) {
                item.StartTime = toIso(moment(item.StartTime).year(dt.year())
                    .month(dt.month()).date(dt.date()).toDate(), true);
            }
            if (item.EndTime) {
                item.EndTime = toIso(moment(item.EndTime).year(dt.year())
                    .month(dt.month()).date(dt.date()).toDate(), true);
            }
        }
    }

    public getFlexBalance(workRelationId: number, details: boolean = false): Observable<WorkBalance> {
        var params = new URLSearchParams();
        params.append('action', 'calc-flex-balance');
        if (details) { params.append('details', 'true'); }
        var obs: any = this.workerService.queryWithUrlParams(params, `workrelations/${workRelationId}` )
            .map((response: any) => response.json());
        return obs;
    }

}
