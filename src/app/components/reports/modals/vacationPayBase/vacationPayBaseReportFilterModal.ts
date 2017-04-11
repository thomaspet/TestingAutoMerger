import { Component, OnInit, ViewChild, Type, Input } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { ReportDefinition, ReportDefinitionParameter } from '../../../../unientities';
import { ReportDefinitionParameterService, ErrorService, YearService,
    PayrollrunService } from '../../../../services/services';
import { PreviewModal } from '../preview/previewModal';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: (any) => void }[]
};

@Component({
    selector: 'vacation-pay-base-report-filter-modal-content',
    templateUrl: './vacationPayBaseReportFilterModal.html'
})
export class VacationPayBaseReportFilterModalContent implements OnInit {
    @Input() public config: ModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{ Yer: number }> = new BehaviorSubject({ Yer: new Date().getFullYear() });
    constructor(
        private payrollRunService: PayrollrunService,
        private yearService: YearService
    ) { }

    public ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getLayout(this.config.report.parameters));
        let subscription = this.yearService
            .selectedYear$
            .finally(() => subscription.unsubscribe())
            .subscribe(year => {
                this.model$.next({ Yer: year - 1 });
            });
    }

    private getLayout(reportParameters: ReportDefinitionParameter[]): UniFieldLayout[] {
        return [<any>{
            FieldType: FieldType.NUMERIC,
            Label: reportParameters[0].Label,
            Property: reportParameters[0].Name,
        }];
    }
}

@Component({
    selector: 'vacation-pay-base-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class VacationPayBaseReportFilterModal implements OnInit {
    @ViewChild(UniModal) private modal: UniModal;
    private previewModal: PreviewModal;
    private modalConfig: ModalConfig;
    public type: Type<any> = VacationPayBaseReportFilterModalContent;
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
                            model$.getValue()[this.modalConfig.report.parameters[0].Name],
                                this.modalConfig.report.parameters[0].Name);
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
