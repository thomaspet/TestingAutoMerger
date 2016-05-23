import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGAZone} from '../../unientities';

export class AgaZoneService extends BizHttp<AGAZone> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AGAZone.RelativeUrl;
        this.DefaultOrderBy = null;
    }
    
    public getAgaRules() {
       return this.GetAll('action=get-agasectors');
    }
    
}
