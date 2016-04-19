import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {QuoteCalculationSummary} from '../../models/sales/QuoteCalculationSummary'
import {moment} from "moment";

export class CustomerQuoteService extends BizHttp<CustomerQuote> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerQuote.relativeUrl;
        this.DefaultOrderBy = null;
    }    
            
    Next(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'next');
    }
    
    Previous(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, 'previous');
    }
    
    NewCustomerQuote()
    {       
        var q = new CustomerQuote();
        q.CreatedDate = new Date();
        q.ValidUntilDate = moment(new Date()).addMonth(1);
        
        console.log("==NEW QUOTE==");
        console.log(q);
        
        /*   
        this.customerQuoteService.Post(q)
            .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);        
                },
                (err) => console.log('Error creating quote: ', err)
            );  
        this.Post
        */
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
        { Code: '40005', Text: 'Overf�rt til ordre' },
        { Code: '40006', Text: 'Overf�rt til faktura' },
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