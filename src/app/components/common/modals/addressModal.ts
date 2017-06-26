import {
    Component, Type, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange,
    SimpleChanges
} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {Address, Country, PostalCode} from '../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {AddressService, CountryService, PostalCodeService, ErrorService} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'address-form',

    template: `
        <article class="modal-content address-modal">
            <uni-form
                [config]="formConfig$"
                [fields]="fields$"
                [model]="model$"
                (changeEvent)="change($event)">
            </uni-form>

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

    private model$: BehaviorSubject<Address> = new BehaviorSubject(null);
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    private countries: Array<Country>;

    constructor(
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
        this.model$.next(this.config.model);
        this.setupForm();
        this.setupQuestionCheckbox();
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.model$.next(this.config.model);
        this.setupForm();
    }

    private setupForm() {
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

                    this.createFormFields();
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public change(changes: SimpleChanges) {
        if (changes['PostalCode']) {
            const postalCode = changes['PostalCode'].currentValue;
            const model = this.model$.getValue();
            this.postalCodeService.GetAll(`filter=Code eq ${postalCode}&top=1`)
                .subscribe((postalCodes: Array<PostalCode>) => {
                    if (postalCodes.length > 0) {
                        model.PostalCode = postalCodes[0].Code;
                        model.City = postalCodes[0].City;
                        this.model$.next(model);
                        this.config.model = _.cloneDeep(model);
                    } else {
                        model.City = '';
                        this.model$.next(model);
                        this.config.model = _.cloneDeep(model);
                    }
                });
        }
    }

    private createFormFields() {
        let fields = this.getFields();
        let country: UniFieldLayout = <any>fields.find(x => x.Property === 'Country');
        country.Options = {
            source: this.countries,
            valueProperty: 'Name',
            displayProperty: 'Name',
            events: {
                blur: () => this.setCountryCodeBasedOnCountry()
            }
        };
        this.fields$.next(fields);
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
                err => this.errorService.handle(err)
            );
        }
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                Legend: (this.config && this.config.title) || 'Adresse',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Address',
                Property: 'AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Adresse',
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Address',
                Property: 'AddressLine2',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje to',
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Address',
                Property: 'AddressLine3',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje tre',
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Address',
                Property: 'PostalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr.',
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Address',
                Property: 'City',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Address',
                Property: 'Country',
                FieldType: FieldType.DROPDOWN,
                Label: 'Land',
            }
        ];
    }

    private setupQuestionCheckbox() {
        let fields = this.fields$.getValue();
        fields.push({
            Property: '_question',
            Hidden: (this.config.question || '').length == 0,
            FieldType: FieldType.CHECKBOX,
            Label: this.config.question,
            ReadOnly: this.config.disableQuestion
        });
        this.fields$.next(fields);
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
                    text: 'Ok',
                    class: 'good',
                    method: () => {
                        this.modal.close();
                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(address: Address, disableQuestion: boolean = false, title?: string) {
        if (title) {
            this.modalConfig.title = title;
        }

        if (!address.Country || address.Country === '') {
            address.Country = 'Norge';
            address.CountryCode = 'NO';
        }

        this.modalConfig.model = address;
        this.modal.getContent().then(cmp => cmp.model$.next(address));
        this.modalConfig.disableQuestion = disableQuestion;
        this.modal.open();
    }
}
