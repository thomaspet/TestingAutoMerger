import {Component, Input, Output, OnInit, AfterViewInit, EventEmitter} from '@angular/core';
import {UniModalService} from '@uni-framework/uniModal/modalService';
import {ErrorService, YearService, ReportDefinitionParameterService, StatisticsService} from '@app/services/services';
import {Http, URLSearchParams} from '@angular/http';
import {ReportDefinitionParameter, ReportDefinition, LocalDate} from '@uni-entities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniForm, FieldType} from '@uni-framework/ui/uniform';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uniModal/interfaces';

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
                    [config]="formConfig$">
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
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public busy: boolean = false;

    // Parameter form
    private model$: BehaviorSubject<any> = new BehaviorSubject({});
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private http: Http,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private yearService: YearService,
    ) {}

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Vis rapport',
                cancel: 'Avbryt'
            };
        }

        if (this.options && this.options.data) {
            this.busy = true;
            this.loadParameters(this.options.data).then(() => {
                this.fields$.next(this.options.data.parameters.map(p => {
                    let type;
                    let options;

                    switch (p.Type) {
                        case 'Number':
                            type = FieldType.NUMERIC;
                            break;
                        case 'Boolean':
                            type = FieldType.CHECKBOX;
                            p.DefaultValue = (p.DefaultValue === 'true');
                            p.value = p.DefaultValue;
                            break;
                        case 'Dropdown':
                            type = FieldType.DROPDOWN;
                            let source = p.DefaultValueList ? JSON.parse(p.DefaultValueList) : p.DefaultValueSourceData || [];
                            p.value = p.DefaultValue;
                            if (source.length > 0) {
                                p.value = p.Name === 'OrderBy' ? source[0].Label : source[0].Value;
                            }
                            options = {
                                source: source,
                                valueProperty: (p.Name === 'OrderBy') ? 'Label' : 'Value',
                                displayProperty: 'Label',
                                searchable: false,
                                hideDeleteButton: true,
                            };
                            break;
                        case 'Date':
                            type = FieldType.LOCAL_DATE_PICKER;
                            p.value = p.Defaultvalue || new LocalDate();
                            break;
                        default:
                            type = FieldType.TEXT;
                            break;
                    }

                    // Check for system values
                    if (p.Name.includes('System_')) {
                        switch (p.Name.split('_')[1]) {
                            case 'PeriodAccountYear':
                                this.yearService.getActiveYear().subscribe(res => p.value = res.toString());
                                break;
                        }
                    }

                    return {
                        Property: p.Name,
                        Label: p.Label,
                        FieldType: type,
                        Options: options
                    };
                }));

                const model = {};
                this.options.data.parameters.map(p => {
                    model[p.Name] = p.value;
                });

                this.model$.next(model);

                this.busy = false;
            });
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public accept() {
        const model = this.model$.getValue();

        this.options.data.parameters.map(p => {
            if (!model[p.Name] && p.Type === 'Number') {
                model[p.Name] = 0;
            }

            p.value = model[p.Name];

            if (p.Name === 'HideAccounts') {
                if (p.value === true) {
                    p. value = 1;
                } else {
                    p. value = 0;
                }
            } else if (p.Name === 'OrderBy') {
                const source: any[] = JSON.parse(p.DefaultValueList);
                const selectedSort = source.find(element => element.Label === p.value);

                if (selectedSort) {
                    selectedSort.Value.forEach(sortValue => {
                        switch (sortValue.Source) {
                            case 'OrderBy':
                                model['OrderBy'] = sortValue.Field;
                                break;
                            case 'OrderByGroup':
                                model['OrderByGroup'] = sortValue.Field;

                                const orderByGroup = {
                                    Name: 'OrderByGroup',
                                    value: model['OrderByGroup']
                                };
                                this.options.data.parameters.push(orderByGroup);
                                break;
                        }
                    });
                }

                p.value = model[p.Name];
            }
        });

        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    private loadParameters(report: IExtendedReportDefinition) {
        return new Promise( (resolve, rejest) => {

            this.reportDefinitionParameterService.GetAll(
                'filter=ReportDefinitionId eq ' + report.ID
            )
            .subscribe(params => {
                if (params && params.length > 0) {
                    this.fetchDefaultValues(params).then( updatedParams => {
                        report.parameters = <any>updatedParams;
                        resolve(true);
                    });
                } else {
                    resolve(true);
                }
            }, err => { this.errorService.handle(err); resolve(false); });
        });
    }

    private fetchDefaultValues(params: Array<IParameterDto >): Promise<Array<IParameterDto >> {
        return new Promise( (resolve, reject) => {

            // Defaultvalue-parameter-queries defined in report?
            const chunkOfQuerys = [];
            let topSourceIndex = -1;
            for (let i = 0; i < params.length; i++) {
                const par: { DefaultValueSource?: string, SourceIndex?: number} = params[i];
                if (par.DefaultValueSource) {
                    const qIndex = par.DefaultValueSource.indexOf('?');
                    const query = qIndex >= 0 ? par.DefaultValueSource.substr(qIndex + 1) : par.DefaultValueSource;
                    chunkOfQuerys.push(this.statisticsService.GetAll(`${query}`));
                    topSourceIndex++;
                }
                par.SourceIndex = topSourceIndex;
            }
            if (chunkOfQuerys.length > 0) {
                Observable.forkJoin(...chunkOfQuerys).subscribe( results => {
                    for (let i = 0; i < params.length; i++) {
                        const reportParam: { SourceIndex?: number } = <any>params[i];
                        const dataset: any = reportParam.SourceIndex !== undefined ? results[reportParam.SourceIndex] : undefined;
                        if (dataset && dataset.Success && dataset.Data.length > 0) {
                            params[i].DefaultValueSourceData = dataset.Data;
                            params[i].value = this.pickValueFromResult(<any>reportParam, dataset.Data[0] );
                        }
                    }
                    resolve(params);
                });
                return;
            }

            // Auto-detect default-value:
            const param: CustomReportDefinitionParameter = <any>params.find(
                x => ['InvoiceNumber', 'OrderNumber', 'QuoteNumber'].indexOf(x.Name) >= 0
            );
            if (param) {
                const statparams = new URLSearchParams();
                statparams.set('model', 'NumberSeries');
                statparams.set('select', 'NextNumber');

                switch (param.Name) {
                    case 'InvoiceNumber':
                        statparams.set('filter', 'Name eq \'Customer Invoice number series\'');
                        break;
                    case 'OrderNumber':
                        statparams.set('filter', 'Name eq \'Customer Order number series\'');
                        break;
                    case 'QuoteNumber':
                        statparams.set('filter', 'Name eq \'Customer Quote number series\'');
                        break;
                }

                // Get param value
                this.statisticsService.GetDataByUrlSearchParams(statparams).subscribe(stat => {
                    const val = stat.Data[0].NumberSeriesNextNumber - 1;
                    if (val > 0) { param.value = val; }
                    resolve(params);
                }, err => this.errorService.handle(err));
            } else {
                resolve(params);
            }
        });
    }

    pickValueFromResult(param: IParameterDto, result: any): any {
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

}



class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}

interface IParameterDto {
    ID: number;
    Name: string;
    Label: string;
    Type: string;
    value?: string;
    DefaultValue?: string;
    DefaultValueSource?: string;
    DefaultValueSourceData?: object;
    DefaultValueList?: string;
    DefaultValueLookupType?: string;
}

interface IExtendedReportDefinition extends ReportDefinition {
    parameters?: Array<CustomReportDefinitionParameter>;
}
