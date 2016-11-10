import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class UserService extends BizHttp<User> {

    constructor(http: UniHttp, private authService: AuthService) {
        super(http);

        this.relativeURL = User.RelativeUrl;
        this.entityType = User.EntityType;
        this.DefaultOrderBy = null;
    }

    public getCurrentUser(): Observable<User> {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('users?action=current-session')
            .send()
            .map(response => response.json());
    }
}
