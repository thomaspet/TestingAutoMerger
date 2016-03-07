import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IJournalEntryLineDraft} from '../../interfaces';
import {UniHttp} from '../../../framework/core/http';

export class JournalEntryLineDraftService extends BaseApiService<IJournalEntryLineDraft> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'JournalEntryLineDrafts';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}