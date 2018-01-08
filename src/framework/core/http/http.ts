import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, URLSearchParams, Request, RequestMethod} from '@angular/http';
import {environment} from 'src/environments/environment';
import {AuthService} from '../../../app/authService';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

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
    private baseUrl: string = environment.BASE_URL;
    private apiDomain: string = environment.API_DOMAINS.BUSINESS;
    private headers: Headers;
    private method: number;
    private body: any;
    private endPoint: string;

    private lastReAuthentication: Date;
    private reAuthenticated$: EventEmitter<any> = new EventEmitter();

    // AuthService is used by BizHttp for caching, don't remove!
    constructor(public http: Http, public authService: AuthService) {
        const headers = environment.DEFAULT_HEADERS;
        this.headers = new Headers();
        this.appendHeaders(headers);
    }

    public appendHeaders(headers: any) {
        for (let key in headers) {
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
        this.appendHeaders(environment.DEFAULT_HEADERS);
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

    public withDomain(domain: string) {
        this.apiDomain = domain;
        return this;
    }

    public usingMetadataDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.METADATA;
        return this;
    }

    public usingBusinessDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.BUSINESS;
        return this;
    }

    public usingRootDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.ROOT;
        return this;
    }

    public usingInitDomain() {
        this.baseUrl = environment.BASE_URL_INIT;
        this.apiDomain = environment.API_DOMAINS.INIT;
        return this;
    }

    public usingStatisticsDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.STATISTICS;
        return this;
    }

    public usingUmhDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.UMH;
        return this;
    }

    public usingIntegrationDomain() {
        this.baseUrl = environment.BASE_URL_INTEGRATION;
        this.apiDomain = '';
        return this;
    }

    public usingAdminDomain() {
        this.baseUrl = environment.ADMIN_SERVER_URL;
        this.apiDomain = '';
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
        const options: any = {
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
        const token = this.authService.getToken();
        const companyKey = this.authService.getCompanyKey();
        const year = localStorage.getItem('activeFinancialYear') != 'undefined'
            ? localStorage.getItem('activeFinancialYear')
            : localStorage.getItem('ActiveYear');

        if (token) {
            this.headers.set('Authorization', 'Bearer ' + token);
        }

        if (companyKey) {
            this.headers.set('CompanyKey', companyKey);
        }

        if (year) {
            const parsed = JSON.parse(year);
            this.headers.set('Year', parsed.Year);
        }

        this.headers.set('Accept', 'application/json');

        const baseurl = request.baseUrl || this.baseUrl;
        const apidomain = request.apiDomain || this.apiDomain;
        const endpoint = request.endPoint || this.endPoint;

        const url = baseurl + apidomain + endpoint;
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.BUSINESS;
        this.endPoint = undefined;

        const options: any = {
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
            options.params = searchParams;
        } else if (request) {
            options.params = this.buildUrlParams(request);
        }

        return this.http.request(new Request(options)).catch((err) => {
            if (err.status === 401) {
                this.authService.clearAuthAndGotoLogin();
                return Observable.throw('Sesjonen din er utløpt, vennligst logg inn på ny');
            }

            return Observable.throw(err);
        });
    }

    public multipleRequests(requests: IUniHttpRequest[]) {
        const uniHttpCalls = [];
        requests.forEach((request: IUniHttpRequest) => {
            uniHttpCalls.push(
                this.send(request)
            );
        });
        return Observable.forkJoin(uniHttpCalls);
    }

    private buildUrlParams(request: IUniHttpRequest) {
        const urlParams = new URLSearchParams();
        const filters = ['expand', 'filter', 'orderBy', 'action', 'top', 'skip', 'hateoas'];
        filters.forEach((filter: string) => {
            if (request[filter]) {
                urlParams.append(filter, request[filter]);
            }
        });
        return urlParams;
    }
}
