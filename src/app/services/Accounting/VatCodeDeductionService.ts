import {BaseApiService} from '../BaseApiService';
import {IVatCodeDeduction, IVatType} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';

export class VatCodeDeductionService extends BaseApiService<IVatCodeDeduction> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: Kjetil: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'VatCodeDeductions';
        this.DefaultOrderBy = null;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
        
        if (this.LogAll)
            console.log('VatCodeDeductionService created, API URL:' + this.GetApiUrl());
    }       
}