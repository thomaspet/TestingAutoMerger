import { Component, Input, Output, OnInit, AfterViewInit, EventEmitter, SimpleChanges } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { StatisticsResponse } from '@app/models/StatisticsResponse';
import { ErrorService, YearService, ReportDefinitionParameterService, StatisticsService } from '@app/services/services';
import { ReportDefinitionParameter, ReportDefinition, LocalDate } from '@uni-entities';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-report-params-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 33vw">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

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

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.reject" class="bad" (click)="reject()">
                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
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

    private hasParameterDependency: boolean = false;
    private report: ExtendedReportDefinition;

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private yearService: YearService,
    ) { }

    accept() {
        const model = this.model$.getValue();

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
        this.initForm();
    }

    ngAfterViewInit() {
        setTimeout(function () {
            document.getElementById('good_button_ok').focus();
        });
    }

    onChangeEvent(changes: SimpleChanges) {
        if (this.hasParameterDependency) {
            const changedParamName: string = Object.keys(changes)[0];
            const changedParam = this.report.parameters.find(param => param.Name === changedParamName);
            changedParam.value = changes[changedParamName].currentValue;

            // find the changed param's idx in {this.report.parameters} to get which params to re-resolve
            const changedParamIdx = this.report.parameters.findIndex(param => param.Name === changedParamName);
            const paramsToBeResolved = this.report.parameters.slice(changedParamIdx + 1);
            this.resolveParamValues(paramsToBeResolved)
                .then(params => {
                    // only fields that has been re-resolved should be re-generated
                    let paramsIdx = 0;
                    const fields: UniFieldLayout[] = this.fields$.getValue();
                    for (let i = changedParamIdx + 1; i < this.report.parameters.length; i++) {
                        fields[i] = this.generateFields(params[paramsIdx]);
                        paramsIdx++;
                    }
                    this.fields$.next(fields);
                });
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
                    chunkOfQuerys.push(this.statisticsService.GetAll(`${query}`));
                    topSourceIndex++;
                }

                // This should be set as standard for reports?
                if (parameter.Name === 'System_PeriodAccountYear' || parameter.Name === 'PeriodAccountYear') {
                    this.yearService.getActiveYear().subscribe(year => params[i].value = '' + year);
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
                const searchParams = new URLSearchParams();
                searchParams.set('model', 'NumberSeries');
                searchParams.set('select', 'NextNumber');

                switch (param.Name) {
                    case 'InvoiceNumber':
                        searchParams.set('filter', 'Name eq \'Customer Invoice number series\'');
                        break;
                    case 'OrderNumber':
                        searchParams.set('filter', 'Name eq \'Customer Order number series\'');
                        break;
                    case 'QuoteNumber':
                        searchParams.set('filter', 'Name eq \'Customer Quote number series\'');
                        break;
                }

                // Get param value
                this.statisticsService.GetDataByUrlSearchParams(searchParams).subscribe((result: StatisticsResponse) => {
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
        switch (param.Type) {
            case 'Number':
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.NUMERIC,
                    Options: undefined,
                };
            case 'Boolean':
                param.DefaultValue = <any>(param.DefaultValue === 'true' || param.DefaultValue === '1');
                param.value = param.DefaultValue;
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.CHECKBOX,
                    Options: undefined,
                };
            case 'Dropdown':
                param.value = param.value || param.DefaultValue;
                if (param.DefaultValueList.includes('/api/statistics')) {
                    return <UniFieldLayout>{
                        Property: param.Name,
                        Label: param.Label,
                        FieldType: FieldType.DROPDOWN,
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
                    param.value = param.Name === 'OrderBy' ? source[0].Label : source[0].Value;
                    return <UniFieldLayout>{
                        Property: param.Name,
                        Label: param.Label,
                        FieldType: FieldType.DROPDOWN,
                        Options: {
                            source: source,
                            valueProperty: (param.Name === 'OrderBy') ? 'Label' : 'Value',
                            displayProperty: 'Label',
                            searchable: false,
                            hideDeleteButton: true,
                        },
                    };
                }
            case 'Date':
                param.value = param.DefaultValue || new LocalDate();
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Options: undefined,
                };
            default:
                return <UniFieldLayout>{
                    Property: param.Name,
                    Label: param.Label,
                    FieldType: FieldType.TEXT,
                    Options: undefined,
                };
        }
    }

    private initForm() {
        if (this.report) {
            this.busy = true;
            this.loadParams(this.report)
                .switchMap(loadedParams => this.resolveParamValues(loadedParams))
                .subscribe(resolvedParams => {
                    this.report.parameters = resolvedParams;
                    this.fields$.next(resolvedParams.map(param => this.generateFields(param)));
                    const model = this.model$.getValue();
                    resolvedParams.map(field => {
                        model[field.Name] = field.value;
                    });
                    this.model$.next(model);
                    this.busy = false;
                }, err => this.errorService.handle(err));
        }
    }

    private loadParams(report: ExtendedReportDefinition): Observable<ExtendedReportDefinitionParameter[]> {
        return this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .map(params => {
                if (!params || params.length === 0) {
                    throw new Error('Did not find any report definition parameters!');
                }
                return params;
            })
            .switchMap(params => Observable.fromPromise(this.fetchDefaultValues(params)));
    }

    private pickValueFromResult(param: ExtendedReportDefinitionParameter, result: any): any {
        if ((!!param.DefaultValue) || param.DefaultValue === '0') {
            if (result.hasOwnProperty(param.DefaultValue)) {
                return result[param.DefaultValue];
            }
            return param.DefaultValue;
        } else {
            for (const key in result) {
                if (result.hasOwnProperty(key)) {
                    return result[key];
                }
            }
        }
    }

    // find the value of the parameter that is requested and return a query string that replaces {ParameterName} by the current value
    private replaceParamWithValue(query: string, params: ExtendedReportDefinitionParameter[]): string {
        this.hasParameterDependency = true;
        const paramName = query.substring(query.indexOf('{') + 1, query.indexOf('}'));
        const param = params.find(parameter => parameter.Name === paramName)
            || this.report.parameters.find(parameter => parameter.Name === paramName);
        const paramValue: string | number = param.value || param.DefaultValue;
        return query.replace(`{${paramName}}`, paramValue.toString());
    }

    private resolveParamValues(params: ExtendedReportDefinitionParameter[]): Promise<ExtendedReportDefinitionParameter[]> {
        return this.resolvePromisesSequentially(params.map(param => () => {
            // check if parameter has an API source to get the list for dropdown
            if (param.Type === 'Dropdown' && param.DefaultValueList.includes('/api/statistics')) {
                const qIndex = param.DefaultValueList.indexOf('?');
                let query = qIndex >= 0 ? param.DefaultValueList.substr(qIndex + 1) : param.DefaultValueList;
                // check if the API source is dependent of another parameter, then written as {ParameterName} instead of the value
                // example => {PeriodID} in '/api/statistics?model=VatReport&select=ID&filter=TerminPeriodID eq {PeriodID}'
                if (query.includes('{')) {
                    query = this.replaceParamWithValue(query, params);
                }
                const valueProperty = JSON.parse(param.DefaultValueLookupType).ValueProperty;

                return this.statisticsService.GetAll(`${query}`)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .map((resp: StatisticsResponse) => resp.Data)
                    .map((data: any[]) => {
                        param.source = data;
                        param.value = data[0] ? data[0][valueProperty] : undefined;
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
}
