import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../common/userService';
import {URLSearchParams} from '@angular/http';
import {toIso, capitalizeFirstLetter} from '../../components/common/utils/utils';
import {ErrorService} from '../common/errorService';
import * as moment from 'moment';

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

export interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval;
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

    constructor(http: UniHttp, private userService: UserService, private errorService: ErrorService) {
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
                this.user.company = JSON.parse(localStorage.getItem('activeCompany')).Name;
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

    public createInitialWorkRelation(workerId: number, profile: WorkProfile): Observable<WorkRelation> {
        var route = 'workrelations';
        var rel = {
            WorkerID: workerId,
            CompanyName: this.user.company,
            WorkPercentage: 100,
            Description: profile.Name,
            StartDate: moment([moment().year(), moment().month(), 1]).toDate(),
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

    public getIntervalFilter(interval: ItemInterval): string {
        switch (interval) {
            case ItemInterval.today:
                return "date eq '" + toIso(new Date()) + "'";
            case ItemInterval.yesterday:
                return "date eq '" + toIso(this.getLastWorkDay()) + "'";
            case ItemInterval.thisWeek:
                return "date ge '" + toIso(moment().startOf('week').toDate()) + "' and date le '" +
                toIso(moment().endOf('week').toDate()) + "'";
            case ItemInterval.thisMonth:
                return "date ge '" + toIso(moment().startOf('month').toDate()) + "' and date le '" +
                toIso(moment().endOf('month').toDate()) + "'";
            case ItemInterval.lastTwoWeeks:
                return "date ge '" + toIso(moment().startOf('week').add(-1)
                    .startOf('week').toDate()) + "' and date le '" +
                toIso(moment().endOf('month').toDate()) + "'";            
            case ItemInterval.lastTwoMonths:
                return "date ge '" + toIso(moment().add(-1, 'month').startOf('month').toDate()) + "' and date le '" +
                toIso(moment().endOf('month').toDate()) + "'";
            case ItemInterval.lastThreeMonths:
                return "date ge '" + toIso(moment().add(-2, 'month').startOf('month').toDate()) + "' and date le '" +
                toIso(moment().endOf('month').toDate()) + "'";
            case ItemInterval.thisYear:
                return "date ge '" + toIso(moment().startOf('year').toDate()) + "' and date le '" +
                toIso(moment().endOf('year').toDate()) + "'";
            default:
                return '';
        }
    }

    public getIntervalDate(interval: ItemInterval): Date {
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

    public getIntervalItems(): Array<IFilter> {
        let date = new Date();
        return [
<<<<<<< HEAD
            {
                name: 'today',
                label: 'I dag',
                isSelected: true,
                interval: ItemInterval.today,
                bigLabel: this.getBigLabel(ItemInterval.today),
                date: new Date()
            },
            {
                name: 'yesterday',
                label: this.getLastWorkDayName(),
                isSelected: false,
                interval: ItemInterval.yesterday,
                bigLabel: this.getBigLabel(ItemInterval.yesterday),
                date: new Date(date.setDate(date.getDate() - 1))
            },
            {
                name: 'week',
                label: 'Denne uke',
                interval: ItemInterval.thisWeek,
                bigLabel: this.getBigLabel(ItemInterval.thisWeek),
                date: new Date()
            },
            {
                name: 'month',
                label: 'Denne måned',
                interval: ItemInterval.thisMonth,
                bigLabel: this.getBigLabel(ItemInterval.thisMonth),
                date: new Date()
            },
            {
                name: 'months',
                label: 'Siste 2 måneder',
                interval: ItemInterval.lastTwoMonths,
                bigLabel: this.getBigLabel(ItemInterval.lastTwoMonths),
                date: new Date()
            },
            {
                name: 'year',
                label: 'Dette år',
                interval: ItemInterval.thisYear,
                bigLabel: this.getBigLabel(ItemInterval.thisYear),
                date: new Date()
            },
            {
                name: 'all',
                label: 'Alt',
                interval: ItemInterval.all,
                bigLabel: this.getBigLabel(ItemInterval.all),
                date: new Date()
            }
=======
            { name: 'today', label: 'I dag', isSelected: true, interval: ItemInterval.today },
            { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
            { name: 'weeks', label: 'Siste 2 uker', interval: ItemInterval.lastTwoWeeks},
            { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
            { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
            { name: 'months2', label: 'Siste 3 måneder', interval: ItemInterval.lastThreeMonths},
            { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
            { name: 'all', label: 'Alt', interval: ItemInterval.all}
>>>>>>> develop
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

    public getBigLabel(item: ItemInterval) {
        let bigLabel = '';
        switch (item) {
            case ItemInterval.today:
                bigLabel += moment().format('Do MMMM YYYY');
                break;
            case ItemInterval.yesterday:
                bigLabel += moment().add(-1, 'days').format('Do MMMM YYYY');
                break;
            case ItemInterval.thisWeek:
                bigLabel += 'Uke ' + moment(new Date()).week();
                break;
            case ItemInterval.thisMonth:
                bigLabel += capitalizeFirstLetter(moment().format('MMMM'));
                break;
            case ItemInterval.lastTwoMonths:
                bigLabel += capitalizeFirstLetter(moment().add(-1, 'months').format('MMMM')) + ' og ' + capitalizeFirstLetter(moment().format('MMMM'));
                break;
            case ItemInterval.thisYear:
                bigLabel += moment().format('YYYY');
                break;
            case ItemInterval.all:
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
            expand: 'WorkType,Dimensions,Dimensions.Project,Dimensions.Department,CustomerOrder',
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
