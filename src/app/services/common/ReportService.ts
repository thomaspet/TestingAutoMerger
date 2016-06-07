import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition,ReportDefinitionDataSource} from '../../unientities';
import {ReportDefinitionDataSourceService} from './ReportDefinitionDataSourceService';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export class ReportService extends BizHttp<ReportDefinition> {
    
    constructor(http: UniHttp, private datasource: ReportDefinitionDataSourceService) {        
        super(http);
        
        this.relativeURL = ReportDefinition.RelativeUrl;       
        this.DefaultOrderBy = null;
    }
        
    getReportTemplateAndData(name: string, inputparams: any) : Observable<any> {
        var template, self = this;
        return this.getReportTemplate(name)
            .concatMap((data: any) => {
                let [tmpl, rd] = data;
                template = tmpl;
                return self.getReportDataFromSources(rd, inputparams);
            })
            .concatMap((data) => {
              return data;  
            })
            .map((data) => {
                return [template, data];
            });
    }
    
    private getReportTemplate(name : string) : Observable<any> {
        // TODO: later on use ['ReportDefinitionDataSource'] for expand
        return this.GetAll<ReportDefinition>(`filter=Name eq '${name}'`).concatMap((rds : Array<ReportDefinition>) => {  
            return this.http.http.get(`/assets/ReportTemplates/${rds[0].TemplateLinkId}`).map(res => [res.text(), rds[0]]);        
        });
    }   
   
    private getReportDataFromSources(rd : ReportDefinition, inputparams : any) : Observable<any> {
        var self = this;
 
        this.relativeURL = ReportDefinitionDataSource.RelativeUrl;
        return this.GetAll<ReportDefinitionDataSource>(`filter=ReportDefinitionId eq ${rd.ID}`).map((sources : Array<ReportDefinitionDataSource>) => {
            var dataset = [];
            sources.forEach((source : ReportDefinitionDataSource) => {
                dataset.push(self.getReportData(source, inputparams));             
            });
            
            return Observable.forkJoin(dataset);
        });      
    }
   
    private getReportData(source: ReportDefinitionDataSource, inputparams : any) : Observable<any> {
        return this.http.asGET().usingEmptyDomain().withEndPoint(source.DataSourceUrl.replace('{Id}', inputparams.Id.toString())).send({}, true).map((data) => {
            return data._body;
        });
    }
}