import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Phone} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class PhoneService extends BizHttp<Phone> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Phone.relativeUrl;
                
        this.DefaultOrderBy = null;
    }           
}