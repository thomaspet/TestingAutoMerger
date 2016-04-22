import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Municipal} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class MunicipalService extends BizHttp<Municipal> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Municipal.relativeUrl;
        this.DefaultOrderBy = null;
    }       
}