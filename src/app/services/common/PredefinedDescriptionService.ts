import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PredefinedDescription} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PredefinedDescriptionService extends BizHttp<PredefinedDescription> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = PredefinedDescription.RelativeUrl;
        this.entityType = PredefinedDescription.EntityType;
        this.DefaultOrderBy = null;
    }
}
