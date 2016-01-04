import {Injectable, Inject} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class EmployeeDS {
    employees: Array<any> = [];
    currentEmployee:any;
    constructor(@Inject(Http) private http:Http) {
        
    }
    
    get(id) {
        
        if (this.employees[id]) {
            this.currentEmployee = this.employees[id];
            return Observable.from(this.employees[id]);
        }
        
        var url = 'http://devapi.unieconomy.no:80/api/biz/employees/' + id;
        var headers = new Headers();
        headers.append('Client','client1');
        var expandedUrl = url+'?expand=BusinessRelationInfo,Employments,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
        return this.http.get(expandedUrl,{headers:headers})
        .map((result:any)=>{
            var rjson = result.json();
            this.employees[rjson.ID] = rjson;
            this.currentEmployee = rjson;
            return rjson;
        });        
    }
}