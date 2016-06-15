import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition,ReportDefinitionDataSource} from '../../unientities';
import {ReportDefinitionDataSourceService} from './ReportDefinitionDataSourceService';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export class ReportService extends BizHttp<ReportDefinition> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = ReportDefinition.RelativeUrl;       
        this.DefaultOrderBy = null;
    }
        
    getReportTemplateAndData(name: string, inputparams: any) : Observable<any> {
        var template, self = this;
        return this.getReportTemplate(name)
            .concatMap((data: any) => {
                let [tmpl, rdID] = data;
                template = tmpl;
                return self.getReportDataFromSources(rdID, inputparams);
            })
            .map((data: any) => {
                return [template, [JSON.stringify(data)]];
            });
    }
    
    private getReportTemplate(name : string) : Observable<any> {
        var params = new URLSearchParams();
        params.set('filter', `Name eq '${name}'`);
        params.set('expand', '');
        
        return this.GetAllByUrlSearchParams(params).concatMap((results : Array<ReportDefinition>) => {
            var rd = results[0];
            // TODO: hack just now when not every report definition is done at backend
            if (rd == null) {
                rd = new ReportDefinition();
                rd.ID = 1;
                rd.TemplateLinkId = "CustomerInvoiceWithoutGiro.mrt";
            }
            return this.http.http.get(`/assets/reports/${rd.TemplateLinkId}`).map(res => [res.text(), rd.ID]);        
        });
    }   
   
    private getReportDataFromSources(rdID : number, inputparams : any) : Observable<any> {
        var self = this;
        var params = new URLSearchParams();
        params.set('filter', `ReportDefinitionId eq ${rdID}`);
 
        return this.datasource.GetAllByUrlSearchParams(params).map((sources : Array<ReportDefinitionDataSource>) => {
            var dataset = [];
            console.log("== SOURCES ==");
            sources.forEach((source : ReportDefinitionDataSource) => {
                source = new ReportDefinitionDataSource();
                source.DataSourceUrl = "/api/biz/invoices/{Id}?expand=Dimensions,Items,Items.Product,Items.VatType,Customer,Customer.Info,Customer.Info.Addresses,InvoiceReference";
                dataset.push(self.getReportData(source, inputparams));
            });
            return dataset;
        });      
    }
   
    private getReportData(source: ReportDefinitionDataSource, inputparams : any) : Observable<any> {
        return this.http.asGET().usingEmptyDomain().withEndPoint(source.DataSourceUrl.replace('{Id}', inputparams.Id.toString())).send();     
    }
}