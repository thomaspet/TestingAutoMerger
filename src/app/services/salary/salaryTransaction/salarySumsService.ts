import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransactionSums} from '../../../unientities';

import {Observable} from 'rxjs/Observable';

@Injectable()
export class SalarySumsService extends BizHttp<SalaryTransactionSums> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = 'salarysums';
    }

    public getFromPayrollRun(id: number, filter: string = null): Observable<SalaryTransactionSums> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=get-sums&id=${id}${filter ? '&filter=' + filter : ''}`)
            .send()
            .map(response => response.json());
    }

    public getSumsInYear(year: number, employeeID: number = null): Observable<SalaryTransactionSums> {
        let filter = `year(PayDate) eq ${year} and transactions.EmployeeID eq ${employeeID} and StatusCode gt ${0}`;
        
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=getall&fromPayrollRun=true&filter=${filter}`)
            .send()
            .map(response => response.json());
    }

    public getSumsInPeriod(fromPeriod: number, toPeriod: number, transYear: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + `?action=sums-in-period&fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&year=${transYear}`)
            .send()
            .map(response => response.json());
    }

}
