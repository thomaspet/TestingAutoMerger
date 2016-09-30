import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatPost} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class VatPostService extends BizHttp<VatPost> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        // TODO: should resolve this from configuration based on type
        this.relativeURL = "vatposts";
        this.entityType = VatPost.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }
}
