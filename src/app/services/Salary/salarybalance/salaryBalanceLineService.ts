import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { SalaryBalanceLine } from '../../../unientities';
@Injectable()
export class SalaryBalanceLineService extends BizHttp<SalaryBalanceLine> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = SalaryBalanceLine.RelativeUrl;
        this.entityType = SalaryBalanceLine.EntityType;
     }
}
