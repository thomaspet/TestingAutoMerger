import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import 'rxjs/add/operator/catch';

import {environment} from 'src/environments/environment';
import {RequestMethod} from './request-method';
import {AuthService} from '../../../app/authService';
import {catchError, take} from 'rxjs/operators';

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
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
}

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
};

@Injectable()
export class UniHttp {
    private baseUrl: string = environment.BASE_URL;
    private apiDomain: string = environment.API_DOMAINS.BUSINESS;
    private headers: HttpHeaders;
    private method: string;
    private body: any;
    private endPoint: string;

    constructor(public http: HttpClient, public authService: AuthService) {
        this.headers = new HttpHeaders();
        this.appendHeaders(DEFAULT_HEADERS);
    }

    public appendHeaders(headers: any) {
        Object.keys(headers).forEach(key => {
            if (headers[key]) {
                this.headers = this.headers.set(key, headers[key] + '');
            }
        });

        return this;
    }

    public withNewHeaders() {
        this.headers = new HttpHeaders();
        return this;
    }

    public withDefaultHeaders() {
        this.headers = new HttpHeaders();
        this.appendHeaders(DEFAULT_HEADERS);
        return this;
    }

    public withBaseUrl(url: string) {
        this.baseUrl = url;
        return this;
    }

    public withHeader(name: string, value: any) {
        this.headers = this.headers.set(name, value + '');
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

    public usingJobInfoDomain() {
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.JOBINFO;
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

    public usingElsaDomain() {
        this.baseUrl = environment.ELSA_SERVER_URL;
        this.apiDomain = '';
        return this;
    }

    public usingEmptyDomain() {
        this.apiDomain = '';
        return this;
    }

    public as(method: RequestMethod | string) {
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

    public withBody(body: any) {
        this.body = body;
        return this;
    }

    public withBodyTrim(body: any) {
        this.body = this.deleteObjectsWithID(body);
        return this;
    }

    public withEndPoint(endPoint: string) {
        this.endPoint = endPoint;
        return this;
    }

    public sendToUrl(url: any): Observable<any> {
        if (this.authService.jwt) {
            this.headers = this.headers.set('Authorization', 'Bearer ' + this.authService.jwt);
        }

        const options: any = {
            observe: 'body',
            headers: this.headers
        };

        if (this.body) {
            options.body = this.body instanceof FormData ? this.body : JSON.stringify(this.body);
        }

        let httpRequest;
        switch (this.method) {
            case 'get':
                httpRequest = this.http.get(url, options);
            break;
            case 'put':
                httpRequest = this.http.put(url, options.body, options);
            break;
            case 'post':
                httpRequest = this.http.post(url, options.body, options);
            break;
            case 'delete':
                httpRequest = this.http.delete(url, options);
            break;
        }

        this.method = undefined;
        this.body = undefined;

        return httpRequest.pipe(
            take(1),
            catchError(err => {
                if (err.status === 401) {
                    this.authService.clearAuthAndGotoLogin();
                    return throwError('Sesjonen din er utløpt, vennligst logg inn på ny');
                }

                return throwError(err);
            })
        );
    }

    public send(request: IUniHttpRequest = {}, searchParams: HttpParams = null, addCompanyKeyHeader: boolean = true): Observable<any> {
        const token = this.authService.jwt;
        const companyKey = this.authService.getCompanyKey();

        if (token) {
            this.headers = this.headers.set('Authorization', 'Bearer ' + token);
        }

        if (companyKey && addCompanyKeyHeader) {
            this.headers = this.headers.set('CompanyKey', companyKey);
        }

        let baseurl = request.baseUrl || this.baseUrl ;
        baseurl = baseurl !== '' ? baseurl + '/' : baseurl;
        const apidomain = request.apiDomain || this.apiDomain;
        const endpoint = request.endPoint || this.endPoint;
        const url = (baseurl + apidomain + endpoint).replace(/([^:]\/)\/+/g, '$1');
        this.baseUrl = environment.BASE_URL;
        this.apiDomain = environment.API_DOMAINS.BUSINESS;
        this.endPoint = undefined;

        const method = request.method || this.method;
        const options: any = {
            observe: 'response',
            url: url,
            headers: this.headers,
            responseType: request.responseType || 'json'
        };
        const body = request.body || this.body;
        if (body) {
            options.body = (body instanceof FormData) ? body : JSON.stringify(body);
        }

        if (searchParams) {
            options.params = searchParams;
        } else if (request) {
            options.params = this.buildUrlParams(request);
        }

        this.method = undefined;
        this.body = undefined;

        let httpRequest;
        switch (method) {
            case 'get':
                httpRequest = this.http.get(options.url, options);
            break;
            case 'put':
                httpRequest = this.http.put(options.url, options.body, options);
            break;
            case 'post':
                httpRequest = this.http.post(options.url, options.body, options);
            break;
            case 'delete':
                httpRequest = this.http.delete(options.url, options);
            break;
        }

        return httpRequest.pipe(
            take(1),
            catchError(err => {
                if (err.status === 401) {
                    this.authService.clearAuthAndGotoLogin();
                    return throwError('Sesjonen din er utløpt, vennligst logg inn på ny');
                }

                return throwError(err);
            })
        );
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
        let params = new HttpParams();
        const filters = ['expand', 'filter', 'orderBy', 'action', 'top', 'skip', 'hateoas'];
        filters.forEach((filter: string) => {
            if (request[filter]) {
                params = params.append(filter, request[filter]);
            }
        });
        return params;
    }

    private deleteObjectsWithID(obj: any): any {
        if (obj === null) { return null; }

        // Array? Loop it.
        if (Array.isArray(obj)) {
            obj.forEach(o => {
                o = this.deleteObjectsWithID(o);
            });
        }
        // Object? Loop properties.
        else
        {
            var propNames = Object.getOwnPropertyNames(obj);
            propNames.forEach(name => {
                // Property object and property object name + ID
                if (typeof obj[name] === 'object' && propNames.indexOf(name + 'ID') > 0 && obj[name + 'ID'] > 0) {
                    delete obj[name];
                }
                // If property is an array og object recurive delete
                else if (Array.isArray(obj[name]) || typeof obj[name] === 'object') {
                    obj[name] = this.deleteObjectsWithID(obj[name]);
                }
            });
        }

        return obj;
    }
}
