import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {TradeHeaderCalculationSummary} from '../../models/sales/TradeHeaderCalculationSummary'

declare var moment;

export class CustomerOrderService extends BizHttp<CustomerOrder> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CustomerOrder.relativeUrl;
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

    newCustomerOrder()
    {       
        var o = new CustomerOrder();
        o.CreatedDate = moment().toDate();
        o.OrderDate = moment().toDate();
  
        return o;               
    }

    calculateOrderSummary(orderItems: Array<CustomerOrderItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(orderItems)
            .withEndPoint(this.relativeURL + '?action=calculate-order-summary') 
            .send();
    } 

    // TODO: To be retrieved from database schema shared.Status instead?
    private statusTypes: Array<any> = [
        { Code: '41001', Text: 'Kladd' },
        { Code: '41002', Text: 'Registrert' },
        { Code: '41003', Text: 'Delvis overført til faktura' },
        { Code: '41004', Text: 'Overført til faktura' },
        { Code: '41005', Text: 'Avsluttet' }
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