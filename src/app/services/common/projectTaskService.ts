import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ProjectTask} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ProjectTaskService extends BizHttp<ProjectTask> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = ProjectTask.RelativeUrl;
        this.entityType = ProjectTask.EntityType;
        this.DefaultOrderBy = null;
    }

    public getGroupedTasks(): Observable<ProjectTask> {
        return super.GetAll('groupby=ProjectID');
    }
    
}
