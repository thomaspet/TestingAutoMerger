import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

export class CustomerService extends BizHttp<Customer> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = Customer.RelativeUrl;

        this.entityType = Customer.EntityType;

        this.DefaultOrderBy = "Info.Name";

        this.defaultExpand = ["Info"];
    }
}
