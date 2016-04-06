import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerQuoteItemService extends BizHttp<CustomerQuoteItem> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerQuoteItem.relativeUrl;
        this.DefaultOrderBy = null;
    }    
    
    
}