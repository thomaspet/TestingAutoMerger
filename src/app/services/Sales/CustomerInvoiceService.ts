import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoice, CustomerInvoiceItem} from '../../unientities';
import {StatusCodeCustomerInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

declare var moment;

@Injectable()
export class CustomerInvoiceService extends BizHttp<CustomerInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert' },
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt' }
    ];

    public statusTypesCredit: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt(Kreditnota)' },
    ];
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerInvoice.RelativeUrl;
        this.entityType = CustomerInvoice.EntityType;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }    
  
    public newCustomerInvoice(): Promise<CustomerInvoice>
    {       
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerInvoice.EntityType).subscribe((invoice: CustomerInvoice) => {
                invoice.InvoiceDate = moment().toDate();

                resolve(invoice);                
            });               
        });
    }
    
    public calculateInvoiceSummary(invoiceItems: Array<CustomerInvoiceItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(invoiceItems)
            .withEndPoint(this.relativeURL + '?action=calculate-invoice-summary') 
            .send()
            .map(response => response.json());
    } 

    public getInvoiceByInvoiceNumber(invoiceNumber: string): Observable<any> {        
        return this.GetAll('filter=InvoiceNumber eq ' + invoiceNumber, ['JournalEntry', 'JournalEntry.Lines', 'JournalEntry.Lines.Account', 'JournalEntry.Lines.SubAccount']);
    }

    public getInvoiceSummary(odatafilter: string): Observable<any> {        
        return this.http 
            .asGET()
            .usingBusinessDomain()            
            .withEndPoint(this.relativeURL + '?action=get-customer-invoice-summary&odataFilter=' + odatafilter) 
            .send()
            .map(response => response.json());
    } 

    public createCreditNoteFromInvoice(currentInvoiceID: number): Observable<any> {
        return super.PutAction(currentInvoiceID, 'create-credit-draft-invoice');
    } 

    public getStatusText(statusCode: number, invoiceType: number): string {
        var text = '';

        // TODO use enum for invoiceType
        if (invoiceType === 0) {
            this.statusTypes.forEach((status) => {
                if (status.Code === statusCode) {
                    text = status.Text;
                    return;
                }
            });
        } else {
            this.statusTypesCredit.forEach((status) => {
                if (status.Code === statusCode) {
                    text = status.Text;
                    return;
                }
            });
        }
        return text;
    };  
}
