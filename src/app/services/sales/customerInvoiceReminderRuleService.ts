import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoiceReminderRule} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerInvoiceReminderRuleService extends BizHttp<CustomerInvoiceReminderRule> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CustomerInvoiceReminderRule.RelativeUrl;
        this.entityType = CustomerInvoiceReminderRule.EntityType;

        this.DefaultOrderBy = null;
    }
}
