import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class UserService extends BizHttp<User> {
    private currentUser: User;

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = User.RelativeUrl;
        this.entityType = User.EntityType;
        this.DefaultOrderBy = null;
        this.authService.authentication$.subscribe(
            change => this.currentUser = undefined
            /* don't need error handling */
            );
    }

    public getCurrentUser(): Observable<User> {
        if (this.currentUser) {
            return Observable.of(this.currentUser);
        } else {
            return this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint('users?action=current-session')
                .send()
                .switchMap((response) => {
                    this.currentUser = response.json();
                    return Observable.of(this.currentUser);
                });
        }
    }

    // override bizhttp put with cache invalidation
    public Put(id: number, entity: any): Observable<any> {
        this.currentUser = undefined;
        return super.Put(id, entity);
    }
}
