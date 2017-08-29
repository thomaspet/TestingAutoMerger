import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Team} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class TeamService extends BizHttp<Team> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Team.RelativeUrl;
        this.entityType = Team.EntityType;
        this.DefaultOrderBy = null;
    }
}
