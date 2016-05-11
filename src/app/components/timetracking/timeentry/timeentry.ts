import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {Worker} from '../../../unientities';

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
        email: ''
    };
    worker: Worker = new Worker();

    constructor(private tabService: TabService, authService: AuthService, private http:UniHttp) {
        this.tabService.addTab({ name: view.label, url: view.route });
        
        this.user.name = authService.jwtDecoded.unique_name;
        this.user.id = authService.jwtDecoded.userId;
        this.user.guid = authService.jwtDecoded.nameid;
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
        this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send().subscribe((result)=> {
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
        this.http.asPOST().usingBusinessDomain()
        .withEndPoint(route).send().subscribe((result:Worker)=> {
            this.worker = result;
        });
    }
    
    initWorkRelations() {
        
    }
    
}