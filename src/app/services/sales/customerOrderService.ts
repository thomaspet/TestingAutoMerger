import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {StatusCodeCustomerOrder, LocalDate} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../common/errorService';

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

    constructor(http: UniHttp, private errorService: ErrorService) {
        super(http);
        this.relativeURL = CustomerOrder.RelativeUrl;
        this.entityType = CustomerOrder.EntityType;
        this.DefaultOrderBy = null;
    }

    public getGroupCounts() {
        const route = '?model=customerorder&select=count(id),statuscode&filter=isnull(deleted,0) eq 0';
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(route)
            .send()
            .map((res) => {
                const data = (res.json() || {}).Data || [];
                return data.reduce((counts, group) => {
                    if (group.CustomerOrderStatusCode) {
                        counts[group.CustomerOrderStatusCode] = group.countid;
                    }
                    return counts;
                }, {});
            });
    }


    public next(currentID: number): Observable<CustomerOrder> {
        return super.GetAction(currentID, 'next');
    }

    public previous(currentID: number): Observable<CustomerOrder> {
        return super.GetAction(currentID, 'previous');
    }

    public setPrintStatus(orderId: number, printStatus: string): Observable<any> {
        return super.PutAction(orderId, 'set-customer-order-printstatus', 'ID=' + orderId + '&printStatus=' + printStatus);
    }

    public newCustomerOrder(): Promise<CustomerOrder> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerOrder.EntityType).subscribe((order: CustomerOrder) => {
                order.OrderDate = new LocalDate(new Date());

                resolve(order);
            }, err => this.errorService.handle(err));
        });
    }

    public calculateOrderSummary(orderItems: Array<CustomerOrderItem>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(orderItems)
            .withEndPoint(this.relativeURL + '?action=calculate-order-summary')
            .send()
            .map(response => response.json());
    }

    public getStatusText(statusCode: string): string  {
        let statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    };
}
