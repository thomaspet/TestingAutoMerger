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

    calculateOrderSummary(quoteItems: Array<CustomerOrderItem>): Observable<any> {        
        return this.http 
            .asPOST()
            .usingBusinessDomain()
            .withBody(quoteItems)
            .withEndPoint(this.relativeURL + '?action=calculate-order-summary') 
            .send();
    } 

    // TODO: To be retrieved from database schema shared.Status instead?
    // TODO: Sett opp gyldige statuser her
    private statusTypes: Array<any> = [
       
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