import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService, FinancialYearService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'account-report-filter-form',
    templateUrl: 'app/components/reports/modals/account/AccountReportFilterModal.html'
})
export class AccountReportFilterForm implements OnInit {
    @Input('config')
    public config: any = {};
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<{
        PeriodAccountYear: number,
        FromAccountNumber: number,
        ToAccountNumber: number,
        FromPeriodNo: number,
        ToPeriodNo: number,
        OrderBy: string,
        IncludeCorrections: boolean,
        ShowAccountsWithoutDetails: boolean,
        UseColors: boolean,
        ShowAccountsWithoutBalance: boolean,
        ShowFilter: string
    }> = new BehaviorSubject({
        PeriodAccountYear: new Date().getFullYear(),
        FromAccountNumber: 1000,
        ToAccountNumber: 8990,
        FromPeriodNo: 1,
        ToPeriodNo: 12,
        OrderBy: 'AccountNrAndJournalNr',
        IncludeCorrections: false,
        UseColors: true,
        ShowAccountsWithoutDetails: false,
        ShowAccountsWithoutBalance: false,
        ShowFilter: 'withoutCorrections'
    });

    private typeOfOrderBy: { ID: string, Label: string }[] = [
        { ID: 'AccountNrAndDate', Label: 'Kontonr og dato' },
        { ID: 'AccountNrAndJournalNr', Label: 'Kontonr og bilagsnr' },
        { ID: 'AccountNameAndDate', Label: 'Kontonavn og dato' },
        { ID: 'AccountNameAndJournalNr', Label: 'Kontonavn og bilagsnr' }
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
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Fra konto',
                Property: 'FromAccountNumber'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Til konto',
                Property: 'ToAccountNumber'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
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
                Label: 'Sorter etter',
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
            }
            //TODO. These controls to be included?
            //,
            //<any>{
            //    FieldType: FieldType.RADIO,
            //    Label: 'Vis kontoer uten bevegelse',
            //    Property: 'ShowAccountsWithoutDetails',
            //},
            //<any>{
            //    FieldType: FieldType.RADIO,
            //    Label: 'Vis kontoer uten saldo',
            //    Property: 'ShowAccountsWithoutBalance',
            //}
        ];
    }
}

@Component({
    selector: 'account-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class AccountReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = AccountReportFilterForm;

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
                        this.modal.getContent().then((component: AccountReportFilterForm) => {

                            // set parametervalues
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'OrderBy':
                                        switch (component.model$.getValue()['OrderBy']) {
                                            case 'AccountNrAndDate':
                                                parameter.value = 'Financialdate';
                                                break;
                                            case 'AccountNrAndJournalNr':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            case 'AccountNameAndDate':
                                                parameter.value = 'Financialdate';
                                                break;
                                            case 'AccountNameAndJournalNr':
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                            default:
                                                parameter.value = 'JournalEntryNumber';
                                                break;
                                        }
                                        break;
                                    default:
                                        parameter.value = component.model$.getValue()[parameter.Name];
                                        break;
                                }
                            }

                            // add custom parameters
                            let accountLastYearParam = new CustomReportDefinitionParameter();
                            accountLastYearParam.Name = 'PeriodAccountLastYear';
                            accountLastYearParam.value = component.model$.getValue().PeriodAccountYear - 1;
                            this.modalConfig.report.parameters.push(accountLastYearParam);

                            let orderByGroupParam = new CustomReportDefinitionParameter();
                            orderByGroupParam.Name = 'OrderByGroup';
                            switch (component.model$.getValue()['OrderBy']) {
                                case 'AccountNrAndDate':
                                case 'AccountNrAndJournalNr':
                                    orderByGroupParam.value = 'number';
                                    break;
                                case 'AccountNameAndDate':
                                case 'AccountNameAndJournalNr':
                                    orderByGroupParam.value = 'name';
                                    break;
                                default:
                                    orderByGroupParam.value = 'default';
                                    break;
                            }
                            this.modalConfig.report.parameters.push(orderByGroupParam);


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
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
