import {Component, OnInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    ReportDefinitionParameterService,
    ErrorService,
    YearService,
    PayrollrunService
} from '../../../../services/services';

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
    @ViewChild(UniModal)
    private modal: UniModal;

    private modalConfig: ModalConfig;
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
                        let report = this.modalConfig.report;
                        let paramName = this.modalConfig.report.parameters[0].Name;
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
