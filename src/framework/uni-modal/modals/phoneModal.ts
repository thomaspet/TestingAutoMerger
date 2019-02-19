import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Phone, PhoneTypeEnum} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../app/services/common/keyCodes';

@Component({
    selector: 'uni-phone-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Telefon'}}</h1>
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
export class UniPhoneModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<Phone> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public initialState: any;

    constructor(private elementRef: ElementRef) {}

    public ngOnInit() {
        const phone = this.options.data || {};
        this.initialState = Object.assign({}, phone);
        const fields = this.getFormFields();

        if (phone._initValue && fields[0] && !phone[fields[0].Property]) {
            phone[fields[0].Property] = phone._initValue;
        }
        this.formModel$.next(phone);
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
        let phone: Phone;
        if (emitValue) {
            phone = this.formModel$.getValue();
        } else {
            phone = this.initialState;
        }

        this.onClose.emit(phone);
    }

    private getFormFields(): UniFieldLayout[] {
        let fields = [
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
                Property: 'Description',
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
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
            }
        ];

        return fields;
    }
}
