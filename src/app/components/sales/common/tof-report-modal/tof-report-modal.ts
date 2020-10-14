import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {
    ReportDefinition,
    ReportParameter,
    StatusCodeCustomerInvoice,
    StatusCodeCustomerOrder,
    StatusCodeCustomerQuote
} from '@uni-entities';
import {ConfirmActions, IModalOptions, IUniModal, UniModalService, UniPreviewModal} from '@uni-framework/uni-modal';
import {TofEmailModal} from '@uni-framework/uni-modal/modals/tof-email-modal/tof-email-modal';
import {CompanySettingsService, ErrorService, ReportDefinitionParameterService, ReportTypeService,} from '@app/services/services';
import {theme, THEMES} from 'src/themes/theme';

class CustomReportParameter extends ReportParameter {
    Name: string;
    value: string;
}

@Component({
    selector: 'tof-report-modal',
    templateUrl: './tof-report-modal.html',
    styleUrls: ['./tof-report-modal.sass']
})
export class TofReportModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

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

    entityLabel: string;
    entityType: string;
    entityTypeShort: string; // e.g Invoice instead of CustomerInvoice
    entity: any;
    reportType: number;

    // Temp fix for skipping report selection on bruno.
    // Should rewrite the entire report flow at some point
    skipConfigurationGoStraightToAction: string;

    constructor(
        private reportTypeService: ReportTypeService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private companySettingsService: CompanySettingsService,
    ) {}

    ngOnInit() {
        const modalData = this.options.data || {};
        this.entityLabel = modalData.entityLabel;
        this.entityType = modalData.entityType;
        this.entityTypeShort = this.entityType.replace('Customer', '');
        this.entity = modalData.entity;
        this.reportType = modalData.reportType;

        this.skipConfigurationGoStraightToAction = modalData.skipConfigurationGoStraightToAction;

        const isdraft: boolean =
            this.entity.StatusCode === StatusCodeCustomerInvoice.Draft ||
            this.entity.StatusCode === StatusCodeCustomerOrder.Draft ||
            this.entity.StatusCode === StatusCodeCustomerQuote.Draft;

        this.busy = true;
        Observable.forkJoin(
            this.reportTypeService.getFormType(this.reportType, isdraft), // TODO: update method when all reports are updated
            this.companySettingsService.Get(1)
        ).subscribe(
            data => {
                this.reports = data[0];
                const company = data[1];
                const entity = this.entity;

                let defaultReportID;
                let localization;

                if (entity && entity.Customer) {
                    defaultReportID = entity.Customer[`DefaultCustomer${this.entityTypeShort}ReportID`];
                    localization = entity.Customer.Localization;
                }

                if (company) {
                    if (!defaultReportID) {
                        defaultReportID = company[`DefaultCustomer${this.entityTypeShort}ReportID`];
                    }

                    if (!localization) {
                        localization = company.Localization;
                    }
                }

                const defaultReport = this.reports.find(report => report.ID === defaultReportID);
                this.selectedReport = defaultReport || this.reports[0];
                this.selectedReport.localization = localization;
                this.reports.map(report => report['localization'] = this.selectedReport.localization);
                this.loadReportParameters();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    entityHasHours() {
        return this.entity.Items.some(line => !!line.ItemSourceID);
    }

    openAddHoursModal() {
        return this.modalService.confirm(<IModalOptions>{
            header: 'Faktura rapport',
            message: 'Fakturaen inneholder timer, ønsker du å legge ved timeliste?',
            buttonLabels: {
                accept: 'Ja',
                reject: 'Nei'
            }
        });
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
                    ? this.entity.ID
                    : this.entity[this.entityTypeShort + 'Number'];

                this.toNr = this.fromNr;

                this.inputFromLabel = res.length > 1
                    ? `Fra ${this.entityLabel.toLowerCase()} ${name}`
                    : `${this.entityLabel} ${name}`;

                this.inputToLabel = `Til ${this.entityLabel.toLowerCase()} ${name}`;

                if (res[1] && res[1].Type === 'Number') {
                    this.inputType.secondName = res[1].Name;
                    this.inputType.secondInputType = res[1].Type;
                }

                this.setReportParameters();

                // Create default parameters
                const keys = this.selectedReport.parameters.map(param => param.Name);
                this.defaultParameters = this.selectedReport?.parameters || [];
                const duplicatedKeys = this.defaultParameters?.map(x => x.Name) || [];
                // this.defaultParameters = [];
                res.forEach(param => {
                    if (!keys.includes(param.Name) && !duplicatedKeys.includes(param.Name)) {
                        duplicatedKeys.push(param.Name);
                        this.defaultParameters.push(<CustomReportParameter> {
                            Name: param.Name,
                            value: param.DefaultValue
                        });
                    }
                });

                this.selectedReport.parameters.concat(this.defaultParameters);
                const source = this.entityHasHours() ? this.openAddHoursModal().onClose : of(ConfirmActions.CANCEL);
                source.subscribe(action => {
                    if (action === ConfirmActions.CANCEL) {
                        if (this.skipConfigurationGoStraightToAction) {
                            if (this.skipConfigurationGoStraightToAction === 'preview') {
                                this.preview();
                                this.onClose.emit();
                            } else {
                                this.print();
                            }
                        } else {
                            this.busy = false;
                        }
                        return;
                    }
                    const userWantsToPrintHours = action === ConfirmActions.ACCEPT;
                    let showHoursIndex = this.selectedReport?.parameters?.indexOf(item => item.Name === 'ShowHours') || 0;
                    if (showHoursIndex < 0) {
                        showHoursIndex = this.selectedReport?.parameters?.length || 0;
                    }
                    this.selectedReport.parameters[showHoursIndex] = (<CustomReportParameter>{
                        Name: 'ShowHours',
                        value: this.entityHasHours() && userWantsToPrintHours ? '1' : '0'
                    });
                    if (this.skipConfigurationGoStraightToAction) {
                        if (this.skipConfigurationGoStraightToAction === 'preview') {
                            this.preview();
                            this.onClose.emit();
                        } else {
                            this.print();
                        }
                    } else {
                        this.busy = false;
                    }
                });
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
        const entityNumberParam = this.selectedReport?.parameters?.find(item => item.Name === `${this.entityTypeShort}Number`);
        if (!entityNumberParam) {
            if (!this.selectedReport.parameters) {
                this.selectedReport.parameters = this.defaultParameters || [];
            }
        } else {
            this.selectedReport.parameters = [<CustomReportParameter>{
                Name: this.inputType.name,
                value: this.fromNr
            }].concat(this.defaultParameters);
        }
        const idItem = this.selectedReport.parameters.find(item => item.Name === 'Id');
        const entityItem = this.selectedReport?.parameters?.find(item => item.Name === `${this.entityTypeShort}Number`);

        // if we have Id, we are going to use Id to select the Item
        if (idItem) {
            idItem.value = this.entity.ID;
            if (entityItem && entityItem.value === null) {
                entityItem.value = '-1';
            }
        }
    }

    preview() {
        this.setReportParameters();
        this.modalService.open(UniPreviewModal, {
            data: this.selectedReport
        });
    }

    cancel() {
        this.onClose.emit();
    }

    sendEmail() {
        this.setReportParameters();

        this.modalService.open(TofEmailModal, {
            data: {
                entity: this.entity,
                entityType: this.entityType,
                reportType: this.reportType,
                report: this.selectedReport,
                parameters: this.selectedReport.parameters
            }
        }).onClose.subscribe(emailSent => {
            if (emailSent) {
                this.onClose.emit('email');
            }
        });
    }

    print() {
        this.preview();
        this.onClose.emit('print');
    }
}
