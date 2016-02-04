import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class EmployeeDS {
    //baseUrl = 'http://devapi.unieconomy.no:80/api';
    baseUrl = 'http://localhost:27831/api';
    expandedProperties = 'BusinessRelationInfo,Employments.Localization.BusinessRelationInfo,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
    employees: Array<any> = [];
    constructor(private http:Http) {
        
    }
    
    get(id) {
        if (!this.employees[id]) {
            var url = this.baseUrl + '/biz/employees/' + id + '?expand='+this.expandedProperties;
            this.employees[id] = new ReplaySubject(1);
            
            return this._doGET(url)
                    .subscribe(this.employees[id]);        
        }
        return this.employees[id]
    }
    
    getValidation() {
        var url = this.baseUrl + '/metadata/model/Employee';
        return this._doGET(url);
    }
    
    getModel() {
        var url = this.baseUrl + '/metadata/validations/Employee';
        return this._doGET(url);
    }
    
    _doGET(url) {
        var headers = new Headers();
        headers.append('Client','client1');
        return this.http.get(url,{headers:headers})
        .map((res)=>res.json())
    }
}