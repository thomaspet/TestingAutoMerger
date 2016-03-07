import {Injectable, EventEmitter} from "angular2/core";
import {UniHttp} from "./http";
import {Observable} from "rxjs/Observable";
import {AppConfig} from '../../../app/AppConfig';

@Injectable()
export class MetadataHttp {

    constructor(protected http:UniHttp) {
        this.http = http.usingMetadataDomain();
    }

    public Get(ID: number): Observable<any> {
        return this.http
            .asGET()
            .withEndPoint(ID.toString())
            .send();
    }
}