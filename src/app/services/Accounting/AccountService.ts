import {BaseApiService} from '../BaseApiService';
import {IAccount} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';

export class AccountService extends BaseApiService<IAccount> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: Kjetil: should resolve this from configuration based on type (IAccount)? Frank is working on something..
        this.RelativeURL = "Accounts";
        
        console.log('AccountService created, API URL:' + this.GetApiUrl());
    }
}