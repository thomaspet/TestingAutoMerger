import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {PhoneTypeEnum} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-phone-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Telefon'}}</header>
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
export class UniPhoneModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    formConfig$ = new BehaviorSubject({autofocus: true});
    formModel$ = new BehaviorSubject(null);
    formFields$ = new BehaviorSubject([]);
    initialState: any;

    ngOnInit() {
        const phone = this.options.data || {};
        this.initialState = Object.assign({}, phone);
        const fields = this.getFormFields();

        if (phone._initValue && fields[0] && !phone[fields[0].Property]) {
            phone[fields[0].Property] = phone._initValue;
        }
        this.formModel$.next(phone);
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
                EntityType: 'Phone',
                Property: 'Number',
                FieldType: FieldType.TEXT,
                Label: 'Telefonnr.',
            },
            <any> {
                EntityType: 'Phone',
                Property: 'CountryCode',
                FieldType: FieldType.TEXT,
                Label: 'Landskode',
            },
            <any> {
                EntityType: 'Phone',
                Property: 'Type',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                Options: {
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    source:  [
                        {ID: PhoneTypeEnum.PtPhone, Name: 'Telefon'},
                        {ID: PhoneTypeEnum.PtMobile, Name: 'Mobil' },
                        {ID: PhoneTypeEnum.PtFax, Name: 'Fax'}
                    ]
                }
            },
            <any> {
                EntityType: 'Phone',
                Property: 'Description',
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Options: {
                    events: {
                        enter: () => this.close(true)
                    }
                }
            },
        ];
    }
}
