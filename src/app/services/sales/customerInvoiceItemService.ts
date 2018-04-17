import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoiceItem, StatusCodeCustomerInvoiceItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerInvoiceItemService extends BizHttp<CustomerInvoiceItem> {
    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoiceItem.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoiceItem.Invoiced, Text: 'Fakturert' }
    ];

    public statusTypesCredit: Array<any> = [
        { Code: StatusCodeCustomerInvoiceItem.Draft, Text: 'Kladd(Kreditnota)' },
        { Code: StatusCodeCustomerInvoiceItem.Invoiced, Text: 'Fakturert(Kreditnota)' }
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CustomerInvoiceItem.RelativeUrl;
        this.entityType = CustomerInvoiceItem.EntityType;
        this.DefaultOrderBy = null;

        /*
            Because saving quote/order/invoice doesnt invalidate the cache of this service.
            Ideally this shouldn't be a separate service, the quote/order/invoice services
            should just have a function for getting items. Might refactor later if I find time.
        */
       this.disableCache();
    }

    public getStatusText(statusCode: number, invoiceType: number): string {
        const dict = (invoiceType === 0) ? this.statusTypes : this.statusTypesCredit;
        const statusType = dict.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }
}
