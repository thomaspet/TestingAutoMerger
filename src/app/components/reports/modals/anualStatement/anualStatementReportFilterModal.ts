import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {IUniModal, UniModalService, ConfirmActions, IModalOptions} from '../../../../../framework/uni-modal';
import {Observable, BehaviorSubject} from 'rxjs';
import {ReportDefinition, ReportDefinitionParameter, Employee} from '../../../../unientities';
import {EmployeeService, YearService} from '../../../../services/services';
interface IField {
    Label: string;
    value?: any;
}
const FROM_EMP = 'Fra ansatt';
const TO_EMP = 'Til ansatt';
const YEAR = 'År';

@Component({
    selector: 'annual-statement-report-params-modal',
    templateUrl: 'anualStatementReportFilterModal.html'
})

export class AnnualSatementReportFilterModalComponent implements OnInit, IUniModal {
    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();
    @Input()
    public options?: IModalOptions;
    public fields$: BehaviorSubject<IField[]> = new BehaviorSubject([]);
    public busy: boolean;

    constructor(
        private modalService: UniModalService,
        private yearService: YearService,
        private employeeService: EmployeeService
    ) {}

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Vis rapport',
                cancel: 'Avbryt'
            };
        }

        this.loadParameters();
    }

    private loadParameters() {
        this.busy = true;
        this.getDefaultValues([
            {Label: FROM_EMP, value: 1},
            {Label: TO_EMP},
            {Label: YEAR}
        ])
            .finally(() => this.busy = false)
            .subscribe(defaultFields => this.fields$.next(defaultFields));
    }

    private getDefaultValues(model: IField[]): Observable<IField[]> {
        const yearObs = this.yearService
            .selectedYear$
            .take(1)
            .do(year => {
                const field = model.find(x => x.Label === YEAR);
                if (!field) {
                    return;
                }
                field.value = year;
            });

        const empObs = this.employeeService
            .GetAll('orderby=EmployeeNumber desc&top=1')
            .map(emp => <Employee>emp[0])
            .do(emp => {
                const toEmpField = model.find(x => x.Label === TO_EMP);
                toEmpField.value = emp.EmployeeNumber;
            });

        return Observable.forkJoin(yearObs, empObs).map(() => model);
    }

    private submitValues(model: IField[]) {
        this.options.data.parameters = [
            {Name: 'employeeFilter', value: this.getEmpValue(model)},
            {Name: 'year', value: this.getYearValue(model)}
        ];
    }

    private getEmpValue(model: IField[]) {
        const fromEmp = model.find(x => x.Label === FROM_EMP);
        const toEmp = model.find(x => x.Label === TO_EMP);
        return (fromEmp && fromEmp.value || 0) + '-' + (toEmp && toEmp.value || 0);
    }

    private getYearValue(model: IField[]): number {
        const year = model.find(x => x.Label === YEAR);
        return +(year && year.value);
    }

    public accept() {
        this.fields$
            .take(1)
            .do(fields => this.submitValues(fields))
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
