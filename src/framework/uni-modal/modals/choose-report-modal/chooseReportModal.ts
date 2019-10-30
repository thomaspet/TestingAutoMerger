import {Component, Input, Output, EventEmitter, SimpleChange} from '@angular/core';
import {UniModalService} from '../../modalService';
import {IUniModal, IModalOptions, ConfirmActions} from '../../interfaces';
import {Observable} from 'rxjs';
import {UniPreviewModal} from '@app/components/reports/modals/preview/previewModal';
import {ReportDefinition, ReportParameter, StatusCodeCustomerInvoice, StatusCodeCustomerQuote, StatusCodeCustomerOrder} from '@uni-entities';

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
        const entity = this.options.data.entity;
        const isdraft: boolean =
            entity.StatusCode == StatusCodeCustomerInvoice.Draft ||
            entity.StatusCode == StatusCodeCustomerOrder.Draft || 
            entity.StatusCode == StatusCodeCustomerQuote.Draft;

        Observable.forkJoin(
            this.reportTypeService.getFormType(this.options.data.type, isdraft),
            this.companySettingsService.Get(1)
        ).subscribe(
            data => {
                this.reports = data[0];
                const company = data[1];
                const defaultReportID = (entity && entity.Customer[`DefaultCustomer${this.options.data.typeName}ReportID`])
                    ? entity.Customer[`DefaultCustomer${this.options.data.typeName}ReportID`]
                    : company[`DefaultCustomer${this.options.data.typeName}ReportID`];
                const defaultReport = defaultReportID && this.reports.find(report => report.ID === defaultReportID);

                this.selectedReport = defaultReport || this.reports[0];
                if (entity && entity.Customer.Localization) {
                    this.selectedReport.localization = entity.Customer.Localization;
                } else if (company.Localization) {
                    this.selectedReport.localization = company.Localization;
                }
                this.loadReportParameters();
            },
            err => this.errorService.handle(err)
        );
    }

    ngAfterViewInit() {
        if (document.getElementById('preview_button')) {
            document.getElementById('preview_button').focus();
        }
    }

    loadReportParameters() {
        if (!this.selectedReport || !this.selectedReport.ID) {
            return;
        }

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + this.selectedReport.ID).subscribe(
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
                var keys = this.selectedReport.parameters.map(param => param.Name);
                for (var i = 0; i < res.length; i++) {
                    if (!keys.includes(res[i].Name))  {
                        this.defaultParameters.push(<CustomReportParameter> {
                            Name: res[i].Name,
                            value: res[i].DefaultValue
                        });
                    }
                }
                this.selectedReport.parameters.concat(this.defaultParameters);
            },
            err => this.errorService.handle(err)
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
        }].concat(this.defaultParameters)
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
