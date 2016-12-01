import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {StatusCodeCustomerOrder} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../common/ErrorService';

declare var moment;

@Injectable()
export class CustomerOrderService extends BizHttp<CustomerOrder> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerOrder.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerOrder.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerOrder.PartlyTransferredToInvoice, Text: 'Delvis overført' },
        { Code: StatusCodeCustomerOrder.TransferredToInvoice, Text: 'Overført' },
        { Code: StatusCodeCustomerOrder.Completed, Text: 'Avsluttet' }
    ];

    constructor(http: UniHttp, authService: AuthService, private errorService: ErrorService) {
        super(http, authService);
        this.relativeURL = CustomerOrder.RelativeUrl;
        this.entityType = CustomerOrder.EntityType;
        this.DefaultOrderBy = null;
    }

    public next(currentID: number): Observable<CustomerOrder> {
        return super.GetAction(currentID, 'next');
    }

    public previous(currentID: number): Observable<CustomerOrder> {
        return super.GetAction(currentID, 'previous');
    }

    public newCustomerOrder(): Promise<CustomerOrder> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerOrder.EntityType).subscribe((order: CustomerOrder) => {
                order.OrderDate = moment().toDate();

                resolve(order);
            }, err => this.errorService.handle(err));
        });
    }

    public calculateOrderSummary(orderItems: Array<CustomerOrderItem>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(orderItems)
            .withEndPoint(this.relativeURL + '?action=calculate-order-summary')
            .send()
            .map(response => response.json());
    }

    public getStatusText(statusCode: string): string  {
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
