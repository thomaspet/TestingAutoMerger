import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransaction} from '../../../unientities';
import {Observable} from 'rxjs';
import {RequestMethod} from '@uni-framework/core/http';

@Injectable()
export class SalaryTransactionService extends BizHttp<SalaryTransaction> {

    public supplements: any[] = [];

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

    public completeTrans(trans: SalaryTransaction): Observable<SalaryTransaction[]> {
        return super.ActionWithBody(null, trans, 'complete-trans', RequestMethod.Post);
    }

    public removeTransaction(id: number) {
        return super.Remove(id);
    }

    public updateFromEmployments(employmentIDs: number[]): Observable<SalaryTransaction[]> {
        return super.ActionWithBody(null, employmentIDs, 'update-from-employments');
    }

    public updateDataSource(source: SalaryTransaction[], transes: SalaryTransaction[]): SalaryTransaction[] {
        return transes.length > 1 ? [...source, ...transes.filter((x, i) => i !== 0)] : source;
    }

    public fillInRowmodel(rowModel: SalaryTransaction, trans: SalaryTransaction) {
        rowModel['Rate'] = trans.Rate;
        rowModel['Text'] = trans.Text;
        rowModel['Sum'] = trans.Sum;
        rowModel['Amount'] = trans.Amount;

        return rowModel;
    }
}
