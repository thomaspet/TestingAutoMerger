import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {of} from 'rxjs';

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {

    public relativeURL = 'annualsettlement';
    protected entityType = 'AnnualSettlement';

    constructor(protected http: UniHttp) {
        super(http);
    }

    getAnnualSettlements() {
        return this.GetAll();
    }

    getAnnualSettlement(id) {
        return this.Get(id, ['AnnualSettlementCheckList']);
    }

    createFinancialYear(year: number) {
        return this.Post({
            _createguid: this.getNewGuid(),
            AccountYear: year
        });
    }

}
