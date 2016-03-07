import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IVatType} from '../../interfaces';
import {UniHttp} from '../../../framework/core/http';

export class VatTypeService extends BaseApiService<IVatType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'VatTypes';

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = 'VatCode';
    }    
}