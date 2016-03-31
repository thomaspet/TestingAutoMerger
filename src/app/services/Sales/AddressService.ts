import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Address} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class AddressService extends BizHttp<Address> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = "address"; // TODO: change to Address.relativeUrl;
        this.DefaultOrderBy = null;
    }       
}