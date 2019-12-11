import { Component, Input, Output, OnInit, AfterViewInit, EventEmitter, SimpleChanges } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

import { StatisticsResponse } from '@app/models/StatisticsResponse';
import {
    ErrorService,
    FinancialYearService,
    ReportDefinitionParameterService,
    StatisticsService,
    BrowserStorageService,
} from '@app/services/services';
import { ReportDefinitionParameter, ReportDefinition, LocalDate } from '@uni-entities';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UniReportComments, ReportCommentConfig, ReportCommentSetup } from '@app/components/reports/modals/parameter/reportComments';
import { UniReportSendModal } from './reportSendModal';
import { UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'uni-report-params-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 45rem">
            <header>{{options.header}}</header>

            <article [attr.aria-busy]="busy" class="modal-content">
                <p [innerHtml]="options.message"></p>

                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>

                <uni-form
                    [fields]="fields$"
                    [model]="model$"
                    [config]="formConfig$"
                    (changeEvent)="onChangeEvent($event)">
                </uni-form>
            </article>

            <div *ngIf="options?.data?.parameters?.length > 0" class="rememberForm">
                <mat-checkbox
                    tabindex="-1"
                    [(ngModel)]="rememberSelection"
                    (change)="onRememberChange()"
                    [labelPosition]="'after'"
                    [disableRipple]="true">
                        Husk utvalg
                </mat-checkbox>
            </div>

            <footer>
                <button *ngIf="options.buttonLabels.cancel" class="secondary pull-left" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>

                <button *ngIf="commentConfig" class="secondary" (click)="editComments()">
                    Kommentarer ({{comments?.length}})
                </button>

                <button class="secondary" (click)="trySend()">Epost</button>
                <button *ngIf="options.buttonLabels.accept" class="c2a" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>
            </footer>
        </section>
    `
})
export class UniReportParamsModal implements IUniModal, OnInit, AfterViewInit {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean = false;
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    model$: BehaviorSubject<any> = new BehaviorSubject({});
    commentConfig: ReportCommentConfig;
    comments: any[];
    rememberSelection: boolean = false;

    private browserStorageItemKey: string;
    private browserStorageReportParams: any;
    private hasParameterDependency: boolean = false;
    private report: ExtendedReportDefinition;
    private activeYear: number;

    constructor(
        private browserStorageService: BrowserStorageService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private uniModalService: UniModalService,
        private toastService: ToastService,
    ) {
        // Queries could give different results when changing current year
        this.financialYearService.lastSelectedFinancialYear$.subscribe((res) => {
            if (this.activeYear && this.activeYear != res.Year && !this.rememberSelection) {
                this.reportDefinitionParameterService.invalidateCache();
            }
            this.activeYear = res.Year;
        });
    }

    fetchEditedParams() {
        const model = this.model$.getValue();
         if (this.rememberSelection) {
             this.browserStorageService.setItemOnCompany(this.browserStorageItemKey, model);
         }

        this.report.parameters.map(param => {
            if (!model[param.Name] && param.Type === 'Number') {
                model[param.Name] = 0;
            }

            param.value = model[param.Name];

            if (param.Type === 'Boolean') {
                if (param.value === true) {
                    param.value = 1;
                } else {
                    param.value = 0;
                }
            } else if (param.Name === 'OrderBy') {
                const source: any[] = JSON.parse(param.DefaultValueList);
                const selectedSort = source.find(element => element.Label === param.value);

                if (selectedSort) {
                    selectedSort.Value.forEach(sortValue => {
                        switch (sortValue.Source) {
                            case 'OrderBy':
                                model['OrderBy'] = sortValue.Field;
                                break;
                            case 'OrderByGroup':
                                model['OrderByGroup'] = sortValue.Field;

                                const orderByGroup = <ExtendedReportDefinitionParameter>{
                                    Name: 'OrderByGroup',
                                    value: model['OrderByGroup']
                                };
                                this.report.parameters.push(orderByGroup);
                                break;
                        }
                    });
                }

                param.value = model[param.Name];
            }
        });
    }

    accept() {
        this.fetchEditedParams();
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Vis rapport',
                cancel: 'Avbryt'
            };
        }
        this.report = this.options.data;
        this.browserStorageItemKey = 'reportParamsForReportId:' + this.options.data.UniqueReportID;
        this.initForm();
    }

    ngAfterViewInit() {
        setTimeout(function () {
            document.getElementById('good_button_ok').focus();
        });
    }

    onChangeEvent(changes: SimpleChanges) {
        const changedParamName: string = Object.keys(changes)[0];
        if (this.hasParameterDependency) {
            const changedParam = this.report.parameters.find(param => param.Name === changedParamName);
            changedParam.value = changes[changedParamName].currentValue;

            // find the changed param's idx in {this.report.parameters} to get which params to re-resolve
            const changedParamIdx = this.report.parameters.findIndex(param => param.Name === changedParamName);
            const paramsToBeResolved = this.report.parameters.slice(changedParamIdx + 1);
            this.resolveParamValues(paramsToBeResolved, false)
                .then(params => {
                    // only fields that has been re-resolved should be re-generated
                    let paramsIdx = 0;
                    const fields: UniFieldLayout[] = this.fields$.getValue();
                    for (let i = changedParamIdx + 1; i < this.report.parameters.length; i++) {
                        fields[i] = this.generateFields(params[paramsIdx]);
                        paramsIdx++;
                    }
                    this.fields$.next(fields);

                    const model = this.model$.getValue();
                    params.map(param => {
                        model[param.Name] = param.value;
                    });
                    this.model$.next(model);
                });
        }
        if (this.commentConfig && this.commentConfig.filter.indexOf(`{${changedParamName}}`) >= 0) {
            this.loadComments();
        }
    }

    onRememberChange() {
        if (!this.rememberSelection) {
            this.browserStorageService.removeItemFromCompany(this.browserStorageItemKey);
            this.initForm();
        }
    }

    reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    private fetchDefaultValues(params: ExtendedReportDefinitionParameter[]): Promise<ExtendedReportDefinitionParameter[]> {
        return new Promise(resolve => {

            // Defaultvalue-parameter-queries defined in report?
            const chunkOfQuerys = [];
            let topSourceIndex = -1;
            for (let i = 0; i < params.length; i++) {
                const parameter = params[i];
                if (parameter.DefaultValueSource && !parameter.value) {
                    const qIndex = parameter.DefaultValueSource.indexOf('?');
                    const query = qIndex >= 0 ? parameter.DefaultValueSource.substr(qIndex + 1) : parameter.DefaultValueSource;
                    chunkOfQuerys.push(this.statisticsService.GetAllForCompany(`${query}`, this.report.companyKey));
                    topSourceIndex++;
                }

                // This should be set as standard for reports?
                if (parameter.Name === 'System_PeriodAccountYear' || parameter.Name === 'PeriodAccountYear' || parameter.Name === 'yr') {
                    params[i].value = '' + this.financialYearService.getActiveYear();
                }

                parameter.SourceIndex = topSourceIndex;
            }
            if (chunkOfQuerys.length > 0) {
                Observable.forkJoin(...chunkOfQuerys).subscribe((results: StatisticsResponse[]) => {
                    for (let i = 0; i < params.length; i++) {
                        const reportParam = params[i];
                        const dataset = reportParam.SourceIndex !== undefined ? results[reportParam.SourceIndex] : undefined;
                        // If the value already has been set (if the param field is year), skip it!
                        if (dataset && dataset.Success && dataset.Data.length > 0 && !params[i].value) {
                            params[i].value = this.pickValueFromResult(reportParam, dataset.Data[0]);
                        }
                    }
                    resolve(params);
                });
                return;
            }

            // Auto-detect default-value:
            const param: ExtendedReportDefinitionParameter = <any>params.find(
                x => ['InvoiceNumber', 'OrderNumber', 'QuoteNumber'].indexOf(x.Name) >= 0
            );
            if (param) {
                let searchParams = new HttpParams()
                    .set('model', 'NumberSeries')
                    .set('select', 'NextNumber');

                switch (param.Name) {
                    case 'InvoiceNumber':
                        searchParams = searchParams.set('filter', 'Name eq \'Customer Invoice number series\'');
                    break;
                    case 'OrderNumber':
                        searchParams = searchParams.set('filter', 'Name eq \'Customer Order number series\'');
                    break;
                    case 'QuoteNumber':
                        searchParams = searchParams.set('filter', 'Name eq \'Customer Quote number series\'');
                    break;
                }

                // Get param value
                this.statisticsService
                    .GetDataByHttpParamsForCompany(searchParams, this.report.companyKey)
                    .subscribe((result: StatisticsResponse) => {
                        const value = result.Data[0].NumberSeriesNextNumber - 1;
                        if (value > 0) { param.value = value; }
                        resolve(params);
                    }, err => this.errorService.handle(err));
            } else {
                resolve(params);
            }
        });
    }

    private generateFields(param: ExtendedReportDefinitionParameter): UniFieldLayout {
        switch (param.Type ? param.Type.toLowerCase() : '') {
            case 'number':
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.NUMERIC,
                    Hidden: !param.Visible,
                    Options: undefined,
                };
            case 'boolean':
                param.value = param.value === true || param.DefaultValue === 'true' || param.DefaultValue === '1';
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.CHECKBOX,
                    Hidden: !param.Visible,
                    Options: undefined,
                };
            case 'dropdown':
                param.value = param.value || param.DefaultValue;
                if (param.DefaultValueList.includes('/api/statistics')) {
                    return <UniFieldLayout>{
                        Property: param.Name,
                        Label: param.Label,
                        FieldType: FieldType.DROPDOWN,
                        Hidden: !param.Visible,
                        Options: {
                            source: param.source,
                            valueProperty: JSON.parse(param.DefaultValueLookupType).ValueProperty,
                            displayProperty: JSON.parse(param.DefaultValueLookupType).DisplayProperty,
                            searchable: false,
                            hideDeleteButton: true,
                        },
                    };
                } else {
                    const source = JSON.parse(param.DefaultValueList);
                    param.value = param.value || (param.Name === 'OrderBy' ? source[0].Label : source[0].Value);
                    return <UniFieldLayout>{
                        Property: param.Name,
                        Label: param.Label,
                        FieldType: FieldType.DROPDOWN,
                        Hidden: !param.Visible,
                        Options: {
                            source: source,
                            valueProperty: (param.Name === 'OrderBy') ? 'Label' : 'Value',
                            displayProperty: 'Label',
                            searchable: false,
                            hideDeleteButton: true,
                        },
                    };
                }
            case 'date':
                param.value = param.value || param.DefaultValue || new LocalDate();
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Hidden: !param.Visible,
                    Options: undefined,
                };
            case 'comment':
                this.commentConfig = this.commentConfig || { filter: param.DefaultValueLookupType };
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.TEXTAREA,
                    Hidden: true,
                    Options: undefined,
                };
            default:
                param.value = param.value ? param.value.toString() : undefined;
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.TEXT,
                    Hidden: !param.Visible,
                    Options: undefined,
                };
        }
    }

    private initForm() {
        if (this.report) {
            this.busy = true;
            this.loadParams(this.report)
                .switchMap(loadedParams => this.resolveParamValues(loadedParams, true))
                .subscribe(resolvedParams => {
                    this.report.parameters = resolvedParams;
                    this.fields$.next(resolvedParams.map(param => this.generateFields(param)));
                    const model = this.model$.getValue();
                    resolvedParams.map(param => {
                        model[param.Name] = param.value;
                    });
                    this.model$.next(model);
                    this.loadComments();
                    this.busy = false;
                }, err => this.errorService.handle(err));
        }
    }

    private loadComments() {
        if (!this.commentConfig) { return; }
        let filter = this.commentConfig.filter;
        let id: any = '0';
        if (filter.indexOf('{') >= 0) {
            filter = this.replaceQueryParamWithValue(filter, this.report.parameters);
        }
        if (filter.indexOf('/') >= 0) {
            const parts = filter.split('/');
            if (parts.length === 2) {
                id = parts[1];
                filter = parts[0];
            }
        }
        this.commentConfig.entity = filter;
        this.commentConfig.id = id;
        this.commentConfig.companyKey = this.report.companyKey;
        const query = `model=comment&select=id as ID,text as Text&filter=entitytype eq '${filter}' and entityid eq '${id}'`;
        this.statisticsService.GetAllForCompany(query, this.report.companyKey)
            .subscribe(res => {
                this.comments = res.Data;
            });
    }

    public editComments() {
        this.uniModalService.open(UniReportComments, {
            data: <ReportCommentSetup> {
                config: this.commentConfig, comments: this.comments
            }
        }).onClose.subscribe(commentsChanged => {
            if (commentsChanged) {
                this.loadComments();
            }
        });
    }

    public trySend() {

        // Should we get the contact-email from companysettings?
        const reportSelfKeyword = 'accounting';
        if (this.report && this.report.Category && this.report.Category.toLowerCase().indexOf(reportSelfKeyword) === 0) {
            const route = 'model=companysettings&select=defaultemail.emailaddress as Email'
                + '&join=&expand=defaultemail';
            // Fetch contact-email from exact company:
            this.statisticsService.GetAllForCompany(route, this.report.companyKey)
                .subscribe( result => {
                    let email;
                    if (result.Success && result.Data && result.Data.length > 0) {
                        email = result.Data[0].Email;
                    }
                    this.openAndSendReport(email);
                 });
            return;
        }
        this.openAndSendReport();
    }

    private openAndSendReport(receiver?: string) {
        this.fetchEditedParams();
        const isForm = !!this.report.ReportType;
        const formKey = this.report.parameters.length > 0 ? this.report.parameters[0].value : 0;
        const formKeyLabel = isForm && this.report.parameters.length > 0 ? ` ${this.report.parameters[0].value}` : '';
        const params = this.report.parameters.map( x => ({ Name: x.Name, value: x.value }));
        const options = {
            data: {
                model: {
                    EmailAddress: receiver,
                    Subject: `${this.report.Name}${formKeyLabel}`,
                    Message: `Vedlagt finner du '${this.report.Name}${formKeyLabel}'`,
                    ReportDefinition: this.report.Name
                },
                parameters: params,
                form: { Name: this.report.Name },
                company: this.report.company ? { CompanyName: this.report.company.Name } : undefined
            }
        };

        this.uniModalService.open(UniReportSendModal, options)
            .onClose.subscribe(email => {
                if (email) {
                    email.EntityType = this.getEntityTypeFromReport(this.report);
                    email.EntityID = formKey;
                    this.sendReport(
                        this.report.ID,
                        email,
                        params
                    );
                }
            });
    }

    private sendReport(reportID: number, details: any, parameters = null) {
        const http = this.statisticsService.GetHttp();
        const companyKey = this.report.companyKey;
        const route = 'emails/?action=send';

        const toast = this.toastService.addToast(
            'Sender e-post til ' + details.EmailAddress,
            ToastType.warn, 0,
            details.Subject
        );

        if (!parameters) {
            parameters = [];
            parameters.push({ Name: 'Id', value: details.EntityID });
        }

        parameters.push({
            Name: 'LogoUrl',
            value: environment.BASE_URL_FILES
                + '/api/image/?key='
                + http.authService.getCompanyKey() + '&id=logo'
        });

        const email = {
            ToAddresses: [details.EmailAddress],
            CopyAddress: details.SendCopy ? details.CopyAddress : '',
            Subject: details.Subject,
            Message: details.Message,
            ReportID: reportID,
            Parameters: parameters,
            EntityType: details.EntityType,
            EntityID: details.EntityID
        };

        if (companyKey) { http.appendHeaders({ CompanyKey: companyKey}); }
        return http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(route)
            .withBody(email)
            .send({}, undefined, !companyKey)
            .map(response => response.body)
            .subscribe((success) => {
            this.toastService.removeToast(toast);
            if (success) {
                this.toastService.addToast('E-post sendt', ToastType.good, ToastTime.short);
            } else {
                this.toastService.addToast('E-post ikke sendt',
                    ToastType.bad,
                    ToastTime.medium,
                    'Feilet i oppretting av jobb'
                );
            }
        }, err => {
            this.errorService.handle(err);
        });

    }

    private getEntityTypeFromReport(report: ExtendedReportDefinition) {
        switch (report.ReportType) {
            // case 1:
            //     return 'CustomerInvoice';
            // case 2:
            //     return 'CustomerOrder';
            // case 3:
            //     return 'CustomerQuote';
            default:
                return report.Name;
        }
    }

    private loadParams(report: ExtendedReportDefinition): Observable<ExtendedReportDefinitionParameter[]> {
        return this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .map(params => {
                if (!params || params.length === 0) {
                    return [];
                }
                return params;
            })
            .switchMap(params => {
                this.browserStorageReportParams = this.browserStorageService.getItemFromCompany(this.browserStorageItemKey);
                if (this.browserStorageReportParams) {
                    this.rememberSelection = true;
                    return Observable.of(params.map(param => {
                        param.value = this.browserStorageReportParams[param.Name];
                        return param;
                    }));
                } else {
                    return Observable.fromPromise(this.fetchDefaultValues(params));
                }
            });
    }

    private pickValueFromResult(param: ExtendedReportDefinitionParameter, result: any): any {
        if ((!!param.DefaultValue) || param.DefaultValue === '0') {
            if (result.hasOwnProperty(param.DefaultValue)) {
                return result[param.DefaultValue];
            }
            return param.DefaultValue;
        }
    }

    // find the value of the parameter that is requested and return a query string that replaces {ParameterName} by the current value
    private replaceQueryParamWithValue(query: string, params: ExtendedReportDefinitionParameter[]): string {
        this.hasParameterDependency = true;
        const paramName = query.substring(query.indexOf('{') + 1, query.indexOf('}'));
        const param = params.find(parameter => parameter.Name === paramName)
            || this.report.parameters.find(parameter => parameter.Name === paramName);
        const paramValue: string | number = param.value || param.DefaultValue;
        return query.replace(`{${paramName}}`, paramValue.toString());
    }

    private resolveParamValues(
        params: ExtendedReportDefinitionParameter[],
        isOnInit: boolean
    ): Promise<ExtendedReportDefinitionParameter[]> {
        return this.resolvePromisesSequentially(params.map(param => () => {
            // check if parameter has an API source to get the list for dropdown
            if (param.Type === 'Dropdown' && param.DefaultValueList.includes('/api/statistics')) {
                const qIndex = param.DefaultValueList.indexOf('?');
                let query = qIndex >= 0 ? param.DefaultValueList.substr(qIndex + 1) : param.DefaultValueList;
                // check if the API source is dependent of another parameter, then written as {ParameterName} instead of the value
                // example => {PeriodID} in '/api/statistics?model=VatReport&select=ID&filter=TerminPeriodID eq {PeriodID}'
                if (query.includes('{')) {
                    query = this.replaceQueryParamWithValue(query, params);
                }
                return this.statisticsService.GetAllForCompany(`${query}`, this.report.companyKey)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .map((resp: StatisticsResponse) => resp.Data)
                    .map((data: any[]) => {
                        param.source = data;
                        if (data && data[0] && (!isOnInit || !this.browserStorageReportParams)) {
                            param.value = data[0][JSON.parse(param.DefaultValueLookupType).ValueProperty];
                        }
                        return param;
                    }).toPromise();
            }
            return Promise.resolve(param);
        }));
    }

    // executes Promises sequentially
    // {functions} = An array of funcs that return promises
    private resolvePromisesSequentially<T>(functions: Array<() => Promise<T>>): Promise<Array<T>> {
        const reducer = (promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result)));
        return functions.reduce(reducer, Promise.resolve([]));
    }

}



interface ExtendedReportDefinitionParameter extends ReportDefinitionParameter {
    value?: any;
    source?: any[];
    SourceIndex?: number;
}

interface ExtendedReportDefinition extends ReportDefinition {
    parameters?: ExtendedReportDefinitionParameter[];
    companyKey?: string;
    company?: any;
}
