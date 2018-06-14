import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {TravelType} from '../../../unientities';

import {Observable} from 'rxjs/Observable';

@Injectable()
export class TravelTypeService extends BizHttp<TravelType> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TravelType.RelativeUrl;
        this.entityType = TravelType.EntityType;
    }
}
