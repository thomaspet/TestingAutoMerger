import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { SalaryTransaction, SalaryTransactionSums } from '../../../unientities';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SalaryTransactionService extends BizHttp<SalaryTransaction> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = SalaryTransaction.RelativeUrl;
        this.entityType = SalaryTransaction.EntityType;
    }

    public createVacationPayments(ID: number) {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=createvacationpay')
            .send()
            .map(response => response.json());
    }

    public delete(ID: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('salarytrans/' + ID)
            .send();
    }

    public getSumsInPeriod(fromPeriod: number, toPeriod: number, transYear: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + `?action=sums-in-period&fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&year=${transYear}`)
            .send()
            .map(response => response.json());
    }

    public getSumsInYear(year: number, employeeID: number = null): Observable<SalaryTransactionSums> {
        let params = '&year=' + year + (employeeID ? '&empID=' + employeeID : '');
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/salarytrans?action=yearly-sums' + params)
            .send()
            .map(response => response.json());
    }

    public getRate(wageTypeID: number, employmentID: number, employeeID: number) {

        employmentID = employmentID ? employmentID : 0;
        employeeID = employeeID ? employeeID : 0;

        if (wageTypeID) {
            return this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL + `?action=get-rate&wagetypeID=${wageTypeID}&employmentID=${employmentID}&employeeID=${employeeID}`)
                .send()
                .map(response => response.json());
        } else {
            return Observable.of(0);
        }
    }
}
