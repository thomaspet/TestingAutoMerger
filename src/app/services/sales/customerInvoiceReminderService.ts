import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoiceReminder} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {RequestMethod} from '@angular/http';

@Injectable()
export class CustomerInvoiceReminderService extends BizHttp<CustomerInvoiceReminder> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CustomerInvoiceReminder.RelativeUrl;
        this.entityType = CustomerInvoiceReminder.EntityType;

        this.DefaultOrderBy = null;
    }

    public getCustomerInvoicesReadyForReminding(): Observable<any> {
        return this.GetAction(null, 'get-customer-invoices-ready-for-reminding');
    }

    public createInvoiceRemindersForInvoicelist(list): Observable<any> {
        return this.ActionWithBody(null, list, `create-invoicereminders-for-invoicelist`, RequestMethod.Post);
    }

    public createInvoiceRemindersFromReminderRules(): Observable<any> {
        return this.PostAction(null, `create-invoicereminders-from-reminder-rules`);
    }

    public getInvoiceRemindersFromReminderRules(): Observable<any> {
        return this.PostAction(null, `get-invoicereminders-from-reminder-rules`);
    }

    public getInvoiceRemindersForInvoicelist(list): Observable<any> {
        return this.ActionWithBody(null, list, `get-invoicereminders-for-invoicelist`, RequestMethod.Post);
    }
}
