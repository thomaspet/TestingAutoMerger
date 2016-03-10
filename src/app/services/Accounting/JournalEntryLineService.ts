import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntryLine} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class JournalEntryLineService extends BizHttp<JournalEntryLine> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = JournalEntryLine.relativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}