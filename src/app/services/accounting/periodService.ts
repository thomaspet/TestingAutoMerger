import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Period} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PeriodService extends BizHttp<Period> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Period.RelativeUrl;
        this.entityType = Period.EntityType;
        this.DefaultOrderBy = null;
    }       
}
