import {Injectable} from "angular2/core";
import {Http, Headers} from "angular2/http";
import {ReplaySubject} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/observable/from";

@Injectable()
export class CompanySettingsDS {
    baseUrl = "http://devapi.unieconomy.no:80/api";
    // baseUrl = "http://localhost:29077/api";
    expandedProperties = "Address,Emails,Phones";

    constructor(private http: Http) {
    }

    get(id: number | string) {
        var url = this.baseUrl + "/biz/companysettings/" + id + "?expand=" + this.expandedProperties;
        return this._doGET(url);
    }

    getCompanyTypes() {
        var url = this.baseUrl + "/biz/companytypes";
        return this._doGET(url);
    }

    getCurrencies() {
        var url = this.baseUrl + "/biz/currencies";
        return this._doGET(url);
    }

    getPeriodSeries() {
        var url = this.baseUrl + "/biz/period-series";
        return this._doGET(url);
    }

    getAccountGroupSets() {
        var url = this.baseUrl + "/biz/accountgroupsets";
        return this._doGET(url);
    }


    getValidation() {
        var url = this.baseUrl + "/metadata/model/companysettings";
        return this._doGET(url);
    }

    getModel() {
        var url = this.baseUrl + "/metadata/validations/companysettings";
        return this._doGET(url);
    }

    _doGET(url: string) {
        var headers = new Headers();
        headers.append("Client", "client1");
        return this.http.get(url, {headers: headers})
            .map((res: any) => res.json());
    }

    update(headers: Headers, company: any) {
        var url = this.baseUrl + "/biz/companysettings/1";
        this.http.put(
            url,
            JSON.stringify(company),
            {headers: headers})
            .map((res: any) => console.log(res))
            .subscribe(
                (data: any) => console.log(data),
                (err: any) => console.log(err));
    }
}
