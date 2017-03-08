import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { SalaryTransactionSupplement } from '../../../unientities';

@Injectable()
export class SupplementService extends BizHttp<SalaryTransactionSupplement> {

    constructor(protected http: UniHttp) {
        super(http);
        this.entityType = SalaryTransactionSupplement.EntityType;
        this.relativeURL = SalaryTransactionSupplement.RelativeUrl;
     }
}
