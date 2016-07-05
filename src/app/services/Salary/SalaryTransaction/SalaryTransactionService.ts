import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';

export class SalaryTransactionService extends BizHttp<SalaryTransaction> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = SalaryTransaction.RelativeUrl;
    }

    public delete(ID: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('salarytrans/' + ID)
            .send();
    }

}
