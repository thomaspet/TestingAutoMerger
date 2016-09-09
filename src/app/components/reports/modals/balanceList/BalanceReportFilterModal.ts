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
    selector: 'balance-report-filter-form',
    directives: [NgIf, NgFor, NgClass, UniComponentLoader, UniForm],
    templateUrl: 'app/components/reports/modals/balanceList/BalanceReportFilterModal.html'
})
export class BalanceReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        journalYear: number,
        fromPeriod: number,
        toPeriod: number,
        includezerobalance: boolean,
        orderBy: string
    } = {
        journalYear: new Date().getFullYear(),
        fromPeriod: 1,
        toPeriod: 12,
        includezerobalance: false,
        orderBy: 'AccountNumber'
    };

    constructor() {}

    public ngOnInit() {
        this.fields = [
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Rengskapsår',
                Property: 'journalYear'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'fromPeriod'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'toPeriod'
            },
            <UniFieldLayout>{
                FieldType: FieldType.RADIO,
                Label: 'Inkluder kontoer med saldo = 0',
                Property: 'includeZeroBalance'
            }
        ];
    }
}

@Component({
    selector: 'balance-report-filter-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionParameterService]
})
export class BalanceReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = BalanceReportFilterForm;
    
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
                        this.modal.getContent().then((component: BalanceReportFilterForm) => {
                            for (const parameter of <AttilasCustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                if (parameter.Name === 'odatafilter') {
                                    parameter.value = `Period.AccountYear eq '${component.model.journalYear}'`
                                        + ` and Period.No ge ${component.model.fromPeriod}`
                                        + ` and Period.No le ${component.model.toPeriod}`;
                                } else if (parameter.Name === 'includezerobalancecustomer') {
                                    parameter.value = component.model.includezerobalance;
                                } else if (parameter.Name === 'includezerobalancesupplier') {
                                    parameter.value = component.model.includezerobalance;
                                } else if (parameter.Name === 'orderby') {
                                    parameter.value = component.model.orderBy;
                                }
                            }
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
