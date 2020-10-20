import {Component, Output, EventEmitter} from '@angular/core';
import {ConfirmActions, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {BehaviorSubject, forkJoin, of} from 'rxjs';
import {SendEmail} from '@app/models/sendEmail';
import {ReportDefinition, CompanySettings} from '@uni-entities';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {AuthService} from '@app/authService';

// Import services directly (instead of from services/services) to avoid circular deps
import {CustomerService} from '@app/services/sales/customerService';
import {UserService} from '@app/services/common/userService';
import {CompanySettingsService} from '@app/services/common/companySettingsService';
import {ErrorService} from '@app/services/common/errorService';
import {ReportTypeService} from '@app/services/reports/reportTypeService';
import {ReportDefinitionParameterService} from '@app/services/reports/reportDefinitionParameterService';
import {EmailService} from '@app/services/common/emailService';
import {theme, THEMES} from 'src/themes/theme';
import {ReportTypeEnum} from '@app/models';

@Component({
    selector: 'tof-email-modal',
    templateUrl: './tof-email-modal.html',
    styleUrls: ['./tof-email-modal.sass']
})
export class TofEmailModal {
    @Output() onClose = new EventEmitter();
    options: IModalOptions  = {};

    isTestCompany: boolean;
    formConfig$ = new BehaviorSubject({autofocus: true});
    formModel$ = new BehaviorSubject<{model: SendEmail, reportID: number}>(null);
    formFields$ = new BehaviorSubject<UniFieldLayout[]>([]);

    private reports: ReportDefinition[];
    private parameterName: string;
    private entity;

    busy: boolean;
    invalidEmail: boolean;
    showHours = '0';
    reportType: ReportTypeEnum;

    constructor(
        private authService: AuthService,
        private customerService: CustomerService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private reportTypeService: ReportTypeService,
        private reportParamService: ReportDefinitionParameterService,
        private emailService: EmailService,
        private modalService: UniModalService
    ) {}

    ngOnInit() {
        this.isTestCompany = this.authService.activeCompany && this.authService.activeCompany.IsTest;

        const modalData = this.options.data || {};
        this.entity = modalData.entity;
        this.reportType = modalData.reportType;

        const model = this.getEmailModel(modalData.entityType, this.entity);
        const customerRequest = model.CustomerID ? this.customerService.Get(model.CustomerID, ['Info', 'Info.DefaultEmail']) : of(null);
        const reportsRequest = modalData.reportType ? this.reportTypeService.getFormType(modalData.reportType) : of(null);

        this.busy = true;
        forkJoin([
            this.companySettingsService.Get(1, ['DefaultEmail']),
            this.userService.getCurrentUser(),
            customerRequest,
            reportsRequest,
            this.entityHasHours() && this.reportType === ReportTypeEnum.INVOICE ? this.openAddHoursModal().onClose : of(null)
        ]).subscribe(
            res => {
                const companySettings: CompanySettings = res[0] || {};
                const user = res[1];
                const customer = res[2];
                this.reports = res[3] || [];

                const selectedReport = modalData.report
                    || this.reports.find(report => report.ID === companySettings[`Default${model.EntityType}ReportID`])
                    || this.reports[0];

                const userWantsToPrintHours = res[4] === ConfirmActions.ACCEPT;
                this.showHours = this.entityHasHours() &&  userWantsToPrintHours ? '1' : '0';
                if (!model.EmailAddress && customer && customer.Info) {
                    model.EmailAddress = customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress || '';
                }

                if (!model.CopyAddress && user) {
                    model.CopyAddress = user.Email || '';
                }

                model.Message += '\n\nMed vennlig hilsen\n'
                    + companySettings.CompanyName + '\n'
                    + user.DisplayName + '\n'
                    + (companySettings.DefaultEmail && companySettings.DefaultEmail.EmailAddress || '');

                this.formModel$.next({model, reportID: selectedReport.ID});
                this.formFields$.next(this.getFormFields());

                if (modalData && modalData.parameters && modalData.parameters[0]) {
                    this.parameterName = modalData.parameters[0].Name;
                    this.busy = false;
                } else {
                    this.getParamName();
                }
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formFields$.complete();
        this.formModel$.complete();
    }

    private getEmailModel(entityType: string, entity) {
        const model = new SendEmail();
        model.EmailAddress = entity.EmailAddress;
        model.EntityType = entityType;
        model.EntityID = entity.ID;
        model.CustomerID = entity.CustomerID;
        model.Format = 'pdf';

        let entityLabel, entityNumber;
        switch (entityType) {
            case 'CustomerInvoice':
                entityLabel = 'Faktura';
                entityNumber = entity.InvoiceNumber;
            break;
            case 'CustomerOrder':
                entityLabel = 'Ordre';
                entityNumber = entity.OrderNumber;
            break;
            case 'CustomerQuote':
                entityLabel = 'Tilbud';
                entityNumber = entity.QuoteNumber;
            break;
        }

        model.Subject = `${entityLabel} ${entityNumber}`;
        model.Message = `Vedlagt finner du ${entityLabel.toLowerCase()} ${entityNumber}`;
        return model;
    }

    sendEmail() {
        this.busy = true;
        const paramValue = this.parameterName === 'Id'
            ? this.entity[this.parameterName.toUpperCase()]
            : this.entity[this.parameterName];

        const parameter = {Name: this.parameterName, value: paramValue};
        const formModel = this.formModel$.getValue();

        const email = formModel.model.EmailAddress || '';
        const isValidEmail = email && this.emailService.isValidEmailAddress(email);

        if (!isValidEmail) {
            this.invalidEmail = true;
            this.busy = false;
            return;
        }

        this.emailService.sendEmailWithReportAttachment(
            `Models.Sales.${formModel.model.EntityType}`,
            formModel.reportID,
            formModel.model,
            [parameter, {Name: 'ShowHours', value: this.showHours}]
        ).then(() => {
            this.onClose.emit(email);
            this.busy = false;
        }).catch(() => {
            this.busy = false;
        });
    }

    onFormChange(changes) {
        if (changes['reportID']) {
            this.getParamName();
        }
    }

    private getParamName() {
        this.busy = true;
        const formModel = this.formModel$.getValue();

        this.reportParamService.GetAll('filter=ReportDefinitionId eq ' + formModel.reportID).subscribe(
            res => {
                this.parameterName = res[0].Name;
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private getFormFields(): UniFieldLayout[] {
        let fields = [
            {
                Property: 'model.EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Til'
            },
            {
                Property: 'model.Subject',
                FieldType: FieldType.TEXT,
                Label: 'Emne'
            },
            {
                Property: 'model.Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Melding'
            },
            {
                Property: 'reportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Options: {
                    source: this.reports,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    hideDeleteButton: true,
                    searchable: false,
                },
            },
            {
                Property: 'model.Format',
                FieldType: FieldType.DROPDOWN,
                Label: 'Format',
                Options: {
                    valueProperty: 'Format',
                    displayProperty: 'Name',
                    source: [
                        {Format: 'pdf', Name: 'PDF'},
                        {Format: 'html', Name: 'HTML5'},
                    ]
                }
            },
            <any> {
                Property: 'model.SendCopy',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kopi til meg'
            }
        ];

        // Temp fix to hide report selector in bruno.
        // Will rewrite report flow at some point, and this wont be necessary..
        if (theme.theme === THEMES.EXT02) {
            fields = fields.filter(f => f.Property !== 'reportID');
        }

        return fields;
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
}
