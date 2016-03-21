import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class BusinessRelationService extends BizHttp<BusinessRelation> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = BusinessRelation.relativeUrl;
        
        this.DefaultOrderBy = null;
    }       
}