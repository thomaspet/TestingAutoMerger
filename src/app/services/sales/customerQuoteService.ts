import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem} from '../../unientities';
import {StatusCodeCustomerQuote} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../common/errorService';
import * as moment from 'moment';

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


    constructor(http: UniHttp, authService: AuthService, private errorService: ErrorService) {
        super(http, authService);
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

    public setPrintStatus(quoteId: number, printStatus: string): Observable<any> {
        return super.PutAction(quoteId, 'set-customer-quote-printstatus', 'ID=' + quoteId + '&printStatus=' + printStatus);
    }

    public newCustomerQuote(): Promise<CustomerQuote> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerQuote.EntityType).subscribe((quote: CustomerQuote) => {
                quote.QuoteDate = moment().toDate();
                quote.ValidUntilDate = moment().add(1, 'month').toDate();

                resolve(quote);
            }, err => this.errorService.handle(err));
        });
    }

    public getGroupCounts() {
        const route = '?model=customerquote&select=count(id),statuscode&filter=isnull(deleted,0) eq 0';
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(route)
            .send()
            .map((res) => {
                const data = (res.json() || {}).Data || [];
                return data.reduce((counts, group) => {
                    if (group.CustomerQuoteStatusCode) {
                        counts[group.CustomerQuoteStatusCode] = group.countid;
                    }
                    return counts;
                }, {});
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
        let statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    };
}
