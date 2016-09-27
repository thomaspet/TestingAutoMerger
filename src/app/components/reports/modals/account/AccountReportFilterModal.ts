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
    selector: 'account-report-filter-form',
    directives: [NgIf, NgFor, NgClass, UniComponentLoader, UniForm],
    templateUrl: 'app/components/reports/modals/account/AccountReportFilterModal.html'
})
export class AccountReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        PeriodAccountYear: number,
        FromAccountNumber: number,
        ToAccountNumber: number,
        FromPeriodNo: number,
        ToPeriodNo: number,
        OrderBy: string,
        IncludeCorrections: boolean,
        ShowAccountsWithoutDetails: boolean,
        UseColors: boolean,
        ShowAccountsWithoutBalance: boolean
    } = {
        PeriodAccountYear: new Date().getFullYear(),
        FromAccountNumber: 1000,
        ToAccountNumber: 8990,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        OrderBy: 'Account.AccountNumber',
        IncludeCorrections: false,
        UseColors: true,
        ShowAccountsWithoutDetails: false,
        ShowAccountsWithoutBalance: false
    };

    // TODO: 
    // * Show journal entries with/without corrections
    // * 

    //TODO: Not completed yet
    private typeOOrderBy: { ID: string, Label: string }[] = [
        { ID: 'accountAndDate', Label: 'Kontonr og dato' },
        { ID: 'Account.AccountNumber', Label: 'Kontonr og bilagsnr' },
        { ID: 'accountNameAndDate', Label: 'Kontonavn og bilagsnr' },
        { ID: 'accountNameAndJournalNr', Label: 'Kontonavn og dato' }
    ];

    constructor() { }

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
                Label: 'Sorter etter',
                Property: 'OrderBy',
                Options: {
                    source: this.typeOOrderBy,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
            <UniFieldLayout>{
                FieldType: FieldType.RADIO,
                Label: 'Vis kontoer uten bevegelse',
                Property: 'ShowAccountsWithoutDetails',
            },
            <UniFieldLayout>{
                FieldType: FieldType.RADIO,
                Label: 'Vis kontoer uten saldo',
                Property: 'ShowAccountsWithoutBalance',
            }
        ];
    }
}

@Component({
    selector: 'account-report-filter-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionParameterService]
})
export class AccountReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type = AccountReportFilterForm;

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
                        this.modal.getContent().then((component: AccountReportFilterForm) => {

                            // set parametervalues
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                parameter.value = component.model[parameter.Name];
                            }

                            // add custom parameters
                            let accountLastYearParam = new CustomReportDefinitionParameter();
                            accountLastYearParam.Name = 'PeriodAccountLastYear';
                            accountLastYearParam.value = component.model.PeriodAccountYear - 1;
                            this.modalConfig.report.parameters.push(accountLastYearParam);

                            // add custom parameters
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
