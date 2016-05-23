import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AccountGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class AccountGroupService extends BizHttp<AccountGroup> {

    constructor(http: UniHttp) { 
        super(http);

        //TODO: should resolve this from configuration based on type (IAccount)? Frank is working on something..               
        this.relativeURL = AccountGroup.RelativeUrl;

        //set this property if you want a default sort order from the API, e.g. AccountNumber
        this.DefaultOrderBy = 'Name';
    }
}