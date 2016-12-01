import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class ProjectService extends BizHttp<Project> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = Project.RelativeUrl;
        this.entityType = Project.EntityType;
        this.DefaultOrderBy = null;
    }
}
