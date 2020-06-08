import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType, UniFormError} from '@uni-framework/ui/uniform';
import {Email} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import { EmailService } from '@app/services/common/emailService';


@Component({
    selector: 'uni-email-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Epost'}}</header>
            <article>
                <uni-form #form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button
                    class="secondary"
                    (click)="close(false)"
                    (keydown.shift.tab)="$event.preventDefault(); form?.focus()">
                    Avbryt
                </button>

                <button
                    class="c2a"
                    (click)="close(true)"
                    (keydown.tab)="$event.preventDefault()">
                    Ok
                </button>
            </footer>
        </section>
    `
})
export class UniEmailModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    formConfig$ = new BehaviorSubject({autofocus: true});
    formModel$  = new BehaviorSubject<Email>(null);
    formFields$ = new BehaviorSubject([]);
    initialEmail: Email;

    constructor(
        private emailService: EmailService
    ) {}

    ngOnInit() {
        const email = this.options.data || {};
        this.initialEmail = email;
        const fields = this.getFormFields();

        if (email._initValue && fields[0] && !email[fields[0].Property]) {
            email[fields[0].Property] = email._initValue;
        }

        this.formModel$.next(Object.assign({}, email));
        this.formFields$.next(this.getFormFields());
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formModel$.complete();
        this.formFields$.complete();
    }

    close(emitValue?: boolean) {
        if (emitValue) {
            // Since multivalue currently depends on memory references we need to
            // map the updated values to the initial object and return that,
            // instead of returning the edited one.
            const address = this.formModel$.getValue();
            Object.keys(address).forEach(key => {
                this.initialEmail[key] = address[key];
            });

            this.onClose.emit(this.initialEmail);
        } else {
            this.onClose.emit(null);
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'Email',
                Property: 'EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Epostadresse',
                Validations: [(value: string, fieldLayout: UniFieldLayout) => this.emailService.emailUniFormValidation(value, fieldLayout)]
            },
            <any> {
                EntityType: 'Email',
                Property: 'Description',
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Options: {
                    events: {
                        enter: () => this.close(true)
                    }
                }
            }
        ];
    }
}
