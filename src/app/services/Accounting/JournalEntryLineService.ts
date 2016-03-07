import {BaseApiService} from '../../../framework/core/http/BaseApiService';
import {IJournalEntryLine} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class JournalEntryLineService extends BaseApiService<IJournalEntryLine> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'JournalEntryLines';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}