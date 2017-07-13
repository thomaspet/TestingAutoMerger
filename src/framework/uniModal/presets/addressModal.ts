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
        <dialog class="uni-modal" (clickOutside)="close(false)">
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

    private countries: Country[];

    constructor(
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        let address = this.options.data || {};
        this.formModel$.next(address);

        this.countryService.GetAll('orderby=Name').subscribe(
            res => {
                let countries: Country[] = res;
                let defaultCountryIndex = countries.findIndex(x => x.CountryCode === 'NO');
                if (defaultCountryIndex >= 0) {
                    let defaultCountry = countries.splice(defaultCountryIndex, 1)[0];
                    countries.unshift(defaultCountry);
                }

                this.countries = countries;
                this.formFields$.next(this.getFormFields());
            },
            err => this.errorService.handle(err)
        );
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
        let address: Address;
        if (emitValue) {
            address = this.formModel$.getValue();
            this.setCountryCode(address);
        }

        this.onClose.emit(address);
    }

    private setCountryCode(address: Address) {
        if (address.Country && this.countries) {
            let country = this.countries.find(c => c.Name === address.Country);
            address.CountryCode = country && country.CountryCode;
        }
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
                FieldType: FieldType.DROPDOWN,
                Label: 'Land',
                Options: {
                    source: this.countries,
                    valueProperty: 'Name',
                    displayProperty: 'Name',
                }
            }
        ];

        return fields;
    }
}
