import {Component, OnInit, ViewChild, Type, Input, OnDestroy} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter, PayrollRun, Employee} from '../../../../unientities';
import {
    ReportDefinitionParameterService,
    YearService,
    ErrorService,
    PayrollrunService,
    EmployeeService
} from '../../../../services/services';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: () => void }[]
};

type InputModel = {
    FromEmpNo: number,
    ToEmpNo: number,
    RunID: number
};

type Hash = {
    [details: string]: any;
};
@Component({
    selector: 'paycheck-report-filter-modal-content',
    templateUrl: 'paycheckReportFilterModal.html'
})
export class PaycheckReportFilterModalContent implements OnInit, OnDestroy {

    @Input() public config: ModalConfig;
    private currentYear: number;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<InputModel> = new BehaviorSubject({ FromEmpNo: 0, ToEmpNo: 0, RunID: 0 });
    private selectedPayrollRun: PayrollRun;

    private subscriptions: any[] = [];
    public params$: BehaviorSubject<Hash> = new BehaviorSubject<Hash>([]);
    private employees: Employee[];

    constructor(
        private payrollRunService: PayrollrunService,
        private yearService: YearService,
        private employeeService: EmployeeService,
        private errorService: ErrorService) { }

    public ngOnInit() {
        this.config$.next(this.config);
        this.subscriptions.push(this.yearService
            .selectedYear$
            .do(year => this.currentYear = year)
            .switchMap(year => {
                return Observable.forkJoin(
                    this.employeeService.GetAll('orderby=EmployeeNumber DESC&top=1')
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                        .map(emps => emps[0]),
                    this.payrollRunService.getLatestSettledRun(year)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)));
            })
            .subscribe((result: [Employee, PayrollRun]) => {
                let [employee, payrollRun] = result;
                this.selectedPayrollRun = payrollRun;
                this.fields$
                    .next(this.getLayout(payrollRun));

                this.model$
                    .next({
                        FromEmpNo: 1,
                        ToEmpNo: employee.EmployeeNumber || 1,
                        RunID: payrollRun.ID
                    });
                this.updateParams(this.model$.getValue());
            }));
    }

    public ngOnDestroy() {
        this.subscriptions.map(subscription => subscription.unsubscribe());
    }

    public formChange(change) {
        this.updateParams(this.model$.getValue());
    }

    private updateParams(inputModel: InputModel) {
        let params = this.params$.getValue();
        Observable
            .of(inputModel && inputModel.RunID !== params['RunID'])
            .do(hasChanged => {
                if (this.currentYear && this.currentYear !== params['ThisYear']) {
                    params['ThisYear'] = this.currentYear;
                    params['LastYear'] = this.currentYear - 1;
                    this.params$.next(params);
                }
            })
            .filter((hasChanged) => hasChanged)
            .do((hasChanged) => params['PayDate'] = this.selectedPayrollRun.PayDate)
            .switchMap((hasChanged) => Observable
                .forkJoin(
                Observable.of(inputModel),
                this.payrollRunService
                    .getEmployeesOnPayroll(inputModel.RunID, [])
                    .map(emps => {
                        this.employees = emps;
                        return emps;
                    })
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                ))
            .map((result: [InputModel, Employee[]]) => {
                let [model, employees] = result;
                if (employees) {
                    let filteredEmployees = employees
                        .filter(emp => emp.EmployeeNumber <= model.ToEmpNo && emp.EmployeeNumber >= model.FromEmpNo);

                    params['TransFilter'] = `PayrollRunID eq ${model.RunID} `
                        + (filteredEmployees.length
                            ? 'and (' + filteredEmployees.map(emp => 'EmployeeID eq ' + emp.ID).join(' or ') + ')'
                            : '');
                    params['EmployeeFilter'] = filteredEmployees.map(emp => 'ID eq ' + emp.ID).join(' or ');
                }
                return model;
            })
            .map((model: InputModel) => {
                Object.keys(model).forEach(key => {
                    params[key] = model[key];
                });
                return params;
            })
            .subscribe((newParams) => this.params$.next(newParams));
    }

    private getLayout(defaultRun: PayrollRun): UniFieldLayout[] {
        return [
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra ansatt nummer',
                Property: 'FromEmpNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til ansatt nummer',
                Property: 'ToEmpNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Lønnsavregning',
                Property: 'RunID',
                Options: {
                    getDefaultData: () => Observable.of([defaultRun]),
                    search: (query) => this.payrollRunService.GetAll(`filter=year(PayDate) eq ${this.currentYear} and (startswith(ID, '${query}') or contains(Description, '${query}'))&top=50&orderby=PayDate DESC`),
                    valueProperty: 'ID',
                    template: (obj: PayrollRun) => obj ? `${obj.ID} - ${obj.Description}` : '',
                    events: {
                        select: (model: any, value: PayrollRun) => this.selectedPayrollRun = value
                    }
                }
            }
        ];
    }
}

@Component({
    selector: 'paycheck-report-filter-modal',
    template: `<uni-modal [type]='type' [config]='modalConfig'></uni-modal>`
})
export class PayCheckReportFilterModal implements OnInit {
    @ViewChild(UniModal)
    private modal: UniModal;

    private modalConfig: ModalConfig;
    public type: Type<any> = PaycheckReportFilterModalContent;

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.modalConfig = {
            title: 'Parametre',
            report: new ReportDefinition(),
            actions: [
                {
                    text: 'Ok',
                    class: 'good',
                    method: () => {
                        Observable
                            .fromPromise(this.modal.getContent())
                            .map((component: PaycheckReportFilterModalContent) => {
                                let params = component.params$.getValue();
                                component.config.report.parameters.map(param => {
                                    param.value = params[param.Name];
                                });
                                return component;
                            })
                            .do(() => this.modal.close())
                            .subscribe((component: PaycheckReportFilterModalContent) => {
                                this.modalService.open(UniPreviewModal, {
                                    data: component.config.report
                                });
                            });
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.modal.close()
                }
            ]
        };
    }

    public open(report: ReportDefinition) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;

        this.reportDefinitionParameterService
            .GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .subscribe((params: ReportDefinitionParameter[]) => {
                this.modalConfig.report.parameters = params;
                this.modal.open();
            }, err => this.errorService.handle(err));
    }
}
