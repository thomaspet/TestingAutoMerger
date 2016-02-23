import {Injectable} from "angular2/core";
import {Http, Headers, URLSearchParams, Request, RequestMethod} from "angular2/http";
import { Observable } from "rxjs/Observable";
import { AppConfig } from "../../app/AppConfig";
import "rxjs/add/operator/map";
import "rxjs/add/observable/forkjoin";
import "rxjs/add/observable/from";

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
    top?: number;
    skip?: number;
}

@Injectable()
export class UniHttp {
    private baseUrl = AppConfig.BASE_URL;
    private apiDomain = AppConfig.API_DOMAINS.BUSINESS;
    private headers: Headers;
    private method: number;
    private body: any;
    private endPoint: string;

    constructor(public http: Http) {
        var headers = AppConfig.DEFAULT_HEADERS;
        this.headers = new Headers();
        this.appendHeaders(headers);
    }

    appendHeaders(headers: any) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                this.headers.append(header, AppConfig.DEFAULT_HEADERS[header]);
            }
        }
        return this;
    }

    withBaseUrl(url: string) {
        this.baseUrl = url;
        return this;
    }

    withHeader(name: string, value: any) {
        this.headers.append(name, value);
        return this;
    }

    withHeaders(headers: any) {
        return this.appendHeaders(headers);
    }

    usingInitDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.INIT;
        return this;
    }

    usingMetadataDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.METADATA;
        return this;
    }

    usingBusinessDomain() {
        this.apiDomain = AppConfig.API_DOMAINS.BUSINESS;
        return this;
    }

    as(method: number) {
        this.method = method;
        return this;
    }

    asGET() {
        this.method = RequestMethod.Get;
        return this;
    }

    asPUT() {
        this.method = RequestMethod.Put;
        return this;
    }

    asPOST() {
        this.method = RequestMethod.Post;
        return this;
    }

    asDELETE() {
        this.method = RequestMethod.Delete;
        return this;
    }

    asPATCH() {
        this.method = RequestMethod.Patch;
        return this;
    }

    asHEAD() {
        this.method = RequestMethod.Head;
        return this;
    }

    withBody(body: any) {
        this.body = body;
        return this;
    }

    withEndPoint(endPoint: string) {
        this.endPoint = endPoint;
        return this;
    }

    sendToUrl(url: any) {
        var options: any = {
            method: this.method,
            url: url
        };
        if (this.body) {
            options.body = JSON.stringify(this.body);
        }
        return this.http.request(new Request(options)).map((response: any) => response.json());
    }

    send(request?: IUniHttpRequest) {
        request = request || {};
        var baseurl = request.baseUrl || this.baseUrl,
            apidomain = request.apiDomain || this.apiDomain,
            endpoint = request.endPoint || this.endPoint,
            method = request.method || this.method,
            body = request.body || this.body
            ;
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
        return this.http.request(new Request(options)).map((response: any) => response.json());
    }


    multipleRequests(requests: IUniHttpRequest[]) {
        var uniHttpCalls = [];
        requests.forEach((request: IUniHttpRequest) => {
            uniHttpCalls.push(
                this.send(request));
        });
        return Observable.forkJoin(uniHttpCalls);
    }

    private static buildUrlParams(request: IUniHttpRequest) {
        var urlParams = new URLSearchParams();
        var filters = ["expand", "filter", "action", "top", "skip"];
        filters.forEach((filter: string) => {
            if (request[filter]) {
                urlParams.append(filter, request[filter]);
            }
        });
        return urlParams;
    }
}
