import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerInvoice, CustomerInvoiceItem} from '../../unientities';
import {StatusCodeCustomerInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {TradeHeaderCalculationSummary} from '../../models/sales/TradeHeaderCalculationSummary'

declare var moment;

export class CustomerInvoiceService extends BizHttp<CustomerInvoice> {

    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerInvoice.RelativeUrl;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }    
    
    // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert' },
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt' },
    ];

    private statusTypesCredit: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Kreditert' },
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt' },
    ];
            
    next(currentID: number): Observable<CustomerInvoice>
    {
        return super.GetAction(currentID, 'next');
    }
    
    previous(currentID: number): Observable<CustomerInvoice>
    {
        return super.GetAction(currentID, 'previous');
    }
  
    newCustomerInvoice(): Promise<CustomerInvoice>
    {       
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerInvoice.EntityType).subscribe(invoice => {
                invoice.CreatedDate = moment().toDate();
                invoice.InvoiceDate = moment().toDate();

                resolve(invoice);                
            });               
        });
    }
    
    calculateInvoiceSummary(invoiceItems: Array<CustomerInvoiceItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(invoiceItems)
            .withEndPoint(this.relativeURL + '?action=calculate-invoice-summary') 
            .send();
    } 

    getInvoiceByInvoiceNumber(invoiceNumber: string): Observable<any> {        
        return this.GetAll('filter=InvoiceNumber eq ' + invoiceNumber, ['JournalEntry','JournalEntry.Lines','JournalEntry.Lines.Account']);
    }

    public createCreditNoteFromInvoice(currentInvoiceID: number): Observable<any> {
        return super.PutAction(currentInvoiceID, 'create-credit-draft-invoice');
    } 

    public getStatusText = (statusCode: string, invoiceType: number) => {
        var text = 'Udefinert';

        //TODO use enum for invoiceType
        if (invoiceType == 0) {
            this.statusTypes.forEach((status) => {
                if (status.Code == statusCode) {
                    text = status.Text;
                    return;
                }
            });
        }
        else {
            this.statusTypesCredit.forEach((status) => {
                if (status.Code == statusCode) {
                    text = status.Text;
                    return;
                }
            });
        }
        return text;
    };    
}