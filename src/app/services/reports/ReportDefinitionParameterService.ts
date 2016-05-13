import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinitionParameter} from '../../unientities';

export class ReportDefinitionParameterService extends BizHttp<ReportDefinitionParameter> {
    
    constructor(http: UniHttp) {
        super(http);
    }
   
}
