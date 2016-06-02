import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource} from '../../unientities';
import {ReportDefinitionDataSourceService} from '../../services/services';

class ReportParameter extends ReportDefinitionParameter {
    public value: string;
}

class ReportDataSource extends ReportDefinitionDataSource {
    
}

class Report extends ReportDefinition {
    public parameters: ReportParameter[];
    public dataSources: ReportDataSource[];
    public templateJson: string;
}

@Injectable()
export class ReportDefinitionService extends BizHttp<ReportDefinition>{
    private report: Report;
    private target: any;
    private baseHttp: Http;
    constructor(
        public uniHttp: UniHttp,
        public reportDefinitionDataSourceService: ReportDefinitionDataSourceService) {

        super(uniHttp);
        this.baseHttp = this.uniHttp.http;
        this.relativeURL = ReportDefinition.RelativeUrl;
        this.DefaultOrderBy = 'Category';
    }

    public generateReportHtml(report: Report, target: any) {
        this.report = report;
        this.target = target;
        
        // get template
        this.baseHttp.get('/assets/ReportTemplates/' + report.TemplateLinkId)
            .map(res => res.text())
            .subscribe(template => {
                this.report.templateJson = template;
                this.onTemplateLoaded();
            },
            err => this.onError('Cannot load report template.\n\n' + err)
            );
    }  
    
    public onTemplateLoaded() {
        // get data source URLs 
        this.reportDefinitionDataSourceService.GetAll<ReportDataSource>('ReportDefinitionId=' + this.report.ID)
              .subscribe(dataSources => {
                  this.report.dataSources = dataSources;
                  this.onDataSourcesLoaded(); 
              },
              err => this.onError('Cannot get data sources.\n\m' + err) 
              );
    }

    public onDataSourcesLoaded() {
        // resolve placeholders in data source source URLs
        alert('fasza');
    }
    
    private onError(message: string) {
        alert(message);
    }
}
