import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {Email, CompanySettings} from '../../../unientities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {SendEmail} from '../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    EmailService,
    CustomerService,
    UserService,
    ErrorService,
    CompanySettingsService
} from '../../../services/services';

// Reusable email form
@Component({
    selector: 'send-email-form',
    template: `
        <article class="modal-content send-email-modal">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$"></uni-form>
           <footer>
                <button *ngFor="let action of config.actions" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class SendEmailForm {
    @Input()
    private config: any = {};

    public model$: BehaviorSubject<any> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    public ngOnInit() {

        this.setupForm();
        this.extendFormConfig();
        this.model$.next(this.config.model));
    }

    private setupForm() {
         console.log(this.model$);
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields$.next([
            {
                EntityType: 'SendEmail',
                Property: 'EmailAddress',
                FieldType: FieldType.TEXT,
                Label: 'Til',
                LineBreak: true,
            },
            {
                EntityType: 'SendEmail',
                Property: 'Subject',
                FieldType: FieldType.TEXT,
                Label: 'Emne',
                LineBreak: true,
            },
            {
                EntityType: 'SendEmail',
                Property: 'Format',
                FieldType: FieldType.DROPDOWN,
                Label: 'Format',
                LineBreak: true
            },
            {
                EntityType: 'SendEmail',
                Property: 'Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Melding'
            },
            {
                EntityType: 'SendEmail',
                Property: 'SendCopy',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kopi til meg'
            }
        ]);
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue()
        var formatField: UniFieldLayout = fields.find(x => x.Property === 'Format');

        // TODO: currently not working formats, doc returns array with negative values and the other doesn't return data
        formatField.Options = {
            source:  [
                {Format: 'pdf', Name: 'PDF'},
                // {Format: 'doc', Name: 'Word' },
                // {Format: 'xls', Name: 'Excel'},
                // {Format: 'jpg', Name: 'JPG'},
                // {Format: 'png', Name: 'PNG'},
                {Format: 'html', Name: 'HTML5'}
            ],
            valueProperty: 'Format',
            displayProperty: 'Name'
        };
        this.fields$.next(fields);
    }

}

// email modal
@Component({
    selector: 'send-email-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class SendEmailModal {
    @Input() public email: SendEmail;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Email>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};

    private type: Type<any> = SendEmailForm;

    constructor(
        private emailService: EmailService,
        private toastService: ToastService,
        private customerService: CustomerService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService
    ) {


    }

    public ngOnInit() {
        this.modalConfig = {
            model: this.email,
            title: 'Send på epost',
            actions: [
                {
                    text: 'Send epost',
                    class: 'good',
                    method: () => {
                        if (this.modalConfig.model.EmailAddress.indexOf('@') <= 0) {
                            this.toastService.addToast('Sending av epost feilet', ToastType.bad, 3, 'Grunnet manglende epostadresse');
                        } else {
                            this.modal.close();
                            this.Changed.emit(this.modalConfig.model);
                        }
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(sendemail: SendEmail) {
        sendemail.Format = sendemail.Format || 'pdf';

        Observable.forkJoin(
            this.companySettingsService.Get(1, ['DefaultEmail']),
            this.userService.getCurrentUser(),
            sendemail.CustomerID ? this.customerService.Get(sendemail.CustomerID, ['Info', 'Info.DefaultEmail']) : Observable.of(null)
        )
        .subscribe((response) => {
            let companySettings: CompanySettings = response[0];
            var user = response[1];
            var customer = response[2];

            // Adding default?
            if(!sendemail.EmailAddress) {
                if (customer) { sendemail.EmailAddress = customer.Info.DefaultEmail ? customer.Info.DefaultEmail.EmailAddress : ''; }
            }
            if (!sendemail.CopyAddress) { sendemail.CopyAddress = user.Email; };
            sendemail.Message += '\n\nMed vennlig hilsen\n' +
                                 companySettings.CompanyName + '\n' +
                                 user.DisplayName + '\n' +
                                 (companySettings.DefaultEmail ? companySettings.DefaultEmail.EmailAddress : '');

            this.modalConfig.model = sendemail;
            this.modal.open();
        }, err => this.errorService.handle(err));
    }
}
