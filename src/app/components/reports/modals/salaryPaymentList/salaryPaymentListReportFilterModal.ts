import { Component, OnInit, ViewChild, Type, Input } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { ReportDefinition, ReportDefinitionParameter, PayrollRun } from '../../../../unientities';
import { ReportDefinitionParameterService, YearService, ErrorService,
    PayrollrunService } from '../../../../services/services';
import { PreviewModal } from '../preview/previewModal';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: (any) => void }[]
}

@Component({
    selector: 'salary-payment-list-report-filter-modal-content',
    templateUrl: './salaryPaymentListReportFilterModal.html'
})
export class SalaryPaymentListReportFilterModalContent implements OnInit {
    @Input() public config: ModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{ RunID: number }> = new BehaviorSubject({ RunID: 0 });
    private currentYear: number;
    constructor(
        private payrollRunService: PayrollrunService,
        private yearService: YearService
    ) { }

    public ngOnInit() {
        this.config$.next(this.config);
        let subscription = this.yearService
            .selectedYear$
            .do(year => this.currentYear = year)
            .switchMap(year => this.payrollRunService.getLatestSettledRun(year))
            .finally(() => subscription.unsubscribe())
            .subscribe(payrollRun => {
                this.fields$.next(this.getLayout(payrollRun));
                this.model$.next({ RunID: payrollRun ? payrollRun.ID : 0 });
            });
    }

    private getLayout(defaultRun: PayrollRun): UniFieldLayout[] {
        return [<any>{
            FieldType: FieldType.AUTOCOMPLETE,
            Label: 'Lønnsavregning',
            Property: 'RunID',
            Options: {
                getDefaultData: () => Observable.of([defaultRun]),
                search: (query) => this.payrollRunService.GetAll(`filter=year(PayDate) eq ${this.currentYear} and (startswith(ID, '${query}') or contains(Description, '${query}'))&top=50`),
                valueProperty: 'ID',
                template: (obj: PayrollRun) => obj ? `${obj.ID} - ${obj.Description}` : ''
            }
        }];
    }
}

@Component({
    selector: 'salary-payment-list-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class SalaryPaymentListReportFilterModal implements OnInit {
    @ViewChild(UniModal) private modal: UniModal;
    private previewModal: PreviewModal;
    private modalConfig: ModalConfig;
    public type: Type<any> = SalaryPaymentListReportFilterModalContent;
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
                    method: (model$) => {
                        this.modal.close();
                        this.previewModal.openWithId(
                            this.modalConfig.report,
                            model$.getValue().RunID,
                                'RunID');
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.modal.getContent().then(() => this.modal.close())
                }
            ]
        };
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
