import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class EmailService extends BizHttp<Email> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = "emails"; // TODO: change to Email.relativeUrl;
        this.DefaultOrderBy = null;
    }       
}