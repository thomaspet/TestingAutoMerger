import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Transition} from '../../unientities';

@Injectable()
export class TransitionService extends BizHttp<Transition> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Transition.RelativeUrl;
        this.entityType = Transition.EntityType;
        this.DefaultOrderBy = null;
    }
}

