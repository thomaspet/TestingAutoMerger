// angular
import {Injectable} from '@angular/core';

// app
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {TransitionThreshold} from '../../unientities';

import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class ThresholdService extends BizHttp<TransitionThreshold> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = TransitionThreshold.RelativeUrl;
        this.entityType = TransitionThreshold.EntityType;
        this.DefaultOrderBy = null;
    }
}