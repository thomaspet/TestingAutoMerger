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
        const token = this.authService.getTokenDecoded();
        return this.GetAll('').map((users: User[]) => {
            return users.find(user => user.GlobalIdentity === token.nameid);
        });
    }
}
