import {Component, Input, Output, EventEmitter, SimpleChange} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {CompanySettings, ReportDefinition} from '../../../app/unientities';
import {SendEmail} from '../../../../src/app/models/sendEmail';
import {ToastService, ToastType} from '../../uniToast/toastService';
import { CustomerService } from '@app/services/sales/customerService';
import { UserService } from '@app/services/common/userService';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { ErrorService } from '@app/services/common/errorService';
import {ReportTypeService} from '@app/services/reports/reportTypeService';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { ReportDefinitionParameterService } from '@app/services/reports/reportDefinitionParameterService';

@Component({
    selector: 'uni-send-email-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Send e-post'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="emailChange($event)">
                </uni-form>
            </article>

            <footer>
                <span class="warn" *ngIf="invalidEmail">Ugyldig e-post</span>
                <button class="good" (click)="close(true)">Send</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniSendEmailModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<{sendEmail: SendEmail, selectedForm: any}> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formList: ReportDefinition[];
    private selectedReport: ReportDefinition;
    private parameterName: string;

    public invalidEmail: boolean;

    constructor(
        private toastService: ToastService,
        private customerService: CustomerService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private reportTypeService: ReportTypeService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
    ) {}

    public ngOnInit() {
        this.initFormModel();
    }

    emailChange(change: SimpleChange) {
        if (change['selectedForm.ID']) {
            const sendEmail = this.formModel$.value.sendEmail;
            this.selectedReport = this.formList.find(x => x.ID === change['selectedForm.ID'].currentValue);
            this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + this.selectedReport.ID).subscribe(
                res => this.parameterName = res[0].Name,
                err => this.errorService.handle(err)
            );
            this.formModel$.next({sendEmail, selectedForm: this.selectedReport});
        }
    }

    public initFormModel() {
        const sendEmail: SendEmail = this.options.data.model || new SendEmail();
        sendEmail.Format = sendEmail.Format || 'pdf';

        Observable.forkJoin(
            this.companySettingsService.Get(1, ['DefaultEmail']),
            this.userService.getCurrentUser(),
            sendEmail.CustomerID
                ? this.customerService.Get(sendEmail.CustomerID, ['Info', 'Info.DefaultEmail'])
                : Observable.of(null),
            this.options.data.reportType
                ? this.reportTypeService.getFormType(this.options.data.reportType) :
                Observable.of(null),
        ).subscribe(
            res => {
                const companySettings: CompanySettings = res[0] || {};
                const user = res[1];
                const customer = res[2];
                this.formList = res[3];
                this.selectedReport = this.options.data.form
                    || this.formList.find(x => x.ID === companySettings[`Default${sendEmail.EntityType}ReportID`]);
                this.parameterName = this.options.data.parameters[0].Name;

                if (!sendEmail.EmailAddress && customer && customer.Info) {
                    sendEmail.EmailAddress = customer.Info.DefaultEmail
                        ? customer.Info.DefaultEmail.EmailAddress
                        : '';
                }

                if (!sendEmail.CopyAddress && user) {
                    sendEmail.CopyAddress = user.Email || '';
                }

                sendEmail.Message += '\n\nMed vennlig hilsen\n'
                    + companySettings.CompanyName + '\n'
                    + user.DisplayName + '\n'
                    + (companySettings.DefaultEmail && companySettings.DefaultEmail.EmailAddress || '');

                this.formModel$.next({sendEmail, selectedForm: this.selectedReport});
                this.formFields$.next(this.getFormFields());
            },
            err => this.errorService.handle(err)
        );
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            const value = this.parameterName === 'Id'
                ? this.options.data.entity[this.parameterName.toUpperCase()]
                : this.options.data.entity[this.parameterName];
            const parameters = [{ Name: this.parameterName, value }];
            const model = this.formModel$.getValue();

            if (model.selectedForm.parameters) {
                model.selectedForm.parameters = [];
            }

            if (!model.sendEmail.EmailAddress || !model.sendEmail.EmailAddress.includes('@')) {
                this.invalidEmail = true;
                return;
            }

            this.onClose.emit({model, parameters});
        } else {
            this.onClose.emit();
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'sendEmail.EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Til'
            },
            <any> {
                Property: 'sendEmail.Subject',
                FieldType: FieldType.TEXT,
                Label: 'Emne'
            },
            <any> {
                Property: 'sendEmail.Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Melding'
            },
            <any>{
                Property: 'selectedForm.ID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                Options: {
                    source: this.formList,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    hideDeleteButton: true,
                    searchable: false,
                },
            },
            <any> {
                Property: 'sendEmail.Format',
                FieldType: FieldType.DROPDOWN,
                Label: 'Format',
                Options: {
                    valueProperty: 'Format',
                    displayProperty: 'Name',
                    // REVISIT: currently not working formats commented out
                    // doc returns array with negative values and the other doesn't return data
                    source: [
                        {Format: 'pdf', Name: 'PDF'},
                        {Format: 'html', Name: 'HTML5'},
                        // {Format: 'doc', Name: 'Word' },
                        // {Format: 'xls', Name: 'Excel'},
                        // {Format: 'jpg', Name: 'JPG'},
                        // {Format: 'png', Name: 'PNG'}
                    ]
                }
            },
            <any> {
                Property: 'sendEmail.SendCopy',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kopi til meg'
            }
        ];
    }
}
