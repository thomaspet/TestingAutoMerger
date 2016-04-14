import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {UniHttp} from '../../framework/core/http/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class CompanySettingsDS {
    private baseUrl:string = 'http://devapi.unieconomy.no:80/api';
    // baseUrl = 'http://localhost:29077/api';
    private expandedProperties: string = 'Address,Emails,Phones';

    constructor(private http: Http, private _uniHttp: UniHttp) {
    }

    public get(id: number | string) {
        var url = this.baseUrl + '/biz/companysettings/' + id + '?expand=' + this.expandedProperties;
        return this._doGET(url);
    }

    public getCompanyTypes() {
        var url = this.baseUrl + '/biz/companytypes';
        return this._doGET(url);
    }

    public getCurrencies() {
        var url = this.baseUrl + '/biz/currencies';
        return this._doGET(url);
    }

    public getPeriodSeries() {
        var url = this.baseUrl + '/biz/period-series';
        return this._doGET(url);
    }

    public getAccountGroupSets() {
        var url = this.baseUrl + '/biz/accountgroupsets';
        return this._doGET(url);
    }
    
    public getAccounts() {
        var url = this.baseUrl + '/biz/accounts';
        return this._doGET(url);
    }


    public getValidation() {
        var url = this.baseUrl + '/metadata/model/companysettings';
        return this._doGET(url);
    }

    public getModel() {
        var url = this.baseUrl + '/metadata/validations/companysettings';
        return this._doGET(url);
    }
    
    public getSubEntities() {
        return this._uniHttp
                   .asGET()
                   .withEndPoint('subentities')
                   .send({expand: 'BusinessRelationInfo,BusinessRelationInfo.InvoiceAddress'});
    }
    
    public getMunicipalities(filter: string) {
        return this._uniHttp
                   .asGET()
                   .withEndPoint('municipals')
                   .send({filter: filter});
    }

    private _doGET(url: string) {
        var headers = new Headers();
        headers.append('Client', 'client1');
        return this.http.get(url, {headers: headers})
            .map((res: any) => res.json());
    }

    public update(headers: Headers, company: any) {
        var url = this.baseUrl + '/biz/companysettings/1';
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
