import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerOrderItemService extends BizHttp<CustomerOrderItem> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = "orderitems";// CustomerOrderItem.relativeUrl;
        this.DefaultOrderBy = null;
    }
}