import {BizHttp} from '../../../framework/core/http/BizHttp';
import {IJournalEntry} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class JournalEntryService extends BizHttp<IJournalEntry> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = 'JournalEntries';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}