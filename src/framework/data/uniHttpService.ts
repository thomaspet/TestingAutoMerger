import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkjoin';
import 'rxjs/add/observable/from';

export interface UniHttpRequest {
    resource: string,
    id?: number,
    expand?: string,
    filter?: string,
    body?: string
}

@Injectable()
export class UniHttpService {
    baseUrl = 'http://devapi.unieconomy.no:80/api';
    headers: Headers;

    constructor(public http: Http) {
        //Later we will get header from localstorage
        this.headers = new Headers();
        this.headers.append('Client', 'client1');
    }
 
    get(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; };
        if (request.expand) { request.resource += ('?expand=' + request.expand) };

        return this._doMethod(this.baseUrl + request.resource, 'GET');
    }
 
    getMultiple(request: Array<UniHttpRequest>) {
        var calls = [];

        request.forEach((req) => {
            if (req.id) { req.resource += req.id };
            if (req.expand) { req.resource += ('?expand=' + req.expand) };
            calls.push(this._doMethod(this.baseUrl + req.resource, 'GET'));
        })

        return Observable.forkJoin(
            calls
        )
    }

    put(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; };

        return this._doMethod(this.baseUrl + request.resource, 'PUT', request.body);
    }
    //Post does not need to check for ID, because there is no ID?
    post(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; }

        return this._doMethod(this.baseUrl + request.resource, 'POST', request.body);
    }

    delete(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; };

        return this._doMethod(this.baseUrl + request.resource, 'DELETE');
    }

    //Better way to do this then with switch??
    _doMethod(url: string, method: string, data?: any) {

        switch (method) {
            case 'GET':
                return this.http.get(url, { headers: this.headers })
                    .map((res) => res.json())
                break;
            case 'PUT':
                return this.http.put(url, JSON.stringify(data), { headers: this.headers })
                    .map((res) => res.json())
                break;
            case 'POST':
                return this.http.post(url, JSON.stringify(data), { headers: this.headers })
                    .map((res) => res.json())
                break;
            case 'DELETE':
                return this.http.delete(url, { headers: this.headers })
                    .map((res) => res.json())
                break;
        }
    }
}