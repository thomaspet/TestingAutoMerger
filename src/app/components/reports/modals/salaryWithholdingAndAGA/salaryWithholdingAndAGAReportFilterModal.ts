import {Component, OnInit, ViewChild, Type, Input, OnDestroy, SimpleChange} from '@angular/core';
import {UniModal} from '@uni-framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '@uni-entities';
import {
    ReportDefinitionParameterService,
    ErrorService,
    PayrollrunService,
    BrowserStorageService
} from '@app/services/services';
import {UniModalService, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType, UniFormError} from '@uni-framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import * as moment from 'moment';

interface ModalConfig {
    report: any;
    title: string;
    actions: {text: string, class?: string, method: () => void}[];
}

interface IWitholdingAndAGAReportModel {
    FromPeriod: number;
    ToPeriod: number;
    Year: number;
    rememberChoice: boolean;
    isTerm: boolean;
}

@Component({
    selector: 'salary-withholding-and-aga-report-filter-modal-content',
    templateUrl: './salaryWithholdingAndAGAReportFilterModal.html'
})
export class SalaryWithholdingAndAGAReportFilterModalContent implements OnInit {
    @Input() config: ModalConfig;
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    model$: BehaviorSubject<IWitholdingAndAGAReportModel> =
    new BehaviorSubject({FromPeriod: null, ToPeriod: null, Year: null, rememberChoice: false, isTerm: null});

    constructor(
        private payrollRunService: PayrollrunService,
        private browserStorage: BrowserStorageService,
    ) {}

    ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getLayout(this.config.report.parameters));
        this.payrollRunService
            .getLatestSettledRun()
            .subscribe(payrollRun => this.model$.next({
                FromPeriod: (payrollRun && payrollRun.PayDate) ? moment(payrollRun.PayDate ).month() : null,
                ToPeriod: (payrollRun && payrollRun.PayDate) ? moment(payrollRun.PayDate).month() : null,
                Year: (payrollRun && payrollRun.PayDate) ? moment(payrollRun.PayDate).year() : moment().year(),
                rememberChoice: false,
                isTerm: this.browserStorage.getItem('rememberChoiceAGAReport') || false
            }));
    }

    validateTerm = (term: number, field: UniFieldLayout): UniFormError | null => {
        if (!term || (term > 0 && term <= 6)) {
            return null;
        }

        return {
            value: term,
            errorMessage:
                'Termin er ikke gyldig. Termin kan kun inneholde tall fra 1-6',
            field: field,
            isWarning: true
        };
    }

    validatePeriod = (period: number, field: UniFieldLayout): UniFormError | null => {
        if (!period || (period > 0 && period <= 12)) {
            return null;
        }

        return {
            value: period,
            errorMessage:
                'Periode er ikke gyldig. Periode kan kun inneholde tall fra 1-12',
            field: field,
            isWarning: true
        };
    }

    validateTermOrPeriod = (period: number, field: UniFieldLayout): UniFormError | null => {
        if (this.model$.value.isTerm) {
            return this.validateTerm(period, field);
        }
        return this.validatePeriod(period, field);
    }

    changes = (event: SimpleChange) => {
        if (event['isTerm']) {
            this.model$.next({
                ToPeriod: null,
                FromPeriod: null,
                Year: this.model$.value.Year,
                rememberChoice: this.model$.value.rememberChoice,
                isTerm: this.model$.value.isTerm
            });
        }
    }

    private getLayout(reportParameters: ReportDefinitionParameter[]): UniFieldLayout[] {
        return [
            <UniFieldLayout>{
                Property: 'isTerm',
                FieldType: FieldType.RADIOGROUP,
                Label: '',
                Options: {
                    source: [
                        {isTerm: false, text: 'Periode'},
                        {isTerm: true, text: 'Termin'}
                    ],
                    labelProperty: 'text',
                    valueProperty: 'isTerm',
                }
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra',
                Property: reportParameters[0].Name,
                Validations: [this.validateTermOrPeriod]
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til',
                Property: reportParameters[1].Name,
                Validations: [this.validateTermOrPeriod]
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'År',
                Property: reportParameters[2].Name
            },
            <UniFieldLayout>{
                FieldType: FieldType.CHECKBOX,
                Label: 'Husk utvalg',
                Property: 'rememberChoice'
            },
        ];
    }

    getParams() {
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

    modalConfig: ModalConfig;
    type: Type<any> = SalaryWithholdingAndAGAReportFilterModalContent;
    private subscriptions: any[] = [];
    inActive: boolean;

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
    ) {}

    ngOnInit() {
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
                                    const params = component.getParams();

                                    if (params['isTerm']) {
                                        params['FromPeriod'] = this.convertToPeriod(params['FromPeriod']) - 1;
                                        params['ToPeriod'] = this.convertToPeriod(params['ToPeriod']);
                                    }
                                    this.setSelectedChoice(params);
                                    this.modalService
                                        .open(UniPreviewModal, {
                                            data: this.updateParamsOnReport(
                                                component.config.report,
                                                params)
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

    ngOnDestroy() {
        this.subscriptions.map(sub => sub.unsubscribe());
    }

    convertToPeriod(term: number): number {
        return term * 2;
    }

    open(report: ReportDefinition) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID)
            .subscribe((params: ReportDefinitionParameter[]) => {
                this.modalConfig.report.parameters = params;
                this.modal.open();
            }, err => this.errorService.handle(err));
    }

    setSelectedChoice(params: any) {
        if (params['rememberChoice']) {
            this.browserStorage.setItem('rememberChoiceAGAReport', params['isTerm']);
        }
    }

    close() {
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
