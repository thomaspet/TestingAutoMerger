import { UniCacheService } from '../../app/services/services';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

export class UniView {
    protected cacheService: UniCacheService;
    protected cacheKey: string;

    constructor(routerUrl: string, cacheService: UniCacheService) {
        this.cacheService = cacheService;
        this.updateCacheKey(routerUrl);
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

    protected updateCacheKey(routerUrl: string) {
        let rootRoute = this.findRootRoute(routerUrl.split('/'));
        this.cacheKey = rootRoute || routerUrl;
    }

    protected updateState(key: string, data: any, isDirty: boolean = false): void {
        let pageCache = this.cacheService.getPageCache(this.cacheKey);
        let stateVariable = pageCache.state[key];

        if (stateVariable) {
            stateVariable.isDirty = isDirty;
            stateVariable.updatedAt = new Date();
            stateVariable.subject.next(data);
        }

        this.cacheService.updatePageCache(this.cacheKey, pageCache);
    }

    protected isDirty(key?: string): boolean {
        let pageCache = this.cacheService.getPageCache(this.cacheKey);

        if (key && key.length) {
            return pageCache.state[key] && pageCache.state[key].isDirty;
        } else {
            let dirty = Object.keys(pageCache.state).find(stateKey => pageCache.state[stateKey].isDirty);
            return (dirty && dirty.length > 0);
        }
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


    public canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        // Update from cache
        let cache = this.cacheService.getPageCache(this.cacheKey);
        let canDeactivate = !cache.isDirty || this.getUserPermission();

        if (canDeactivate) {
            this.cacheService.clearPageCache(this.cacheKey);
        }

        return canDeactivate;
    }

    private getUserPermission(): boolean {
        // TODO: add possibility to save directly from dialog
        return window.confirm('Du har ulagrede endringer, ønsker du å forkaste disse?');
    }
}
