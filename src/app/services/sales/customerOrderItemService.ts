import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrderItem} from '../../unientities';
import {StatusCodeCustomerOrderItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class CustomerOrderItemService extends BizHttp<CustomerOrderItem> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = CustomerOrderItem.RelativeUrl;
        this.entityType = CustomerOrderItem.EntityType;
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
