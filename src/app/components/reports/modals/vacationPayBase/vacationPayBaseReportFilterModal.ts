import {Component, OnInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '@uni-framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '@uni-entities';
import {UniModalService, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {
    ReportDefinitionParameterService,
    ErrorService,
    FinancialYearService,
    PayrollrunService
} from '@app/services/services';

type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: (a: any) => void }[]
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
        private financialYearService: FinancialYearService
    ) { }

    public ngOnInit() {
        const activeYear = this.financialYearService.getActiveYear();

        this.config$.next(this.config);
        this.fields$.next(this.getLayout(this.config.report.parameters));
        this.model$.next({ Yer: activeYear - 1 });
    }

    private getLayout(reportParameters: ReportDefinitionParameter[]): UniFieldLayout[] {
        return [<any>{
            FieldType: FieldType.TEXT,
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
    @ViewChild(UniModal, { static: true })
    private modal: UniModal;

    public modalConfig: ModalConfig;
    public type: Type<any> = VacationPayBaseReportFilterModalContent;

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
                    method: (model$) => {
                        this.modal.close();
                        const report = this.modalConfig.report;
                        const paramName = this.modalConfig.report.parameters[0].Name;
                        report.parameters = [{Name: paramName, value: model$.getValue()[paramName]}];

                        this.modalService.open(UniPreviewModal, {
                            data: report
                        });
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => this.modal.getContent().then(() => this.modal.close())
                }
            ]
        };
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
}
