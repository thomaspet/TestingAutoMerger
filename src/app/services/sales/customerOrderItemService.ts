import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrderItem, StatusCodeCustomerOrderItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomerOrderItemService extends BizHttp<CustomerOrderItem> {

    // TODO: To be retrieved from database schema shared.Status instead?
    // TODO: Sett opp gyldige statuser her
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerOrderItem.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerOrderItem.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerOrderItem.TransferredToInvoice, Text: 'Overført'},
        { Code: StatusCodeCustomerOrderItem.Completed, Text: 'Avsluttet'}
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CustomerOrderItem.RelativeUrl;
        this.entityType = CustomerOrderItem.EntityType;
        this.DefaultOrderBy = null;
    }

    public getStatusText = (statusCode: string) => {
        let statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }
}
