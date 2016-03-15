import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class JournalEntryLineService extends BizHttp<Customer> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Customer.relativeUrl;
                
        this.DefaultOrderBy = "Info.Name";
        
        this.defaultExpand = ["Info"];
    }       
}