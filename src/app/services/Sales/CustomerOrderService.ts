import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {StatusCodeCustomerOrder} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {TradeHeaderCalculationSummary} from '../../models/sales/TradeHeaderCalculationSummary'

declare var moment;

export class CustomerOrderService extends BizHttp<CustomerOrder> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerOrder.RelativeUrl;
        this.DefaultOrderBy = null;
    }    
            
    next(currentID: number): Observable<CustomerOrder>
    {
        return super.GetAction(currentID, 'next');
    }
    
    previous(currentID: number): Observable<CustomerOrder>
    {
        return super.GetAction(currentID, 'previous');
    }
    
    newCustomerOrder(): Promise<CustomerOrder>
    {       
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerOrder.EntityType).subscribe(order => {
                order.OrderDate = moment().toDate();
                   
                resolve(order);                
            });               
        });
    }

    calculateOrderSummary(orderItems: Array<CustomerOrderItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(orderItems)
            .withEndPoint(this.relativeURL + '?action=calculate-order-summary') 
            .send()
            .map(response => response.json());
    } 

    // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: StatusCodeCustomerOrder.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerOrder.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerOrder.PartlyTransferredToInvoice, Text: 'Delvis overført til faktura' },
        { Code: StatusCodeCustomerOrder.TransferredToInvoice, Text: 'Overført til faktura' },
        { Code: StatusCodeCustomerOrder.Completed, Text: 'Avsluttet' }
    ];

    public getStatusText = (statusCode: string) => {
        var text = '';
        this.statusTypes.forEach((status) => {
            if (status.Code == statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };    
}
