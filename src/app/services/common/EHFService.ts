import {BizHttp} from '../../../framework/core/http/BizHttp';
import {EHFLog} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@angular/http';

export class EHFService extends BizHttp<EHFLog> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = EHFLog.RelativeUrl;
        this.entityType = EHFLog.EntityType;
        this.DefaultOrderBy = null;
    }

    public Activate(activate) {
        return this.ActionWithBody(null, activate, 'activate', RequestMethod.Post);
    }
}
