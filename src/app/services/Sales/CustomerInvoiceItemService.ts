import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoice, CustomerInvoiceItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerInvoiceItemService extends BizHttp<CustomerInvoiceItem> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = "invoiceitems";// CustomerInvoiceItem.relativeUrl;
        this.DefaultOrderBy = null;
    }
}