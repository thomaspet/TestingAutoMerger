import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {NgIf, NgFor, NgClass} from '@angular/common';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService,JournalEntryService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from '../../../../../framework/uniform/interfaces';
import {UniForm} from '../../../../../framework/uniform/uniform';

@Component({
    selector: 'balance-report-filter-form',
    directives: [NgIf, NgFor, NgClass, UniComponentLoader, UniForm],
    templateUrl: 'app/components/reports/modals/postingJournal/PostingJournalReportFilterModal.html',
    providers: [JournalEntryService]
})
export class PostingJournalReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        fromJournalEntryNumber: string,
        toJournalEntryNumber: string,
        fromPeriod: number,
        toPeriod: number,
        orderBy: string,
        showFilter: string
    } = {
        fromJournalEntryNumber: '1-2016',
        toJournalEntryNumber: '',
        fromPeriod: 0,
        toPeriod: 12,
        orderBy: 'date',
        showFilter: 'without'
    };

    private typeOfOrderBy: {ID: string, Label: string}[] = [
        {ID: 'date', Label: 'Bilagsnr og dato'},
        {ID: 'accountnumber', Label: 'Bilagsnr og kontonr'}
    ];

    private typeOfShowFilter: {ID: string, Label: string}[] = [
        {ID: 'without', Label: 'uten korrigeringer'},
        {ID: 'with', Label: 'med korrigeringer'},
        {ID: 'only', Label: 'med KUN korrigeringer'}
    ];

    constructor(private journalEntryService: JournalEntryService) {
    }

    public ngOnInit() {
        var self = this;

        this.fields = [
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Fra bilagsnr',
                Property: 'fromJournalEntryNumber'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til bilagsnr',
                Property: 'toJournalEntryNumber'
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
                FieldType: FieldType.DROPDOWN,
                Label: 'Sortering',
                Property: 'orderBy',
                Options: {
                    source: this.typeOfOrderBy,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
            <UniFieldLayout>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Vis bilag',
                Property: 'reportFor',
                Options: {
                    source: this.typeOfShowFilter,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
        ];

        this.journalEntryService.getLastJournalEntryNumber().subscribe(data => {
            this.model.toJournalEntryNumber = data[0].Data[0].JournalEntryLineJournalEntryNumber;
            // TOOD: update form
        });

    }
}

@Component({
    selector: 'postingjournal-report-filter-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionParameterService]
})
export class PostingJournalReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = PostingJournalReportFilterForm;
    
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
                        this.modal.getContent().then((component: PostingJournalReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch(parameter.Name) {
                                    case 'odatafilter':
                                        parameter.value = `Period.No ge ${component.model.fromPeriod}`
                                        + ` and Period.No le ${component.model.toPeriod}`;
                                        break;
                                    case 'fromJournalEntryNumber':
                                    case 'toJournalEntryNumber':
                                    case 'fromPeriod':
                                    case 'toPeriod':
                                    case 'showFilter':
                                        parameter.value = component.model[parameter.Name];
                                        break;
                                    case 'orderBy':
                                        switch(component.model.orderBy) {
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
