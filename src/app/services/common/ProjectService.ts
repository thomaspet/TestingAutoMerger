import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class ProjectService extends BizHttp<Project> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = Project.relativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
}