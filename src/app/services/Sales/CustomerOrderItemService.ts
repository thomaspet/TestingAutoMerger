import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, CustomerOrderItem} from '../../unientities';
import {StatusCodeCustomerOrderItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerOrderItemService extends BizHttp<CustomerOrderItem> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = "orderitems";// CustomerOrderItem.RelativeUrl;
        this.DefaultOrderBy = null;
    }
    
    // TODO: To be retrieved from database schema shared.Status instead?
    // TODO: Sett opp gyldige statuser her
    private statusTypes: Array<any> = [
        { Code: StatusCodeCustomerOrderItem.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerOrderItem.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerOrderItem.TransferredToInvoice, Text: 'Overført'},
        { Code: StatusCodeCustomerOrderItem.Completed, Text: 'Avsluttet'}
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