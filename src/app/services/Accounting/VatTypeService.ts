import {BizHttp} from '../../../framework/core/http/BizHttp';
import {IVatType} from '../../interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class VatTypeService extends BizHttp<IVatType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = 'VatTypes';

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = 'VatCode';
    }    
}