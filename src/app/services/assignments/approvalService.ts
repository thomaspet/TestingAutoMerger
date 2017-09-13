import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Approval} from '../../unientities';

@Injectable()
export class ApprovalService extends BizHttp<Approval> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Approval.RelativeUrl;
        this.entityType = Approval.EntityType;
        this.DefaultOrderBy = null;
    }
}
