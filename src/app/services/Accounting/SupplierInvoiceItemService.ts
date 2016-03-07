import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ISupplierInvoiceItem} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class SupplierInvoiceItemService extends BizHttp<ISupplierInvoiceItem> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = 'SupplierInvoiceItems';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}