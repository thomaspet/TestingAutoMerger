import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinitionDataSource} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export class ReportDefinitionDataSourceService extends BizHttp<ReportDefinitionDataSource> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = ReportDefinitionDataSource.RelativeUrl;       
        this.DefaultOrderBy = null;
    }
}