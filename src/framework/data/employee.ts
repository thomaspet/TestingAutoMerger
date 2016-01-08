import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class EmployeeDS {
    baseUrl = 'http://devapi.unieconomy.no:80/api/biz/employees/';
    expandedProperties = 'BusinessRelationInfo,Employments,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
    employees: Array<any> = [];
    constructor(private http:Http) {
        
    }
    
    get(id) {
        if (!this.employees[id]) {
            var url = this.baseUrl + id + '?expand='+this.expandedProperties;
            var headers = new Headers();
            headers.append('Client','client1');
            
            this.employees[id] = new ReplaySubject(1);
            return this.http.get(url,{headers:headers})
            .map((res)=>res.json())
            .subscribe(this.employees[id]);        
        }
        return this.employees[id]
    }
}