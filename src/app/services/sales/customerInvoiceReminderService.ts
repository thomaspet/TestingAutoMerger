import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoiceReminder, StatusCodeCustomerInvoiceReminder} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {RequestMethod} from '@angular/http';

@Injectable()
export class CustomerInvoiceReminderService extends BizHttp<CustomerInvoiceReminder> {

    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoiceReminder.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerInvoiceReminder.Sent, Text: 'Sendt' },
        { Code: StatusCodeCustomerInvoiceReminder.Paid, Text: 'Betalt' },
        { Code: StatusCodeCustomerInvoiceReminder.Completed, Text: 'Avsluttet' },
        { Code: StatusCodeCustomerInvoiceReminder.Failed, Text: 'Feilet' },
        { Code: StatusCodeCustomerInvoiceReminder.SentToDebtCollection, Text: 'Sendt til inkasso' }
    ];

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CustomerInvoiceReminder.RelativeUrl;
        this.entityType = CustomerInvoiceReminder.EntityType;

        this.DefaultOrderBy = null;
    }

    public getCustomerInvoicesReadyForReminding(includeInvoiceWithReminderStop: boolean): Observable<any> {
        return this.GetAction(null, `get-customer-invoices-ready-for-reminding&includeInvoiceWithReminderStop=${includeInvoiceWithReminderStop}` );
    }
    public getCustomerInvoicesReadyForDebtCollection(includeInvoiceWithReminderStop: boolean): Observable<any> {
        return this.GetAction(null, `get-customer-invoices-ready-for-debt-collection&includeInvoiceWithReminderStop=${includeInvoiceWithReminderStop}`);
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

    public sendToDebtCollection(list): Observable<any> {
        return this.ActionWithBody(null, list , 'send-to-debt-collection', RequestMethod.Put);
    }
    public sendAction(list): Observable<any> {
        return this.ActionWithBody(null, list, `send`, RequestMethod.Put);
    }

    public sendTransistion(reminder): Observable<any> {
        return this.Transition(reminder.ID, reminder, `send`);
    }

    public getStatusText(statusCode: number): string {
        let statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    };
}
