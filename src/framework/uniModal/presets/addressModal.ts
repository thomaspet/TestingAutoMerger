import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../modalService';
import {Address, Country} from '../../../app/unientities';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {
    CountryService,
    PostalCodeService,
    ErrorService
} from '../../../app/services/services';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-address-modal',
    template: `
        <dialog class="uni-modal"
                (clickOutside)="close(false)"
                (keydown.esc)="close(false)">
            <header>
                <h1>{{options.header || 'Adresse'}}</h1>
            </header>
            <main>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="formChange($event)">
                </uni-form>
            </main>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </dialog>
    `
})
export class UniAddressModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<Address> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        let address = this.options.data || {};
        this.formModel$.next(address);

        this.formFields$.next(this.getFormFields());
    }

    public formChange(changes) {
        if (changes['PostalCode'] && changes['PostalCode'].currentValue) {
            let address = this.formModel$.getValue();
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

    public close(emitValue?: boolean) {
        const address: Address = emitValue
            ? this.formModel$.getValue()
            : null;

        this.onClose.emit(address);
    }

    private getFormFields(): UniFieldLayout[] {
        let fields = [
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 1',
            },
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine2',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 2',
            },
            <any> {
                EntityType: 'Address',
                Property: 'AddressLine3',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 3',
            },
            <any> {
                EntityType: 'Address',
                Property: 'PostalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr.',
            },
            <any> {
                EntityType: 'Address',
                Property: 'City',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
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
