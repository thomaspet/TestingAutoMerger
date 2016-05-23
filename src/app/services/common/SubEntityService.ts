import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class SubEntityService extends BizHttp<SubEntity> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = SubEntity.RelativeUrl;
        this.DefaultOrderBy = null;
    }       
}