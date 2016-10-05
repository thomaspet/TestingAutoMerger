import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class UserService extends BizHttp<User> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = User.RelativeUrl;       
        this.entityType = User.EntityType;
        this.DefaultOrderBy = null;
    }       
}
