import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, URLSearchParams, Request, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {AppConfig} from '../../../app/AppConfig';
import {AuthService} from '../authService';

export interface IUniHttpRequest {
    baseUrl?: string;
    headers?: any;
    apiDomain?: string;
    endPoint?: string;
    body?: any;
    method?: any;
    action?: string;
    expand?: string;
    filter?: string;
    orderBy?: string;
    top?: number;
    skip?: number;
}

@Injectable()
export class UniHttp {
    private baseUrl: string = AppConfig.BASE_URL;
    private apiDomain: string = AppConfig.API_DOMAINS.BUSINESS;
    private headers: Headers;
    private method: number;
    private body: any;
    private endPoint: string;
    
    private lastReAuthentication: Date;
    private reAuthenticated$: EventEmitter<any> = new EventEmitter();
    
    constructor(public http: Http, private authService: AuthService) {
        var headers = AppConfig.DEFAULT_HEADERS;
        this.headers = new Headers();
        this.appendHeaders(headers);
    }

    public appendHeaders(headers: any) {
        for (var key in headers) {
            this.headers.set(key, headers[key])
        }
        return this;
    }

    public getBaseUrl() {
        return this.baseUrl;
    }

    public withNewHeaders() {
        this.headers = new Headers();
        return this;
    }

    public withDefaultHeaders() {
        this.headers = new Headers();
        this.appendHeaders(AppConfig.DEFAULT_HEADERS);
        return this;
    }

    public withBaseUrl(url: string) {
        this.baseUrl = url;
        return this;
    }

    public withHeader(name: string, value: any) {
        this.headers.set(name, value);
        return this;
    }

    public withHeaders(headers: any) {
        return this.appendHeaders(headers);
    }

    public usingMetadataDomain() {
        this.baseUrl = AppConfig.BASE_URL;
        this.apiDomain = AppConfig.API_DOMAINS.METADATA;
        this.baseUrl = AppConfig.BASE_URL;
        return this;
    }

    public usingBusinessDomain() {
        this.baseUrl = AppConfig.BASE_URL;
        this.apiDomain = AppConfig.API_DOMAINS.BUSINESS;
        this.baseUrl = AppConfig.BASE_URL;
        return this;
    }

    public usingInitDomain() {
        this.baseUrl = AppConfig.BASE_URL_INIT;
        this.apiDomain = AppConfig.API_DOMAINS.INIT;
        this.baseUrl = AppConfig.BASE_URL_INIT;
        return this;
    }
    
    public usingEmptyDomain() {
        this.apiDomain = "";
        return this;
    }

    public as(method: number) {
        this.method = method;
        return this;
    }

    public asGET() {
        this.method = RequestMethod.Get;
        return this;
    }

    public asPUT() {
        this.method = RequestMethod.Put;
        return this;
    }

    public asPOST() {
        this.method = RequestMethod.Post;
        return this;
    }

    public asDELETE() {
        this.method = RequestMethod.Delete;
        return this;
    }

    public asPATCH() {
        this.method = RequestMethod.Patch;
        return this;
    }

    public asHEAD() {
        this.method = RequestMethod.Head;
        return this;
    }

    public withBody(body: any) {
        this.body = body;
        return this;
    }
    
    public withEndPoint(endPoint: string) {
        this.endPoint = endPoint;
        return this;
    }

    public sendToUrl(url: any) {
        var options: any = {
            method: this.method,
            url: url,
            headers: this.headers
        };
        if (this.body) {
            options.body = (this.body instanceof FormData) ? this.body : JSON.stringify(this.body);
        }
        return this.http.request(new Request(options)).map((response: any) => response.json());
    }

    public send(request: IUniHttpRequest = {}, withoutJsonMap: boolean = false, searchParams: URLSearchParams = null): Observable<any> {
        let token = this.authService.getToken();
        let activeCompany = this.authService.getActiveCompany();

        if (token) {
            this.headers.set('Authorization', 'Bearer ' + token);
        }

        if (activeCompany) {
            this.headers.set('CompanyKey', activeCompany.Key);
        }
        
        this.headers.set('Accept', 'application/json');

        var baseurl = request.baseUrl || this.baseUrl,
            apidomain = request.apiDomain || this.apiDomain,
            endpoint = request.endPoint || this.endPoint,
            method = request.method || this.method,
            body = request.body || this.body;

        var url = baseurl + apidomain + endpoint;
        var options: any = {
            method: method,
            url: url,
            headers: this.headers
        };

        if (body) {
            options.body = (body instanceof FormData) ? body : JSON.stringify(body);
        }
        
        if (searchParams) {
            options.search = searchParams;
        } else if (request) {
            options.search = UniHttp.buildUrlParams(request);
        }

        return this.http.request(new Request(options))
        .retryWhen(errors => errors.switchMap(err => {
            if (err.status === 401) {
                if (!this.authService.isAuthenticated() 
                    || !this.authService.lastTokenUpdate 
                    || (new Date().getMinutes() - this.authService.lastTokenUpdate.getMinutes()) > 1) {
                    
                    this.lastReAuthentication = new Date();
                    this.authService.requestAuthentication$.emit({
                        onAuthenticated: (newToken) => {
                            this.headers.set('Authorization', 'Bearer ' + newToken);
                            this.reAuthenticated$.emit(true);
                        }
                    });
                
                    return this.reAuthenticated$;
                } else {
                    return Observable.timer(500);
                }
                    
            } else {
                    return Observable.throw(err);                
            }
        }))
        .switchMap(
            (response) => {
                if (withoutJsonMap) {
                    return Observable.from([response]);
                } else {
                    return Observable.from([response.json()]);
                }
            });
    }

    public multipleRequests(requests: IUniHttpRequest[]) {
        var uniHttpCalls = [];
        requests.forEach((request: IUniHttpRequest) => {
            uniHttpCalls.push(
                this.send(request)
            );
        });
        return Observable.forkJoin(uniHttpCalls);
    }

    private static buildUrlParams(request: IUniHttpRequest) {
        var urlParams = new URLSearchParams();
        var filters = ['expand', 'filter', 'orderBy', 'action', 'top', 'skip'];
        filters.forEach((filter: string) => {
            if (request[filter]) {
                urlParams.append(filter, request[filter]);
            }
        });
        return urlParams;
    }
}
