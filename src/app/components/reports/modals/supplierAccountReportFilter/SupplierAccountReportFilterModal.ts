import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService, FinancialYearService, ErrorService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'supplier-account-report-filter-form',
    templateUrl: './SupplierAccountReportFilterModal.html'

})
export class SupplierAccountReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{
        FromAccountNumber: number,
        ToAccountNumber: number,
        PeriodAccountYear: number,
        PeriodAccountLastYear: number,
        FromPeriodNo: number,
        ToPeriodNo: number,
        HideAccounts: boolean,
        OrderBy: string,
        ShowFilter: string
    }> = new BehaviorSubject({
        FromAccountNumber: 200000,
        ToAccountNumber: 299999,
        PeriodAccountYear: new Date().getFullYear(),
        PeriodAccountLastYear: (new Date().getFullYear()) - 1,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        HideAccounts: false,
        OrderBy: 'SupplierNrAndJournalNr',
        ShowFilter: 'withoutCorrections'
    });

    private typeOfOrderBy: { ID: string, Label: string }[] = [
        { ID: 'SupplierNrAndJournalNr', Label: 'Leverandørnr og bilagsnr' },
        { ID: 'SupplierNrAndDate', Label: 'Leverandørnr og dato' },
        { ID: 'SupplierNameAndJournalNr', Label: 'Leverandørnavn og bilagsnr' },
        { ID: 'SupplierNameAndDate', Label: 'Leverandørnavn og dato' }
    ];

    private typeOfShowFilter: { ID: string, Label: string }[] = [
        { ID: 'withoutCorrections', Label: 'uten korrigeringer' },
        { ID: 'withCorrections', Label: 'med korrigeringer' },
        { ID: 'onlyCorrections', Label: 'med KUN korrigeringer' }
    ];

    constructor(
        private yearService: FinancialYearService
    ) {
    }

    public ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getComponentFields());
        this.yearService.getActiveYear().subscribe(res => {
            let model = this.model$.getValue();
            model.PeriodAccountYear = res;
            this.model$.next(model);
        });
        if (this.model$.getValue().PeriodAccountYear) {
            let model = this.model$.getValue();
            model.PeriodAccountLastYear = model.PeriodAccountYear - 1;
            this.model$.next(model);
        }
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
    public type: Type<any> = SupplierAccountReportFilterForm;

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
                        this.modal.getContent().then((component: SupplierAccountReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'ShowLastYear':
                                    case 'ShowFrontPage':
                                    case 'ShowFilter':
                                    case 'FromAccountNumber':
                                    case 'ToAccountNumber':
                                    case 'FromPeriodNo':
                                    case 'ToPeriodNo':
                                    case 'PeriodAccountYear':
                                    case 'PeriodAccountLastYear':
                                        parameter.value = component.model$.getValue()[parameter.Name];
                                        break;
                                    case 'PeriodAccountLastYear':
                                        parameter.value = component.model$.getValue()['PeriodAccountYear'] - 1;
                                        break;
                                    case 'OrderBy':
                                        switch (component.model$.getValue()['OrderBy']) {
                                            case 'SupplierNrAndJournalNr':
                                            case 'SupplierNameAndJournalNr':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            case 'SupplierNrAndDate':
                                            case 'SupplierNameAndDate':
                                                parameter.value = 'FinancialDate';
                                                break;
                                        }
                                        break;
                                    case 'OrderByGroup':
                                        switch (component.model$.getValue()['OrderBy']) {
                                            case 'SupplierNameAndJournalNr':
                                            case 'SupplierNameAndDate':
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
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
