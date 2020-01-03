import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Address, Country} from '@uni-entities';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {CountryService, PostalCodeService, ErrorService} from '@app/services/services';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-address-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Adresse'}}</header>
            <article>
                <uni-form #form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="formChange($event)">
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
export class UniAddressModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    formConfig$ = new BehaviorSubject({autofocus: true});
    formModel$ = new BehaviorSubject(null);
    formFields$ = new BehaviorSubject([]);

    initialState: any;

    constructor(
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
        private errorService: ErrorService,
    ) {}

    public ngOnInit() {
        const address = this.options.data || {};
        const fields = this.getFormFields();

        if (address._initValue && fields[0] && !address[fields[0].Property]) {
            address[fields[0].Property] = address._initValue;
        }
        this.initialState = Object.assign({}, address);
        this.formModel$.next(Object.assign({}, address));
        this.formFields$.next(fields);
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formModel$.complete();
        this.formFields$.complete();
    }

    formChange(changes) {
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

    close(emitValue?: boolean) {
        this.onClose.emit(emitValue ? this.formModel$.getValue() : null);
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
