import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinitionParameter} from '../../unientities';

@Injectable()
export class ReportDefinitionParameterService extends BizHttp<ReportDefinitionParameter> {
    
    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = ReportDefinitionParameter.RelativeUrl;
        this.DefaultOrderBy = 'ID';
    }
   
}
