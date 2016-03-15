import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class CustomerService extends BizHttp<Customer> {
    
    constructor(http: UniHttp) {        
        super(http);
       
        this.relativeURL = Customer.relativeUrl;       
        this.DefaultOrderBy = null;
    }       
}