import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class CompanySettingsDS {
    //baseUrl = 'http://devapi.unieconomy.no:80/api';
    baseUrl = 'http://localhost:35729/api/biz/';
    expandedProperties = 'Address,Emails,Phones';
    companySettings: Array<any> = [];
    
    constructor(private http: Http) { }

    get(id) {
        if (!this.companySettings[id]) {
            var url = this.baseUrl + '/biz/companysettings/' + id + '?expand=' + this.expandedProperties;
            this.companySettings[id] = new ReplaySubject(1);

            return this._doGET(url)
                .subscribe(this.companySettings[id]);
        }
        return this.companySettings[id]
    }

    getCompanyTypes() {
        var url = this.baseUrl + '/biz/companytypes';
        return this._doGET(url);
    }

    getCurrencies() {
        var url = this.baseUrl + '/biz/currencies';
        return this._doGET(url);
    }
    getPeriodSeries() {
        var url = this.baseUrl + '/biz/period-series';
        return this._doGET(url);
    }
    getAccountGroupSets() {
        var url = this.baseUrl + '/biz/accountgroupsets';
        return this._doGET(url);
    }


    getValidation() {
        var url = this.baseUrl + '/metadata/model/companysettings';
        return this._doGET(url);
    }

    getModel() {
        var url = this.baseUrl + '/metadata/validations/companysettings';
        return this._doGET(url);
    }

    _doGET(url) {
        var headers = new Headers();
        headers.append('Client', 'client1');
        return this.http.get(url, { headers: headers })
            .map((res) => res.json())
    }

    update(headers, company) {
        console.log("update(headers, company) called")

        var url = this.baseUrl + '/biz/companysettings/1';
        this.http.put(
            url,
            JSON.stringify(company),
            { headers: headers })
            .map(res => console.log(res))
            .subscribe(
            data => console.log(data),
            err => console.log(err))
            
        console.log("Put company: ")
        console.log(company);
    }
}