﻿import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../common/userService';
import {URLSearchParams} from '@angular/http';
import {toIso, capitalizeFirstLetter} from '../../components/common/utils/utils';
import {ErrorService} from '../common/errorService';
import * as moment from 'moment';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

export enum ItemInterval {
    all = 0,
    today = 1,
    yesterday = 2,
    thisWeek = 3,
    lastTwoWeeks = 4,
    thisMonth = 5,
    lastTwoMonths = 6,
    lastThreeMonths = 7,
    thisYear = 8
}

export enum IFilterInterval {
    day = 0,
    week = 1,
    twoweeks = 2,
    month = 3,
    year = 4,
    all = 5
}

export interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval | IFilterInterval;
    bigLabel?: string;
    date?: Date;
}

@Injectable()
export class WorkerService extends BizHttp<Worker> {

    public user: { id: number, guid: string, name: string, email: string, company: string } = {
        id: 0,
        guid: '',
        name: '',
        email: '',
        company: ''
    };

    constructor(
        http: UniHttp,
        private userService: UserService,
        private errorService: ErrorService,
        private browserStorage: BrowserStorageService,
    ) {
        super(http);
        this.relativeURL = Worker.RelativeUrl;
        this.entityType = Worker.EntityType;
        this.DefaultOrderBy = null;
        this.getCurrentUserId();
    }


    public getRelationsForUser(id: number): Observable<WorkRelation[]> {
        var obs = this.getWorkerFromUser(id);
        return obs.switchMap((worker: Worker) => {
            return this.getRelationsForWorker(worker.ID);
        });
    }

    public getRelationsForWorker(workerId: number): Observable<WorkRelation[]> {
        return this.getWorkRelations(workerId).switchMap((list: WorkRelation[]) => {
            // Try to create initial workrelation for this worker
            if ((!list) || list.length === 0) {
                return this.getWorkProfiles().switchMap((profiles: WorkProfile[]) => {
                    return this.createInitialWorkRelation(workerId, profiles[0]).switchMap((item: WorkRelation) => {
                        return Observable.of([item]);
                    });
                });
            }
            return Observable.of(list);
        });
    }

    public getWorkers(): Observable<Array<Worker>> {
        return super.GetAll<Worker>('', ['info']);
    }

    public getCurrentUserId(): Promise<number> {
        return new Promise( (resolve, reject) => {
            this.userService.getCurrentUser().subscribe( usr => {
                this.user.name = usr.DisplayName;
                this.user.id = usr.ID;
                this.user.guid = usr.GlobalIdentity;
                this.user.company = this.browserStorage.getItem('activeCompany').Name;
                resolve(usr.ID);
            }, err => {
                reject(err.statusText);
            });
        });
    }

    public getWorkerFromUser(userid: number): Observable<Worker> {
        return super.PostAction<Worker>(null, 'create-worker-from-user', 'userid=' + userid);
    }

    public getWorkRelations(workerId: number): Observable<WorkRelation[]> {
        return this.GET('workrelations', { filter: 'workerid eq ' + workerId, expand: 'workprofile'});
    }

    public get<T>(route: string, params?: any): Observable<T> {
        return this.GET(route, params);
    }

    public post<T>(route: string, body?: any): Observable<T> {
        return this.POST(route, undefined, body);
    }

    public createInitialWorkRelation(workerId: number, profile: WorkProfile): Observable<WorkRelation> {
        var route = 'workrelations';
        var dt = moment();
        var rel = {
            WorkerID: workerId,
            CompanyName: this.user.company,
            WorkPercentage: 100,
            Description: profile.Name,
            StartDate: moment([dt.year(), dt.month(), dt.date()]).toDate(),
            IsActive: true,
            WorkProfileID: profile.ID
        };
        return this.POST(route, undefined, rel);
    }

    public getWorkProfiles(): Observable<WorkProfile[]> {
        return this.GET('workprofiles');
    }

    public getIntervalFilterPeriod(fromDate: Date, toDate: Date): string {
        return "date ge '" + toIso(fromDate) + "' and date le '" + toIso(toDate) + "'";
    }

    public getIntervalFilter(interval: IFilterInterval | ItemInterval, date: Date): string {
        switch (interval) {
            case IFilterInterval.day:
                return "date eq '" + toIso(date) + "'";
            case IFilterInterval.week:
                return "date ge '" + toIso(moment(date).startOf('week').toDate()) + "' and date le '" +
                    toIso(moment(date).endOf('week').toDate()) + "'";
            case IFilterInterval.twoweeks:
                return "date ge '" + toIso(moment(date).subtract(1, 'week').startOf('week').toDate()) + "' and date le '" +
                    toIso(moment(date).endOf('week').toDate()) + "'";
            case IFilterInterval.month:
                return "date ge '" + toIso(moment(date).startOf('month').toDate()) + "' and date le '" +
                    toIso(moment(date).endOf('month').toDate()) + "'";
            case IFilterInterval.year:
                return "date ge '" + toIso(moment(date).startOf('year').toDate()) + "' and date le '" + toIso(moment(date).endOf('year').toDate()) + "'";
            default:
                return '';
        }
    }

    public getIntervalDate(interval: ItemInterval | IFilterInterval): Date {
        switch (interval) {
            case ItemInterval.today:
                return new Date();
            case ItemInterval.yesterday:
                return this.getLastWorkDay();
            case ItemInterval.thisWeek:
                return moment().startOf('week').toDate();
            case ItemInterval.lastTwoWeeks:
                return moment().startOf('week').add(-1).startOf('week').toDate();
            case ItemInterval.thisMonth:
                return moment().startOf('month').toDate();
            case ItemInterval.lastTwoMonths:
                return moment().add(-1, 'month').startOf('month').toDate();
            case ItemInterval.lastThreeMonths:
                return moment().add(-2, 'month').startOf('month').toDate();
            case ItemInterval.thisYear:
                return moment().startOf('year').toDate();
            default:
                return new Date();
        }
    }

    public getFilterIntervalDate(interval: IFilterInterval | ItemInterval, date: Date): Date {
        switch (interval) {
            case IFilterInterval.day:
                return new Date(date);
            case IFilterInterval.week:
                return moment(date).startOf('week').toDate();
            case IFilterInterval.twoweeks:
                return moment(date).subtract(1, 'week').startOf('week').toDate();
            case IFilterInterval.month:
                return moment(date).startOf('month').startOf('week').toDate();
            case IFilterInterval.year:
                return moment(date).startOf('year').toDate();
            default:
                return new Date();
        }
    }

    public getFilterIntervalItems(): Array<IFilter> {
        let date = new Date();
        return [
            {
                name: 'day',
                label: 'Dag',
                isSelected: true,
                interval: IFilterInterval.day,
                bigLabel: this.getBigLabel(IFilterInterval.day),
                date: new Date()
            },
            {
                name: 'week',
                label: 'Uke',
                isSelected: false,
                interval: IFilterInterval.week,
                bigLabel: this.getBigLabel(IFilterInterval.week),
                date: new Date(date.setDate(date.getDate() - 1))
            },
            {
                name: 'twoweek',
                label: '2 uker',
                interval: IFilterInterval.twoweeks,
                bigLabel: this.getBigLabel(IFilterInterval.twoweeks),
                date: new Date()
            },
            {
                name: 'month',
                label: 'Måned',
                interval: IFilterInterval.month,
                bigLabel: this.getBigLabel(IFilterInterval.month),
                date: new Date()
            },
            {
                name: 'year',
                label: 'År',
                interval: IFilterInterval.year,
                bigLabel: this.getBigLabel(IFilterInterval.year),
                date: new Date()
            },
            {
                name: 'all',
                label: 'Alt',
                interval: IFilterInterval.all,
                bigLabel: this.getBigLabel(IFilterInterval.all),
                date: new Date()
            }
        ];
    }

    private getLastWorkDay(): Date {
        var dt = moment();
        var dayNumber = new Date().getDay();
        if (dayNumber === 1) {
            dt.add(-3, 'days');
        } else {
            dt.add(-1, 'days');
        }
        return dt.toDate();
    }

    public getBigLabel(item: IFilterInterval | ItemInterval, date: Date = new Date()) {
        let bigLabel = '';
        switch (item) {
            case IFilterInterval.day:
                bigLabel += moment(date).format('Do MMMM YYYY');
                break;
            case IFilterInterval.week:
                bigLabel += 'Uke ' + moment(new Date(date)).week();
                break;
            case IFilterInterval.twoweeks:
                bigLabel += 'Uke ' + moment(new Date(date)).subtract(1, 'week').week()
                    + ' & ' + moment(new Date(date)).week();
                break;
            case IFilterInterval.month:
                bigLabel += capitalizeFirstLetter(moment(date).format('MMMM'));
                break;
            case IFilterInterval.year:
                bigLabel += date.getFullYear();
                break;
            case IFilterInterval.all:
                bigLabel += 'Alle registrerte timer';
                break;
        }

        return bigLabel;
    }

    private getLastWorkDayName(): string {
        return capitalizeFirstLetter(moment(this.getLastWorkDay()).format('dddd'));
    }

    public getWorkItems(workRelationID: number, intervalFilter: string = ''): Observable<WorkItem[]> {
        var filter = 'WorkRelationID eq ' + workRelationID;
        if (intervalFilter.length > 0) {
            filter += ' and ( ' + intervalFilter + ' )';
        }
        return this.GET('workitems', { filter: filter, hateoas: 'false',
            expand: 'WorkType,Dimensions,Dimensions.Project,Dimensions.Department,CustomerOrder'
                + ',Customer,Customer.Info',
            orderBy: 'StartTime' });
    }

    public getWorkItemById(id: number): Observable<WorkItem> {
        return this.GET('workitems/' + id, { expand: 'WorkType'});
    }

    public saveWorkItem(item: WorkItem): Observable<WorkItem> {
        item.Dimensions = (item.Dimensions && Object.keys(item.Dimensions).length === 0) ? null : item.Dimensions;
        return this.saveByID(item, 'workitems');
    }

    public deleteWorkitem(id: number): Observable<WorkItem> {
        return this.deleteByID(id, 'workitems');
    }

    public query(route: string, ...args: any[]): Observable<any[]> {
        var params = new URLSearchParams();
        for (var i = 0; i < args.length; i += 2) {
            params.append(args[i], args[i + 1]);
        }
        return this.queryWithUrlParams(params, route).map(response => response.json());
    }

    public queryWithUrlParams(
        params?: URLSearchParams, route = 'worktypes', expand?: string, hateoas: boolean = false): Observable<any> {
        if (expand) {
            if (params === undefined) { params = new URLSearchParams(); }
            params.append('expand', expand);
        }
        if (hateoas === false ) {
            if (params === undefined) { params = new URLSearchParams(); }
            params.append('hateoas', 'false');
        }
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(route)
            .send({}, params);
    }

    public saveByID<T>(item: T, baseRoute: string): Observable<T> {
        var itemX: any = item;
        if (itemX && itemX.ID) {
            return this.PUT(baseRoute + '/' + itemX.ID, undefined, item );
        }
        return this.POST(baseRoute, undefined, item );
    }

    public deleteByID(id: any, baseRoute: string): Observable<any> {
        return this.http.asDELETE().usingBusinessDomain().withEndPoint(baseRoute + '/' + id).send(undefined);
    }

    public getByID<T>(id: number, baseRoute: string, expand?: string): Observable<T> {
        return this.GET(baseRoute + '/' + id, { expand: expand});
    }

    public getStatistics(query: string): Observable<any> {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint('?' + query).send()
        .map(response => response.json());

    }

    // http helpers (less verbose?)

    private GET(route: string, params?: any ): Observable<any> {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }
    private POST(route: string, params?: any, body?: any ): Observable<any> {
        if (body) {
            return this.http.asPOST().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params)
            .map(response => response.json());
        } else {
            return this.http.asPOST().usingBusinessDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json());
        }
    }
    private PUT(route: string, params?: any, body?: any ): Observable<any> {
        if (body) {
            return this.http.asPUT().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params)
            .map(response => response.json());
        } else {
            return this.http.asPUT().usingBusinessDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json());
        }
    }

}
