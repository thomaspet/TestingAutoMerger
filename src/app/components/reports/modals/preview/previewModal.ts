import {Component, ViewChild, Output, EventEmitter, Type, Input, ChangeDetectorRef} from '@angular/core';
import {Http} from '@angular/http';
import {ReportDefinition, CompanySettings, User} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ReportService, Report, ReportParameter, UserService} from '../../../../services/services';
import {CompanySettingsService, ErrorService} from '../../../../services/services';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ReportFormat} from '../../../../models/reportFormat';

@Component({
    selector: 'report-preview-modal-type',
    templateUrl: './previewModal.html'
})
export class ReportPreviewModalType {
    @Input('config')
    private config;

    constructor() {
    }
}

@Component({
    selector: 'report-preview-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
        <send-email-modal></send-email-modal>
    `
})
export class PreviewModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    @ViewChild(SendEmailModal)
    private sendEmailModal: SendEmailModal;
    @Output() printed: EventEmitter<any> = new EventEmitter<any>();
    public modalConfig: any = {};
    public type: Type<any> = ReportPreviewModalType;

    private reportDefinition: ReportDefinition;
    private companySettings: CompanySettings;
    private user: User;
    private modalDoneHandler: (msg: string) => void;

    constructor(
        private reportService: ReportService,
        private http: Http,
        private userService: UserService,
        private toastService: ToastService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef
    ) {

        this.companySettingsService.Get(1)
            .subscribe(
                settings => this.companySettings = settings,
                err => this.errorService.handle(err)
            );

        this.userService.getCurrentUser()
            .subscribe(
                user => this.user = user,
                err => this.errorService.handle(err)
            );

        this.modalConfig = {
            title: 'Forhåndsvisning',
            model: null,

            saveactions: [
                {
                    label: 'Last ned PDF',
                    action: (done) => this.download(ReportFormat.PDF, done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Last ned CSV',
                    action: (done) => this.download(ReportFormat.CSV, done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Last ned HTML',
                    action: (done) => this.download(ReportFormat.HTML, done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Last ned Excel',
                    action: (done) => this.download(ReportFormat.Excel, done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Last ned Word',
                    action: (done) => this.download(ReportFormat.Word, done),
                    main: true,
                    disabled: false
                }
            ],
        };
    }

    public download(format, done) {
        this.modal.getContent().then(() => {
            this.reportService.generateReportFormat(format, this.reportDefinition);
            this.printed.emit();
            done(format.toUpper() + ' nedlastet');
        }).catch(() => {
            done('Feilet!');
        });
    }

    public openWithId(report: Report, id: number, name: string = 'Id', doneHandler: (msg: string) => void = null) {
        var idparam = new ReportParameter();
        idparam.Name = name;
        idparam.value = id.toString();
        report.parameters = [idparam];
        this.open(report, null, doneHandler);
    }

    public open(report: Report, parameters = null, doneHandler: (msg: string) => void = null) {
        this.modalDoneHandler = doneHandler;
        this.modalConfig.title = report.Name;
        this.modalConfig.report = null;
        this.reportDefinition = report;
        this.modal.open();

        this.reportService.generateReportHtml(report, this.modalConfig, () => {
            this.cdr.markForCheck();
        });
    }
}
