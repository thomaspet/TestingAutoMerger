import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Address} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class AddressService extends BizHttp<Address> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Address.relativeUrl;
                
        this.DefaultOrderBy = null;
    }           
}