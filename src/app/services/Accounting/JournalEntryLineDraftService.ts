import {BizHttp} from '../../../framework/core/http/BizHttp';
import {IJournalEntryLineDraft} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http/http';

export class JournalEntryLineDraftService extends BizHttp<IJournalEntryLineDraft> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = 'JournalEntryLineDrafts';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}