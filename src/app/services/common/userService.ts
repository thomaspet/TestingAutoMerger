import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class UserService extends BizHttp<User> {
    private userObservable: Observable<User>;

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = User.RelativeUrl;
        this.entityType = User.EntityType;
        this.DefaultOrderBy = 'DisplayName';

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

    inviteUser(email: string) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications')
            .withBody({Email: email})
            .send()
            .pipe(
                switchMap(() => {
                    super.invalidateCache();
                    return this.GetAll().pipe(
                        map(users => users.find(u => u.Email === email))
                    );
                })
            );
    }

    public getRolesByUserId(id: number) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('userroles?filter=UserID eq ' + id +
                '&expand=SharedRole')
            .send()
            .map(res => res.json());
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

    public getUsersByGUIDs(GUIDs: string[]): Observable<User[]> {
        if (GUIDs.length === 0) {
            return Observable.of([]);
        }
        const query = `filter=GlobalIdentity eq '` + GUIDs.join(`' OR ID eq '`) + `'`;
        return this.GetAll(query);
    }
}
