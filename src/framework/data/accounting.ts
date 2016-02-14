import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class AccountingDS {
    baseUrl = 'http://localhost:27831/api';
    expandedProperties = 'Alias,Currency,AccountGroup';
    accounts: Array<any> = [];
    vattypes;
    constructor(private http:Http) {
        
    }
    
    getAccount(id) {
        if (!this.accounts[id]) {
            var url = this.baseUrl + '/biz/accounts/' + id + '?expand='+this.expandedProperties;
            this.accounts[id] = new ReplaySubject(1);
            
            return this._doGET(url)
                    .subscribe(this.accounts[id]);        
        }
        return this.accounts[id]
    }
    
    updateAccount(account)
    {
        var headers = new Headers();
        headers.append('Client','client1');
        var url = this.baseUrl + '/biz/accounts/' + account.ID;

        this.http.put(
            url,
            JSON.stringify(account),
            { headers: headers })
            .map(res => console.log(res))
            .subscribe(
                data => console.log(data),
                err => console.log(err))
    }
    
    getVatTypes() {
        var url = this.baseUrl + '/biz/vattypes';
        this.vattypes = this._doGET(url);
        return this.vattypes;       
    }
                
    _doGET(url) {
        var headers = new Headers();
        headers.append('Client','client1');
        return this.http.get(url,{headers:headers})
        .map((res)=>res.json())
    }
}