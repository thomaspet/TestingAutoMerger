import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Worker, WorkRelation, WorkProfile, WorkItem, User, WorkType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Rx";
import {AuthService} from '../../../framework/core/authService';
import {URLSearchParams} from '@angular/http'
declare var moment;

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
                        if (item.GlobalIdentity === guid) {
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
    
    getWorkItems(workRelationID: number): Observable<WorkItem[]> {
        return this.GET('workitems', { filter: 'WorkRelationID eq ' + workRelationID, expand: 'WorkType', orderBy: 'StartTime' });
    }
    
    getWorkItemById(id:number): Observable<WorkItem> {
        return this.GET('workitems/' + id, { expand: 'WorkType'});
    }
    
    saveWorkItem(item:WorkItem) : Observable<WorkItem> {
        if (item.ID) {
            return this.PUT('workitems/' + item.ID, undefined, item );
        }
        return this.POST('workitems', undefined, item );
    }

    deleteWorkitem(id:number): Observable<boolean> {
        return this.http.asDELETE().usingBusinessDomain().withEndPoint('workitems/' + id).send();
    }
    
    getWorkTypes(): Observable<WorkType[]> {
        return this.GET('worktypes');
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