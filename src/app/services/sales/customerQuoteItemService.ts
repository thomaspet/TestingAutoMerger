import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class CustomerQuoteItemService extends BizHttp<CustomerQuoteItem> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = CustomerQuoteItem.RelativeUrl;
        this.entityType = CustomerQuoteItem.EntityType;
        this.DefaultOrderBy = null;
    }
}
