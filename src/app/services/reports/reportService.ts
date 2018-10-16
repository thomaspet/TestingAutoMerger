import {EventEmitter, Injectable} from '@angular/core';
import {RequestMethod} from '@angular/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {StimulsoftReportWrapper} from '../../../framework/wrappers/reporting/reportWrapper';
import {ErrorService} from '../common/errorService';
import {EmailService} from '../common/emailService';
import {ReportDefinitionService} from '../reports/reportDefinitionService';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource} from '../../unientities';
import {environment} from 'src/environments/environment';
import {AuthService} from '../../authService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReportStep} from '@app/components/reports/report-step';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {StatisticsService} from '@app/services/common/statisticsService';

@Injectable()
export class ReportService extends BizHttp<string> {
    private report: Report;
    private target: any;
    private format: string;
    private sendemail: SendEmail;
    private emailtoast: number;
    private parentModalIsClosed: boolean;

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private reportGenerator: StimulsoftReportWrapper,
        private emailService: EmailService,
        private toastService: ToastService,
        private reportDefinitionService: ReportDefinitionService,
        private authService: AuthService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService
    ) {
        super(http);

        this.relativeURL = 'report';
        this.entityType = null;
        this.DefaultOrderBy = null;
    }

    //
    // Get report template and datasources
    //

    public getReportTemplate(reportId) {
        return this.http.asGET()
            .usingRootDomain()
            .withEndPoint(`${this.relativeURL}/${reportId}`)
            .send()
            .map(response => response.json());
    }

    public getReportData(reportId, properties, companyKey?: string) {
        // Map to object if its a property list
        if (properties instanceof Array) {
            const params = properties;
            properties = {};
            params.forEach(param => {
                properties[param.Name] = param.value;
            });
        }

        if (companyKey) { this.http.appendHeaders( { CompanyKey: companyKey }); }
        return this.http.asPOST()
            .usingRootDomain()
            .withEndPoint(`${this.relativeURL}/${reportId}`)
            .withBody(properties)
            .send(undefined, undefined, !companyKey)
            .map(response => response.json());
    }

    //
    // Generate report
    //

    public generateReportFormat(format: string, report: ReportDefinition, doneHandler: (msg: string) => void = null) {
        this.format = format;
        this.report = <Report>report;
        this.target = null;
        this.sendemail = null;

        this.generateReport(doneHandler);
    }

    public generateReportHtml(report: ReportDefinition, target: any, doneHandler: (msg: string) => void = null) {
        this.format = 'html';
        this.report = <Report>report;
        this.target = target;
        this.sendemail = null;

        this.generateReport(doneHandler); // startReportProccess()
    }

    public generateReportPdf(report: ReportDefinition, doneHandler: (msg: string) => void = null) {
        this.format = 'pdf';
        this.report = <Report>report;
        this.target = null;
        this.sendemail = null;

        this.generateReport(doneHandler);
    }

    public generateReportPdfFile(report: ReportDefinition): Observable<string> {
        this.report = <Report>report;
        return this.generateReportObservable()
            .switchMap(dataSources => this.getDataSourcesObservable())
            .switchMap((response: { dataSources: any }) =>
                this.reportGenerator.printReport(
                    this.report.templateJson,
                    this.report.dataSources,
                    this.report.parameters,
                    false, 'pdf',
                    this.report.localization
                )
            );
    }

    public generateReportSendEmail(name: string, sendemail: SendEmail, parameters = null, doneHandler: (msg: string) => void = null) {
        if (!sendemail.EmailAddress || sendemail.EmailAddress.indexOf('@') <= 0) {
            this.toastService.addToast(
                'Sending feilet',
                ToastType.bad, 3,
                'Sending av e-post feilet grunnet manglende e-postadresse'
            );

            if (doneHandler) {
                doneHandler('Sending feilet');
            }
        } else {
            this.emailtoast = this.toastService.addToast(
                'Sender e-post til ' + sendemail.EmailAddress, ToastType.warn, 0, sendemail.Subject
            );

            this.reportDefinitionService.getReportByName(name).subscribe((report) => {
                report.parameters = [{ Name: 'Id', value: sendemail.EntityID }];
                if (parameters) { report.parameters = report.parameters.concat(parameters); }

                this.format = sendemail.Format;
                this.report = <Report>report;
                this.target = null;
                this.sendemail = sendemail;
                this.generateReport(doneHandler);
            }, err => this.errorService.handle(err));
        }
    }

    private generateReport(doneHandler: (msg: string) => void = null) {
        Observable.forkJoin([
            this.generateReportObservable(),
            this.getDataSourcesObservable()
        ]).subscribe(res => {
            this.onDataFetched(this.report.dataSources, doneHandler);
        });
    }

    // private startSteps() {
    //     return new Promise((resolve, reject) => {
    //         if (this.parentModalIsClosed) {
    //             reject();
    //         }
    //         this.steps$.next(new ReportStep());
    //         setTimeout(() => {
    //             resolve(true);
    //         }, 100);
    //     });
    // }

    // private runStep(stepKey: string) {
    //     return new Promise((resolve, reject) => {
    //         if (this.parentModalIsClosed) {
    //             reject();
    //         }
    //         const steps = this.steps$.getValue().Steps;
    //         steps[stepKey] = true;
    //         this.steps$.next(new ReportStep(steps));
    //         setTimeout(() => {
    //             resolve(true);
    //         }, 100);
    //     });
    // }

    // private getData() {
    //     return Observable.forkJoin([
    //         this.generateReportObservable(),
    //         this.getDataSourcesObservable()
    //     ]).toPromise();
    // }

    // private loadLibraries() {
    //     return this.reportGenerator.loadLibraries();
    // }

    private renderReport() {
        return new Promise((resolve, reject) => {
            if (this.parentModalIsClosed) {
                reject();
            }
            this.reportGenerator.renderReport(
                this.report.templateJson,
                this.report.dataSources,
                this.report.parameters,
                this.report.localization,
                resolve
            );
        });
    }

    public getDistributions(entity: string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?filter=StatusCode eq 30001 and EntityType eq '${entity}'`)
            .send()
            .map(res => res.json());
    }

    public distribute(id, type) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=distribute&id=${id}&entityType=${type}`)
            .send()
            .map(res => res.json());
    }

    public distributeWithType(id, type, disttype) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=distribute-with-type&id=${id}&distributiontype=${disttype}&entityType=${type}`)
            .send()
            .map(res => res.json());
    }

    private renderHtml(report) {
        return new Promise((resolve, reject) => {
            if (!report) {
                reject();
            }
            if (this.parentModalIsClosed) {
                reject();
            }
            this.reportGenerator.renderHtml(report, resolve);
        });
    }

    public startReportProcess(reportDefinition, target: any, closeEmitter: EventEmitter<boolean>) {
        this.parentModalIsClosed = false;
        this.format = 'html';
        this.report = <Report>reportDefinition;
        this.target = target;
        this.sendemail = null;
        const s = closeEmitter.subscribe(() => {
            this.parentModalIsClosed = true;
            const styleNode = document.getElementById('StiViewerStyles');
            styleNode.parentNode.removeChild(styleNode);
            s.unsubscribe();
        });

        return Observable.forkJoin(
            this.generateReportObservable(),
            this.getDataSourcesObservable(),
            this.reportGenerator.loadLibraries()
        ).switchMap(() => {
            return this.renderReport();
        }).switchMap(renderedReport => {
            return this.renderHtml(renderedReport);

            // return Promise.reject('Nope');
        });

        // return this.startSteps()
        //     .then(() => this.runStep('FETCHING_DATA'))
        //     .then(() => this.getData())
        //     .then(() => this.runStep('DATA_FETCHED'))
        //     .then(() => this.runStep('LOADING_LIBRARIES'))
        //     .then(() => this.loadLibraries())
        //     .then(() => this.runStep('LIBRARIES_LOADED'))
        //     .then(() => this.runStep('RENDERING_REPORT'))
        //     .then(() => this.renderReport())
        //     .then((renderedReport) => report = renderedReport)
        //     .then(() => this.runStep('REPORT_RENDERED'))
        //     .then(() => this.runStep('RENDERING_HTML'))
        //     .then(() => this.renderHtml(report))
        //     .then(() => this.runStep('HTML_RENDERED'))
        //     .catch(() => {
        //         // we don't have to do anything when the process is interrupt
        //         // but I put that here to remember that this process
        //         // have rejections inside the methods
        //     });
    }

    private generateReportObservable() {
        // Add logo url to report
        this.addLogoUrl();

        return this.getReportTemplate(this.report.ID)
            .map(template => {
                this.report.templateJson = template;
            });
    }

    private getCustomerLocalizationOverride(entity: string) {
        if (this.report.dataSources[entity] && this.report.dataSources[entity][0]) {
            let obs;

            if (entity === 'CustomerInvoice' && this.report.Name === 'Purring') {
                const customerNumber = this.report.dataSources[entity][0].CustomerCustomerNumber;
                obs = this.statisticsService
                    .GetAllUnwrapped(`model=Customer&select=Localization as Localization&filter=CustomerNumber eq ${customerNumber}`);
            } else {
                const customerID = this.report.dataSources[entity][0].CustomerID;
                if (!customerID) {
                    return;
                }
                obs = this.statisticsService
                    .GetAllUnwrapped(`model=Customer&select=Localization as Localization&filter=ID eq ${customerID}`);
            }

            obs.subscribe((res) => {
                if (res[0].Localization) {
                    this.report.localization = res[0].Localization;
                }
            });
        }
    }

    private getLocalizationOverride() {
        // Override localization from CompanySettings?
        if (this.report.dataSources['CompanySettings'] && this.report.dataSources['CompanySettings'][0]) {
            if (this.report.dataSources['CompanySettings'][0].Localization) {
                this.report.localization = this.report.dataSources['CompanySettings'][0].Localization;
            }
        }
        // Override localization from Customer?
        ['CustomerInvoice', 'CustomerOrder', 'CustomerQuote'].forEach(entity => {
            this.getCustomerLocalizationOverride(entity);
        });
    }

    private getDataSourcesObservable(): Observable<any> {
        return this.getReportData(this.report.ID, this.report.parameters, this.report['companyKey'])
            .map(dataSources => {
                this.report.dataSources = dataSources;
                if (!this.report.localization) {
                    this.getLocalizationOverride();
                }
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public onDataFetched(dataSources: any, doneHandler: (msg: string) => void = null) {
        // uncomment this line to get the actual JSON being sent to the report - quite usefull when developing reports..
        // console.log('DATA: ', JSON.stringify(dataSources));

        if (this.target) {
            this.reportGenerator.showReport(
                this.report.templateJson, dataSources,
                this.report.parameters, this.report.localization,
                this.target
            );
            if (doneHandler) { doneHandler(''); }
        } else {
            this.reportGenerator.printReport(
                this.report.templateJson, dataSources,
                this.report.parameters, !this.sendemail,
                this.format,
                this.report.localization
            ).then(attachment => {
                if (this.sendemail) {
                    const body = {
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
                        this.toastService.addToast('E-post sendt', ToastType.good, 3);
                        if (doneHandler) { doneHandler('E-post sendt'); }
                    }, err => {
                        if (doneHandler) { doneHandler('Feil oppstod ved sending av e-post'); }
                        this.errorService.handle(err);
                    });
                }
            });
        }
    }

    private addLogoUrl() {
        if (this.report.parameters) {
            const logoKeyParam = new CustomReportDefinitionParameter();
            logoKeyParam.Name = 'LogoUrl';
            logoKeyParam.value = environment.BASE_URL_FILES + '/api/image/?key=' + this.http.authService.getCompanyKey() + '&id=logo';
            this.report.parameters.push(logoKeyParam);
        }
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
    public localization: string;
}
