import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class UserService extends BizHttp<User> {
    private userObservable: Observable<User>;

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = User.RelativeUrl;
        this.entityType = User.EntityType;
        this.DefaultOrderBy = null;

        this.http.authService.authentication$.subscribe((auth) => {
            this.userObservable = undefined;
        });
    }

    public getCurrentUser(): Observable<User> {
        if (!this.userObservable) {
            this.userObservable = this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint('users?action=current-session')
                .send()
                .map(res => res.json())
                .publishReplay(1)
                .refCount();
        }

        return this.userObservable
            // Re-throw errors because of issue where hot observables
            // stop emitting errors if one subscriber doesn't catch
            .catch(err => Observable.throw(err));
    }

    // override bizhttp put with cache invalidation
    public Put(id: number, entity: any): Observable<any> {
        this.userObservable = undefined; // invalidate cache
        return super.Put(id, entity);
    }

    public getRolesByUserId(id: number) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('userroles?filter=UserID eq ' + id +
                '&expand=SharedRole')
            .send()
            .map(res => res.json());
    }


    private getPermissionKey(url: string): string {
        if (!url) {
            return '';
        }

        // Remove query params first
        let noQueryParams = url.split('?')[0];
        noQueryParams = noQueryParams.split(';')[0];


        let urlParts = noQueryParams.split('/');
        urlParts = urlParts.filter(part => {
            // Remove empty url parts and numeric url parts (ID params)
            return part !== '' && isNaN(parseInt(part));
        });

        return 'ui_' + urlParts.join('_');
    }

    public changeAutobankPassword(body: any) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('users?action=change-autobank-password')
            .withBody(body)
            .send()
            .map(res => res.json());
    }
}
