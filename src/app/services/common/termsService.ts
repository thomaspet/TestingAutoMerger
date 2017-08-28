import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Terms} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class TermsService extends BizHttp<Terms> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Terms.RelativeUrl;
        this.entityType = Terms.EntityType;
        this.DefaultOrderBy = null;
    }
}
