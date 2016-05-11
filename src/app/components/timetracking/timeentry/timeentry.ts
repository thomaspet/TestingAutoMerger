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
        name: '',
        email: ''
    };
    worker: Worker = new Worker();

    constructor(private tabService: TabService, authService: AuthService, private http:UniHttp) {
        this.tabService.addTab({ name: view.label, url: view.route });
        
        this.user.name = authService.jwtDecoded.unique_name;
        this.user.id = authService.jwtDecoded.userId;
        this.initUser();
    }
    
    ngAfterViewInit() {               
    }
    
    initUser() {
        if (this.user.id) {
            this.initWorker(this.user.id);
            return;
        }
        var route = "users/?select=id,email&filter=displayname eq '" + this.user.name + "'";
        this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send().subscribe((result)=> {
            if (result.length>0) {
                var item = result[0];
                this.user.id = item.ID;
                this.user.email = item.Email;
            } 
        });          
    }
    
    initWorker(userid:number) {
        var route = "workers?action=create-worker-from-user&userid=" + userid;
        this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send().subscribe((result:Worker)=> {
            this.worker = result;
        });
    }
    
}