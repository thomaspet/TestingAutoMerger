import {UniCacheService} from '../../app/services/cacheService';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

export class UniView {
    protected cacheService: UniCacheService;
    protected cacheKey: string;

    constructor(routerUrl: string, cacheService: UniCacheService) {
        this.cacheService = cacheService;

        let rootRoute = this.findRootRoute(routerUrl.split('/'));
        this.cacheKey = rootRoute || routerUrl;
    }

    protected getStateSubject(key: string): ReplaySubject<any> {
        let pageCache = this.cacheService.getPageCache(this.cacheKey);

        if (!pageCache.state[key]) {
            pageCache.state[key] = {
                isDirty: false,
                subject: new ReplaySubject(1)
            };
        }

        return pageCache.state[key].subject;
    }

    protected updateState(key: string, data: any, isDirty: boolean = true): void {
        let pageCache = this.cacheService.getPageCache(this.cacheKey);
        let stateVariable = pageCache.state[key];

        stateVariable.isDirty = isDirty;
        stateVariable.updatedAt = new Date();
        stateVariable.subject.next(data);

        this.cacheService.updatePageCache(this.cacheKey, pageCache);
    }

    protected isDirty(key: string): boolean {
        let pageCache = this.cacheService.getPageCache(this.cacheKey);
        return pageCache.state[key] && pageCache.state[key].isDirty;
    }

    // Pop url segments until we reach :id
    // if url has no :id, undefined is returned
    private findRootRoute(urlSegments: string[]) {
        if (!urlSegments.length) {
            return;
        }

        if (isNaN(+urlSegments[urlSegments.length - 1])) {
            urlSegments.pop();
            return this.findRootRoute(urlSegments);
        } else {
            return urlSegments.join('/');
        }
    }


    public canDeactivate(): Observable<boolean>|Promise<boolean>|boolean {
        // Update from cache
        let cache = this.cacheService.getPageCache(this.cacheKey);

        if (cache.isDirty) {
            return this.getUserPermission();
        } else {
            return true;
        }
    }

    private getUserPermission(): boolean {
        // TODO: add possibility to save directly from dialog
        if (window.confirm('Du har ulagrede endringer, ønsker du å forkaste disse?')) {
            this.cacheService.clearPageCache(this.cacheKey);
            return true;
        } else {
            return false;
        }
    }
}
