import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IJournalEntryLine} from '../../interfaces';
import {UniHttp} from '../../../framework/core/http';

export class JournalEntryLineService extends BaseApiService<IJournalEntryLine> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'JournalEntryLines';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}