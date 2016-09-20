import {UniCacheService, IUniCacheEntry} from '../../app/services/cacheService';

// Base class for UniParentView and UniChildView
class UniView {
    protected cacheService: UniCacheService;
    protected cacheKey: string;
    protected cacheEntry: IUniCacheEntry;

    constructor(routerUrl: string, cacheService: UniCacheService) {
        this.cacheService = cacheService;

        let rootRoute = this.findRootRoute(routerUrl.split('/'));
        this.cacheKey = rootRoute || routerUrl;

        this.cacheEntry = this.cacheService.getCacheEntry(this.cacheKey)
                          || this.cacheService.initCacheEntry(this.cacheKey);
    }

    protected getStateVar(key: string) {
        if (this.cacheEntry.state[key]) {
            return this.cacheEntry.state[key].data;
        }
    }

    protected setStateVar(key: string, data: any, isDirty: boolean = true) {
        this.cacheEntry.state[key] = {
            isDirty: isDirty,
            updatedAt: new Date(),
            data: data
        };

        if (isDirty) {
            this.cacheEntry.isDirty = true;
        }

        this.cacheService.updateCacheEntry(this.cacheKey, this.cacheEntry);
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
}

export class UniParentView extends UniView {

    constructor(routerUrl: string, cacheService: UniCacheService) {
        super(routerUrl, cacheService);
    }

    public canDeactivate() {
        // Update from cache
        // TODO: replaySubject(1) ?
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

export class UniChildView extends UniView {

    constructor(routerUrl: string, cacheService: UniCacheService) {
        super(routerUrl, cacheService);
    }
}

