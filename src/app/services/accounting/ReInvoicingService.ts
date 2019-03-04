import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class ReInvoicingService extends BizHttp<ReInvoice> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = ReInvoice.RelativeUrl;
        this.entityType = ReInvoice.EntityType;
    }


}
