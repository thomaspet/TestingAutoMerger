import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeriesTask} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class NumberSeriesTaskService extends BizHttp<NumberSeriesTask> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = NumberSeriesTask.RelativeUrl;
        this.entityType = NumberSeriesTask.EntityType;
        this.DefaultOrderBy = null;
    }
}
