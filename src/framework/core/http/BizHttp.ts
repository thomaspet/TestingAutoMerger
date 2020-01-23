import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/concatMap';

import {UniHttp} from './http';
import {RequestMethod} from './request-method';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';

export interface IHttpCacheStore<T> {
    [hash: number]: IHttpCacheEntry<T>;
}

interface IHttpCacheEntry<T> {
    timeout: number;
    data: Observable<T|T[]>;
}

interface IHttpCacheSettings {
    timeout?: number;
    maxEntries?: number;
    clearOnlyOnLogout?: boolean;
}

@Injectable()
export class BizHttp<T> {
    protected noCache: boolean;
    protected cacheStore: IHttpCacheStore<T> = {};
    protected cacheSettings: IHttpCacheSettings = {};

    protected DefaultOrderBy: string;
    protected defaultExpand: string[];
    protected debounceTime: number = 500;

    // should be found based on type of T. Set in childclass constructor now
    public relativeURL: string;
    protected entityType: string;

    constructor(protected http: UniHttp) {
        this.http.authService.authentication$.subscribe(auth => {
            if (this.cacheSettings.clearOnlyOnLogout) {
                if (!auth || !auth.user) {
                    this.invalidateCache();
                }
            } else {
                this.invalidateCache();
            }
        });
    }

    protected disableCache() {
        this.noCache = true;
    }

    /**
     * Calculate a 32 bit FNV-1a hash
     * Used for converting endpoint + odata string to a smaller hash
     * that is used as key for the result cache.
     * Ref: https://gist.github.com/vaiorabbit/5657561
     *      http://isthe.com/chongo/tech/comp/fnv/
     */
    protected hashFnv32a(input: string): number {
        /* tslint:disable:no-bitwise */
        let i, l,
            hval = 0x811c9dc5;

        for (i = 0, l = input.length; i < l; i++) {
            hval ^= input.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }

        return hval >>> 0;
    }

    protected getFromCache(hash: number): Observable<any> {
        if (this.noCache) {
            return;
        }

        const entry = this.cacheStore[hash];
        if (entry) {
            // Verify that the entry is not timed out
            if (!entry.timeout || (performance.now() < entry.timeout)) {
                return entry.data.pipe(map(res => cloneDeep(res)));
            } else {
                delete this.cacheStore[hash];
            }
        }
    }

    protected storeInCache(hash: number, requestObservable: Observable<T|T[]>, withTimeout: boolean = true) {
        if (this.noCache) {
            return;
        }

        // Delete first entry if store is full
        let keys = Object.keys(this.cacheStore);

        if (keys.length >= (this.cacheSettings.maxEntries || 50)) {
            delete this.cacheStore[keys[0]];
        }

        let timeout: number;
        if (withTimeout) {
            timeout = performance.now() + (this.cacheSettings.timeout || 30000);
        }

        this.cacheStore[hash] = {
            timeout: timeout,
            data: requestObservable
        };
    }

    public invalidateCache(): void {
        this.cacheStore = {};
    }

    public waitUntilJobCompleted(jobID: number) {
        return this.http
            .usingJobInfoDomain()
            .asGET()
            .withEndPoint(jobID.toString())
            .send()
            .repeatWhen(c => c.debounceTime(1000))
            .skipWhile(status => status.body.Completed !== true)
            .take(1)
            .map(response => response.body);
    }

    public Get(ID: number|string, expand?: string[], hateoas = false): Observable<any> {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }

        const hash = this.hashFnv32a(this.relativeURL + ID + expandStr);
        let request = this.getFromCache(hash);

        if (!request) {
            request = this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL + '/' + ID + (typeof ID == 'string' && ID.indexOf('?') == 0 ? '&' : '?') + 'hateoas=' + hateoas)
                .send({expand: expandStr})
                .publishReplay(1)
                .refCount();


            this.storeInCache(hash, request);
        }

        return request.map((res) => res.body);
    }

    public GetOneByQuery(query: string, expand?: string[]): Observable<any> {
        return this.GetAll(query, expand)
            .map(result => result && result.length && result[0]);
    }

    public GetAllByHttpParams<T>(params: HttpParams, mapResponse?: boolean): Observable<any> {
        // use default orderby for service if no orderby is specified
        if (!params.get('orderby') && this.DefaultOrderBy) {
            params = params.set('orderby', this.DefaultOrderBy);
        }

        // use default expands for service if no expand is specified
        if (!params.get('expand') && this.defaultExpand) {
            params = params.set('expand', this.defaultExpand.join());
        }

        // remove empty filters, causes problem on backend
        if (params.get('filter') === '') {
            params = params.delete('filter');
        }

        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL)
            .send({}, params)
            .pipe(
                map(res => {
                    return mapResponse ? res.body : res;
                })
            );
    }

    public GetAll(query?: string, expand?: string[]): Observable<any> {
        if (this.DefaultOrderBy && (!query || (query && query.toLowerCase().indexOf('orderby=') < 0))) {
            if (query) {
                query += '&orderby=' + this.DefaultOrderBy;
            } else {
                query = 'orderby=' + this.DefaultOrderBy;
            }
        }

        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }

        const hash = this.hashFnv32a(this.relativeURL + query + expandStr);
        let request = this.getFromCache(hash);

        if (!request) {
            request = this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL + (query ? '?' + query : ''))
                .send({expand: expandStr})
                .publishReplay(1)
                .refCount();

            this.storeInCache(hash, request);
        }

        return request.map(res => res.body);
    }

    public Post<T>(entity: T): Observable<any> {
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL)
            .send()
            .map(response => response.body);
    }

    public Put<T>(ID: number, entity: T): Observable<any> {
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID)
            .send()
            .map(response => response.body);
    }

    public Remove<T>(ID: number | string, entity?: T): Observable<any> {
        // maybe not neccessary to include entity as parameter?
        // could be useful for validating if entity could be deleted?
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .asDELETE()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send();
    }

    public Transition<T>(ID: number, entity: T, transitionName: string): Observable<any> {
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID + '?action=' + transitionName)
            .send()
            .map(response => response.body);
    }

    public Action<T>(ID: number, actionName: string, parameters: string = null, method: RequestMethod = RequestMethod.Put): Observable<any> {
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withEndPoint(this.relativeURL + '/' + (ID === null ? '' : ID) + '?action=' + actionName + (parameters === null ? '' : '&' + parameters))
            .send()
            .map(response => response.body);
    }

    public ActionWithBody<T>(ID: number, body: T, actionName: string, method: RequestMethod | string = RequestMethod.Put, parameters: string = null): Observable<any> {
        this.invalidateCache();
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withBody(body)
            .withEndPoint(this.relativeURL + '/' + (ID === null ? '' : ID) + '?action=' + actionName + (parameters === null ? '' : '&' + parameters))
            .send()
            .map(response => response.body);
    }

    public GetAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Get);
    }

    public PostAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Post);
    }

    public PutAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Put);
    }

    public DeleteAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Delete);
    }

    public GetNewEntity(expand?: string[], entityname: string = null) {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        }

        // TODO. Needs a more robust way to handle the Singular Url needed for this request.
        // let relativeUrlSingular = this.relativeURL.slice(0, this.relativeURL.length - 1);
        let endpoint = !!entityname
            ? entityname
            : this.relativeURL.slice(0, this.relativeURL.length - 1);

        endpoint += '/new';

        const hash = this.hashFnv32a(endpoint + expandStr);
        let request = this.getFromCache(hash);

        if (!request) {
            request = this.http
                .usingMetadataDomain()
                .asGET()
                .withEndPoint(endpoint)
                .send({expand: expandStr})
                .publishReplay(1)
                .refCount();

            this.storeInCache(hash, request, false);
        }

        return request.map((res) => res.body);
    }

    public GetLayout(ID: string) {
        var endPoint = ['layout', ID].join('/');
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(endPoint)
            .send()
            .map(response => response.body);
    }

    public getNewGuid(): string {
        return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    public getNextID(currentID: number): Observable<number> {
        type statisticsResponse = {Data: {ID: number}[]};
        return this.http
            .usingBusinessDomain()
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(`?model=${this.entityType}&select=ID as ID&filter=ID gt ${currentID}&orderby=ID&top=1`)
            .send()
            .map(response => response.body)
            .map((response: statisticsResponse) => {
                return response.Data.length > 0 ? response.Data[0].ID : null;
            });
    }

    public getPreviousID(currentID: number): Observable<number> {
        type statisticsResponse = {Data: {ID: number}[]};
        return this.http
            .usingBusinessDomain()
            .usingStatisticsDomain()
            .asGET()
            .withEndPoint(`?model=${this.entityType}&select=ID as ID&filter=ID lt ${currentID}&orderby=ID DESC&top=1`)
            .send()
            .map(response => response.body)
            .map((response: statisticsResponse) => {
                return response.Data.length > 0 ? response.Data[0].ID : null;
            });
    }
}
