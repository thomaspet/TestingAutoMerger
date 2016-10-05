import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from '../../../../../framework/uniform/interfaces';

@Component({
    selector: 'customer-account-report-filter-form',
    templateUrl: 'app/components/reports/modals/customerAccountReportFilter/CustomerAccountReportFilterModal.html'
})
export class CustomerAccountReportFilterForm implements OnInit {
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
        OrderBy: string,        
        ShowFilter: string
    } = {
        FromAccountNumber: 100000,
        ToAccountNumber: 100000,
        PeriodAccountYear: new Date().getFullYear(),
        PeriodAccountLastYear: (new Date().getFullYear()) - 1,
        FromPeriodNo: 0,
        ToPeriodNo: 12,
        OrderBy: 'customerjournal',        
        ShowFilter: 'without'
    };

    private typeOfOrderBy: {ID: string, Label: string}[] = [
        {ID: 'customerjournal', Label: 'Kundenr og bilagsnr'},
        {ID: 'customerdate', Label: 'Kundenr og dato'},
        {ID: 'namejournal', Label: 'Kundenavn og bilagsnr'},
        {ID: 'namedate', Label: 'Kundenavn og dato'}
    ];

    private typeOfShowFilter: {ID: string, Label: string}[] = [
        {ID: 'without', Label: 'uten korrigeringer'},
        {ID: 'with', Label: 'med korrigeringer'},
        {ID: 'only', Label: 'med KUN korrigeringer'}
    ];

    constructor() {}

    public ngOnInit() {
        this.fields = [
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Fra kundenr',
                Property: 'FromAccountNumber'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til kundenr',
                Property: 'ToAccountNumber'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Regnskapsår',
                Property: 'PeriodAccountYear'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'FromPeriodNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'ToPeriodNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Sortering',
                Property: 'OrderBy',
                Options: {
                    source: this.typeOfOrderBy,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
            <UniFieldLayout>{
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
    selector: 'customer-account-report-filter-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig"></uni-modal>`
})
export class CustomerAccountReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = CustomerAccountReportFilterForm;
    
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
                        this.modal.getContent().then((component: CustomerAccountReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'ShowLastYear':
                                    case 'ShowFilter':
                                    case 'ShowFrontPage':
                                    case 'FromAccountNumber':
                                    case 'ToAccountNumber':
                                    case 'FromPeriodNo':
                                    case 'ToPeriodNo':
                                    case 'PeriodAccountYear':
                                        parameter.value = component.model[parameter.Name];
                                        break;
                                    case 'PeriodAccountLastYear':
                                        parameter.value = component.model['PeriodAccountYear'] - 1;
                                        break;
                                    case 'OrderBy':
                                        switch (component.model['OrderBy']) {
                                            case 'customerjournal':
                                            case 'namejournal':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            case 'customerdate':
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
                                        break;
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
