import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatCodeGroup, VatType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';


export class VatCodeGroupService extends BizHttp<VatCodeGroup> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = "vatcodegroups";// VatCodeGroup.RelativeUrl;
        this.entityType = VatCodeGroup.EntityType;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;        
    }       
}
