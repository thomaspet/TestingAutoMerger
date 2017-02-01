import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoiceReminderSettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerInvoiceReminderSettingsService extends BizHttp<CustomerInvoiceReminderSettings> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CustomerInvoiceReminderSettings.RelativeUrl;
        this.entityType = CustomerInvoiceReminderSettings.EntityType;

        this.DefaultOrderBy = null;
    }
}
