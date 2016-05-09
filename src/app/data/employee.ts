import {Injectable, Inject} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {UniHttp} from '../../framework/core/http/http';

@Injectable()
export class EmployeeDS {

    public expandedProperties: string = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'Employments.SubEntity.BusinessRelationInfo',
        'BankAccounts',
        'VacationRateEmployee',
        'SubEntity'
    ].join(',');
        
    public subEntities: Observable<any>;

    constructor(@Inject(UniHttp)
                public http: UniHttp) {
    }

    public get(id: number|string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('employees/' + id)
            .send({expand: this.expandedProperties});
    }

    public getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('subentities')
            .send({expand: 'BusinessRelationInfo'});
    }
    
    public getTotals(ansattID:number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({filter: 'EmployeeNumber eq ' + ansattID});
    }

    public getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('EmployeeLeave')
            .send();
    }
}
