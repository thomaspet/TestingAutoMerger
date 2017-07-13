import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../modalService';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Phone, PhoneTypeEnum} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-address-modal',
    template: `
        <dialog class="uni-modal" (clickOutside)="close(false)">
            <header>
                <h1>{{options.header || 'Telefon'}}</h1>
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
export class UniPhoneModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<Phone> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        let phone = this.options.data || {};
        this.formModel$.next(phone);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        let phone: Phone;
        if (emitValue) {
            phone = this.formModel$.getValue();
        }

        this.onClose.emit(phone);
    }

    private getFormFields(): UniFieldLayout[] {
        let fields = [
            <any> {
                EntityType: 'Phone',
                Property: 'CountryCode',
                FieldType: FieldType.TEXT,
                Label: 'Landskode',
            },
            <any> {
                EntityType: 'Phone',
                Property: 'Number',
                FieldType: FieldType.TEXT,
                Label: 'Telefonnr.',
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
