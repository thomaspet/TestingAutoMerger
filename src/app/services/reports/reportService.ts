import {Injectable} from '@angular/core';
import {RequestMethod} from '@angular/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams, ResponseContentType, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {StimulsoftReportWrapper} from '../../../framework/wrappers/reporting/reportWrapper';
import {ErrorService} from '../common/errorService';
import {EmailService} from '../common/emailService';
import {ReportDefinitionService} from '../reports/reportDefinitionService';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource} from '../../unientities';
import {AppConfig} from '../../AppConfig';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class ReportService extends BizHttp<string> {
    private report: Report;
    private target: any;
    private format: string;
    private sendemail: SendEmail;
    private emailtoast: number;

    constructor(http: UniHttp, authService: AuthService,
        private errorService: ErrorService,
        private reportGenerator: StimulsoftReportWrapper,
        private emailService: EmailService,
        private toastService: ToastService,
        private reportDefinitionService: ReportDefinitionService) {
        super(http, authService);

        this.relativeURL = 'report';
        this.entityType = null;
        this.DefaultOrderBy = null;
    }

    //
    // Get report template and datasources
    //

    public getReportTemplate(reportId): Observable<any> {
        return this.http.asGET()
        .usingRootDomain()
        .withEndPoint(`${this.relativeURL}/${reportId}`)
        .send()
        .map(response => response.json());
    }

    public getReportData(reportId, properties): Observable<any> {
        // Map to object if its a property list
        if (properties instanceof Array) {
            let params = properties;
            properties = {};
            params.forEach(param => {
                properties[param.Name] = param.value;
            });
        }

        return this.http.asPOST()
        .usingRootDomain()
        .withEndPoint(`${this.relativeURL}/${reportId}`)
        .withBody(properties)
        .send()
        .map(response => response.json())
    }

    //
    // Generate report
    //

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
            .switchMap(dataSources => this.getDataSourcesObservable())
            .map((response: { dataSources: any }) =>
                this.reportGenerator
                    .printReport(this.report.templateJson, response.dataSources, this.report.parameters, false, 'pdf'));
    }

    public generateReportSendEmail(name: string, sendemail: SendEmail, parameters = null) {
        if (sendemail.EmailAddress.indexOf('@') <= 0) {
            this.toastService.addToast('Sending av epost feilet', ToastType.bad, 3, 'Grunnet manglende epostadresse');
        } else {
            this.emailtoast = this.toastService.addToast('Sender epost til ' + sendemail.EmailAddress, ToastType.warn, 0, sendemail.Subject);

            this.reportDefinitionService.getReportByName(name).subscribe((report) => {
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
        Observable.forkJoin([
            this.generateReportObservable(),
            this.getDataSourcesObservable()
        ]).subscribe(res => {
            this.onDataFetched(this.report.dataSources);
        });
    }

    private generateReportObservable() {
        // Add logo url to report
        this.addLogoUrl();

        return this.getReportTemplate(this.report.ID)
            .map(template => {
                this.report.templateJson = template;
            });
    }

    private getDataSourcesObservable(): Observable<any> {
        return this.getReportData(this.report.ID, this.report.parameters)
            .map(dataSources => {
                this.report.dataSources = dataSources;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private onDataFetched(dataSources: any) {
        // uncomment this line to get the actual JSON being sent to the report - quite usefull when developing reports..
        // console.log('DATA: ', JSON.stringify(dataSources));

        if (this.target) {
            this.reportGenerator.showReport(this.report.templateJson, dataSources, this.report.parameters, this.target);
        } else {
            var attachment = this.reportGenerator.printReport(this.report.templateJson, dataSources, this.report.parameters, !this.sendemail, this.format);

            if (this.sendemail) {
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
    }

    private addLogoUrl() {
        let logoKeyParam = new CustomReportDefinitionParameter();
        logoKeyParam.Name = 'LogoUrl';
        logoKeyParam.value = AppConfig.BASE_URL_FILES + 'image/?key=' + this.authService.getCompanyKey() + '&id=logo';
        this.report.parameters.push(logoKeyParam);
    }
}

class ReportDataSource extends ReportDefinitionDataSource {

}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}

export class ReportParameter extends ReportDefinitionParameter {
    public value: string;
}

export class Report extends ReportDefinition {
    public parameters: ReportParameter[];
    public dataSources: ReportDataSource[];
    public templateJson: string;
}