import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService, FinancialYearService} from '../../../../services/services';
import {JournalEntryService} from '../../../../services/services';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {ErrorService} from '../../../../services/services';

declare var _;
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'balance-report-filter-form',
    templateUrl: './PostingJournalReportFilterModal.html'
})
export class PostingJournalReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{
        FromJournalEntryNumber: number,
        ToJournalEntryNumber: number,
        PeriodAccountYear: number,
        FromPeriod: number,
        ToPeriod: number,
        OrderBy: string,
        ShowFilter: string
    }> = new BehaviorSubject({
        FromJournalEntryNumber: 1,
        ToJournalEntryNumber: 1,
        PeriodAccountYear: new Date().getFullYear(),
        FromPeriod: 1,
        ToPeriod: 12,
        OrderBy: 'date',
        ShowFilter: 'withoutCorrections'
    });

    private typeOfOrderBy: { ID: string, Label: string }[] = [
        { ID: 'date', Label: 'Bilagsnr og dato' },
        { ID: 'accountnumber', Label: 'Bilagsnr og kontonr' }
    ];

    private typeOfShowFilter: { ID: string, Label: string }[] = [
        { ID: 'withoutCorrections', Label: 'uten korrigeringer' },
        { ID: 'withCorrections', Label: 'med korrigeringer' },
        { ID: 'onlyCorrections', Label: 'med KUN korrigeringer' }
    ];

    constructor(
        private journalEntryService: JournalEntryService,
        private errorService: ErrorService,
        private yearService: FinancialYearService) {
    }

    public ngOnInit() {
        this.config$.next(this.config);
        this.fields$.next(this.getComponentFields());
        this.yearService.getActiveYear().subscribe(res => {
            let model = this.model$.getValue();
            model.PeriodAccountYear = res;
            this.model$.next(model);
        });
        this.journalEntryService.getLastJournalEntryNumber().subscribe(data => {
            let model = this.model$.getValue();
            model.ToJournalEntryNumber = data.Data[0].JournalEntryLineJournalEntryNumberNumeric;
            this.model$.next(model);
        }, err => this.errorService.handle(err));
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra bilagsnr',
                Property: 'FromJournalEntryNumber'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til bilagsnr',
                Property: 'ToJournalEntryNumber'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Regnskapsår',
                Property: 'PeriodAccountYear'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'FromPeriod'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'ToPeriod'
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
    selector: 'postingjournal-report-filter-modal',
    template: `<uni-modal [type]='type' [config]='modalConfig'></uni-modal>`
})
export class PostingJournalReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = PostingJournalReportFilterForm;

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
                        for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                            switch (parameter.Name) {
                                case 'PeriodAccountYear':
                                case 'FromJournalEntryNumber':
                                case 'ToJournalEntryNumber':
                                case 'FromPeriod':
                                case 'ToPeriod':
                                case 'ShowFilter':
                                    parameter.value = model$.getValue()[parameter.Name];
                                    break;
                                case 'OrderBy':
                                    switch (model$.getValue().OrderBy) {
                                        case 'date':
                                            parameter.value = 'Financialdate';
                                            break;
                                        case 'accountnumber':
                                            parameter.value = 'Account.AccountNumber';
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

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID).subscribe(params => {
            this.modalConfig.report.parameters = params;
            this.modal.open();
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
