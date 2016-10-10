import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from "../../../../../framework/uniform/interfaces";

@Component({
    selector: 'supplier-account-report-filter-form',
    templateUrl: 'app/components/reports/modals/SupplierAccountReportFilter/SupplierAccountReportFilterModal.html'

})
export class SupplierAccountReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        FromAccountNumber: number,
        ToAccountNumber: number,
        PeriodAccountYear: number,
        PeriodAccountLastYear: number,
        FromPeriodNo: number,
        ToPeriodNo: number,
        HideAccounts: boolean,
        OrderBy: string,
        ShowFilter: string
    } = {
        FromAccountNumber: 200000,
        ToAccountNumber: 200000,
        PeriodAccountYear: new Date().getFullYear(),
        PeriodAccountLastYear: (new Date().getFullYear()) - 1,
        FromPeriodNo: 0,
        ToPeriodNo: 12,
        HideAccounts: false,
        OrderBy: 'supplierjournal',
        ShowFilter: 'without'
    };

    private typeOfOrderBy: {ID: string, Label: string, Value: string}[] = [
        {ID: 'supplierjournal', Label: 'Kundenr og bilagsnr', Value: ''},
        {ID: 'supplierdate', Label: 'Kundenr og dato', Value: ''},
        {ID: 'namejournal', Label: 'Kundenavn og bilagsnr', Value: ''},
        {ID: 'namedate', Label: 'Kundenavn og dato', Value: ''}
    ];

    private typeOfShowFilter: {ID: string, Label: string}[] = [
        {ID: 'without', Label: 'uten korrigeringer'},
        {ID: 'with', Label: 'med korrigeringer'},
        {ID: 'only', Label: 'med KUN korrigeringer'}
    ];

    constructor() {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();
    }

    public getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra kundenr',
                Property: 'FromAccountNumber'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til kundenr',
                Property: 'ToAccountNumber'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Regnskapsår',
                Property: 'PeriodAccountYear'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'FromPeriodNo'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'ToPeriodNo'
            },
            <any>{
                FieldType: FieldType.CHECKBOX,
                Label: 'Skjul kontoer uten bevegelse',
                Property: 'HideAccounts'
            },
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Sortering',
                Property: 'OrderBy',
                Options: {
                    source: this.typeOfOrderBy,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Vis bilag',
                Property: 'ShowFilter',
                Options: {
                    source: this.typeOfShowFilter,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
        ];
    }
}

@Component({
    selector: 'supplier-account-report-filter-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig"></uni-modal>`
})
export class SupplierAccountReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type = SupplierAccountReportFilterForm;

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
                        this.modal.getContent().then((component: SupplierAccountReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'ShowLastYear':
                                    case 'ReportFor':
                                    case 'ShowFrontPage':
                                    case 'FromAccountNumber':
                                    case 'ToAccountNumber':
                                    case 'FromPeriodNo':
                                    case 'ToPeriodNo':
                                    case 'PeriodAccountYear':
                                    case 'PeriodAccountLastYear':
                                        parameter.value = component.model[parameter.Name];
                                        break;
                                    case 'PeriodAccountLastYear':
                                        parameter.value = component.model['PeriodAccountYear'] - 1;
                                        break;
                                    case 'OrderBy':
                                        switch (component.model['OrderBy']) {
                                            case 'supplierjournal':
                                            case 'namejournal':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            case 'supplierdate':
                                            case 'namedate':
                                                parameter.value = 'FinancialDate';
                                                break;
                                        }
                                        break;
                                    case 'OrderByGroup':
                                        switch (component.model['OrderBy']) {
                                            case 'namejournal':
                                            case 'namedate':
                                                parameter.value = 'name';
                                                break;
                                            default:
                                                parameter.value = 'journalentrynumber';
                                                break;
                                        }
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

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
