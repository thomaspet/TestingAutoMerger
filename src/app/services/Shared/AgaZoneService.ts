import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGAZone} from '../../unientities';

export class AgaZoneService extends BizHttp<AGAZone> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AGAZone.relativeUrl;
    }
    
    getAgaRules() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(AGAZone.relativeUrl + '?action=get-agasectors')
            .send();
    }
}
