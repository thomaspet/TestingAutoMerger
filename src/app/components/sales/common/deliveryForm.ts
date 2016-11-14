import {Component, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter} from '@angular/core';
import {FieldType, Address} from '../../../unientities';
import {AddressService, BusinessRelationService} from '../../../services/services';
import {UniForm} from '../../../../framework/uniform';
import {AddressModal} from '../../common/modals/modals';
declare const _;

@Component({
    selector: 'tof-delivery-form',
    template: `
        <section class="shippingAddress">
            <uni-form [fields]="[multivalueField]"
                      [model]="entity"
                      [config]="{autofocus: true}"
                      (readyEvent)="onLeftFormReady($event)"
                      (changeEvent)="onLeftFormChange($event)">
            </uni-form>

            <section *ngIf="entity?.Customer && entity.ShippingAddressLine1"
                     class="addressCard"
                     [attr.aria-readonly]="readonly">
                <strong>{{entity.Customer?.Info?.Name}}</strong>
                <br><span *ngIf="entity.ShippingAddressLine1">
                    {{entity.ShippingAddressLine1}}
                </span>
                <br><span *ngIf="entity.ShippingPostalCode || entity.ShippingCity">
                    {{entity.ShippingPostalCode}} {{entity.ShippingCity}}
                </span>
                <br><span *ngIf="entity.ShippingCountry">
                    {{entity.ShippingCountry}}
                </span>
                <span class="emailInfo" *ngIf="entity.Customer?.Info?.Emails">
                    {{entity?.Customer?.Info?.Emails[0]?.EmailAddress}}
                </span>
            </section>
        </section>

        <aside>
            <uni-form [fields]="fields"
                      [model]="entity"
                      [config]="{}"
                      (readyEvent)="onRightFormReady($event)"
                      (changeEvent)="onRightFormChange($event)">
            </uni-form>
        </aside>
    `
})
export class TofDeliveryForm {
    @ViewChildren(UniForm)
    private forms: QueryList<UniForm>;

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

    private fields: any[];
    private multivalueField: any;
    private address$: any;

    constructor(private addressService: AddressService,
                private businessRelationService: BusinessRelationService) {
        this.initFormLayout();
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            this.entity = _.cloneDeep(this.entity);
        }

        if (changes['readonly'] && this.forms) {
            setTimeout(() => {
                if (this.readonly) {
                    this.forms.first.readMode();
                    this.forms.last.readMode();
                } else {
                    this.forms.last.editMode();
                    if (this.entity.Customer) {
                        this.forms.first.editMode();
                    } else {
                        this.forms.first.readMode();
                    }
                }
            });
        }
    }

    public onLeftFormReady() {
        if (this.readonly) {
            this.forms.first.readMode();
        }
    }

    public onRightFormReady() {
        if (this.readonly) {
            this.forms.last.readMode();
        }
    }

    public onLeftFormChange(model) {
        this.entity = model;
        this.addressService.addressToShipping(this.entity, model['_ShippingAddress']);
        this.entityChange.next(model);
    }

    public onRightFormChange(model) {
        this.entity = model;
        this.entityChange.next(this.entity);
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
        this.entity.Customer.Info.Addresses = _.uniq(this.entity.Customer.Info.Addresses, '_createguid');

        // this.quote.Customer.Info.ID
        this.businessRelationService.Put(this.entity.Customer.Info.ID, this.entity.Customer.Info).subscribe((info) => {
            this.entity.Customer.Info = info;
            resolve(info.Addresses[idx]);
        });
    }

    private initFormLayout() {
        // Setup multivalue form
        this.multivalueField = {
            ComponentLayoutID: 3,
            EntityType: 'Address',
            Property: '_ShippingAddress',
            Placement: 1,
            Hidden: false,
            FieldType: FieldType.MULTIVALUE,
            ReadOnly: false,
            LookupField: false,
            Label: 'Leveringsadresse',
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
            ID: 6,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            CustomFields: null
        };

        this.multivalueField.Options = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Customer.Info.ShippingAddressID',
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
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        // Setup right side form
        this.fields = [
            {
                EntityType: this.entityType,
                Property: 'DeliveryDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DATEPICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Leveringsdato',
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
                ID: 3,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                EntityType: this.entityType,
                Property: 'DeliveryName',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Mottaker',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 2,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                EntityType: this.entityType,
                Property: 'DeliveryMethod',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Leveringsmåte',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 4,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                EntityType: this.entityType,
                Property: 'DeliveryTerm',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Leveringsbetingelse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 5,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
        ];
    }

}
