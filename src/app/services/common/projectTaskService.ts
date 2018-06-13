import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ProjectTask} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class ProjectTaskService extends BizHttp<ProjectTask> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = ProjectTask.RelativeUrl;
        this.entityType = ProjectTask.EntityType;
        this.DefaultOrderBy = null;
    }

    public getGroupedTasks(): Observable<ProjectTask> {
        return super.GetAll('groupby=ProjectID');
    }
}
