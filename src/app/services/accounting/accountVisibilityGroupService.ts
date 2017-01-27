import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AccountVisibilityGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class AccountVisibilityGroupService extends BizHttp<AccountVisibilityGroup> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AccountVisibilityGroup.RelativeUrl;
        this.entityType = AccountVisibilityGroup.EntityType;
        this.DefaultOrderBy = 'Name';
    }
}
