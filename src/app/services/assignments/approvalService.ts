// angular
import {Injectable} from '@angular/core';

// app
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Approval} from '../../unientities';

import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class ApprovalService extends BizHttp<Approval> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = Approval.RelativeUrl;
        this.entityType = Approval.EntityType;
        this.DefaultOrderBy = null;
    }
}