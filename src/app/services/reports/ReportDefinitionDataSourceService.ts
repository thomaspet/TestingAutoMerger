import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinitionDataSource} from '../../unientities';

export class ReportDefinitionDataSourceService extends BizHttp<ReportDefinitionDataSource>{
    
    constructor(http: UniHttp) {
        super(http);
        
        this.RelativeURL = ReportDefinitionDataSource.RelativeUrl;
        this.DefaultOrderBy = 'ID';
    }
   
}
