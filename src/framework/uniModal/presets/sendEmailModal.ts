import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uniModal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {CompanySettings} from '../../../app/unientities';
import {SendEmail} from '../../../../src/app/models/sendEmail';
import {ToastService, ToastType} from '../../uniToast/toastService';
import { CustomerService } from '@app/services/sales/customerService';
import { UserService } from '@app/services/common/userService';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { ErrorService } from '@app/services/common/errorService';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-send-email-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Send epost'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <span class="warn" *ngIf="invalidEmail">Ugyldig epost</span>
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
    private formModel$: BehaviorSubject<SendEmail> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private invalidEmail: boolean;

    constructor(
        private toastService: ToastService,
        private customerService: CustomerService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
        this.initFormModel();
    }

    public initFormModel() {
        let model: SendEmail = this.options.data || new SendEmail();
        model.Format = model.Format || 'pdf';

        Observable.forkJoin(
            this.companySettingsService.Get(1, ['DefaultEmail']),
            this.userService.getCurrentUser(),
            model.CustomerID
                ? this.customerService.Get(model.CustomerID, ['Info', 'Info.DefaultEmail'])
                : Observable.of(null)
        ).subscribe(
            res => {
                let companySettings: CompanySettings = res[0] || {};
                let user = res[1];
                let customer = res[2];

                if (!model.EmailAddress && customer && customer.Info) {
                    model.EmailAddress = customer.Info.DefaultEmail
                        ? customer.Info.DefaultEmail.EmailAddress
                        : '';
                }

                if (!model.CopyAddress && user) {
                    model.CopyAddress = user.Email || '';
                }

                model.Message += '\n\nMed vennlig hilsen\n'
                    + companySettings.CompanyName + '\n'
                    + user.DisplayName + '\n'
                    + (companySettings.DefaultEmail && companySettings.DefaultEmail.EmailAddress || '');

                this.formModel$.next(model);
            },
            err => this.errorService.handle(err)
        );
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            const model = this.formModel$.getValue();
            if (!model.EmailAddress || !model.EmailAddress.includes('@')) {
                this.invalidEmail = true;
                return;
            }

            this.onClose.emit(model);
        } else {
            this.onClose.emit();
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'SendEmail',
                Property: 'EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Til'
            },
            <any> {
                EntityType: 'SendEmail',
                Property: 'Subject',
                FieldType: FieldType.TEXT,
                Label: 'Emne'
            },
            <any> {
                EntityType: 'SendEmail',
                Property: 'Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Melding'
            },
            <any> {
                EntityType: 'SendEmail',
                Property: 'Format',
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
                EntityType: 'SendEmail',
                Property: 'SendCopy',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kopi til meg'
            }
        ];
    }
}
