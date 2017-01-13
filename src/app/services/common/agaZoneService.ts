import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGAZone} from '../../unientities';

@Injectable()
export class AgaZoneService extends BizHttp<AGAZone> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AGAZone.RelativeUrl;
        this.entityType = AGAZone.EntityType;
        this.DefaultOrderBy = null;
    }
    
    public getAgaRules() {
       return this.GetAll('action=get-agasectors');
    }
    
}
