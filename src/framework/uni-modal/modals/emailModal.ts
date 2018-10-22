import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Email} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../app/services/common/keyCodes';

@Component({
    selector: 'uni-email-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Epost'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    (readyEvent)="onReady()"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniEmailModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<Email> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor(private elementRef: ElementRef) {}

    public ngOnInit() {
        const email = this.options.data || {};
        const fields = this.getFormFields();

        if (email._initValue && fields[0] && !email[fields[0].Property]) {
            email[fields[0].Property] = email._initValue;
        }

        this.formModel$.next(email);
        this.formFields$.next(this.getFormFields());
    }

    public onReady() {
        const inputs = <HTMLInputElement[]> this.elementRef.nativeElement.querySelectorAll('input');
        if (inputs.length) {
            const first = inputs[0];
            first.focus();
            first.value = first.value; // set cursor at end of text

            const last = inputs[inputs.length - 1];
            Observable.fromEvent(last, 'keydown')
                .filter((event: KeyboardEvent) => (event.which || event.keyCode) === KeyCodes.ENTER)
                .subscribe(() => this.close(true));
        }
    }

    public close(emitValue?: boolean) {
        let email: Email;
        if (emitValue) {
            email = this.formModel$.getValue();
        }

        this.onClose.emit(email);
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
            }
        ];
    }
}
