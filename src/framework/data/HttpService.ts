import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkjoin';
import 'rxjs/add/observable/from';


@Injectable()
export class HttpService {
    baseUrl = 'http://devapi.unieconomy.no:80/api';
    url: string;
    headers: Headers;
    observer: Observable<any>;
    items: any;

    constructor(public http: Http) {
        this.headers = new Headers();
        this.headers.append('Client', 'client1');
    }

    get(urlEndpoint: string, id?: number, expands?: string) {
        if (id) { urlEndpoint += id; }
        if (expands) { urlEndpoint += ('?expands=' + expands) }

        this.url = this.baseUrl + urlEndpoint;

        return this._doMethod(this.url);
    }

    getMultiple(urlEndpoints: Array<string>, ids?: Array<number>, expands?: Array<string>) {
        var urls = [];
        var results = [];

        console.log('getmultiple runs');

        for (var i = 0; i < urlEndpoints.length; i++) {
            if (ids[i]) { urlEndpoints[i] += ids[i] }
            if (expands[i]) { urlEndpoints[i] += ('?expands=' + expands[i]) }
            urls.push(urlEndpoints[i])
        }

        var tester = Observable.forkJoin(
            this.http.get(urls[0], { headers: this.headers }).map((res) => res.json()),
            this.http.get(urls[0], { headers: this.headers }).map((res) => res.json())
        )
            .subscribe(
            data => console.log(data[0])
        )

        return tester;
    }

    put(urlEndpoint: string, data: Object, id?: number) {
        if (id) {
            urlEndpoint += id;
        }
        this.url = this.baseUrl + urlEndpoint;
    }

    post() { }

    delete() { }

    _doMethod(url) {
        //Dynamic method and headers ?
        return this.http.get(url, { headers: this.headers })
            .map((res) => res.json())
    }
}