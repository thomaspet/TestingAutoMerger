import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IAccount} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';

export class AccountService extends BaseApiService<IAccount> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IAccount)? Frank is working on something..               
        this.RelativeURL = 'Accounts';
        
        //set this property if you want a default sort order from the API, e.g. AccountNumber
        this.DefaultOrderBy = 'AccountNumber';        
    }  
    
    /*    
    //if you need something special that is not supported by the base class, implement your own 
    //method - either using the Get/Post/Put/Remove methods in the base class or by using the
    //base class' http-service directly
    public GetSpecialStuff(specialfilter: string) : Observable<any> {
        return this.http.asGET()....send();    
    }
         
    //if you need something special in get/getall/post/put the default implementation can be overridden
    //you can also use the base class' methods in overridden methods, e.g. GetAll(..) in the example below
    public GetAll(query: string) : Observable<any> {
        
        if (query === null) {
            query = "filter=AccountNumber eq 1234";
        }        
        
        return super.GetAll(query);
    }*/ 

}