import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class CustomerService extends BizHttp<Customer> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Customer.RelativeUrl;
                
        this.entityType = Customer.EntityType;

        this.DefaultOrderBy = "Info.Name";
        
        this.defaultExpand = ["Info"];
    }       
    
    NextCustomer(currentID: number): Observable<Customer>
    {
        return super.GetAction(currentID, "next");
    }
    
    PreviousCustomer(currentID: number): Observable<Customer>
    {
        return super.GetAction(currentID, "previous");
    }
    
    /* Not implemented on backend
    FirstCustomer(): Customer
    {
        return super.Action(0, "first");
    }
    
    LastCustomer(): Customer
    {
        return super.Action(0, "last");
    }
    */
}
