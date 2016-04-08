import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerQuoteService extends BizHttp<CustomerQuote> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerQuote.relativeUrl;
        this.DefaultOrderBy = null;
    }    
            
    NextQuote(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, "next");
    }
    
    PreviousQuote(currentID: number): Observable<CustomerQuote>
    {
        return super.GetAction(currentID, "previous");
    }
}