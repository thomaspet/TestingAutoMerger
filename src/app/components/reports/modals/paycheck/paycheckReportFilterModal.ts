import {Component, OnInit, ViewChild, Type, Input, OnDestroy} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter, PayrollRun, Employee} from '../../../../unientities';
import {
    ReportDefinitionParameterService,
    FinancialYearService,
    ErrorService,
    PayrollrunService,
    EmployeeService
} from '../../../../services/services';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';

interface IModalConfig  {
    report: any;
    title: string;
    actions: { text: string, class?: string, method: () => void }[];
}

interface IInputModel {
    EmpFrom: number;
    EmpTo: number;
    RunID: number;
    Grouping: boolean;
}

interface IHash {
    [details: string]: any;
}

@Component({
    selector: 'paycheck-report-filter-modal-content',
    templateUrl: 'paycheckReportFilterModal.html'
})
export class PaycheckReportFilterModalContent implements OnInit, OnDestroy {

    @Input() public config: IModalConfig;
    public currentYear: number;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<IInputModel> = new BehaviorSubject({ EmpFrom: 0, EmpTo: 0, RunID: 0, Grouping: false });
    private selectedPayrollRun: PayrollRun;

    private subscriptions: any[] = [];
    public params$: BehaviorSubject<IHash> = new BehaviorSubject<IHash>([]);

    constructor(
        private payrollRunService: PayrollrunService,
        private financialYearService: FinancialYearService,
        private employeeService: EmployeeService,
        private errorService: ErrorService) { }

    public ngOnInit() {
        this.currentYear = this.financialYearService.getActiveYear();
        this.config$.next(this.config);

        Observable.forkJoin([
            this.employeeService.GetAll('orderby=EmployeeNumber DESC&top=1')
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map(emps => emps[0]),
            this.payrollRunService.getLatestSettledRun(this.currentYear)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
        ])
        .subscribe((result: [Employee, PayrollRun]) => {
            const [employee, payrollRun] = result;
            this.selectedPayrollRun = payrollRun;
            this.fields$
                .next(this.getLayout(payrollRun));

            this.model$
                .next({
                    EmpFrom: 1,
                    EmpTo: employee.EmployeeNumber || 1,
                    RunID: payrollRun && payrollRun.ID,
                    Grouping: false,
                });
        });
    }

    public ngOnDestroy() {
        this.subscriptions.map(subscription => subscription.unsubscribe());
    }

    public GetParams() {
        return this.model$.getValue();
    }

    private getLayout(defaultRun: PayrollRun): UniFieldLayout[] {
        return [
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra ansatt nummer',
                Property: 'EmpFrom'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til ansatt nummer',
                Property: 'EmpTo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Lønnsavregning',
                Property: 'RunID',
                Options: {
                    getDefaultData: () => Observable.of([defaultRun]),
                    search: (query) => this.payrollRunService
                        .GetAll(
                            `filter=year(PayDate) eq ${this.currentYear} `
                            + `and (startswith(ID, '${query}') `
                            + `or contains(Description, '${query}'))`
                            + `&top=50&orderby=PayDate DESC`),
                    valueProperty: 'ID',
                    template: (obj: PayrollRun) => obj ? `${obj.ID} - ${obj.Description}` : '',
                    events: {
                        select: (model: any, value: PayrollRun) => this.selectedPayrollRun = value
                    }
                }
            },
            <any>{
                FieldType: FieldType.CHECKBOX,
                Label: 'Gruppering på lønnsart',
                Property: 'Grouped',
                Tooltip: {
                    Text: 'Grupperer på lønnsart når lønnsart og sats er lik. Tekst på lønnsposten blir lik lønnsartnavn',
                    Alignment: 'bottom'
                }
            }
        ];
    }
}

@Component({
    selector: 'paycheck-report-filter-modal',
    template: `<uni-modal *ngIf="!inActive" [type]='type' [config]='modalConfig'></uni-modal>`
})
export class PayCheckReportFilterModal implements OnInit {
    @ViewChild(UniModal, { static: false })
    private modal: UniModal;

    public modalConfig: IModalConfig;
    public type: Type<any> = PaycheckReportFilterModalContent;
    public inActive: boolean;

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
                                const params = component.GetParams();
                                component.config.report.parameters.map(param => {
                                    param.value = params[param.Name];
                                });
                                return component;
                            })
                            .do(() => this.close())
                            .subscribe((component: PaycheckReportFilterModalContent) => {
                                this.modalService.open(UniPreviewModal, {
                                    data: component.config.report
                                });
                            });
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.close()
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

    public close() {
        this.modal.close();
        this.refresh();
    }

    private refresh(): void {
        this.inActive = true;
        setTimeout(() => this.inActive = false, 1000);
    }
}
