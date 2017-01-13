import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Municipal} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class MunicipalService extends BizHttp<Municipal> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Municipal.RelativeUrl;
        this.entityType = Municipal.EntityType;
        this.DefaultOrderBy = null;
    }       
}
