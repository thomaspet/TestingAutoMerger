import {Component, OnInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '@uni-framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter, PayrollRun} from '@uni-entities';
import {UniModalService, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {Observable, BehaviorSubject} from 'rxjs';
import {
    ReportDefinitionParameterService,
    FinancialYearService,
    ErrorService,
    PayrollrunService,
    SalaryBookingType
} from '@app/services/services';
import {tap, switchMap} from 'rxjs/operators';

interface IModalConfig {
    report: any;
    title: string;
    actions: { text: string, class?: string, method: (a: any) => void }[];
}

interface ISalaryPaymentModel {
    RunID: number;
    BookingType: SalaryBookingType;
}

@Component({
    selector: 'salary-payment-list-report-filter-modal-content',
    templateUrl: './salaryPaymentListReportFilterModal.html'
})
export class SalaryPaymentListReportFilterModalContent implements OnInit {
    @Input() public config: IModalConfig;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<ISalaryPaymentModel> = new BehaviorSubject({ RunID: 0, BookingType: SalaryBookingType.Dimensions });
    public currentYear: number;
    constructor(
        private payrollRunService: PayrollrunService,
        private financialYearService: FinancialYearService
    ) { }

    public ngOnInit() {
        this.config$.next(this.config);
        this.currentYear = this.financialYearService.getActiveYear();

        this.payrollRunService
            .getLatestSettledRun(this.currentYear)
            .pipe(
                tap(payrollRun => {
                    this.fields$.next(this.getLayout(payrollRun));
                    this.model$.next({ RunID: payrollRun ? payrollRun.ID : 0, BookingType: SalaryBookingType.Dimensions });
                }),
                switchMap(run => {
                    return run && run.ID
                        ? this.payrollRunService.getPostingSummaryDraft(run.ID)
                        : Observable.of(null);
                }),
            )
            .subscribe(draft => {
                const model = this.model$.value;
                model.BookingType = this.payrollRunService.getBookingTypeFromDraft(draft);
                this.model$.next(model);
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
                Property: 'BookingType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type bilag',
                Options: {
                    source: [
                        {ID: SalaryBookingType.Dimensions, name: 'Bilag med dimensjoner kun på resultatkontoer'},
                        {ID: SalaryBookingType.DimensionsAndBalance, name: 'Bilag med dimensjoner på resultat- og balansekontoer'},
                        {ID: SalaryBookingType.NoDimensions, name: 'Bilag uten dimensjoner'}
                    ],
                    valueProperty: 'ID',
                    template: (el: any) => el.name,
                }
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
    @ViewChild(UniModal, { static: true })
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
                    method: (model$: BehaviorSubject<ISalaryPaymentModel>) => {
                        this.modal.close();
                        const report = this.modalConfig.report;
                        report.parameters = [{Name: 'RunID', value: model$.getValue().RunID}];
                        if (report.ID === 8) {
                            report.parameters.push({Name: 'BookingType', value: model$.getValue().BookingType});
                            report.parameters.push({Name: 'Refresh', value: true});
                        }

                        this.modalService.open(UniPreviewModal, {
                            closeOnClickOutside: false,
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
