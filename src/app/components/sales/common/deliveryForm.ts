import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Address, Terms} from '../../../unientities';
import {AddressService, BusinessRelationService, ErrorService} from '../../../services/services';
import {UniForm, FieldType} from '../../../../framework/ui/uniform/index';
import {UniModalService, UniAddressModal} from '../../../../framework/uniModal/barrel';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
declare const _;

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
    @ViewChild(UniForm) private form: UniForm;

    @Input() public readonly: boolean;
    @Input() public entityType: string;
    @Input() public entity: any;
    @Input() public paymentTerms: Terms[];
    @Input() public deliveryTerms: Terms[];
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    private model$: BehaviorSubject<any> = new BehaviorSubject({});
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

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
        this.initFormLayout();
    }

    public onFormReady() {
        if (this.readonly) {
            this.form.readMode();
        }
    }

    public onFormChange(changes) {
        const model = this.model$.getValue();

        if (changes['PaymentTermsID'] && changes['PaymentTermsID'].currentValue) {
            model.PaymentTerms = this.paymentTerms.find((term) => {
                return term.ID ===  changes['PaymentTermsID'].currentValue;
            });
        }

        if (changes['DeliveryTermsID'] && changes['DeliveryTermsID'].currentValue) {
            model.DeliveryTerms = this.deliveryTerms.find((term) => {
                return term.ID ===  changes['DeliveryTermsID'].currentValue;
            });
        }

        let shippingAddress = changes['_shippingAddress'];
        if (shippingAddress) {
            this.saveAddressOnCustomer(shippingAddress.currentValue).subscribe(
                res => {
                    this.addressService.addressToShipping(model, res);
                    this.model$.next(model);
                    this.entityChange.emit(model);
                },
                err => this.errorService.handle(err)
            );
        } else {
            this.model$.next(model);
            this.entityChange.emit(model);
        }
    }

    private saveAddressOnCustomer(address: Address): Observable<Address> {
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

        let saveObservable = this.businessRelationService.Put(
            this.entity.Customer.Info.ID,
            this.entity.Customer.Info
        ).catch(err => this.errorService.handleRxCatch(err, saveObservable))
        .map((response) => {
            this.entity.Customer.Info = response;
            this.model$.next(this.entity);
            return response.Addresses[idx];
        });

        return saveObservable;
    }

    private initFormLayout() {
        let addressFieldOptions = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_shippingAddress',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    header: 'Leveringsadresse'
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        this.fields$.next([
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                Legend: 'Betingelser og levering',
                EntityType: this.entityType,
                Property: 'PaymentTermsID',
                Placement: 1,
                FieldType: FieldType.DROPDOWN,
                Label: 'Betalingsbetingelse',
                Section: 0,
                StatusCode: 0,
                ID: 0,
                Options: {
                    source: this.paymentTerms,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.CreditDays + ' kredittdager (' + item.Name + ')') : '';
                    },
                    debounceTime: 200
                }
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DeliveryTermsID',
                Placement: 1,
                FieldType: FieldType.DROPDOWN,
                Label: 'Leveringsbetingelse',
                Section: 0,
                StatusCode: 0,
                ID: 1,
                Options: {
                    source: this.deliveryTerms,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.CreditDays + ' leveringsdager (' + item.Name + ')') : '';
                    },
                    debounceTime: 200
                }
            },
            {
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
                ID: 2,
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: '_ShippingAddress',
                Placement: 1,
                FieldType: FieldType.MULTIVALUE,
                Label: 'Leveringsadresse',
                Description: '',
                HelpText: '',
                Options: addressFieldOptions,
                Section: 0,
                ID: 3
            },
            {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryName',
                Placement: 1,
                FieldType: FieldType.TEXT,
                Label: 'Mottaker',
                Description: '',
                HelpText: '',
                Section: 0,
                StatusCode: 0,
                ID: 4,
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
                ID: 5,
            }
        ]);
    }
}
