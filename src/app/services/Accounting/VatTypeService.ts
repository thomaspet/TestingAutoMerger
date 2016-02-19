import {BaseApiService} from '../BaseApiService';
import {IVatType} from '../../../framework/interfaces/interfaces';
import {UniHttpService} from '../../../framework/data/uniHttpService';

export class VatTypeService extends BaseApiService<IVatType> {
    
    constructor(http: UniHttpService) {        
        super(http);
        
        //TODO: resolve this from configuration based on type (IVatType)?
        this.RelativeURL = "VatType";
        
        console.log('VatTypeService created, API URL:' + this.BaseURL + "/" + this.RelativeURL);
    }
    
    public GetSpecialStuff(specialfilter: string) : IVatType [] {
        //this.http.get(....)
        return null;
    }
}