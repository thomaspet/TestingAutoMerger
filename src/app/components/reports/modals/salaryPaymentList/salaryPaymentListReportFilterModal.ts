import {Component, OnInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter, PayrollRun} from '../../../../unientities';
import {UniModalService} from '../../../../../framework/uni-modal';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {Observable, BehaviorSubject} from 'rxjs';
import {
    ReportDefinitionParameterService,
    YearService,
    ErrorService,
    PayrollrunService
} from '../../../../services/services';

interface IModalConfig {
    report: any;
    title: string;
    actions: { text: string, class?: string, method: (a: any) => void }[];
}

interface ISalaryPaymentModel {
    RunID: number;
    DimensionGrouping: boolean;
}

@Component({
    selector: 'salary-payment-list-report-filter-modal-content',
    templateUrl: './salaryPaymentListReportFilterModal.html'
})
export class SalaryPaymentListReportFilterModalContent implements OnInit {
    @Input() public config: IModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<ISalaryPaymentModel> = new BehaviorSubject({ RunID: 0, DimensionGrouping: true });
    public currentYear: number;
    constructor(
        private payrollRunService: PayrollrunService,
        private yearService: YearService
    ) { }

    public ngOnInit() {
        this.config$.next(this.config);
        const subscription = this.yearService
            .selectedYear$
            .asObservable()
            .filter(year => !!year)
            .do(year => this.currentYear = year)
            .switchMap(year => this.payrollRunService.getLatestSettledRun(year))
            .finally(() => subscription.unsubscribe())
            .subscribe(payrollRun => {
                this.fields$.next(this.getLayout(payrollRun));
                this.model$.next({ RunID: payrollRun ? payrollRun.ID : 0, DimensionGrouping: true });
            });
    }

    private getLayout(defaultRun: PayrollRun): UniFieldLayout[] {
        const fields = [<any>{
            FieldType: FieldType.AUTOCOMPLETE,
            Label: 'Lønnsavregning',
            Property: 'RunID',
            Options: {
                getDefaultData: () => Observable.of([defaultRun]),
                search: (query) => this.payrollRunService.GetAll(
                    `filter=year(PayDate) eq ${this.currentYear} `
                    + `and (startswith(ID, '${query}') or contains(Description, '${query}'))&top=50`
                ),
                valueProperty: 'ID',
                template: (obj: PayrollRun) => obj ? `${obj.ID} - ${obj.Description}` : ''
            }
        }];

        if (this.config.report.ID === 8) {
            fields.push({
                FieldType: FieldType.CHECKBOX,
                Label: 'Splitt på dimensjoner',
                Property: 'DimensionGrouping'
            });
        }

        return fields;
    }
}

@Component({
    selector: 'salary-payment-list-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class SalaryPaymentListReportFilterModal implements OnInit {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: IModalConfig;
    public type: Type<any> = SalaryPaymentListReportFilterModalContent;

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
                        report.parameters = [{Name: 'RunID', value: model$.getValue().RunID}];
                        if (report.ID === 8) {
                            report.parameters.push({Name: 'DimensionGrouping', value: model$.getValue().DimensionGrouping});
                        }
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
