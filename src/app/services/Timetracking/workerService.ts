import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Worker, WorkRelation, WorkProfile, WorkItem, User, WorkType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Rx";
import {AuthService} from '../../../framework/core/authService';
import {URLSearchParams} from '@angular/http'
import {toIso, addTime} from '../../components/timetracking/utils/utils';
import {AppConfig} from '../../../app/AppConfig';

declare var moment;

export enum ItemInterval {
    all = 0,
    today = 1,
    thisWeek = 2,
    thisMonth = 3,
    lastTwoMonths = 4,
    thisYear = 5
}

@Injectable()
export class WorkerService extends BizHttp<Worker> {
            
    user = {
        id: 0,
        guid: '',
        name: '',
        email: '',
        company: ''
    };    
    
    constructor(http: UniHttp, authService: AuthService ) {
        super(http);
        this.relativeURL = 'workers';
        this.DefaultOrderBy = null;
        
        this.user.name = authService.jwtDecoded.unique_name;
        this.user.id = authService.jwtDecoded.userId;
        this.user.guid = authService.jwtDecoded.nameid;
        this.user.company = JSON.parse(localStorage.getItem('activeCompany')).Name;
        
    }
    
    
    getRelationsForUser(id:number):Observable<WorkRelation[]> {
        var obs = this.getWorkerFromUser(id);
        return obs.flatMap((worker:Worker) => {
            return this.getRelationsForWorker(worker.ID);
        });
    }
    
    getRelationsForWorker(workerId:number):Observable<WorkRelation[]> {  
        return this.getWorkRelations(workerId).flatMap((list:WorkRelation[])=>{
            // Try to create initial workrelation for this worker
            if ((!list) || list.length===0) {
                return this.getWorkProfiles().flatMap((profiles:WorkProfile[]) => {
                    return this.createInitialWorkRelation(workerId, profiles[0]).flatMap((item:WorkRelation)=>{
                        return Observable.of([item]); 
                    });
                })
            }
            return Observable.of(list);
        });
    }
    
    getWorkers(): Observable<Array<Worker>> {
        return super.GetAll<Worker>('', ['info']);
    }
    
    getCurrentUserId(): Promise<number> {
        var localDebug = AppConfig.BASE_URL.indexOf('localhost')>0;
         return new Promise(resolve => {
            if (this.user.id) {
                resolve(this.user.id);
                return;
            } 
            // todo: when authService includes userid this can be removed:
            var guid = this.user.guid;
            this.GET('users').subscribe((result)=> {
                if (result.length>0) {
                    for (var i=0; i<result.length; i++) {
                        var item = result[i];
                        if (item.GlobalIdentity === guid || localDebug) {
                            this.user.id = item.ID;
                            this.user.email = item.Email;
                            resolve(item.ID);
                            return;
                        }
                    }
                } 
            });            
        });
    }
    
    getWorkerFromUser(userid:number): Observable<Worker> {
        return super.PostAction<Worker>(null, "create-worker-from-user", 'userid=' + userid);
    }
    
    getWorkRelations(workerId:number): Observable<WorkRelation[]> {
        return this.GET("workrelations", { filter: 'workerid eq ' + workerId, expand: 'workprofile'});
    }    
    
    createInitialWorkRelation(workerId: number, profile: WorkProfile): Observable<WorkRelation> {
        var route = "workrelations";
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
    
    getWorkProfiles(): Observable<WorkProfile[]> {
        return this.GET('workprofiles');
    }

    getIntervalFilter(interval: ItemInterval):string {
        switch (interval) {
            case ItemInterval.today:
                return "date eq '" + toIso(new Date()) + "'";
            case ItemInterval.thisWeek:
                return "date ge '" + toIso(moment().startOf("week").toDate()) + "' and date le '" + toIso(moment().endOf("week").toDate()) + "'";
            case ItemInterval.thisMonth:
                return "date ge '" + toIso(moment().startOf("month").toDate()) + "' and date le '" + toIso(moment().endOf("month").toDate()) + "'";
            case ItemInterval.lastTwoMonths:
                return "date ge '" + toIso(moment().add(-1,'month').startOf("month").toDate()) + "' and date le '" + toIso(moment().endOf("month").toDate()) + "'";
            case ItemInterval.thisYear:
                return "date ge '" + toIso(moment().startOf("year").toDate()) + "' and date le '" + toIso(moment().endOf("year").toDate()) + "'";
            default: 
                return '';
        }        
    }
    
    getWorkItems(workRelationID: number, interval: ItemInterval = ItemInterval.all): Observable<WorkItem[]> {
        var filter = 'WorkRelationID eq ' + workRelationID;
        var intervalFilter = this.getIntervalFilter(interval);
        if (intervalFilter.length>0) {
            filter += " and ( " + intervalFilter + " )";
        }
        return this.GET('workitems', { filter: filter, expand: 'WorkType,Dimensions,Dimensions.Project,CustomerOrder', orderBy: 'StartTime' });
    }
    
    getWorkItemById(id:number): Observable<WorkItem> {
        return this.GET('workitems/' + id, { expand: 'WorkType'});
    }
    
    saveWorkItem(item:WorkItem) : Observable<WorkItem> {
        return this.saveByID(item, 'workitems');
    }

    deleteWorkitem(id:number): Observable<WorkItem> {
        return this.deleteByID(id, 'workitems');
    }
    
    queryWithUrlParams(params?: URLSearchParams, route = 'worktypes', expand?:string): Observable<WorkType[]> {
        if (params && expand) params.append('expand', expand);
        return this.http
            .usingBusinessDomain()
            .asGET()            
            .withEndPoint(route)
            .send({}, true, params);        
    }

    saveByID<T>(item:T, baseRoute:string): Observable<T> {
        var itemX:any = item;
        if (itemX && itemX.ID) {
            return this.PUT(baseRoute + '/' + itemX.ID, undefined, item );
        }
        return this.POST(baseRoute, undefined, item );            
    }

    deleteByID(id:any, baseRoute:string): Observable<any> {
        return this.http.asDELETE().usingBusinessDomain().withEndPoint(baseRoute + '/' + id).send(undefined, true);
    }

    getByID<T>(id:number, baseRoute:string, expand?:string):Observable<T> {
        return this.GET(baseRoute + '/' + id, { expand: expand});
    }
    
    getStatistics(query:string): Observable<any> {
        return this.GET('statistics?' + query);

    }
   
    // http helpers (less verbose?)
    
    private GET(route: string, params?:any ):Observable<any> {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params);
    }
    private POST(route: string, params?:any, body?:any ):Observable<any> {
        if (body) {
            return this.http.asPOST().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params);            
        } else {
            return this.http.asPOST().usingBusinessDomain()
            .withEndPoint(route).send(params);
        }        
    }
    private PUT(route: string, params?:any, body?:any ):Observable<any> {
        if (body) {
            return this.http.asPUT().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params);            
        } else {
            return this.http.asPUT().usingBusinessDomain()
            .withEndPoint(route).send(params);
        }        
    }      
    
}