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
        this.relativeURL = CustomerInvoice.relativeUrl;
        this.DefaultOrderBy = null;
    }    
    
    // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert' },
    ];
            
    next(currentID: number): Observable<CustomerInvoice>
    {
        return super.GetAction(currentID, 'next');
    }
    
    previous(currentID: number): Observable<CustomerInvoice>
    {
        return super.GetAction(currentID, 'previous');
    }

    newCustomerInvoice()
    {       
        var i = new CustomerInvoice();
        i.CreatedDate = moment().toDate();
        i.InvoiceDate = moment().toDate();
  
        return i;               
    }

    calculateInvoiceSummary(invoiceItems: Array<CustomerInvoiceItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(invoiceItems)
            .withEndPoint(this.relativeURL + '?action=calculate-invoice-summary') 
            .send();
    } 

    public getStatusText = (statusCode: string) => {
        var text = 'Udefinert';
        this.statusTypes.forEach((status) => {
            if (status.Code == statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };    
}