import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';

export class SalaryTransactionService extends BizHttp<SalaryTransaction> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = SalaryTransaction.RelativeUrl;
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
            .send()
            .map(response => response.json());
    }

}
