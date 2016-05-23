import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class SubEntityService extends BizHttp<SubEntity> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = SubEntity.relativeUrl;
        this.DefaultOrderBy = null;
    }
    
    public getMainOrganization() {
        return this.GetAll('SuperiorOrganization eq 0 or SuperiorOrganization eq null', ['BusinessRelationInfo']);
    }       
}
