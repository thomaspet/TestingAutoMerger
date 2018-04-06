import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService, FinancialYearService} from '../../../../services/services';
import {UniModalService} from '../../../../../framework/uni-modal';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'customer-account-report-filter-form',
    templateUrl: './CustomerAccountReportFilterModal.html'
})
export class CustomerAccountReportFilterForm implements OnInit {
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
        OrderBy: string,
        ShowFilter: string
    }> = new BehaviorSubject({
        FromAccountNumber: 100000,
        ToAccountNumber: 199999,
        PeriodAccountYear: new Date().getFullYear(),
        PeriodAccountLastYear: (new Date().getFullYear()) - 1,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        OrderBy: 'CustomerNrAndJournalNr',
        ShowFilter: 'withoutCorrections'
    });

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

    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private errorService: ErrorService,
        private modalService: UniModalService
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
                        for (
                            const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters
                        ) {
                            switch (parameter.Name) {
                                case 'ShowLastYear':
                                case 'ShowFilter':
                                case 'ShowFrontPage':
                                case 'FromAccountNumber':
                                case 'ToAccountNumber':
                                case 'FromPeriodNo':
                                case 'ToPeriodNo':
                                case 'PeriodAccountYear':
                                    parameter.value = model$.getValue()[parameter.Name];
                                    break;
                                case 'PeriodAccountLastYear':
                                    parameter.value = model$.getValue()['PeriodAccountYear'] - 1;
                                    break;
                                case 'OrderBy':
                                    switch (model$.getValue()['OrderBy']) {
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
                                    switch (model$.getValue()['OrderBy']) {
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
                        this.modalService.open(UniPreviewModal, {
                            data: this.modalConfig.report
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

    public open(report: ReportDefinition) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;

        this.reportDefinitionParameterService.GetAll(
            'filter=ReportDefinitionId eq ' + report.ID
        ).subscribe(params => {
            this.modalConfig.report.parameters = params;
            this.modal.open();
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
