import {Injectable} from 'angular2/core';
import {Http, Headers, Request, Response, URLSearchParams, RequestMethod} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkjoin';
import 'rxjs/add/observable/from';

export interface UniHttpRequest {
    resource: string,
    action?: string,
    expand?: string,
    filter?: string,
    body?: any
}

@Injectable()
export class UniHttpService {
    baseUrl = 'http://devapi.unieconomy.no:80/api/biz/';
    headers: Headers;

    constructor(public http: Http) {
        this.headers = new Headers();
        this.headers.append('Client', 'client1');
        // auth headers
    }
    
    buildUrlParams(request: UniHttpRequest) {
        var urlParams = new URLSearchParams();
        if (request.expand) urlParams.append('expand', request.expand);
        if (request.filter) urlParams.append('filter', request.filter);
        if (request.action) urlParams.append('action', request.action);
        
        return urlParams;
    }    
    
    get(request: UniHttpRequest) {
        return this.http.get(this.baseUrl + request.resource, {
            headers: this.headers,
            search: this.buildUrlParams(request)
        }).map((response) => response.json());
    }
    
    put(request: UniHttpRequest) {
        return this.http.put(this.baseUrl + request.resource, JSON.stringify(request.body), {
            headers: this.headers,
            search: this.buildUrlParams(request)
        }).map((response) => response.json());
    }
    
    post(request: UniHttpRequest) {
        return this.http.post(this.baseUrl + request.resource, JSON.stringify(request.body), {
            headers: this.headers,
            search: this.buildUrlParams(request)
        }).map((response) => response.json());
    }

    delete(request: UniHttpRequest) {
        return this.http.delete(this.baseUrl + request.resource, {
            headers: this.headers
        })
    }
    
    multipleRequests(method: string, requests: UniHttpRequest[]) {
        var requestMethod;
        var uniHttpCalls = [];
        
        switch (method.toUpperCase()) {
            case 'GET':
                requestMethod = (requestData) => { return this.get(requestData) };
            break;
            case 'POST':
                requestMethod = (requestData) => { return this.post(requestData) };
            break;
            case 'PUT':
                requestMethod = (requestData) => { return this.put(requestData) };
            break;
            case 'DELETE':
                requestMethod = (requestData) => { return this.delete(requestData) };
            break;
        }

        requests.forEach((request) => {
            uniHttpCalls.push( requestMethod(request) );
        });

        return Observable.forkJoin(uniHttpCalls);
    }
}