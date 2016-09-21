import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {NgIf, NgFor, NgClass} from '@angular/common';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from '../../../../../framework/uniform/interfaces';
import {UniForm} from '../../../../../framework/uniform/uniform';

@Component({
    selector: 'balance-general-ledger-filter-form',
    directives: [NgIf, NgFor, NgClass, UniComponentLoader, UniForm],
    templateUrl: 'app/components/reports/modals/balanceList/BalanceReportFilterModal.html'
})
export class BalanceGeneralLedgerFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
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

    constructor() {}

    public ngOnInit() {
        this.fields = [
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra konto',
                Property: 'FromAccountNumber'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til konto',
                Property: 'ToAccountNumber'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Regnskapsår',
                Property: 'PeriodAccountYear'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra periode',
                Property: 'FromPeriodNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til periode',
                Property: 'ToPeriodNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Sortering',
                Property: 'OrderBy',
                Options: {
                    source: this.orderByOptions,
                    valueProperty: 'field',
                    displayProperty: 'name',
                }
            },
            <UniFieldLayout>{
                FieldType: FieldType.MULTISELECT,
                Label: 'Vis med korrigeringer',
                Property: 'IncludeCorrections'
            },
            <UniFieldLayout>{
                FieldType: FieldType.MULTISELECT,
                Label: 'Bruk farger',
                Property: 'UseColors'
            }
        ];


    }
}

@Component({
    selector: 'balance-general-ledger-filter-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionParameterService]
})
export class BalanceGeneralLedgerFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type = BalanceGeneralLedgerFilterForm;

    private previewModal: PreviewModal;

    constructor(private reportDefinitionParameterService: ReportDefinitionParameterService) {
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            report: new Object(),

            actions: [
                {
                    text: 'Ok',
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
        });
    }
}

class AttilasCustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
