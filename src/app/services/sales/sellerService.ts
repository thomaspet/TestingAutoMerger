import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Seller} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class SellerService extends BizHttp<Seller> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Seller.RelativeUrl;
        this.entityType = Seller.EntityType;
        this.DefaultOrderBy = null;
    }
}
