import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService, FinancialYearService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from 'uniform-ng2/main';
import {ErrorService} from '../../../../services/services';

@Component({
    selector: 'customer-account-report-filter-form',
    templateUrl: './CustomerAccountReportFilterModal.html'
})
export class CustomerAccountReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: any[];
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
        ToAccountNumber: 199999,
        PeriodAccountYear: new Date().getFullYear(),
        PeriodAccountLastYear: (new Date().getFullYear()) - 1,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        OrderBy: 'CustomerNrAndJournalNr',
        ShowFilter: 'withoutCorrections'
    };

    private typeOfOrderBy: {ID: string, Label: string}[] = [
        {ID: 'CustomerNrAndJournalNr', Label: 'Kundenr og bilagsnr'},
        { ID: 'CustomerNrAndDate', Label: 'Kundenr og dato'},
        { ID: 'CustomerNameAndJournalNr', Label: 'Kundenavn og bilagsnr'},
        { ID: 'CustomerNameAndDate', Label: 'Kundenavn og dato'}
    ];

    private typeOfShowFilter: {ID: string, Label: string}[] = [
        {ID: 'withoutCorrections', Label: 'uten korrigeringer'},
        {ID: 'withCorrections', Label: 'med korrigeringer'},
        {ID: 'onlyCorrections', Label: 'med KUN korrigeringer'}
    ];

    constructor(
        private yearService: FinancialYearService
    ) {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();
        this.yearService.getActiveYear().subscribe(res => {
            this.model.PeriodAccountYear = res;
        });
        if ( this.model.PeriodAccountYear ){
                this.model.PeriodAccountLastYear = this.model.PeriodAccountYear - 1;
        }
    }

    private getComponentFields(): UniFieldLayout[] {
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
    selector: 'customer-account-report-filter-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig"></uni-modal>`
})
export class CustomerAccountReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = CustomerAccountReportFilterForm;

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
                                            case 'CustomerNrAndJournalNr':
                                            case 'CustomerNameAndJournalNr':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            case 'CustomerNrAndDate':
                                            case 'CustomerNameAndDate':
                                                parameter.value = 'FinancialDate';
                                                break;
                                        }
                                        break;
                                    case 'OrderByGroup':
                                        switch (component.model['OrderBy']) {
                                            case 'CustomerNameAndJournalNr':
                                            case 'CustomerNameAndDate':
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
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
