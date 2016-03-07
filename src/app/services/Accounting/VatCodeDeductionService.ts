import {BizHttp} from '../../../framework/core/http/BizHttp';
import {IVatCodeDeduction, IVatType} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class VatCodeDeductionService extends BizHttp<IVatCodeDeduction> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = 'VatCodeDeductions';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}