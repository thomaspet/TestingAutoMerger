import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {
    ReportDefinitionParameterService,
    ErrorService,
    FinancialYearService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'balance-report-filter-form',
    templateUrl: './BalanceReportFilterModal.html'
})
export class BalanceReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{
        journalYear: number,
        fromPeriod: number,
        toPeriod: number,
        includezerobalance: boolean,
        orderBy: string
    }> = new BehaviorSubject({
        journalYear: new Date().getFullYear(),
        fromPeriod: 1,
        toPeriod: 12,
        includezerobalance: false,
        orderBy: 'AccountNumber'
    });

    constructor(
        private yearService: FinancialYearService
    ) {}

    public ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getComponentFields());
        this.yearService.getActiveYear().subscribe(res => {
            let model = this.model$.getValue();
            model.journalYear = res;
            this.model$.next(model);
        });
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Regnskapsår',
                Property: 'journalYear'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'fromPeriod'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'toPeriod'
            },
            <any>{
                FieldType: FieldType.RADIO,
                Label: 'Inkluder kontoer med saldo = 0',
                Property: 'includeZeroBalance'
            }
        ]
    }
}

@Component({
    selector: 'balance-report-filter-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class BalanceReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = BalanceReportFilterForm;

    private previewModal: PreviewModal;

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private errorService: ErrorService
    ) {
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            report: new Object(),

            actions: [
                {
                    text: 'Ok',
                    class: 'good',
                    method: (model$) => {
                        for (const parameter of <AttilasCustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                            if (parameter.Name === 'odatafilter') {
                                parameter.value = `Period.AccountYear eq '${model$.getValue().journalYear}'`
                                    + ` and Period.No ge ${model$.getValue().fromPeriod}`
                                    + ` and Period.No le ${model$.getValue().toPeriod}`;
                            } else if (parameter.Name === 'includezerobalancecustomer') {
                                parameter.value = model$.getValue().includezerobalance;
                            } else if (parameter.Name === 'includezerobalancesupplier') {
                                parameter.value = model$.getValue().includezerobalance;
                            } else if (parameter.Name === 'orderby') {
                                parameter.value = model$.getValue().orderBy;
                            }
                        }

                        // add custom parameters - these are used in ODATA in the data retrieval, but
                        // are also sent to the report as individual parameters to make it easier to
                        // use them in the report
                        let accountYearParam = new AttilasCustomReportDefinitionParameter();
                        accountYearParam.Name = 'PeriodAccountYear';
                        accountYearParam.value = model$.getValue().journalYear;

                        let periodFromParam = new AttilasCustomReportDefinitionParameter();
                        periodFromParam.Name = 'PeriodFrom';
                        periodFromParam.value = model$.getValue().fromPeriod;

                        let periodToParam = new AttilasCustomReportDefinitionParameter();
                        periodToParam.Name = 'PeriodTo';
                        periodToParam.value = model$.getValue().toPeriod;

                        this.modalConfig.report.parameters.push(accountYearParam);
                        this.modalConfig.report.parameters.push(periodFromParam);
                        this.modalConfig.report.parameters.push(periodToParam);

                        this.modal.close();
                        this.previewModal.open(this.modalConfig.report);
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.getContent().then(() => {
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public open(report: ReportDefinition, previewModal: PreviewModal) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;
        this.previewModal = previewModal;

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID).subscribe(params => {
            this.modalConfig.report.parameters = params;
            this.modal.open();
        }, err => this.errorService.handle(err));
    }
}

class AttilasCustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
