import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export class ReportService extends BizHttp<ReportDefinition> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = ReportDefinition.RelativeUrl;       
        this.DefaultOrderBy = null;
    }
    
    getReportDefinitionByName(name: string) : Observable<any> {
        var params = new URLSearchParams();
        params.set('filter', `Name eq '${name}'`);
        return this.GetAllByUrlSearchParams(params);
    }      
}