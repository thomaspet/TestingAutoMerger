import {Component, ViewChild, Type, Input} from '@angular/core';
import {Http} from '@angular/http';
import {ReportDefinition, CompanySettings, User} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ReportDefinitionService, Report, ReportParameter, UserService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'report-preview-modal-type',
    templateUrl: 'app/components/reports/modals/preview/previewModal.html'
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

    public modalConfig: any = {};
    public type: Type<any> = ReportPreviewModalType;

    private reportDefinition: ReportDefinition;
    private companySettings: CompanySettings;
    private user: User;

    constructor(
        private reportDefinitionService: ReportDefinitionService,
        private http: Http,
        private userService: UserService,
        private toastService: ToastService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService
    ) {

        this.companySettingsService.getCached(1)
            .subscribe(
                settings => this.companySettings = settings,
                this.errorService.handle
            );

        this.userService.getCurrentUser()
            .subscribe(
                user => this.user = user,
                this.errorService.handle
            );

        this.modalConfig = {
            title: 'Forhåndsvisning',
            model: null,

            actions: [
                /* TODO: need the ID of the report to send
                {
                    text: 'Epost',
                    method: () => {
                        let sendemail = new SendEmail();
                        sendemail.Subject = this.reportDefinition.Name;
                        sendemail.EmailAddress = '';
                        sendemail.Message = 'Vedlagt rapport' +
                                            '\n\nMed vennlig hilsen\n' +
                                            this.companySettings.CompanyName + '\n' +
                                            this.user.DisplayName + '\n' +
                                            (this.companySettings.DefaultEmail ? this.companySettings.DefaultEmail.EmailAddress : '');

                        this.sendEmailModal.openModal(sendemail);

                        if (this.sendEmailModal.Changed.observers.length === 0) {
                            this.sendEmailModal.Changed.subscribe((email) => {
                                this.reportDefinitionService.generateReportSendEmailById(this.reportDefinition.Name, 0, email);
                            });
                        }
                    }
                },*/
                {
                    text: 'Skriv ut',
                    method: () => {
                        this.modal.getContent().then(() => {
                            this.reportDefinitionService.generateReportPdf(this.reportDefinition);
                            this.modal.close();
                        });
                    }
                },
                {
                    text: 'Lukk',
                    method: () => {
                        this.modal.getContent().then(() => {
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public openWithId(report: Report, id: number, name: string = 'Id') {
        var idparam = new ReportParameter();
        idparam.Name = name;
        idparam.value = id.toString();
        report.parameters = [idparam];
        this.open(report);
    }

    public open(report: Report) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = null;
        this.reportDefinition = report;
        this.reportDefinitionService.generateReportHtml(report, this.modalConfig);
        this.modal.open();
    }
}
