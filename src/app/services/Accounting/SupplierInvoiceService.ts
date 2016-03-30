import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    constructor(http: UniHttp) {
        super(http);
        
        //TODO: should resolve this from configuration based on type (ISupplierInvoice)? Frank is working on something..
        this.relativeURL = SupplierInvoice.relativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }
}