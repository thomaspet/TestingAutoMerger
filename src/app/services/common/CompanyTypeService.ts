import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanyType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class CompanyTypeService extends BizHttp<CompanyType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = CompanyType.relativeUrl;
        this.DefaultOrderBy = null;
    }       
}