import {BaseApiService} from '../../../framework/core/BaseApiService';
import {ISupplierInvoice} from '../../interfaces';
import {UniHttp} from '../../../framework/core/http';

export class SupplierInvoiceService extends BaseApiService<ISupplierInvoice> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'SupplierInvoices';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}