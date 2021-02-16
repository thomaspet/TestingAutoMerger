import {EventEmitter, Injectable} from '@angular/core';
import {RequestMethod} from '@uni-framework/core/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, forkJoin, of, from} from 'rxjs';
import {StimulsoftReportWrapper} from '../../../framework/wrappers/reporting/reportWrapper';
import {ErrorService} from '../common/errorService';
import {EmailService} from '../common/emailService';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {ReportDefinition, ReportDefinitionParameter, ReportDefinitionDataSource, LocalDate} from '../../unientities';
import {environment} from 'src/environments/environment';
import {BehaviorSubject} from 'rxjs';
import {StatisticsService} from '@app/services/common/statisticsService';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable()
export class ReportService extends BizHttp<string> {
    private report: Report;
    private target: any;
    private format: string;
    private sendemail: SendEmail;
    private emailtoast: number;
    private parentModalIsClosed: boolean;

    progress$: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private reportGenerator: StimulsoftReportWrapper,
        private emailService: EmailService,
        private toastService: ToastService,
        private statisticsService: StatisticsService
    ) {
        super(http);
        this.relativeURL = 'report';
        this.entityType = null;
        this.DefaultOrderBy = null;
    }

    getDataSources(reportDefinitionID) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`report-definition-data-sources?filter=reportdefinitionid eq ${reportDefinitionID}`)
            .send()
            .map(res => res.body);
    }

    getReportTemplate(reportID: number) {
        return this.http.asGET()
            .usingRootDomain()
            .withEndPoint(`${this.relativeURL}/${reportID}`)
            .send()
            .map(response => response.body);
    }


    public generateReportFormat(format: string, report: ReportDefinition, doneHandler: (msg: string) => void = null) {
        this.format = format;
        this.report = <Report>report;
        this.target = null;
        this.sendemail = null;

        this.generateReport(doneHandler);
    }

    private generateReport(doneHandler: (msg: string) => void = null) {
        Observable.forkJoin([
            this.generateReportObservable(),
            this.getDataSourcesObservable()
        ]).subscribe(res => {
            this.onDataFetched(this.report.dataSources, doneHandler);
        });
    }

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
            .withEndPoint(`distributions?filter=StatusCode eq 30001 and EntityType eq '${entity}'&expand=Elements,Elements.ElementType`)
            .send()
            .map(res => res.body);
    }

    public getDistributions2Types(entity1: string, entity2: string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?filter=StatusCode eq 30001 and (EntityType eq '${entity1}' or EntityType eq '${entity2}')`)
            .send()
            .map(res => res.body);
    }

    public distribute(id, entityType) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=distribute&id=${id}&entityType=${entityType}`)
            .send()
            .map(res => res.body);
    }

    public distributeList(ids, entityType) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=distribute-list&ids=${ids}&entityType=${entityType}`)
            .send()
            .map(res => res.body);
    }

    public distributeWithType(id, entityType, distributionType) {
        const endpoint = `distributions?action=distribute-with-type`
            + `&id=${id}&distributiontype=${distributionType}&entityType=${entityType}`;

        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.body);
    }

    public distributeWithDate(id: number, entityType: string, distributeDate: LocalDate) {
        const endpoint = `distributions?action=distribute-with-date&id=${id}&entityType=${entityType}&distributeDate=${distributeDate}`;

        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.body);
    }

    public getEntitiesWithDistribution(ids, entityType: string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=entities-with-distribution`
            + `&entityIds=${ids}&entityType=${entityType}`)
            .send()
            .map(res => res.body);
    }

    public startReportProcess(reportDefinition, target: any, closeEmitter: EventEmitter<boolean>) {
        this.parentModalIsClosed = false;
        this.format = 'html';
        this.report = <Report>reportDefinition;
        this.target = target;
        this.sendemail = null;
        const s = closeEmitter.subscribe(() => {
            this.parentModalIsClosed = true;
            s.unsubscribe();
        });

        return forkJoin(
            this.generateReportObservable().do(() => {
                this.progress$.next(this.progress$.value + 25);
            }),
            this.getDataSourcesObservable().do(() => {
                this.progress$.next(this.progress$.value + 25);
            }),
            from(this.reportGenerator.loadLibraries()).pipe(
                tap(() => this.progress$.next(this.progress$.value + 25))
            )
        ).switchMap(() => {
            return this.renderReport();
        }).switchMap(renderedReport => {
            this.progress$.next(90);
            return this.renderHtml(renderedReport);
        }).finally(() => this.progress$.next(0));
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
        // REVISIT: quickfix for getting report data client side
        // instead of the api having to worry about it.
        // This function (the entire service tbh) should be refactored.
        return this.getDataSources(this.report.ID).switchMap(ds => {
            const datasources = ds || [];
            const params = this.report.parameters || [];

            const companyKey = this.report['companyKey'];
            if (companyKey) {
                this.http.appendHeaders({CompanyKey: companyKey});
            }

            const getData = (name, endpoint) => {
                return this.http.asGET()
                    .usingEmptyDomain()
                    .withEndPoint(endpoint)
                    .send(undefined, undefined, !companyKey).pipe(
                        catchError(err => {
                            console.error(err);
                            return of([]);
                        }),
                        map(res => {
                            return {
                                name: name,
                                data: res.body ? res.body : res
                            };
                        })
                    );
            };

            const requests = datasources.map(datasource => {
                let endpoint = datasource.DataSourceUrl;
                params.forEach(param => {
                    if (endpoint.includes(`{${param.Name}}`)) {
                        endpoint = endpoint.split(`{${param.Name}}`).join(param.value);
                    }
                });

                return getData(datasource.Name, endpoint);
            });

            return forkJoin(requests)
                .map(response => {
                    const data: any = {};
                    (response || []).forEach((obj: any) => {
                        data[obj.name] = obj.data;
                    });

                    this.report.dataSources = data;
                    if (!this.report.localization) {
                        this.getLocalizationOverride();
                    }
                })
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        });
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
            const logoKeyParam = <ReportParameter> {};
            logoKeyParam.Name = 'LogoUrl';
            logoKeyParam.value = environment.BASE_URL_FILES + '/api/public/image/?key='
                + this.http.authService.getCompanyKey()
                + '&id=logo';
            this.report.parameters.push(logoKeyParam);
        }
    }
}

export interface ReportParameter extends ReportDefinitionParameter {
    value: string;
}

export interface Report extends ReportDefinition {
    parameters: ReportParameter[];
    dataSources: ReportDefinitionDataSource[];
    templateJson: string;
    localization: string;
}
