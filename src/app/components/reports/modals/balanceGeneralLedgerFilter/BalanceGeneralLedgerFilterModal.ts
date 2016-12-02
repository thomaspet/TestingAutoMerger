import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from 'uniform-ng2/main';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'balance-general-ledger-filter-form',
    templateUrl: 'app/components/reports/modals/balanceList/BalanceReportFilterModal.html'
})
export class BalanceGeneralLedgerFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: any[];
    public model: {
        PeriodAccountYear: number,
        FromAccountNumber: number,
        ToAccountNumber: number,
        FromPeriodNo: number,
        ToPeriodNo: number,
        IncludeCorrections: boolean,
        UseColors: boolean,
        OrderBy: string
    } = {
        PeriodAccountYear: new Date().getFullYear(),
        FromAccountNumber: 1000,
        ToAccountNumber: 8999,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        IncludeCorrections: false,
        UseColors: true,
        OrderBy: 'Account.AccountNumber'
    };

    private orderByOptions: Array<{field: string, name: string}> = [
        {field: 'Account.AccountNumber', name: 'Kontonr'},
        {field: 'Account.AccountName', name: 'Kontonavn'}
    ];

    constructor() {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();


    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra konto',
                Property: 'FromAccountNumber'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til konto',
                Property: 'ToAccountNumber'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Regnskapsår',
                Property: 'PeriodAccountYear'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra periode',
                Property: 'FromPeriodNo'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til periode',
                Property: 'ToPeriodNo'
            },
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Sortering',
                Property: 'OrderBy',
                Options: {
                    source: this.orderByOptions,
                    valueProperty: 'field',
                    displayProperty: 'name',
                }
            },
            <any>{
                FieldType: FieldType.MULTISELECT,
                Label: 'Vis med korrigeringer',
                Property: 'IncludeCorrections'
            }
            //TODO? Trenger vi dette? Bør vel løses generelt for alle rapporter?
            //,
            //<any>{
            //    FieldType: FieldType.MULTISELECT,
            //    Label: 'Bruk farger',
            //    Property: 'UseColors'
            //}
        ];
    }
}

@Component({
    selector: 'balance-general-ledger-filter-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class BalanceGeneralLedgerFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = BalanceGeneralLedgerFilterForm;

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
                    method: () => {
                        this.modal.getContent().then((component: BalanceGeneralLedgerFilterForm) => {

                            // set parametervalues
                            for (const parameter of <AttilasCustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                parameter.value = component.model[parameter.Name];
                            }

                            // add custom parameters
                            let accountLastYearParam = new AttilasCustomReportDefinitionParameter();
                            accountLastYearParam.Name = 'PeriodAccountLastYear';
                            accountLastYearParam.value = component.model.PeriodAccountYear - 1;
                            this.modalConfig.report.parameters.push(accountLastYearParam);

                            let filterCorrectionsParam = new AttilasCustomReportDefinitionParameter();
                            filterCorrectionsParam.Name = 'FilterCorrections';
                            filterCorrectionsParam.value = component.model.IncludeCorrections ? '' : ' and isnull(OriginalReferencePostID,0) eq 0 and isnull(ReferenceCreditPostID,0) eq 0 ';
                            this.modalConfig.report.parameters.push(filterCorrectionsParam);

                            console.log('filterCorrectionsParam', filterCorrectionsParam);

                            this.modal.close();
                            this.previewModal.open(this.modalConfig.report);
                        });
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
