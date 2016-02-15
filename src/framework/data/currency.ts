import {Injectable} from "angular2/core";
import {Http, Headers, Response} from "angular2/http";
import { Observable } from "rxjs/Observable";
import {ReplaySubject} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/observable/from";

@Injectable()
export class CurrencyDS {
    baseUrl = "http://localhost:27831/api";
    currencies;

    constructor(private http: Http) {

    }

    getAll() {
        var url = this.baseUrl + "/biz/currencies";
        this.currencies = this._doGET(url);
        return this.currencies;
    }

    get(id: number|string) {
        if (!this.currencies[id]) {
            var url = this.baseUrl + "/biz/accounts/" + id;
            this.currencies[id] = new ReplaySubject(1);

            return this._doGET(url)
                .subscribe(this.currencies[id]);
        }
        return this.currencies[id];
    }

    getValidation() {
        var url = this.baseUrl + "/metadata/model/Currency";
        return this._doGET(url);
    }

    getModel() {
        var url = this.baseUrl + "/metadata/validations/Currency";
        return this._doGET(url);
    }

    _doGET(url: string) {
        var headers = new Headers();
        headers.append("Client", "client1");
        return this.http.get(url, {headers: headers})
            .map((res: any) => res.json());
    }
}
