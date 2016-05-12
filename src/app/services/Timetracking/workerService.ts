import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Worker, WorkRelation, WorkProfile, WorkItem, User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, ObservableInput} from "rxjs/Observable";
import {AuthService} from '../../../framework/core/authService';
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
    
    getFromUser(userid:number): Observable<Worker> {
        return super.PostAction<Worker>(null, "create-worker-from-user", 'userid=' + userid);
    }
    
    getWorkRelations(workerId:number): Observable<Array<WorkRelation>> {
        return this.GET("workrelations", { filter: 'workerid eq ' + workerId, expand: 'workprofile'});
    }    
    
    createInitialWorkRelation(workerId: number, profile: WorkProfile): Observable<WorkRelation> {
        var route = "workrelations";
        var rel = {
            WorkerID: workerId,
            CompanyName: this.user.company,
            WorkPercentage: 100,
            Description: profile.Name,
            StartDate: moment([moment().year(), moment().month(), 1]).getDate(),
            IsActive: true,
            WorkProfileID: profile.ID
        };        
        return this.POST(route, undefined, rel);
    }
    
    getWorkProfiles(): Observable<Array<WorkProfile>> {
        return this.GET('workprofiles');
    }
    
    getWorkItems(workRelationID: number): Promise<Array<WorkItem>> {
       return new Promise<Array<WorkItem>>((resolve)=> {
            this.GET('workitems', { filter: 'WorkRelationID eq ' + workRelationID}).subscribe((result: Array<WorkItem>)=>{
                result.map((value: WorkItem) => {
                    value.StartTime = moment(value.StartTime).toDate(); 
                    value.EndTime = moment(value.EndTime).toDate();
                    value.Date = moment(value.Date).toDate();
                });
                resolve(result);
            });              
        });
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
    
}