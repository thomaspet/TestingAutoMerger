import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {of} from 'rxjs';

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {
    constructor(protected http: UniHttp) {
        super(http);
    }

    getAnnualSettlements() {
        return of([
            {AccountYear: 2017},
            {AccountYear: 2018},
            {AccountYear: 2019},
            {AccountYear: 2020},
        ]);
    }

}
