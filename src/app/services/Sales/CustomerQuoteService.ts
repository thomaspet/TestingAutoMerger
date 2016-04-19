import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {QuoteCalculationSummary} from '../../models/sales/QuoteCalculationSummary';

declare var moment;

export class CustomerQuoteService extends BizHttp<CustomerQuote> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerQuote.relativeUrl;
        this.DefaultOrderBy = null;
    }    
            
    next(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'next');
    }
    
    previous(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'previous');
    }
    
    newCustomerQuote()
    {       
        var q = new CustomerQuote();
        q.CreatedDate = moment().toDate();
        q.QuoteDate = moment().toDate();
        q.ValidUntilDate = moment().add(1, 'month').toDate();

        return q;               
    }

    calculateQuoteSummary(quoteItems: Array<CustomerQuoteItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(quoteItems)
            .withEndPoint(this.relativeURL + '?action=calculate-quote-summary')
            .send();
    } 

     // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: '40002', Text: 'Registrert' },
        { Code: '40003', Text: 'Sendt til kunde' },
        { Code: '40004', Text: 'Kunde har godkjent' },
        { Code: '40005', Text: 'Overført til ordre' },
        { Code: '40006', Text: 'Overført til faktura' },
        { Code: '40007', Text: 'Avsluttet' },
        { Code: '40008', Text: 'Kladd' },

    ];

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