import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../modalService';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Email} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-email-modal',
    template: `
        <dialog class="uni-modal"
                (clickOutside)="close(false)"
                (keydown.esc)="close(false)">
            <header>
                <h1>{{options.header || 'Epost'}}</h1>
            </header>
            <main>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </main>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </dialog>
    `
})
export class UniEmailModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<Email> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        let email = this.options.data || {};
        this.formModel$.next(email);
        this.formFields$.next(this.getFormFields());
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
