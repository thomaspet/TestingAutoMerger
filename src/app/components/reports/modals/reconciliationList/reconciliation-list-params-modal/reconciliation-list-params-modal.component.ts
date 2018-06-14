import {Component, OnInit, EventEmitter, Output, Input, OnChanges} from '@angular/core';
import {IUniModal, UniModalService, ConfirmActions, IModalOptions} from '../../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReportDefinition, ReportDefinitionParameter, Employee} from '../../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {EmployeeService, YearService, StatisticsService, ReportDefinitionParameterService} from '../../../../../services/services';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';

@Component({
    selector: 'uni-reconciliation-list-params-modal',
    templateUrl: './reconciliation-list-params-modal.component.html',
    styleUrls: ['./reconciliation-list-params-modal.component.sass']
})
export class ReconciliationListParamsModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    public busy: boolean;
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public model$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    constructor(
        private statisticsService: StatisticsService,
        private reportDefinitionParamService: ReportDefinitionParameterService
    ) { }

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Vis rapport',
                cancel: 'Avbryt'
            };
        }

        this.busy = true;
        this.options.data.parameters = [];
        this.getParams(this.options.data)
            .switchMap(params => this.generateFieldsAndModel(params))
            .finally(() => this.busy = false)
            .subscribe();
    }

    private getParams(report: ReportDefinition): Observable<IParameterDto[]> {
        return this.reportDefinitionParamService
            .GetAll(`filter=ReportDefinitionId eq ${report.ID}`);
    }

    private generateFieldsAndModel(params: IParameterDto[]): Observable<any> {
        this.fields$
            .next(params.map(param => this.getNewField(param, this.getFieldType(param), param.Name)));

        return this.generateDefaultValues(params)
            .do(model => this.model$.next(model));
    }

    private generateDefaultValues(params: IParameterDto[]): Observable<any> {
        const sources: string[] = [];
        params.forEach(param => {
            if (!param.DefaultValueSource) {
                return;
            }
            const sourceIndex = param.DefaultValueSource.indexOf('?');
            const source = sourceIndex >= 0
                ? param.DefaultValueSource.substring(sourceIndex + 1)
                : param.DefaultValueSource;
            sources.push(source);
        });
        const model = {};
        return this.getFromSource(sources)
            .map((results: any[]) => {
                params.forEach(param => {
                    param.value = this.getDefaultValueFromResult(param.DefaultValue, results);
                    model[param.Name] = param.value;
                });
                return results;
            })
            .switchMap(() => this.fields$.filter(fld => !!fld).take(1))
            .map(fields => {
                Object
                    .keys(model)
                    .forEach(key => {
                        if (!!model[key] || sources.some(source => source.includes(key))) {
                            return;
                        }
                        const param = params.find(prm => prm.Name === key);
                        const field = fields.find(fld => fld.Property === key);
                        if (!param || !field) {
                            return;
                        }
                        model[key] = this.getSimpleDefaultValue(param.DefaultValue, key, field);
                    });
                return model;
            });
    }

    private getSimpleDefaultValue(defaultValue: string, key: string, field: UniFieldLayout) {
        if (!field || !defaultValue) {
            return '';
        }
        switch (field.FieldType) {
            case FieldType.CHECKBOX:
                return isNaN(+defaultValue) ? defaultValue.toLowerCase() !== 'false' : !!+defaultValue;
            default:
            return defaultValue;
        }
    }

    private submitValues(model: any) {
        this.options.data.parameters = Object
            .keys(model)
            .map(key => {
                return {Name: key, value: model[key]};
            });
    }

    private getDefaultValueFromResult(prop: string, results: {Data: any[]}[]): any {
        let ret: any;
        const datas = results.map(result => result.Data).reduce((acc, curr) => [...acc, ...curr], []);
        datas.forEach(data => {
            if (ret !== undefined) {
                return;
            }
            if (data[prop]) {
                ret = data[prop];
            }
        });
        return ret;
    }

    private getFromSource(sources: string[]) {
        return Observable.forkJoin(sources.map(source => this.statisticsService.GetAll(source)));
    }

    private getFieldType(param: IParameterDto): FieldType {
        if (param.Type.toLowerCase() === 'boolean') {
            return FieldType.CHECKBOX;
        }

        return FieldType.TEXT;
    }

    private getNewField(param: IParameterDto, type: FieldType, prop: string): UniFieldLayout {
        const field: UniFieldLayout = new UniFieldLayout();
        field.Label = param.Label;
        field.FieldType = type;
        field.Property = prop;
        field.LineBreak = true;
        return field;
    }

    public accept() {
        this.model$
            .take(1)
            .do(model => this.submitValues(model))
            .subscribe(() => this.onClose.emit(ConfirmActions.ACCEPT));
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

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
