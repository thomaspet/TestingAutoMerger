import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {StatusCodeCustomerQuote} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {TradeHeaderCalculationSummary} from '../../models/sales/TradeHeaderCalculationSummary';

declare var moment;

export class CustomerQuoteService extends BizHttp<CustomerQuote> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerQuote.relativeUrl;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }
    
    // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: StatusCodeCustomerQuote.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerQuote.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerQuote.ShippedToCustomer, Text: 'Sendt til kunde' },
        { Code: StatusCodeCustomerQuote.CustomerAccepted, Text: 'Kunde har godkjent' },
        { Code: StatusCodeCustomerQuote.TransferredToOrder, Text: 'Overført til ordre' },
        { Code: StatusCodeCustomerQuote.TransferredToInvoice, Text: 'Overført til faktura' },
        { Code: StatusCodeCustomerQuote.Completed, Text: 'Avsluttet' }
    ];    
            
    next(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'next');
    }
    
    previous(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'previous');
    }
    
    newCustomerQuote(): Promise<CustomerQuote>
    {       
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerQuote.entityType).subscribe(quote => {
                quote.CreatedDate = moment().toDate();
                quote.QuoteDate = moment().toDate();
                quote.ValidUntilDate = moment().add(1, 'month').toDate();
                
                resolve(quote);                
            });               
        });
    }

    calculateQuoteSummary(quoteItems: Array<CustomerQuoteItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(quoteItems)
            .withEndPoint(this.relativeURL + '?action=calculate-quote-summary')
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