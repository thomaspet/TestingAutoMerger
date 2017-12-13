import {Component, Input, Output, OnInit, AfterViewInit, EventEmitter} from '@angular/core';
import {
    IUniModal,
    IModalOptions,
    ConfirmActions,
    UniModalService,
} from '../../../../../framework/uniModal/modalService';
import {ReportDefinitionParameterService, ErrorService} from '../../../../services/services';
import {StatisticsService} from '../../../../services/services';
import {Http, URLSearchParams} from '@angular/http';
import {ReportDefinitionParameter, ReportDefinition} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

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

                <table>
                    <tr *ngFor="let parameter of options?.data?.parameters">
                        <td>
                            <strong>{{ parameter.Label }}</strong>
                        </td>
                        <td>
                            <input type="text" [(ngModel)]="parameter.value" />
                        </td>
                    </tr>
                </table>

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
            this.loadParameters(this.options.data).then(() => this.busy = false);
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
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
            for (let i = 0; i < params.length; i++) {
                const par = params[i];
                if (par.DefaultValueSource) {
                    const qIndex = par.DefaultValueSource.indexOf('?');
                    const query = qIndex >= 0 ? par.DefaultValueSource.substr(qIndex + 1) : par.DefaultValueSource;
                    chunkOfQuerys.push(this.statisticsService.GetAll(`${query}`));
                }
            }
            if (chunkOfQuerys.length > 0) {
                Observable.forkJoin(...chunkOfQuerys).subscribe( results => {
                    for (let i = 0; i < params.length; i++) {
                        const dataset: { Success: boolean, Data: Array<any> } =
                            <any>( i + 1 >= results.length ? results[results.length - 1] : results[i]);
                        if (dataset && dataset.Success && dataset.Data.length > 0) {
                            params[i].value = this.pickValueFromResult(params[i], dataset.Data[0] );
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
