import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoice, CustomerInvoiceItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

@Injectable()
export class CustomerInvoiceItemService extends BizHttp<CustomerInvoiceItem> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerInvoiceItem.RelativeUrl;
        this.entityType = CustomerInvoiceItem.EntityType
        this.DefaultOrderBy = null;
    }
}
