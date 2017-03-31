import { Component, OnInit, ViewChild, Type, Input, OnDestroy } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { ReportDefinition, ReportDefinitionParameter } from '../../../../unientities';
import {
    ReportDefinitionParameterService, YearService, ErrorService,
    PayrollrunService
} from '../../../../services/services';
import { PreviewModal } from '../preview/previewModal';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: () => void }[]
};

@Component({
    selector: 'salary-withholding-and-aga-report-filter-modal-content',
    templateUrl: './salaryWithholdingAndAGAReportFilterModal.html'
})
export class SalaryWithholdingAndAGAReportFilterModalContent implements OnInit {
    @Input() public config: ModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{
        FromPeriod: number,
        ToPeriod: number,
        Year: number
    }> = new BehaviorSubject({ FromPeriod: 1, ToPeriod: 2, Year: new Date().getFullYear() });
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
}

@Component({
    selector: 'salary-withholding-and-aga-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class SalaryWithholdingAndAGAReportFilterModal implements OnInit, OnDestroy {
    @ViewChild(UniModal) private modal: UniModal;
    private previewModal: PreviewModal;
    private modalConfig: ModalConfig;
    public type: Type<any> = SalaryWithholdingAndAGAReportFilterModalContent;
    private subscriptions: any[] = [];
    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private errorService: ErrorService) { }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Parametre',
            report: new ReportDefinition(),
            actions: [
                {
                    text: 'Ok',
                    class: 'good',
                    method: () => {
                        this.subscriptions
                            .push(Observable
                                .fromPromise(this.modal.getContent())
                                .switchMap((component: SalaryWithholdingAndAGAReportFilterModalContent) =>
                                    component.model$.map(model => {
                                        component.config.report.parameters.map(param => {
                                            param.value = model[param.Name];
                                        });
                                        return component;
                                    })
                                )
                                .do(() => this.modal.close())
                                .subscribe((component: SalaryWithholdingAndAGAReportFilterModalContent) =>
                                    this.previewModal.open(component.config.report)));
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.modal.close()
                }
            ]
        };
    }

    public ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    public open(report: ReportDefinition, previewModal: PreviewModal) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;
        this.previewModal = previewModal;

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .subscribe((params: ReportDefinitionParameter[]) => {
                this.modalConfig.report.parameters = params;
                this.modal.open();
            }, err => this.errorService.handle(err));
    }
}
