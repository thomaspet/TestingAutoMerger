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
    url: string;
    headers: Headers;
    observer: Observable<any>;
    items: any;

    constructor(public http: Http) {
        //Later will get header from localstorage
        this.headers = new Headers();
        this.headers.append('Client', 'client1');
    }
 
    //Get method
    get(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; }
        if (request.expand) { request.resource += ('?expand=' + request.expand) }

        this.url = this.baseUrl + request.resource;

        return this._doMethod(this.url, 'GET');
    }
 
    //Get multiple method
    getMultiple(request: Array<UniHttpRequest>) {
        var calls = [];
 
        for (var i = 0; i < request.length; i++) {
            if (request[i].id) { request[i].resource += request[i].id }
            if (request[i].expand) { request[i].resource += ('?expand=' + request[i].expand) }
            calls.push(this._doMethod(this.baseUrl + request[i].resource, 'GET'))
        }

        return Observable.forkJoin(
            calls
        )
    }

    put(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; }

        return this._doMethod(this.url, 'PUT', request.body);
    }
    
    post(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; }

        return this._doMethod(this.url, 'POST', request.body);
    }

    delete(request: UniHttpRequest) {
        if (request.id) { request.resource += request.id; }

        return this._doMethod(this.url, 'DELETE');
    }

    _doMethod(url, method: string, data?: any) {

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