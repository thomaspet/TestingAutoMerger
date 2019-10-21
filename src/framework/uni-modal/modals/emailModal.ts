import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {Email} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';

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
    initialState: any;

    ngOnInit() {
        const email = this.options.data || {};
        this.initialState = Object.assign({}, email);
        const fields = this.getFormFields();

        if (email._initValue && fields[0] && !email[fields[0].Property]) {
            email[fields[0].Property] = email._initValue;
        }

        this.formModel$.next(email);
        this.formFields$.next(this.getFormFields());
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formModel$.complete();
        this.formFields$.complete();
    }

    close(emitValue?: boolean) {
        this.onClose.emit(emitValue ? this.formModel$.getValue() : null);
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'Email',
                Property: 'EmailAddress',
                FieldType: FieldType.EMAIL,
                Label: 'Epostadresse',
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
