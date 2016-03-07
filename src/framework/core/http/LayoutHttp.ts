import {Injectable} from 'angular2/core';
import {UniHttp} from './http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LayoutHttp {

    http: UniHttp;
    RelativeUrl = "layout";

    constructor(http: UniHttp) {
        this.http = http.usingMetadataDomain();
    }

    public Get(ID: string): Observable<any> {
        var endPoint = [this.RelativeUrl,ID].join("/");
        return this.http
            .asGET()
            .withEndPoint(endPoint)
            .send();
    }
}