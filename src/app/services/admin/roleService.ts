import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Role} from '../../unientities';

@Injectable()
export class RoleService extends BizHttp<Role> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Role.RelativeUrl;
        this.entityType = Role.EntityType;
        this.defaultExpand = [];
    }
}
