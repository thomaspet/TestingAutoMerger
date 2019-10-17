import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniModalService} from '../../modalService';
import {IUniModal, IModalOptions, ConfirmActions} from '../../interfaces';
import {Observable} from 'rxjs';
import {UniPreviewModal} from '@app/components/reports/modals/preview/previewModal';
import {ReportDefinition, ReportParameter} from '@uni-entities';

import {
    ReportTypeService,
    ErrorService,
    ReportDefinitionParameterService,
    CompanySettingsService,
} from '@app/services/services';

class CustomReportParameter extends ReportParameter {
    Name: string;
    value: string;
}

@Component({
    selector: 'choose-report-modal',
    templateUrl: './chooseReportModal.html',
    styleUrls: ['./chooseReportModal.sass']
})
export class UniChooseReportModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    reports: ReportDefinition[];
    selectedReport: any;
    showParameters: boolean = false;
    fromNr: string;
    toNr: string;
    inputFromLabel: string;
    inputToLabel: string;
    inputType: {name: string, secondInputType: string, secondName: string} = {name: 'nr', secondInputType: null, secondName: null};
    defaultParameters: CustomReportParameter[] = [];

    constructor(
        private reportTypeService: ReportTypeService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private companySettingsService: CompanySettingsService,
    ) {}

    ngOnInit() {
        this.busy = true;
        Observable.forkJoin(
            this.reportTypeService.getFormType(this.options.data.type),
            this.companySettingsService.Get(1)
        ).subscribe(
            data => {
                this.reports = data[0];
                const company = data[1];
                const entity = this.options.data.entity;

                let defaultReportID;
                let localization;

                if (entity && entity.Customer) {
                    defaultReportID = entity.Customer[`DefaultCustomer${this.options.data.typeName}ReportID`];
                    localization = entity.Customer.Localization;
                }

                if (company) {
                    if (!defaultReportID) {
                        defaultReportID = company[`DefaultCustomer${this.options.data.typeName}ReportID`];
                    }

                    if (!localization) {
                        localization = company.Localization;
                    }
                }

                const defaultReport = defaultReportID && this.reports.find(report => report.ID === defaultReportID);
                this.selectedReport = defaultReport || this.reports[0];
                this.selectedReport.localization = localization;

                this.loadReportParameters();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    loadReportParameters() {
        if (!this.selectedReport || !this.selectedReport.ID) {
            this.busy = false;
            return;
        }

        this.reportDefinitionParameterService.GetAll(
            'filter=ReportDefinitionId eq ' + this.selectedReport.ID
        ).subscribe(
            res => {
                const name = res[0].Name.includes('Number') ? 'nr' : res[0].Name.toLowerCase();
                this.inputType.name = res[0].Name;
                this.inputType.secondInputType = null;

                this.fromNr = res[0].Name.includes('Id')
                    ? this.options.data.entity.ID
                    : this.options.data.entity[this.options.data.typeName + 'Number'];

                this.toNr = this.fromNr;

                this.inputFromLabel = res.length > 1
                    ? `Fra ${this.options.data.name.toLowerCase()} ${name}`
                    : `${this.options.data.name} ${name}`;

                this.inputToLabel = `Til ${this.options.data.name.toLowerCase()} ${name}`;

                if (res[1] && res[1].Type === 'Number') {
                    this.inputType.secondName = res[1].Name;
                    this.inputType.secondInputType = res[1].Type;
                }

                this.setReportParameters();

                // Create default parameters
                const keys = this.selectedReport.parameters.map(param => param.Name);
                res.forEach(param => {
                    if (!keys.includes(param.Name)) {
                        this.defaultParameters.push(<CustomReportParameter> {
                            Name: param.Name,
                            value: param.DefaultValue
                        });
                    }
                });

                this.selectedReport.parameters.concat(this.defaultParameters);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private setReportParameters(): CustomReportParameter[] {
        if (this.inputType.secondName && this.inputType.secondInputType) {
            return this.selectedReport.parameters = [ <CustomReportParameter> {
                Name: this.inputType.name,
                value: this.fromNr
            }, <CustomReportParameter> {
                Name: this.inputType.secondName,
                value: this.toNr
            }].concat(this.defaultParameters);
        }
        return this.selectedReport.parameters = [ <CustomReportParameter> {
            Name: this.inputType.name,
            value: this.fromNr
        }].concat(this.defaultParameters);
    }

    acceptAndSendEmail() {
        this.setReportParameters();
        this.onClose.emit({
            action: 'email',
            form: this.selectedReport,
            entity: this.options.data.entity,
            entityTypeName: this.options.data.typeName,
            name: this.options.data.name
        });
    }

    acceptAndPrintOut() {
        this.setReportParameters();
        this.onClose.emit({
            action: 'print',
            form: this.selectedReport,
        });
    }

    preview() {
        this.setReportParameters();
        this.modalService.open(UniPreviewModal, {
            data: this.selectedReport
        });
    }

    cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
