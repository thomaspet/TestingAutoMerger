import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition} from '../../unientities';

export class ReportDefinitionService extends BizHttp<ReportDefinition>{
    
    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = ReportDefinition.relativeUrl;
        this.DefaultOrderBy = 'Category';
    }
  
}
