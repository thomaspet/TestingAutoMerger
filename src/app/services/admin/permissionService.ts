import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Permission} from '../../unientities';

@Injectable()
export class PermissionService extends BizHttp<Permission> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Permission.RelativeUrl;
        this.entityType = Permission.EntityType;
        this.defaultExpand = [];
    }
}
