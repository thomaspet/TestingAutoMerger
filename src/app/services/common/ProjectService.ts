import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class ProjectService extends BizHttp<Project> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Project.relativeUrl;       
        this.DefaultOrderBy = null;
    }       
}