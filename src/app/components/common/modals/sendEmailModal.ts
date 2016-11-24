import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {Email, FieldType, CompanySettings} from '../../../unientities';
import {EmailService, CustomerService, UserService} from '../../../services/services';
import {SendEmail} from '../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {CompanySettingsService} from '../../../services/common/CompanySettingsService';
import {Observable} from 'rxjs/Rx';
import {ErrorService} from '../../../services/common/ErrorService';

// Reusable email form
@Component({
    selector: 'send-email-form',
    template: `
        <article class="modal-content send-email-modal">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
           <footer>
                <button *ngFor="let action of config.actions" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>                
            </footer>
        </article>
    `
})
export class SendEmailForm {    
    @Input() public model: SendEmail;
    @ViewChild(UniForm) public form: UniForm;
    private config: any = {};
    private fields: any[] = [];
    private formConfig: any = {};
       
    public ngOnInit() {
        this.setupForm();
        this.extendFormConfig();    
    }
 
    private setupForm() {   
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields = [
            {
                EntityType: 'SendEmail',
                Property: 'EmailAddress',
                FieldType: FieldType.EMAIL,
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
                FieldType: FieldType.MULTISELECT,
                Label: 'Kopi til meg'
            }  
        ];
    }

    private extendFormConfig() {
        var formatField: UniFieldLayout = this.fields.find(x => x.Property === 'Format');

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

            // Adding default
            if (!sendemail.EmailAddress && customer) { sendemail.EmailAddress = customer.Info.DefaultEmail ? customer.Info.DefaultEmail.EmailAddress : ''; }
            if (!sendemail.CopyAddress) { sendemail.CopyAddress = user.Email };
            sendemail.Message += '\n\nMed vennlig hilsen\n' +
                                 companySettings.CompanyName + '\n' +
                                 user.DisplayName + '\n' +
                                 (companySettings.DefaultEmail ? companySettings.DefaultEmail.EmailAddress : '');

            this.modalConfig.model = sendemail;    
            this.modal.open();
        }, this.errorService.handle);
    }
}
