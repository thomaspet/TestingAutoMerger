import {Component, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter} from '@angular/core';
import {Address, CurrencyCode} from '../../../unientities';
import {AddressService, BusinessRelationService, ErrorService} from '../../../services/services';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {AddressModal} from '../../common/modals/modals';
declare const _;
import {BehaviorSubject} from 'rxjs/BehaviorSubject';


@Component({
    selector: 'tof-delivery-form',
    template: `
        <uni-form [fields]="fields$"
                  [model]="model$"
                  [config]="formConfig$"
                  (readyEvent)="onFormReady($event)"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDeliveryForm {
    @ViewChild(UniForm)
    private form: UniForm;

    @ViewChild(AddressModal)
    private addressModal: AddressModal;

    @Input()
    public readonly: boolean;

    @Input()
    public entityType: string;

    @Input()
    public entity: any;

    @Output()
    public entityChange: EventEmitter<any> = new EventEmitter();

    private model$: BehaviorSubject<any> = new BehaviorSubject({});
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private address$: any;

    constructor(private addressService: AddressService,
                private businessRelationService: BusinessRelationService,
                private errorService: ErrorService) {
        this.initFormLayout();
    }

    public ngOnChanges(changes) {
        this.model$.next(this.entity);

        if (changes['readonly'] && this.form) {
            setTimeout(() => {
                if (this.readonly) {
                    this.form.readMode();
                } else {
                    this.form.editMode();
                }
            });
        }

        if (this.entity && this.entity.Customer && !this.entity['_shippingAddressID']) {
            const shippingAddress = this.entity.Customer.Info.Addresses.find((addr) => {
                return addr.AddressLine1 === this.entity.ShippingAddressLine1
                    && addr.PostalCode === this.entity.ShippingPostalCode
                    && addr.City === this.entity.ShippingCity
                    && addr.Country === this.entity.ShippingCountry;
            });

            if (shippingAddress) {
                this.entity['_shippingAddress'] = shippingAddress;
                this.model$.next(this.entity);
            }
        }
    }

    public onFormReady() {
        if (this.readonly) {
            this.form.readMode();
        }
    }

    public onFormChange(changes) {
        const model = this.model$.getValue();

        if (changes['_shippingAddress']) {
            this.addressService.addressToShipping(model, model['_shippingAddress']);
        }

        this.model$.next(model);
        this.entityChange.emit(model);
    }

    private saveAddressOnCustomer(address: Address, resolve) {
        var idx = 0;

        if (!address.ID || address.ID === 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.entity.Customer.Info.Addresses.push(address);
            idx = this.entity.Customer.Info.Addresses.length - 1;
        } else {
            idx = this.entity.Customer.Info.Addresses.findIndex((a) => a.ID === address.ID);
            this.entity.Customer.Info.Addresses[idx] = address;
        }

        // remove entries with equal _createguid
        this.entity.Customer.Info.Addresses = _.uniqBy(this.entity.Customer.Info.Addresses, '_createguid');

        // this.quote.Customer.Info.ID
        this.businessRelationService.Put(
            this.entity.Customer.Info.ID,
            this.entity.Customer.Info
        ).subscribe((response) => {
            this.entity.Customer.Info = response;
            this.model$.next(this.entity);
            resolve(response.Addresses[idx]);
        }, err => this.errorService.handle(err));
    }

    private initFormLayout() {
        let addressFieldOptions = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_shippingAddress',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.address$) {
                    this.address$.unsubscribe();
                }

                this.address$ = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) {
                        this.saveAddressOnCustomer(address, resolve);
                    } else {
                        resolve(address);
                    }
                }, err => this.errorService.handle(err));
            }),

            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        this.fields$.next([
            {
                Legend: 'Levering',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DeliveryDate',
                Placement: 1,
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Leveringsdato',
                Description: '',
                HelpText: '',
                Section: 0,
                StatusCode: 0,
                ID: 1,
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: '_ShippingAddress',
                Placement: 1,
                FieldType: FieldType.MULTIVALUE,
                Label: 'Leveringsadresse',
                Description: '',
                HelpText: '',
                Options: addressFieldOptions,
                Section: 0
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DeliveryName',
                Placement: 1,
                FieldType: FieldType.TEXT,
                Label: 'Mottaker',
                Description: '',
                HelpText: '',
                Section: 0,
                StatusCode: 0,
                ID: 2,
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryMethod',
                Placement: 1,
                FieldType: FieldType.TEXT,
                Label: 'Leveringsmåte',
                Description: '',
                HelpText: '',
                Section: 0,
                StatusCode: 0,
                ID: 3,
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryTerm',
                Placement: 1,
                FieldType: FieldType.TEXT,
                Label: 'Leveringsbetingelse',
                Description: '',
                HelpText: '',
                Section: 0,
                StatusCode: 0,
                ID: 4,
            },
        ]);
    }
}
