import {BaseApiService} from '../BaseApiService';
import {IVatType} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';

export class VatTypeService extends BaseApiService<IVatType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: Kjetil: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'VatTypes';
        this.DefaultOrderBy = 'VatCode';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
        
        if (this.LogAll)
            console.log('VatTypeService created, API URL:' + this.GetApiUrl());
    }
        
    //if you need something special that is not supported by the base class, implement your own 
    //method - either using the Get/Post/Put/Remove methods in the base class or by using the
    //base class' http-service directly
    public GetSpecialStuff(specialfilter: string) : IVatType [] {
        //this.http.get(....)
        return null;
    }
    
    /* 
    //if you need something special in get/getall/post/put the default implementation can be overridden
    public GetAll(query: string) {
        console.log('GetAll i child');
        if (query === null) {
            query = "orderby=AccountNumber";
        }        
        
        return super.GetAll(query);
    }*/
}