import {Injectable} from 'angular2/core';
import {Http, Headers, URLSearchParams, Request, RequestMethod} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../../app/AppConfig';
import {AuthService} from '../authService';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkjoin';
import 'rxjs/add/observable/from';

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

    constructor(public http: Http, private authService: AuthService) {
        var headers = AppConfig.DEFAULT_HEADERS;
        this.appendHeaders(headers);
    }

    private appendHeaders(headers: any) {
        this.headers = new Headers();
        
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                this.headers.append(header, AppConfig.DEFAULT_HEADERS[header]);
            }
        }
    }

    public getBaseUrl() {
        return this.baseUrl;
    }

    public withBaseUrl(url: string) {
        this.baseUrl = url;
        return this;
    }

    public withHeader(name: string, value: any) {
        this.headers.append(name, value);
        return this;
    }

    public withHeaders(headers: any) {
        return this.appendHeaders(headers);
    }

    public usingMetadataDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.METADATA;
        return this;
    }

    public usingBusinessDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.BUSINESS;
        return this;
    }
    
    public usingInitDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.INIT;
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
            url: url
        };
        if (this.body) {
            options.body = JSON.stringify(this.body);
        }
        return this.http.request(new Request(options)).map((response: any) => response.json());
    }
    
    public send(request: IUniHttpRequest = {}, withoutJsonMap: boolean = false): Observable<any> {
        let token = this.authService.getToken();
        let activeCompany = this.authService.getActiveCompany();
        
        if (token && !this.headers.has('Authorization')) {
            this.headers.append('Authorization', 'Bearer ' + token);
        }
        
        if (activeCompany && !this.headers.has('CompanyKey')) {
            this.headers.append('CompanyKey', activeCompany.Key);
        }
        
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
        
        if (this.body) {
            options.body = JSON.stringify(body);
        }
        
        if (request) {
            options.search = UniHttp.buildUrlParams(request);
        }
        
        let req = this.http.request(new Request(options));
        
        if (withoutJsonMap) {            
            return req;
        }
        
        return req.map(response => response.json());
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
