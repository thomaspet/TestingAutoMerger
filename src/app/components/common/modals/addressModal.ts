import {Component, Type, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {Address, FieldType, Country, PostalCode} from '../../../unientities';
import {AddressService, CountryService, PostalCodeService} from '../../../services/services';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'address-form',

    template: `
        <article class="modal-content address-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form *ngIf="config" [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddressForm implements OnChanges {
    @Input() public model: Address;
    @Input() public question: string;
    @Input() public disableQuestion: boolean;
    @ViewChild(UniForm) public form: UniForm;
    public config: any = {};

    private enableSave: boolean;
    private save: boolean;


    private fields: any[] = [];
    private formConfig: any = {};

    private countries: Array<Country>;

    constructor(private countryService: CountryService, private postalCodeService: PostalCodeService) {

    }

    public ngOnInit() {
        this.setupForm();
        this.setupQuestionCheckbox();
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['config.disableQuestion'] != null) {
            this.setupForm();
        }
    }

    private setupForm() {
        this.fields = this.getFields();

        if (!this.countries) {
            this.countryService.GetAll('orderby=Name')
                .subscribe(countries => {
                    // place default country first in the dropdown
                    let defaultCountry = countries.find(x => x.CountryCode === 'NO');
                    if (defaultCountry) {
                        countries = countries.filter(x => x.CountryCode !== 'NO');
                        countries.unshift(defaultCountry);
                    }
                    this.countries = countries;

                    this.extendFormConfig();
                },
                err => console.log('Error retrieving countries:', err)
            );
        }
    }

    private extendFormConfig() {

        let country: UniFieldLayout = this.fields.find(x => x.Property === 'Country');
        country.Options = {
            source: this.countries,
            valueProperty: 'Name',
            displayProperty: 'Name',
            events: {
                blur: () => this.setCountryCodeBasedOnCountry()
            }
        };

        this.fields = _.cloneDeep(this.fields);

        setTimeout(() => {
            this.form.field('PostalCode')
                .changeEvent
                .subscribe((address: Address) => {
                    if (address.PostalCode) {
                        // set city based on postalcode
                        this.postalCodeService.GetAll(`filter=Code eq ${address.PostalCode}&top=1`)
                            .subscribe((postalCodes: Array<PostalCode>) => {
                                if (postalCodes.length > 0) {
                                    address.City = postalCodes[0].City;
                                    this.config.model = _.cloneDeep(address);
                                }
                            });
                    }
                });
        });
    }

    private setCountryCodeBasedOnCountry() {
        let model: Address = this.config.model;
        if (model.Country) {
            this.countryService.GetAll(`filter=Name eq '${model.Country}'&top=1`)
                .subscribe((data: Country[]) => {
                    if (data && data.length > 0) {
                        model.CountryCode = data[0].CountryCode;
                    }
                },
                err => console.log('Error setting countrycode based on country ', err)
            );
        }
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'AddressLine1',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'AddressLine2',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresselinje to',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'AddressLine3',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresselinje tre',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'PostalCode',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Postnr.',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'City',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Poststed',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'Country',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Land',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                Classes: 'country-dropdown'
            }
        ];
    }

    private setupQuestionCheckbox() {
        this.fields.push({
            Property: '_question',
            Hidden: (this.config.question || '').length == 0,
            FieldType: FieldType.MULTISELECT,
            Label: this.config.question,
            ReadOnly: this.config.disableQuestion
        });
    }

}

// address modal
@Component({
    selector: 'address-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class AddressModal {
    @Input() public address: Address;
    @Input() public question: string;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Address>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private type: Type<any> = AddressForm;

    constructor(private addressService: AddressService) {
    }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Adresse',
            mode: null,
            question: this.question,
            disableQuestion: false,

            actions: [
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                },
                {
                    text: 'Lagre adresse',
                    class: 'good',
                    method: () => {
                        this.modal.close();
                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
            ]
        };
    }

    public openModal(address: Address, disableQuestion: boolean = false) {
        if (!address.Country || address.Country === '') {
            address.Country = 'Norge';
            address.CountryCode = 'NO';
        }

        this.modalConfig.model = address;

        this.modalConfig.disableQuestion = disableQuestion;
        this.modal.open();
    }
}
