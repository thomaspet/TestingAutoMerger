import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentBatch} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PaymentBatchService extends BizHttp<PaymentBatch> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PaymentBatch.RelativeUrl;
        this.entityType = PaymentBatch.EntityType;
        this.DefaultOrderBy = null;
    }
}
