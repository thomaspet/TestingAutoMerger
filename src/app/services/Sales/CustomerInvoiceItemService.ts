import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AuthService} from '../../../framework/core/authService';
import {CustomerInvoiceItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerInvoiceItemService extends BizHttp<CustomerInvoiceItem> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = CustomerInvoiceItem.RelativeUrl;
        this.entityType = CustomerInvoiceItem.EntityType;
        this.DefaultOrderBy = null;
    }
}
