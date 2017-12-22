import {Component, Input, Output, OnInit, AfterViewInit, EventEmitter} from '@angular/core';
import {
    IUniModal,
    IModalOptions,
    ConfirmActions,
    UniModalService,
} from '@uni-framework/uniModal/modalService';
import {ReportDefinitionParameterService, ErrorService} from '@app/services/services';
import {StatisticsService} from '@app/services/services';
import {Http, URLSearchParams} from '@angular/http';
import {ReportDefinitionParameter, ReportDefinition} from '@uni-entities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniForm, FieldType} from '@uni-framework/ui/uniform';

@Component({
    selector: 'uni-report-params-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <article [attr.aria-busy]="busy">
                <section [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>

                <uni-form [fields]="fields$"
                  [model]="model$"
                  [config]="formConfig$"
                  (changeEvent)="onFormChange($event)">
                </uni-form>
            </article>

            <footer (click)="busy = !busy" >
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
        private modalService: UniModalService
    ) {

    }

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
                    switch (p.Type) {
                        case 'Number':
                            type = FieldType.NUMERIC;
                            break;
                        case 'Boolean':
                            type = FieldType.CHECKBOX;
                            break;
                        default:
                            type = FieldType.TEXT;
                            break;
                    }

                    return {
                        Property: p.Name,
                        Label: p.Label,
                        FieldType: type
                    };
                }));

                let model = {};
                this.options.data.parameters.map(p => {
                    model[p.Name] = p.value;
                });

                this.model$.next(model);

                this.busy = false
            });
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public onFormChange(changes) {
        const model = this.model$.getValue();
        this.options.data.parameters.map(p => {
            p.value = model[p.Name];
        });
    }

    public accept() {
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
        if (param.DefaultValue) {
            return result[param.DefaultValue];
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
    DefaultValueList?: string;
    DefaultValueLookupType?: string;
}

interface IExtendedReportDefinition extends ReportDefinition {
    parameters?: Array<CustomReportDefinitionParameter>;
}
