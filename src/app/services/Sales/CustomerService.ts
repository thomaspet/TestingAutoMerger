import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class CustomerService extends BizHttp<Customer> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Customer.relativeUrl;
                
        this.DefaultOrderBy = "Info.Name";
        
        this.defaultExpand = ["Info"];
    }       
    
    NextCustomer(CurrentID: number): Customer
    {
        return super.Action(ID, "next-customer");
    }
    
    PreviousCustomer(CurrentID: number): Customer
    {
        return super.Action(ID, "previous-customer");
    }
    
    FirstCustomer(): Customer
    {
        return super.Action(0, "first-customer");
    }
    
    LastCustomer(): Customer
    {
        return super.Action(0, "last-customer");
    }
}