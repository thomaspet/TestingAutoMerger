import {Component, Input, Output, EventEmitter, SimpleChange} from '@angular/core';
import {UniModalService} from '../../modalService';
import {IUniModal, IModalOptions, ConfirmActions} from '../../interfaces';
import {Observable} from 'rxjs';
import {UniPreviewModal} from '@app/components/reports/modals/preview/previewModal';
import {ReportDefinition} from '@uni-entities';

import {
    ReportService,
    ErrorService,
    BrowserStorageService,
    ReportDefinitionParameterService,
    CompanySettingsService,
} from '@app/services/services';

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
    fromNr: number;
    toNr: number;
    inputFromLabel: string;
    inputToLabel: string;
    inputType: any = {name: 'nr', secondInputType: null};

    constructor(
        private reportService: ReportService,
        private errorService: ErrorService,
        private browserStorageService: BrowserStorageService,
        private modalService: UniModalService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private companySettingsService: CompanySettingsService,
    ) {}

    ngOnInit() {
        Observable.forkJoin(
            this.reportService.getFormType(this.options.data.type),
            this.companySettingsService.Get(1)
        ).subscribe(
            data => {
                this.reports = data[0];
                const company = data[1];
                const defaultReportID = company[`DefaultCustomer${this.options.data.typeName}ReportID`];
                const defaultReport = defaultReportID && this.reports.find(report => report.ID === defaultReportID);

                this.selectedReport = defaultReport || this.reports[0];
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

    public loadReportParameters() {
        if (!this.selectedReport || !this.selectedReport.ID) {
            return;
        }

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + this.selectedReport.ID).subscribe(
            res => {
                const name = res[0].Name.includes('Number') ? 'nr' : res[0].Name.toLowerCase();
                const form = this.selectedReport;
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

                this.selectedReport.parameters = [{
                    Name: res[0].Name,
                    value: this.fromNr
                }];
                if (res[1]) {
                    this.inputType.secondName = res[1].Name;
                    this.inputType.secondInputType = res[1].Type;
                    this.selectedReport.parameters = [{
                        Name: res[1].Name,
                        value: this.fromNr
                    }, {
                        Name: this.inputType.secondName,
                        value: this.toNr
                    }];
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public acceptAndSendEmail() {
        this.onClose.emit({
            action: 'email',
            form: this.selectedReport,
            entity: this.options.data.entity,
            entityTypeName: this.options.data.typeName,
            name: this.options.data.name
        });
    }

    public acceptAndPrintOut() {
        this.onClose.emit({
            action: 'print',
            form: this.selectedReport,
        });
    }

    public preview() {
        return this.modalService.open(UniPreviewModal, {
            data: this.selectedReport
        });
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
