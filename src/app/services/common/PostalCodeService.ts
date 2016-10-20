import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PostalCode} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PostalCodeService extends BizHttp<PostalCode> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = PostalCode.RelativeUrl;
        this.entityType = PostalCode.EntityType;
        this.DefaultOrderBy = null;
    }
}
