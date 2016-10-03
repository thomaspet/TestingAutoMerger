import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';

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
}
