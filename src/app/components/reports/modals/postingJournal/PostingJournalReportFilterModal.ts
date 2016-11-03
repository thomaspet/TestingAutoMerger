import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {JournalEntryService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from '../../../../../framework/uniform/interfaces';

declare var _; // lodash
@Component({
    selector: 'balance-report-filter-form',
    templateUrl: 'app/components/reports/modals/postingJournal/PostingJournalReportFilterModal.html'
})
export class PostingJournalReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        FromJournalEntryNumber: number,
        ToJournalEntryNumber: number,
        PeriodAccountYear: number,
        FromPeriod: number,
        ToPeriod: number,
        OrderBy: string,
        ShowFilter: string
    } = {
        FromJournalEntryNumber: 1,
        ToJournalEntryNumber: 1,
        PeriodAccountYear: new Date().getFullYear(),
        FromPeriod: 1,
        ToPeriod: 12,
        OrderBy: 'date',
        ShowFilter: 'withoutCorrections'
    };

    private typeOfOrderBy: { ID: string, Label: string }[] = [
        { ID: 'date', Label: 'Bilagsnr og dato' },
        { ID: 'accountnumber', Label: 'Bilagsnr og kontonr' }
    ];

    private typeOfShowFilter: { ID: string, Label: string }[] = [
        { ID: 'withoutCorrections', Label: 'uten korrigeringer' },
        { ID: 'withCorrections', Label: 'med korrigeringer' },
        { ID: 'onlyCorrections', Label: 'med KUN korrigeringer' }
    ];

    constructor(private journalEntryService: JournalEntryService) {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();
        this.journalEntryService.getLastJournalEntryNumber().subscribe(data => {
            this.model.ToJournalEntryNumber = data.Data[0].JournalEntryLineJournalEntryNumberNumeric;
            this.model = _.cloneDeep(this.model);
        });
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

    private previewModal: PreviewModal;

    constructor(private reportDefinitionParameterService: ReportDefinitionParameterService) {
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            report: new Object(),

            actions: [
                {
                    text: 'Ok',
                    class: 'good',
                    method: () => {
                        this.modal.getContent().then((component: PostingJournalReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'PeriodAccountYear':
                                    case 'FromJournalEntryNumber':
                                    case 'ToJournalEntryNumber':
                                    case 'FromPeriod':
                                    case 'ToPeriod':
                                    case 'ShowFilter':
                                        parameter.value = component.model[parameter.Name];
                                        break;
                                    case 'OrderBy':
                                        switch (component.model.OrderBy) {
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
