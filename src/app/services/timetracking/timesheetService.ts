import {Injectable} from '@angular/core';
import { WorkItem, WorkRelation, WorkBalance } from '../../unientities';
import { WorkerService, ItemInterval, IFilterInterval } from './workerService';
import {from, merge, Observable, of} from 'rxjs';
import {parseTime, toIso, parseDate, ChangeMap, safeInt, safeDec} from '../../components/common/utils/utils';
import {Dimension} from '../common/dimensionService';
import {HttpParams} from '@angular/common/http';
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

    public clone(): TimeSheet {
        const tx = new TimeSheet(this.ts);
        tx.currentRelation = this.currentRelation;
        tx.allowLunchCalculations = this.allowLunchCalculations;
        return tx;
    }

    public addItem(item: WorkItem, recalc: boolean = true) {
        item.WorkRelationID = this.currentRelation.ID;
        this.items.push(item);
        this.changeMap.add(this.items.length - 1, item);
        if (recalc) {
            this.analyzeItems(this.items);
        }
    }

    public recalc() {
        this.analyzeItems(this.items);
    }

    public loadItems(interval?: IFilterInterval | ItemInterval, date?: Date): Observable<number> {
        this.changeMap.clear();
        const filter = this.ts.workerService.getIntervalFilter(interval, date);
        const obs = this.ts.getWorkItems(this.currentRelation.ID, filter);
        return <Observable<number>>obs.mergeMap((items: WorkItem[]) => {
            this.analyzeItems(items);
            this.items = items;
            return Observable.of(items.length);
        });
    }

    public loadItemsByPeriod(fromDate: Date, toDate: Date): Observable<number> {
        this.changeMap.clear();
        const filter = this.ts.workerService.getIntervalFilterPeriod(fromDate, toDate);
        const obs = this.ts.getWorkItems(this.currentRelation.ID, filter);
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
        let toSave: Array<WorkItem>;
        if (unsavedOnly) {
            toSave = this.unsavedItems();
        } else {
            toSave = this.items;
        }
        const toDelete = this.changeMap.getRemovables();
        // Nothing to do ?
        if (toSave && toSave.length === 0 && toDelete && toDelete.length === 0) {
            return Observable.from([new WorkItem()]);
        }

        const obs = this.ts.saveWorkItems(toSave, toDelete);
        return obs.map((result: { original: WorkItem, saved: WorkItem}) => {
            if (result.saved) {
                const item: any = result.original;
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
        const result = { ok: true, message: undefined, row: undefined, fld: undefined };
        let item: WorkItem;
        const list = this.changeMap.getKeys();
        for (let i = 0; i < list.length; i++) {
            const rowIndex = list[i];
            item = this.items[rowIndex];
            if (!item || !item.WorkTypeID) {
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
        const item: WorkItem = this.getRowByIndex(change.rowIndex);
        let ignore = false;
        let recalc = false;
        let reSum = false;
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
                const dimFkName = change.name.split('.')[1];
                const dimType = dimFkName.substr(0, dimFkName.length - 2);
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
            case 'Customer':
                item['Customer'] = change.value;
                item.CustomerID = change && change.value && change.value.ID ? change.value.ID : 0;
                if (!change.value) {
                    item.CustomerID = null;
                    item['Customer'] = undefined;
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

    public removeRow(index: number) {
        const item = this.getRowByIndex(index);
        if (item.ID > 0) {
            this.changeMap.addRemove(item.ID, item);
            this.changeMap.remove(index, true);
        } else {
            this.changeMap.remove(index, true);
        }
        this.items.splice(index, 1);
        this.analyzeItems(this.items);
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
        let prevDate = '';
        let alternate = true;
        let minuteCount = 0;
        // look for alternate days + calc total
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
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
        let minutes = 0;
        let lunch = item.LunchInMinutes || 0;
        if (item.StartTime && item.EndTime) {
            const st = moment(item.StartTime);
            const et = moment(item.EndTime);
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
        const st = moment(item.StartTime);
        const et = moment(item.EndTime);
        const sh = st.hours();
        const sm = st.minutes();
        const eh = et.hours();
        const em = et.minutes();
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
        const userIDSource = userid > 0
            ? of(userid)
            : from(this.workerService.getCurrentUserId());

        return userIDSource.switchMap(userID => {
            if (!userID) {
                return Observable.throw('Could not get userID in TimesheetService');
            }

            let relationsSource;
            if (autoCreate) {
                relationsSource = this.workerService.getRelationsForUser(userID);
            } else {
                const route = `workrelations?expand=worker,workprofile&filter=worker.userid eq ${userID}&hateoas=false`;
                relationsSource = this.workerService.get<Observable<WorkRelation[]>>(route);
            }

            return relationsSource.map((list: WorkRelation[]) => {
                const firstActive = list.filter(x => x.IsActive)[0];
                const timesheet = this.newTimeSheet(firstActive);
                this.workRelations = list;
                return timesheet;
           });
        });
    }

    public initWorker(workerId: number): Observable<TimeSheet> {
        return this.workerService.getRelationsForWorker(workerId).mergeMap((list: WorkRelation[]) => {
            const firstActive = list.filter(x => x.IsActive)[0];
            const ts = this.newTimeSheet(firstActive);
            this.workRelations = list;
            return Observable.of(ts);
        });
    }

    public newTimeSheet(workRelation: WorkRelation): TimeSheet {
        const ts = new TimeSheet(this);
        ts.currentRelation = workRelation;
        return ts;
    }

    public getWorkItems(workRelationID: number, filter: string): Observable<WorkItem[]> {
        return this.workerService.getWorkItems(workRelationID, filter);
    }

    public saveWorkItems(items: WorkItem[], deletables?: WorkItem[]):
        Observable<{ original: WorkItem, saved: WorkItem }> {

            const obsSave = Observable.from(items).mergeMap((item: WorkItem) => {
                const originalId = item.ID;
                item.ID = item.ID < 0 ? 0 : item.ID;
                this.preSaveWorkItem(item);
                return this.workerService.saveWorkItem(item).map((savedItem: WorkItem) => {
                    item.ID = originalId;
                    return { original: item, saved: savedItem };
                });
            });

        if (deletables) {
            const obsDel = Observable.from(deletables).mergeMap( (item: WorkItem) => {
                return this.workerService.deleteWorkitem(item.ID).map((event) => {
                    return { original: item, saved: null };
                });
            });
            return items.length > 0 ? merge(obsSave, obsDel) : obsDel;
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
            const dt = moment(item.Date);
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
        let params = new HttpParams();
        params = params.append('action', 'calc-flex-balance');
        if (details) {
            params = params.append('details', 'true');
        }

        const obs = this.workerService.queryWithUrlParams(params, `workrelations/${workRelationId}`)
        return obs;
    }

}
