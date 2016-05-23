import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Supplier} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class SupplierService extends BizHttp<Supplier> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = Supplier.RelativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
    
    NextSupplier(currentID: number): Observable<Supplier>
    {
        return super.GetAction(currentID, "next");
    }
    
    PreviousSupplier(currentID: number): Observable<Supplier>
    {
        return super.GetAction(currentID, "previous");
    }
    
    /* Not implemented on backend
    FirstCustomer(): Supplier
    {
        return super.Action(0, "first");
    }
    
    LastCustomer(): Supplier
    {
        return super.Action(0, "last");
    }
    */
}