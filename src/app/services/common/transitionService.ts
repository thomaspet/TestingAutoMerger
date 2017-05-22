// angular
import {Injectable} from '@angular/core';

// app
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Transition} from '../../unientities';

import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class TransitionService extends BizHttp<Transition> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = Transition.RelativeUrl;
        this.entityType = Transition.EntityType;
        this.DefaultOrderBy = null;
    }
}

