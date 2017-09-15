import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

const PUBLIC_ROUTES = ['init', 'about', 'assignments', 'tickers', 'uniqueries'];

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

    /** Synchronous permission lookup. Requires user object being passed as param */
    public checkAccessToRoute(url: string, user: User): boolean {
        // Treat empty permissions array as access to everything for now
        if (!user['Permissions'] || !user['Permissions'].length ) {
            return true;
        }

        // First check if the route is a public route
        const rootRoute = this.getRootRoute(url);
        if (!rootRoute || PUBLIC_ROUTES.some(route => route === rootRoute)) {
            return true;
        }

        // If not, check if the user has permission to view the route
        let permissionKey: string = this.getPermissionKey(url);
        let hasPermission = user['Permissions'].some(permission => permission === permissionKey);

        return hasPermission;
    }

    /** Async permission lookup. Async because it may need to GET current user */
    public canActivateUrl(url: string): Observable<boolean> {
        return this.getCurrentUser().map((user: User) => {
            return this.checkAccessToRoute(url, user);
        });
    }

    private getRootRoute(url): string {
        let routeParts = url.split('/');
        routeParts = routeParts.filter(part => part !== '');

        return routeParts[0];
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

}
