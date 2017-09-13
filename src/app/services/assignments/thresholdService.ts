
import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {TransitionThreshold} from '../../unientities';

@Injectable()
export class ThresholdService extends BizHttp<TransitionThreshold> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TransitionThreshold.RelativeUrl;
        this.entityType = TransitionThreshold.EntityType;
        this.DefaultOrderBy = null;
    }
}
