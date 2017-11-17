import {Component, OnInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter, PayrollRun} from '../../../../unientities';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {
    ReportDefinitionParameterService,
    YearService,
    ErrorService,
    PayrollrunService
} from '../../../../services/services';

type ModalConfig = {
    report: any,
    title: string,
    actions: { text: string, class?: string, method: (a: any) => void }[]
};

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
            .asObservable()
            .filter(year => !!year)
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
                search: (query) => this.payrollRunService.GetAll(
                    `filter=year(PayDate) eq ${this.currentYear} `
                    + `and (startswith(ID, '${query}') or contains(Description, '${query}'))&top=50`
                ),
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
    @ViewChild(UniModal)
    private modal: UniModal;

    private modalConfig: ModalConfig;
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
                        let report = this.modalConfig.report;
                        report.parameters = [{Name: 'RunID', value: model$.getValue().RunID}];
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
