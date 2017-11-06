import {Component, OnInit, ViewChild, Type, Input, OnDestroy} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {
    ReportDefinitionParameterService,
    YearService,
    ErrorService,
    PayrollrunService
} from '../../../../services/services';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

type ModalConfig = {
    report: any,
    title: string,
    actions: {text: string, class?: string, method: () => void}[]
};

interface IWitholdingAndAGAReportModel {
    FromPeriod: number;
    ToPeriod: number;
    Year: number;
}

@Component({
    selector: 'salary-withholding-and-aga-report-filter-modal-content',
    templateUrl: './salaryWithholdingAndAGAReportFilterModal.html'
})
export class SalaryWithholdingAndAGAReportFilterModalContent implements OnInit {
    @Input() public config: ModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<IWitholdingAndAGAReportModel> =
    new BehaviorSubject({FromPeriod: 1, ToPeriod: 2, Year: new Date().getFullYear()});
    constructor(
        private payrollRunService: PayrollrunService,
        private yearService: YearService
    ) {}

    public ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getLayout(this.config.report.parameters));
        this.payrollRunService
            .getLatestSettledRun()
            .subscribe(payrollRun => this.model$.next({
                FromPeriod: moment(payrollRun.PayDate).month(),
                ToPeriod: moment(payrollRun.PayDate).month(),
                Year: moment(payrollRun.PayDate).year()
            }));
    }

    private getLayout(reportParameters: ReportDefinitionParameter[]): UniFieldLayout[] {
        return reportParameters.map(param => <UniFieldLayout>{
            FieldType: FieldType.NUMERIC,
            Label: param.Label,
            Property: param.Name,
        });
    }

    public getParams() {
        return this.model$.getValue();
    }
}

@Component({
    selector: 'salary-withholding-and-aga-report-filter-modal',
    template: `
        <uni-modal *ngIf="!inActive" [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class SalaryWithholdingAndAGAReportFilterModal implements OnInit, OnDestroy {
    @ViewChild(UniModal)
    private modal: UniModal;

    private modalConfig: ModalConfig;
    public type: Type<any> = SalaryWithholdingAndAGAReportFilterModalContent;
    private subscriptions: any[] = [];
    private inActive: boolean;

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
                        this.subscriptions.push(
                            Observable
                                .fromPromise(this.modal.getContent())
                                .do(() => this.close())
                                .subscribe((component: SalaryWithholdingAndAGAReportFilterModalContent) => {
                                    this.modalService
                                        .open(UniPreviewModal, {
                                            data: this.updateParamsOnReport(
                                                component.config.report,
                                                component.getParams())
                                        });
                                })
                        );
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.close()
                }
            ]
        };
    }

    public ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public open(report: ReportDefinition) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .subscribe((params: ReportDefinitionParameter[]) => {
                this.modalConfig.report.parameters = params;
                this.modal.open();
            }, err => this.errorService.handle(err));
    }

    private close() {
        this.modal.close();
        this.refresh();
    }

    private refresh() {
        this.inActive = true;
        setTimeout(() => this.inActive = false, 1000);
    }

    private updateParamsOnReport(report: any, params: IWitholdingAndAGAReportModel): any {
        report.parameters.forEach(param => {
            param.value = params[param.Name];
        });

        return report;
    }
}
