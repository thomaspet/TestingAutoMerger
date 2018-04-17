import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerQuoteItemService extends BizHttp<CustomerQuoteItem> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CustomerQuoteItem.RelativeUrl;
        this.entityType = CustomerQuoteItem.EntityType;
        this.DefaultOrderBy = null;

        /*
            Because saving quote/order/invoice doesnt invalidate the cache of this service.
            Ideally this shouldn't be a separate service, the quote/order/invoice services
            should just have a function for getting items. Might refactor later if I find time.
        */
        this.disableCache();
    }
}
