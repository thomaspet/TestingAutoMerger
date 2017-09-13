import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Task} from '../../unientities';

@Injectable()
export class TaskService extends BizHttp<Task> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Task.RelativeUrl;
        this.entityType = Task.EntityType;
        this.DefaultOrderBy = null;
    }
}
