import {Injectable} from "angular2/core";
import {Http, Headers, URLSearchParams} from "angular2/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/observable/forkjoin";
import "rxjs/add/observable/from";

export interface IUniHttpRequest {
    resource: string,
    action?: string,
    expand?: string,
    filter?: string,
    top?: number,
    skip?: number,
    body?: any
}

@Injectable()
export class UniHttpService {
    baseUrl = "http://devapi.unieconomy.no:80/api/biz/";
    //baseUrl = "http://localhost:27831/api/biz/";
    headers: Headers;

    constructor(public http: Http) {
        this.headers = new Headers();
        this.headers.append("Client", "client1");
        // auth headers
    }

    get(request: IUniHttpRequest) {
        return this.http.get(this.baseUrl + request.resource, {
            headers: this.headers,
            search: UniHttpService.buildUrlParams(request)
        }).map((response: any) => response.json());
    }

    put(request: IUniHttpRequest) {
        return this.http.put(this.baseUrl + request.resource, JSON.stringify(request.body), {
            headers: this.headers,
            search: UniHttpService.buildUrlParams(request)
        }).map((response: any) => response.json());
    }

    post(request: IUniHttpRequest) {
        return this.http.post(this.baseUrl + request.resource, JSON.stringify(request.body), {
            headers: this.headers,
            search: UniHttpService.buildUrlParams(request)
        }).map((response: any) => response.json());
    }

    remove(request: IUniHttpRequest) { // delete is a reserved word and could give some problem
        return this.http.delete(this.baseUrl + request.resource, {
            headers: this.headers
        });
    }

    multipleRequests(method: string, requests: IUniHttpRequest[]) {
        var requestMethod;
        var uniHttpCalls = [];

        switch (method.toUpperCase()) {
            case "GET":
                requestMethod = (requestData: IUniHttpRequest) => {
                    return this.get(requestData);
                };
                break;
            case "POST":
                requestMethod = (requestData: IUniHttpRequest) => {
                    return this.post(requestData);
                };
                break;
            case "PUT":
                requestMethod = (requestData: IUniHttpRequest) => {
                    return this.put(requestData);
                };
                break;
            case "DELETE":
                requestMethod = (requestData: IUniHttpRequest) => {
                    return this.remove(requestData);
                };
                break;
        }

        requests.forEach((request: IUniHttpRequest) => {
            uniHttpCalls.push(requestMethod(request));
        });

        return Observable.forkJoin(uniHttpCalls);
    }

    private static buildUrlParams(request: IUniHttpRequest) {
        var urlParams = new URLSearchParams();
        if (request.expand) urlParams.append('expand', request.expand);
        if (request.filter) urlParams.append('filter', request.filter);
        if (request.action) urlParams.append('action', request.action);
        if (request.top)    urlParams.append('top', request.top.toString());
        if (request.skip)   urlParams.append('skip', request.skip.toString());

        return urlParams;
    }
}
