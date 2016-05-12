import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {Observable} from "rxjs/Observable";
declare var moment;

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
})
export class TimeEntry {    
    view = view;
    user = {
        id: 0,
        guid: '',
        name: '',
        email: '',
        company: ''
    };
    worker: Worker = new Worker();
    positions: Array<WorkRelation> = [];
    profiles: Array<WorkProfile> = [];

    constructor(private tabService: TabService, authService: AuthService, private http:UniHttp) {
        this.tabService.addTab({ name: view.label, url: view.route });
        
        this.user.name = authService.jwtDecoded.unique_name;
        this.user.id = authService.jwtDecoded.userId;
        this.user.guid = authService.jwtDecoded.nameid;
        this.user.company = JSON.parse(localStorage.getItem('activeCompany')).Name;
        console.log(this.user.company);
        this.initUser();
    }
    
    ngAfterViewInit() {

    }
    
    initUser() {
        if (this.user.id) {
            this.initWorker(this.user.id);
            return;
        }
        // todo: when authService includes userid this can be removed:
        var route = "users";
        var guid = this.user.guid;
        this.GET(route).subscribe((result)=> {
            if (result.length>0) {
                for (var i=0; i<result.length; i++) {
                    var item = result[i];
                    if (item.GlobalIdentity === guid) {
                        this.user.id = item.ID;
                        this.user.email = item.Email;
                        this.initWorker(this.user.id);
                        break;
                    }
                }
            } 
        });          
    }
    
    initWorker(userid:number) {
        var route = "workers/?action=create-worker-from-user&userid=" + userid;
        this.POST(route).subscribe((result:Worker)=> {
            this.worker = result;
            this.initWorkRelations(this.worker.ID);
        });
    }
    
    initWorkRelations(workerId:number, autoCreate = true) {
        var route = "workrelations";
        this.GET(route, { filter:'workerid eq ' + workerId, expand: 'workprofile' } ).subscribe((result:Array<WorkRelation>) => {
            if (result.length>0) {
                this.positions = result;
            } else {
                if (autoCreate) {
                    this.GET('workprofiles').subscribe((result: Array<WorkProfile>)=> {
                        if (result.length>0) {
                            this.createInitialWorkRelation(workerId, result[0]);
                        }    
                    });
                }                
            }
        });
    }
    
    initWorkProfiles() {
        this.GET('workprofiles').subscribe((result: Array<WorkProfile>)=> {
            this.profiles = result;
        });
    }

    
    createInitialWorkRelation(workerId: number, workProfile: WorkProfile) {
        var route = "workrelations";
        var rel = {
            WorkerID: workerId,
            CompanyName: this.user.company,
            WorkPercentage: 100,
            Description: workProfile.Name,
            StartDate: moment([moment().year(), moment().month, 1]).date(),
            IsActive: true,
            WorkProfileID: workProfile.ID
        };        
        this.POST(route, undefined, rel).subscribe((result:WorkRelation) => {
            this.initWorkRelations(workerId, false);
        });
    }
    
    // Internal helpers (less verbose)
    
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