import { Http, RequestMethod } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import {AppConfig} from '../../appConfig';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {StimulsoftReportWrapper} from '../../../framework/wrappers/reporting/reportWrapper';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource} from '../../unientities';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {ReportDefinitionDataSourceService} from './reportDefinitionDataSourceService';
import {EmailService} from '../common/emailService';
import {SendEmail} from '../../models/sendEmail';
import {AuthService} from '../../../framework/core/authService';
import {ErrorService} from '../common/errorService';


export class ReportParameter extends ReportDefinitionParameter {
    public value: string;
}

class ReportDataSource extends ReportDefinitionDataSource {

}

export class Report extends ReportDefinition {
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
    private sendemail: SendEmail;
    private emailtoast: number;

    constructor(
        private uniHttp: UniHttp,
        private reportDefinitionDataSourceService: ReportDefinitionDataSourceService,
        private reportGenerator: StimulsoftReportWrapper,
        private emailService: EmailService,
        private toastService: ToastService,
        authService: AuthService,
        private errorService: ErrorService
    ) {

        super(uniHttp, authService);
        this.baseHttp = this.uniHttp.http;
        this.relativeURL = ReportDefinition.RelativeUrl;
        this.entityType = ReportDefinition.EntityType;
        this.DefaultOrderBy = 'Category';
    }

    public getReportByName(name: string): Observable<any> {
        return this.GetAll(`filter=Name eq '${name}'`).map((reports) => {
            return reports[0];
        });
    }

    public generateReportHtml(report: ReportDefinition, target: any) {
        this.format = 'html';
        this.report = <Report>report;
        this.target = target;
        this.sendemail = null;

        this.generateReport();
    }

    public generateReportPdf(report: ReportDefinition) {
        this.format = 'pdf';
        this.report = <Report>report;
        this.target = null;
        this.sendemail = null;

        this.generateReport();
    }

    public generateReportPdfFile(report: ReportDefinition): Observable<string> {
        this.report = <Report>report;
        return this.generateReportObservable()
            .switchMap(templates => this.getDataSourcesObservable())
            .switchMap(dataSources => this.getDataFromSourcesObservable())
            .map((response: { data: any, dataSources: any }) =>
                this.reportGenerator
                    .printReport(this.report.templateJson, response.dataSources, this.report.parameters, false, 'pdf'));
    }

    public generateReportSendEmail(name: string, sendemail: SendEmail, parameters = null) {
        if (sendemail.EmailAddress.indexOf('@') <= 0) {
            this.toastService.addToast('Sending av epost feilet', ToastType.bad, 3, 'Grunnet manglende epostadresse');
        } else {
            this.emailtoast = this.toastService.addToast('Sender epost til ' + sendemail.EmailAddress, ToastType.warn, 0, sendemail.Subject);

            this.getReportByName(name).subscribe((report) => {
                report.parameters = [{ Name: 'Id', value: sendemail.EntityID }];
                if (parameters) { report.parameters = report.parameters.concat(parameters); }

                this.format = sendemail.Format;
                this.report = <Report>report;
                this.target = null;
                this.sendemail = sendemail;
                this.generateReport();
            }, err => this.errorService.handle(err));
        }
    }

    private generateReport() {
        this.generateReportObservable()
            .subscribe(template => {
                this.getDataSources();
            });
    }

    private generateReportObservable() {
        // Add logo url to report
        this.addLogoUrl();

        // get template
        return this.baseHttp.get('/assets/ReportTemplates/' + this.report.TemplateLinkId)
            .map(res => res.text())
            .map(template => {
                this.report.templateJson = template;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getDataSources() {
        // get data source URLs
        this.getDataSourcesObservable().subscribe(dataSources => {
            this.getDataFromSources();
        });
    }

    private getDataSourcesObservable(): Observable<ReportDataSource[]> {
        // get data source URLs
        return this.reportDefinitionDataSourceService.GetAll<ReportDataSource>(`filter=ReportDefinitionId eq ${this.report.ID}`)
            .map(dataSources => {
                this.report.dataSources = dataSources;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getDataFromSources() {
        // resolve placeholders first
        this.resolvePlaceholders();

        // create http requests
        let observableBatch = [];

        for (const ds of this.report.dataSources) {
            let url: string = ds.DataSourceUrl;

            observableBatch.push(
                this.http
                    .asGET()
                    .usingEmptyDomain()
                    .withEndPoint(url)
                    .send()
                    .map(response => response.json())
            );
        }

        this.getDataFromSourcesObservable()
            .subscribe((response: { data: any, dataSources: any }) => this.onDataFetched(response.data, response.dataSources));
    }

    private getDataFromSourcesObservable() {
        // resolve placeholders first
        this.resolvePlaceholders();

        // create http requests
        let observableBatch = [];

        for (const ds of this.report.dataSources) {
            let url: string = ds.DataSourceUrl;

            observableBatch.push(
                this.http
                    .asGET()
                    .usingEmptyDomain()
                    .withEndPoint(url)
                    .send()
                    .map(response => response.json())
            );
        }

        return Observable.forkJoin(observableBatch)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map(data => {
                return { data: data, dataSources: this.prepareDataSources(data) };
            }, err => this.errorService.handle(err));
    }

    private prepareDataSources(data: any): any {
        let dataSources = {};
        for (let i = 0; i < data.length; i++) {
            let name = this.report.dataSources[i].Name;
            dataSources[name] = data[i];
        }
        return dataSources;
    }

    private onDataFetched(data: any, dataSources: any) {
        // uncomment this line to get the actual JSON being sent to the report - quite usefull when developing reports..
        // console.log('DATA: ', JSON.stringify(dataSources));

        if (this.target) {
            this.reportGenerator.showReport(this.report.templateJson, dataSources, this.report.parameters, this.target);
        } else {
            var attachment = this.reportGenerator.printReport(this.report.templateJson, dataSources, this.report.parameters, !this.sendemail, this.format);

            let body = {
                ToAddresses: [this.sendemail.EmailAddress],
                CopyAddress: this.sendemail.SendCopy ? this.sendemail.CopyAddress : '',
                Subject: this.sendemail.Subject,
                Message: this.sendemail.Message,
                Attachments: [{
                    Attachment: attachment,
                    FileName: this.sendemail.Subject + '.' + this.format
                }],
                EntityType: this.sendemail.EntityType,
                EntityID: this.sendemail.EntityID
            };

            this.emailService.ActionWithBody(null, body, 'send', RequestMethod.Post).subscribe(() => {
                this.toastService.removeToast(this.emailtoast);
                this.toastService.addToast('Epost sendt', ToastType.good, 3);
            }, err => this.errorService.handle(err));
        }
    }

    private resolvePlaceholders() {
        // resolve placeholders in data source source URLs
        for (const parameter of this.report.parameters) {
            for (const datasSource of this.report.dataSources) {
                const searchString = '{' + parameter.Name + '}';
                datasSource.DataSourceUrl = datasSource.DataSourceUrl.replace(new RegExp(searchString, 'g'), parameter.value);
            }
        }
    }

    private addLogoUrl() {
        let logoKeyParam = new CustomReportDefinitionParameter();
        logoKeyParam.Name = 'LogoUrl';
        logoKeyParam.value = AppConfig.BASE_URL_FILES + 'image/?key=' + this.authService.getCompanyKey() + '&id=logo';
        this.report.parameters.push(logoKeyParam);
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
