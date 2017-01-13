import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinitionDataSource} from '../../unientities';

@Injectable()
export class ReportDefinitionDataSourceService extends BizHttp<ReportDefinitionDataSource>{
    
    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = ReportDefinitionDataSource.RelativeUrl;
        this.entityType = ReportDefinitionDataSource.EntityType;
        this.DefaultOrderBy = 'ID';
    }
   
}
