import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class EmailService extends BizHttp<Email> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Email.relativeUrl;
                
        this.DefaultOrderBy = null;
    }           
}