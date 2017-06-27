// angular
import {Injectable} from '@angular/core';

// app
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Task} from '../../unientities';

import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class TaskService extends BizHttp<Task> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = Task.RelativeUrl;
        this.entityType = Task.EntityType;
        this.DefaultOrderBy = null;
    }
}