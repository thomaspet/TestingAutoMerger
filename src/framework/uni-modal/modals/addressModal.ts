import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {Address, Country} from '../../../app/unientities';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {
    CountryService,
    PostalCodeService,
    ErrorService
} from '../../../app/services/services';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../app/services/common/keyCodes';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-address-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Adresse'}}</header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="formChange($event)"
                    (readyEvent)="onReady()">
                </uni-form>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniAddressModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<Address> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public initialState: any;

    constructor(
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
        private errorService: ErrorService,
        private elementRef: ElementRef
    ) {}

    public ngOnInit() {
        const address = this.options.data || {};
        const fields = this.getFormFields();

        if (address._initValue && fields[0] && !address[fields[0].Property]) {
            address[fields[0].Property] = address._initValue;
        }
        this.initialState = Object.assign({}, address);
        this.formModel$.next(address);

        this.formFields$.next(fields);
    }

    public formChange(changes) {
        if (changes['PostalCode'] && changes['PostalCode'].currentValue) {
            const address = this.formModel$.getValue();
            this.postalCodeService.GetAll(`filter=Code eq ${address.PostalCode}&top=1`)
                .subscribe(
                    res => {
                        address.City = (res.length) ? res[0].City : '';
                        this.formModel$.next(address);
                    },
                    err => this.errorService.handle(err)
                );
        }
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
        if (emitValue) {
            this.onClose.emit(this.formModel$.getValue());
        } else {
            this.onClose.emit(this.initialState);
        }
    }

    private getFormFields(): UniFieldLayout[] {
        const fields = [
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 1',
                MaxLength: 255,
            },
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine2',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 2',
                MaxLength: 255,
            },
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine3',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 3',
                MaxLength: 255,
            },
            <any> {
                EntityType: 'Address',
                Property: 'PostalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr.',
                MaxLength: 10,
            },
            <any> {
                EntityType: 'Address',
                Property: 'City',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
                MaxLength: 100,
            },
            <any> {
                EntityType: 'Address',
                Property: 'Country',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Land',
                Options: {
                    search: (query) => {
                        const filter = query && query.length
                            ? `filter=startswith(Name,'${query}')&top=20`
                            : 'top=20';

                        return this.countryService.GetAll(filter);
                    },
                    events: {
                        select: (model: Address, selectedItem: Country) => {
                            model.Country = selectedItem.Name;
                            model.CountryCode = selectedItem.CountryCode;
                        }
                    },

                    valueProperty: 'Name',
                    displayProperty: 'Name',
                }
            }
        ];

        return fields;
    }
}
