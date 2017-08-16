import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SellerLink} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class SellerLinkService extends BizHttp<SellerLink> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = SellerLink.RelativeUrl;
        this.entityType = SellerLink.EntityType;
        this.DefaultOrderBy = null;
    }
}
