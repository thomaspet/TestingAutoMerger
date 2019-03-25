import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ProjectTask} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class ProjectTaskService extends BizHttp<ProjectTask> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = ProjectTask.RelativeUrl;
        this.entityType = ProjectTask.EntityType;
        this.DefaultOrderBy = null;
    }
}
