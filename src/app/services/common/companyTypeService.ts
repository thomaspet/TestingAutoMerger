import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanyType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CompanyTypeService extends BizHttp<CompanyType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = CompanyType.RelativeUrl;
        this.entityType = CompanyType.EntityType;
        this.DefaultOrderBy = null;
    }       
}
