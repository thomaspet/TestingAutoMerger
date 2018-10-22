import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';
import {
    SalaryTransSupplementsModal
} from '../../../components/salary/modals/salaryTransSupplementsModal';
import {Observable} from 'rxjs';
import {RequestMethod} from '@angular/http';

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

    public save(trans: SalaryTransaction): Observable<SalaryTransaction> {
        return trans.ID ? super.Put(trans.ID, trans) : super.Post(trans);
    }

    public completeTrans(trans: SalaryTransaction): Observable<SalaryTransaction> {
        return super.ActionWithBody(null, trans, 'complete-trans', RequestMethod.Post);
    }
}
