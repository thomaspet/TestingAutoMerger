import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, URLSearchParams, Request, Response, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {AppConfig} from '../../../app/appConfig';
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
    responseType?: number;
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

    public usingRootDomain() {
        this.baseUrl = AppConfig.BASE_URL;
        this.apiDomain = AppConfig.API_DOMAINS.ROOT;
        this.baseUrl = AppConfig.BASE_URL;
        return this;
    }

    public usingInitDomain() {
        this.baseUrl = AppConfig.BASE_URL_INIT;
        this.apiDomain = AppConfig.API_DOMAINS.INIT;
        this.baseUrl = AppConfig.BASE_URL_INIT;
        return this;
    }

    public usingStatisticsDomain() {
        this.baseUrl = AppConfig.BASE_URL;
        this.apiDomain = AppConfig.API_DOMAINS.STATISTICS;
        this.baseUrl = AppConfig.BASE_URL;
        return this;
    }

    public usingEmptyDomain() {
        this.apiDomain = '';
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
            headers: this.headers,
            body: ''
        };
        if (this.body) {
            options.body = (this.body instanceof FormData) ? this.body : JSON.stringify(this.body);
        }

        this.method = undefined;
        this.body = undefined;
        return this.http.request(new Request(options))
            .map((response: any) => response.json());
    }

    public send(request: IUniHttpRequest = {}, searchParams: URLSearchParams = null): Observable<any> {
        let token = this.authService.getToken();
        let activeCompany = this.authService.getActiveCompany();
        const year = JSON.parse(localStorage.getItem('activeFinancialYear'));

        if (token) {
            this.headers.set('Authorization', 'Bearer ' + token);
        }

        if (activeCompany) {
            this.headers.set('CompanyKey', activeCompany.Key);
        }

        if (year) {
            this.headers.set('Year', year.Year);
        }

        this.headers.set('Accept', 'application/json');

        const baseurl = request.baseUrl || this.baseUrl;
        const apidomain = request.apiDomain || this.apiDomain;
        const endpoint = request.endPoint || this.endPoint;

        const url = baseurl + apidomain + endpoint;
        this.baseUrl = AppConfig.BASE_URL;
        this.apiDomain = AppConfig.API_DOMAINS.BUSINESS;
        this.endPoint = undefined;

        var options: any = {
            method: request.method || this.method,
            url: url,
            headers: this.headers,
            body: ''
        };

        if (request.responseType) {
            options.responseType = request.responseType;
        }

        const body = request.body || this.body || {};
        if (body) {
            options.body = (body instanceof FormData) ? body : JSON.stringify(body);
        }

        this.method = undefined;
        this.body = undefined;

        if (searchParams) {
            options.search = searchParams;
        } else if (request) {
            options.search = UniHttp.buildUrlParams(request);
        }

        return this.http.request(new Request(options)).catch((err) => {
            if (err.status === 401) {
                this.authService.clearAuthAndGotoLogin();
                return Observable.empty();
            }

            return Observable.throw(err);
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
