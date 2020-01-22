import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { ErrorService, UserService, CompanySettingsService } from '@app/services/services';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

export interface EmailFormData {
    EmailAddress?: string;
    Subject?: string;
    Message?: string;
    SendCopy?: boolean;
    Format?: string;
    CopyAddress?: string;
}

@Component({
    selector: 'uni-report-send-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Send rapport som e-post'}}</header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
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
export class UniReportSendModal implements IUniModal, OnInit {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<EmailFormData> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public invalidEmail: boolean;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService
    ) { }


    public ngOnInit() {
        this.initFormModel();
    }

    public initFormModel() {
        const formData: EmailFormData = this.options.data.model || {};
        const customCompany = this.options.data.company;
        formData.Format = formData.Format || 'pdf';

        Observable.forkJoin(
            this.userService.getCurrentUser(),
            customCompany ? Observable.of(customCompany) : this.companySettingsService.Get(1)
        ).subscribe(
            res => {
                const user = res[0];
                const company = res[1];

                formData.CopyAddress = user.Email;
                formData.Subject = `${company.CompanyName}: ${formData.Subject}`;

                formData.Message += '\n\nMed vennlig hilsen\n'
                    + company.CompanyName + '\n'
                    + user.DisplayName + '\n'
                    + user.Email;

                this.formModel$.next(formData);
                this.formFields$.next(this.getFormFields());
            },
            err => this.errorService.handle(err)
        );
    }

    public close(emitValue?: boolean) {
        if (emitValue) {

            const model = this.formModel$.getValue();

            if (!model.EmailAddress || !this.isValidEmailAddress(model.EmailAddress)) {
                this.invalidEmail = true;
                return;
            }

            this.onClose.emit(model);
        } else {
            this.onClose.emit();
        }
    }

    // copied direclty from emailservice to avoid circular dependency
    public isValidEmailAddress(email: string): boolean {
        // <something>@<something>.<something>
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Til'
            },
            <any> {
                Property: 'Subject',
                FieldType: FieldType.TEXT,
                Label: 'Emne'
            },
            <any> {
                Property: 'Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Melding'
            },
            <any> {
                Property: 'SendCopy',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kopi til meg'
            }
        ];
    }
}

