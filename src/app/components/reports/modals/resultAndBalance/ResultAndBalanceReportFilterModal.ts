import {Component, ViewChild, Type, Input, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, FieldType, ReportDefinitionParameter} from '../../../../unientities';
import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {UniFieldLayout} from 'uniform-ng2/main';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'result-and-balance-report-filter-form',
    templateUrl: 'app/components/reports/modals/resultAndBalance/ResultAndBalanceReportFilterModal.html'
})
export class ResultAndBalanceReportFilterForm implements OnInit {
    @Input('config')
    public config: any;
    public fields: UniFieldLayout[];
    public model: {
        ReportYear: number,
        fromPeriod: number,
        toPeriod: number,
        fromProjectNo: number,
        toProjectNo: number,
        fromDepartmentNo: number,
        toDepartmentNo: number,
        orderBy: string,
        reportFor: string,
        showFrontPage: boolean,
        showLastYear: boolean,
        showUnallocated: boolean,
        resultfirstgroup: number,
        resultlastgroup: number,
        balancefirstgroup: number,
        balancelastgroup: number
    } = {
        ReportYear: new Date().getFullYear(),
        fromPeriod: 1,
        toPeriod: 12,
        fromProjectNo: 0,
        toProjectNo: 99999,
        fromDepartmentNo: 0,
        toDepartmentNo: 99999,
        orderBy: 'AccountNumber',
        reportFor: 'both',
        showFrontPage: true,
        showLastYear: true,
        showUnallocated: true,
        resultfirstgroup: 94,
        resultlastgroup: 99,
        balancefirstgroup: 92,
        balancelastgroup: 93
    };

    private typeOfReportFor: {ID: string, Label: string}[] = [
        {ID: 'both', Label: 'Begge'},
        {ID: 'result', Label: 'Resultat'},
        {ID: 'balance', Label: 'Balanse'}
    ];

    constructor() {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Vis rapport for',
                Property: 'reportFor',
                Options: {
                    source: this.typeOfReportFor,
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
            },
            <any>{
                FieldType: FieldType.RADIO,
                Label: 'Vis forside',
                Property: 'showFrontPage',
            },
            <any>{
                FieldType: FieldType.RADIO,
                Label: 'Vis fjorårets tall',
                Property: 'showLastYear'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Regnskapsår',
                Property: 'ReportYear'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra periode',
                Property: 'fromPeriod'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Til periode',
                Property: 'toPeriod'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Fra prosjekt',
                Property: 'fromProjectNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til prosjekt',
                Property: 'toProjectNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Fra avdeling',
                Property: 'fromDepartmentNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.TEXT,
                Label: 'Til avdeling',
                Property: 'toDepartmentNo'
            },
            <UniFieldLayout>{
                FieldType: FieldType.RADIO,
                Label: 'Vis udisp. beløp som del av EK',
                Property: 'showUnallocated'
            }
        ];
    }
}

@Component({
    selector: 'result-and-balance-report-filter-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class ResultAndBalanceReportFilterModal {
    @ViewChild(UniModal)
    private modal: UniModal;

    public modalConfig: any = {};
    public type: Type<any> = ResultAndBalanceReportFilterForm;

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
                        this.modal.getContent().then((component: ResultAndBalanceReportFilterForm) => {
                            for (const parameter of <CustomReportDefinitionParameter[]>this.modalConfig.report.parameters) {
                                switch (parameter.Name) {
                                    case 'odatafilter':
                                        parameter.value = `Period.AccountYear eq '${component.model.ReportYear}'`
                                            + ` and Period.No ge ${component.model.fromPeriod}`
                                            + ` and Period.No le ${component.model.toPeriod}`
                                            + ` and isnull(Project.ProjectNumber\,0) ge ${component.model.fromProjectNo}`
                                            + ` and isnull(Project.ProjectNumber\,0) le ${component.model.toProjectNo}`
                                            + ` and isnull(Department.DepartmentNumber\,0) ge ${component.model.fromDepartmentNo}`
                                            + ` and isnull(Department.DepartmentNumber\,0) le ${component.model.toDepartmentNo}`;
                                        break;
                                    case 'ReportYear':
                                    case 'showLastYear':
                                    case 'reportFor':
                                    case 'showFrontPage':
                                    case 'resultfirstgroup':
                                    case 'resultlastgroup':
                                    case 'balancefirstgroup':
                                    case 'balancelastgroup':
                                        parameter.value = component.model[parameter.Name];
                                        break;
                                    case 'ReportLastYear':
                                        parameter.value = component.model['ReportYear'] - 1;
                                        break;
                                }
                            }

                            // Add report parameters                                              
                            let periodFromParam = new CustomReportDefinitionParameter();
                            periodFromParam.Name = 'PeriodFrom';
                            periodFromParam.value = component.model.fromPeriod;

                            let periodToParam = new CustomReportDefinitionParameter();
                            periodToParam.Name = 'PeriodTo';
                            periodToParam.value = component.model.toPeriod;

                            //Project
                            let projectNoFromParam = new CustomReportDefinitionParameter();
                            projectNoFromParam.Name = 'ProjectNoFrom';
                            projectNoFromParam.value = component.model.fromProjectNo;

                            let projectNoToParam = new CustomReportDefinitionParameter();
                            projectNoToParam.Name = 'ProjectNoTo';
                            projectNoToParam.value = component.model.toProjectNo;

                            let departmentNoFromParam = new CustomReportDefinitionParameter();
                            departmentNoFromParam.Name = 'DepartmentNoFrom';
                            departmentNoFromParam.value = component.model.fromDepartmentNo;

                            let departmentNoToParam = new CustomReportDefinitionParameter();
                            departmentNoToParam.Name = 'DepartmentNoTo';
                            departmentNoToParam.value = component.model.toDepartmentNo;

                            let unallocatedParam = new CustomReportDefinitionParameter();
                            unallocatedParam.Name = 'showUnallocated';
                            unallocatedParam.value = component.model.showUnallocated;

                            this.modalConfig.report.parameters.push(periodFromParam);
                            this.modalConfig.report.parameters.push(periodToParam);
                            this.modalConfig.report.parameters.push(projectNoFromParam);
                            this.modalConfig.report.parameters.push(projectNoToParam);
                            this.modalConfig.report.parameters.push(departmentNoFromParam);
                            this.modalConfig.report.parameters.push(departmentNoToParam);
                            this.modalConfig.report.parameters.push(unallocatedParam);

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
        }, this.errorService.handle);
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
