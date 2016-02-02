import {Injectable} from 'angular2/core';
import {Http, Headers, Request, Response, URLSearchParams, RequestMethod} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkjoin';
import 'rxjs/add/observable/from';

export interface UniHttpRequest {
    resource: string,
    id?: number, // move this to resource?
    action?: string,
    expand?: string,
    filter?: string,
    body?: string
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
    
    delete(resource: string) {
        return this.http.delete(this.baseUrl + resource)
        .map(response => response.json());
    }
    
    multipleRequests(method: string, requests: UniHttpRequest[]) {
        var requestMethod;
        
        switch (method.toUpperCase()) {
            case 'GET':
                requestMethod = RequestMethod.Get;
            break;
            case 'PUT':
                requestMethod = RequestMethod.Put;
            break;
            case 'POST':
                requestMethod = RequestMethod.Post;
            break;
            case 'DELETE':
                requestMethod = RequestMethod.Delete;
            break;
        }
        
        var observables = [];
        requests.forEach((request) => {
            observables.push(
                this.http.request(new Request({
                    method: requestMethod,
                    url: this.baseUrl + request.resource,
                    search: this.buildUrlParams(request), // might need to toString() this!
                    body: JSON.stringify(request.body) || null
                }))  
            );
        });
        
        return Observable.forkJoin(observables).map(result => result.json);
    }
 
//     get(request: UniHttpRequest) {
//         if (request.id) { request.resource += request.id; };
//         if (request.expand) { request.resource += ('?expand=' + request.expand) };
// 
//         return this._doMethod(this.baseUrl + request.resource, 'GET');
//     }
//  
//     getMultiple(request: Array<UniHttpRequest>) {
//         var calls = [];
// 
//         request.forEach((req) => {
//             if (req.id) { req.resource += req.id };
//             if (req.expand) { req.resource += ('?expand=' + req.expand) };
//             calls.push(this._doMethod(this.baseUrl + req.resource, 'GET'));
//         })
// 
//         return Observable.forkJoin(
//             calls
//         )
//     }
// 
//     put(request: UniHttpRequest) {
//         if (request.id) { request.resource += request.id; };
// 
//         return this._doMethod(this.baseUrl + request.resource, 'PUT', request.body);
//     }
//     //Post does not need to check for ID, because there is no ID?
//     post(request: UniHttpRequest) {
//         if (request.id) { request.resource += request.id; }
// 
//         return this._doMethod(this.baseUrl + request.resource, 'POST', request.body);
//     }
// 
//     delete(request: UniHttpRequest) {
//         if (request.id) { request.resource += request.id; };
// 
//         return this._doMethod(this.baseUrl + request.resource, 'DELETE');
//     }
// 
//     //Better way to do this then with switch??
//     _doMethod(url: string, method: string, data?: any) {
// 
//         switch (method) {
//             case 'GET':
//                 return this.http.get(url, { headers: this.headers })
//                     .map((res) => res.json())
//                 break;
//             case 'PUT':
//                 return this.http.put(url, JSON.stringify(data), { headers: this.headers })
//                     .map((res) => res.json())
//                 break;
//             case 'POST':
//                 return this.http.post(url, JSON.stringify(data), { headers: this.headers })
//                     .map((res) => res.json())
//                 break;
//             case 'DELETE':
//                 return this.http.delete(url, { headers: this.headers })
//                     .map((res) => res.json())
//                 break;
//         }
//     }
}