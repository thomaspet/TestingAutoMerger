import {Injectable} from '@angular/core';
import {BizHttp, UniHttp, RequestMethod} from '@uni-framework/core/http';
import {CustomerInvoiceReminder, StatusCodeCustomerInvoiceReminder, SharingType} from '../../unientities';
import {Observable} from 'rxjs';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';

@Injectable()
export class CustomerInvoiceReminderService extends BizHttp<CustomerInvoiceReminder> {
    private invoicePrintToast: number;

    statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoiceReminder.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerInvoiceReminder.Sent, Text: 'Sendt' },
        { Code: StatusCodeCustomerInvoiceReminder.Paid, Text: 'Betalt' },
        { Code: StatusCodeCustomerInvoiceReminder.Completed, Text: 'Avsluttet' },
        { Code: StatusCodeCustomerInvoiceReminder.Failed, Text: 'Feilet' },
        { Code: StatusCodeCustomerInvoiceReminder.SentToDebtCollection, Text: 'Sendt til inkasso' },
        { Code: StatusCodeCustomerInvoiceReminder.QueuedForDebtCollection, Text: 'Lagt i kø for inkasso'}
    ];

    constructor(
        http: UniHttp,
        private toastService: ToastService
    ) {
        super(http);

        this.relativeURL = CustomerInvoiceReminder.RelativeUrl;
        this.entityType = CustomerInvoiceReminder.EntityType;

        this.DefaultOrderBy = null;
    }

    getCustomerInvoicesReadyForReminding(includeInvoiceWithReminderStop: boolean): Observable<any> {
        return this.GetAction
            (null, `get-customer-invoices-ready-for-reminding&includeInvoiceWithReminderStop=${includeInvoiceWithReminderStop}` );
    }

    getCustomerInvoicesReadyForDebtCollection(includeInvoiceWithReminderStop: boolean): Observable<any> {
        return this.GetAction
            (null, `get-customer-invoices-ready-for-debt-collection&includeInvoiceWithReminderStop=${includeInvoiceWithReminderStop}`);
    }

    getCustomerInvoicesSentToDebtCollection(includeInvoiceWithReminderStop: boolean): Observable<any> {
        return this.GetAction(null, 'get-customer-invoices-sent-to-debt-collection');
    }

    getCustomerInvoiceReminderList(id: number) {
        return this.GetAll(`filter=CustomerInvoiceID eq '${id}'`);
    }

    checkCustomerInvoiceReminders(id: number) {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint
                (`?model=customerinvoicereminder&select=ID,CustomerInvoiceID,RunNumber as RunNumber,ReminderNumber as ReminderNumber,StatusCode&filter=CustomerInvoiceID eq '${id}'&top=1&orderby=ReminderNumber desc`)
            .send()
            .map(res => res.body);
    }

    createInvoiceRemindersForInvoicelist(list: number[]) {
        return this.ActionWithBody(null, list, `create-invoicereminders-for-invoicelist`, RequestMethod.Post);
    }

    createInvoiceRemindersFromReminderRules(): Observable<any> {
        return this.PostAction(null, `create-invoicereminders-from-reminder-rules`);
    }

    getInvoiceRemindersFromReminderRules(): Observable<any> {
        return this.PostAction(null, `get-invoicereminders-from-reminder-rules`);
    }

    getInvoiceRemindersForInvoicelist(list: number[]): Observable<any> {
        return this.ActionWithBody(null, list, `get-invoicereminders-for-invoicelist`, RequestMethod.Post);
    }

    queueForDebtCollection(list: number[]): Observable<any> {
        return this.ActionWithBody(null, list, 'queue-for-debt-collection', RequestMethod.Put);
    }

    sendAction(list: number[]): Observable<any> {
        return this.ActionWithBody(null, list, `send`, RequestMethod.Put);
    }

    sendInvoicePrintAction(list: number[]): Observable<void> {
        this.invoicePrintToast = this.toastService.addToast(
            'Sender purringer til fakturaprint',
            ToastType.warn,
            ToastTime.forever
        );

        const obs = this.ActionWithBody(null, list, `send-invoice-print`, RequestMethod.Put);
        return obs.map(() => {
            this.toastService.removeToast(this.invoicePrintToast);
            this.toastService.addToast(
                'Purringer sendt til fakturaprint',
                ToastType.good,
                ToastTime.short
            );
        });
    }

    sendTransistion(reminder): Observable<any> {
        return this.Transition(reminder.ID, reminder, `send`);
    }

    getStatusText(statusCode: number): string {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public getSharingTypeText(sharingType: number): string {
        switch(sharingType) {
            case SharingType.Email:
                return 'E-post';
            case SharingType.Print:
                return 'Utskrift';
            case SharingType.InvoicePrint:
                return 'Fakturaprint';
            default:
                return '';
        }
    }
}
