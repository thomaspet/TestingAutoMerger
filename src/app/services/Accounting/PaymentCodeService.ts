import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentCode} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PaymentCodeService extends BizHttp<PaymentCode> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PaymentCode.RelativeUrl;
        this.entityType = PaymentCode.EntityType;
        this.DefaultOrderBy = 'Name';
    }
}
