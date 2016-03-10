import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoiceItem} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class SupplierInvoiceItemService extends BizHttp<SupplierInvoiceItem> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = SupplierInvoiceItem.relativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}