import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AccountGroupSet} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class AccountGroupSetService extends BizHttp<AccountGroupSet> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = AccountGroupSet.RelativeUrl;
        this.entityType = AccountGroupSet.EntityType;
        this.DefaultOrderBy = null;
    }       
}
