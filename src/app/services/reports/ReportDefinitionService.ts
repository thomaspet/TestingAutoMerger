import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {AppConfig} from '../../../app/AppConfig';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {StimulsoftReportWrapper} from '../../../framework/wrappers/reporting/reportWrapper';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource} from '../../unientities';
import {ReportDefinitionDataSourceService} from '../../services/services';

export class ReportParameter extends ReportDefinitionParameter {
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
    private format: string;
    
    constructor(
        private uniHttp: UniHttp,
        private reportDefinitionDataSourceService: ReportDefinitionDataSourceService,
        private reportGenerator: StimulsoftReportWrapper) {

        super(uniHttp);
        this.baseHttp = this.uniHttp.http;
        this.relativeURL = ReportDefinition.RelativeUrl;
        this.DefaultOrderBy = 'Category';
    }

    public generateReportHtml(report: ReportDefinition, target: any) {
        this.format = 'html';
        this.report = <Report>report;
        this.target = target;
       
        this.generateReport();
    }

    public generateReportPdf(report: ReportDefinition) {
        this.format = 'pdf';
        this.report = <Report>report;
       
        this.generateReport();
    }
           

    private generateReport() {
        // get template
        this.baseHttp.get('/assets/ReportTemplates/' + this.report.TemplateLinkId)
            .map(res => res.text())
            .subscribe(template => {
                this.report.templateJson = template;
                this.onTemplateLoaded();
            },
            err => this.onError('Cannot load report template.\n\n' + err)
            );
    }  
    
    private onTemplateLoaded() {
        // get data source URLs 
        this.reportDefinitionDataSourceService.GetAll<ReportDataSource>('filter=ReportDefinitionId eq ' + this.report.ID)
              .subscribe(dataSources => {
                  this.report.dataSources = dataSources;
                  this.onDataSourcesLoaded(); 
              },
              err => this.onError('Cannot get data sources.\n\m' + err) 
              );
    }

    private onDataSourcesLoaded() {
        // resolve placeholders first
        this.resolvePlaceholders();

        // create http requests
        let observableBatch = [];
        
        for (var ds of this.report.dataSources) {
            let url: string = (<ReportDataSource>ds).DataSourceUrl;
            
            url = url.replace(AppConfig.API_DOMAINS.BUSINESS, '');
            
            observableBatch.push(
                this.http
                .asGET()
                .withEndPoint(url)
                .send()
            );
        }
        
        Observable.forkJoin(observableBatch)
            .subscribe(data => this.onDataFetched(data),
            err => this.onError('Cannot load report data.\n\n' + err));
    }
    
    private onDataFetched(data: any) {
        let dataSources = [];
        
        for (let dataSource of data) {
            dataSources.push(JSON.stringify(dataSource));
        }
        
        if (this.format === 'html') {
            this.reportGenerator.showReport(this.report.templateJson, dataSources, this.target);
        } else if (this.format === 'pdf') {
            this.reportGenerator.printReport(this.report.templateJson, dataSources, true);
        }
    }
    
    private resolvePlaceholders() {
        // resolve placeholders in data source source URLs
        for (var p of this.report.parameters) {
            var parameter = <ReportParameter>p;        
            
            for (var ds of this.report.dataSources) {
                var datasSource = <ReportDataSource>ds;
                var searchString = '{' + parameter.Name + '}';
                
                datasSource.DataSourceUrl = datasSource.DataSourceUrl.replace(new RegExp(searchString, 'g'), parameter.value);
            }
        }
    }
    
    private onError(message: string) {
        alert(message);
    }
}
