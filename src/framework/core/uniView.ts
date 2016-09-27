import {UniCacheService} from '../../app/services/cacheService';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

export class UniView {
    protected cacheService: UniCacheService;
    protected cacheKey: string;
    private dirtyState: {[key: string]: boolean} = {};

    constructor(routerUrl: string, cacheService: UniCacheService) {
        this.cacheService = cacheService;

        let rootRoute = this.findRootRoute(routerUrl.split('/'));
        this.cacheKey = rootRoute || routerUrl;
    }

    protected getStateSubject(key: string): ReplaySubject<any> {
        let cacheEntry = this.cacheService.getCacheEntry(this.cacheKey)
                         || this.cacheService.initCacheEntry(this.cacheKey);


        if (!cacheEntry.state[key]) {
            cacheEntry.state[key] = {
                isDirty: false,
                subject: new ReplaySubject(1)
            };
        }

        this.dirtyState[key] = cacheEntry.state[key].isDirty;
        return cacheEntry.state[key].subject;
    }

    protected updateState(key: string, data: any, isDirty: boolean = true): void {
        let cacheEntry = this.cacheService.getCacheEntry(this.cacheKey);
        let stateVariable = cacheEntry.state[key];

        stateVariable.isDirty = isDirty;
        stateVariable.updatedAt = new Date();
        stateVariable.subject.next(data);

        this.dirtyState[key] = isDirty;
        this.cacheService.updateCacheEntry(this.cacheKey, cacheEntry);
    }

    protected isDirty(): boolean {
        for (let key in this.dirtyState) {
            if (this.dirtyState[key]) {
                return true;
            }
        }

        return false;
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
        let cache = this.cacheService.getCacheEntry(this.cacheKey);

        if (cache.isDirty) {
            return this.getUserPermission();
        } else {
            return true;
        }
    }

    private getUserPermission(): boolean {
        // TODO: add possibility to save directly from dialog
        if (window.confirm('Du har ulagrede endringer, ønsker du å forkaste disse?')) {
            this.cacheService.clearCacheEntry(this.cacheKey);
            return true;
        } else {
            return false;
        }
    }
}
