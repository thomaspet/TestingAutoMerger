import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IDepartement} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';

export class DepartementService extends BaseApiService<IDepartement> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'Departements';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}