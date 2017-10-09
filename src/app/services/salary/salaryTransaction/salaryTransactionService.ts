import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';
import {
    SalaryTransSupplementsModal
} from '../../../components/salary/modals/salaryTransSupplementsModal';
import {Observable} from 'rxJs/Observable';

@Injectable()
export class SalaryTransactionService extends BizHttp<SalaryTransaction> {

    constructor(
        http: UniHttp
    ) {
        super(http);
        this.relativeURL = SalaryTransaction.RelativeUrl;
        this.entityType = SalaryTransaction.EntityType;
    }

    public createVacationPayments(ID: number) {
        return super.PutAction(ID, 'createvacationpay');
    }
}
