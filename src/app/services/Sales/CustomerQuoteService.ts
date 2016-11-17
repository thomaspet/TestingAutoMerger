import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {StatusCodeCustomerQuote} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../common/ErrorService';

declare var moment;

@Injectable()
export class CustomerQuoteService extends BizHttp<CustomerQuote> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerQuote.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerQuote.Registered, Text: 'Registrert' },
        // { Code: StatusCodeCustomerQuote.ShippedToCustomer, Text: 'Sendt til kunde' }, // Not available yet
        // { Code: StatusCodeCustomerQuote.CustomerAccepted, Text: 'Kunde har godkjent' }, // Not available yet
        { Code: StatusCodeCustomerQuote.TransferredToOrder, Text: 'Overført til ordre' },
        { Code: StatusCodeCustomerQuote.TransferredToInvoice, Text: 'Overført til faktura' },
        { Code: StatusCodeCustomerQuote.Completed, Text: 'Avsluttet' }
    ];

    public getFilteredStatusTypes(statusCode: number): Array<any> {
        let statusTypesFiltered: Array<any> = [];

        this.statusTypes.forEach((s, i) => {
            if (s.Code === StatusCodeCustomerQuote.Draft &&
                statusCode !== StatusCodeCustomerQuote.Draft) {
                return;
            } else if (s.Code === StatusCodeCustomerQuote.Completed &&
                statusCode !== StatusCodeCustomerQuote.Completed) {
                return;
            } else if (s.Code === StatusCodeCustomerQuote.TransferredToInvoice &&
                statusCode === StatusCodeCustomerQuote.Completed) {
                return;
            } else {
                statusTypesFiltered.push(s);
            }
        });
        return statusTypesFiltered;
    };


    constructor(http: UniHttp, private errorService: ErrorService) {
        super(http);
        this.relativeURL = CustomerQuote.RelativeUrl;
        this.entityType = CustomerQuote.EntityType;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }

    public next(currentID: number): Observable<CustomerQuote> {
        return super.GetAction(currentID, 'next');
    }

    public previous(currentID: number): Observable<CustomerQuote> {
        return super.GetAction(currentID, 'previous');
    }

    public newCustomerQuote(): Promise<CustomerQuote> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerQuote.EntityType).subscribe((quote: CustomerQuote) => {
                quote.QuoteDate = moment().toDate();
                quote.ValidUntilDate = moment().add(1, 'month').toDate();

                resolve(quote);
            }, this.errorService.handle);
        });
    }

    public calculateQuoteSummary(quoteItems: Array<CustomerQuoteItem>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(quoteItems)
            .withEndPoint(this.relativeURL + '?action=calculate-quote-summary')
            .send()
            .map(response => response.json());
    }

    public getStatusText(statusCode: number): string {
        var text = '';
        this.statusTypes.forEach((status) => {
            if (status.Code === statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };
}
