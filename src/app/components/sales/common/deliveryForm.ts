import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Address, LocalDate, Terms, StatusCodeCustomerInvoice, PaymentInfoType} from '../../../unientities';
import {AddressService, BusinessRelationService, ErrorService} from '../../../services/services';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {UniModalService, UniAddressModal} from '../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
declare const _;

@Component({
    selector: 'tof-delivery-form',
    template: `
        <uni-form [fields]="fields$"
                  [model]="model$"
                  [config]="formConfig$"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDeliveryForm implements OnInit {
    @Input() public readonly: boolean;
    @Input() public entityType: string;
    @Input() public entity: any;
    @Input() public paymentTerms: Terms[];
    @Input() public deliveryTerms: Terms[];
    @Input() public paymentInfoTypes: PaymentInfoType[];

    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    private model$: BehaviorSubject<any> = new BehaviorSubject({});
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    ngOnInit() {
        if (this.entity && !this.entity['PaymentInfoTypeID']
            && (this.entityType === 'CustomerOrder' || this.entityType === 'CustomerInvoice')) {
                this.entity['PaymentInfoTypeID'] = this.paymentInfoTypes[0].ID;
        }

        this.model$.next(this.entity);
        this.initFormLayout();
    }

    public ngOnChanges(changes) {
        if (this.entity && this.entity.Customer && !this.entity['_shippingAddressID']) {
            const shippingAddress = this.entity.Customer.Info.Addresses.find((addr) => {
                return addr.AddressLine1 === this.entity.ShippingAddressLine1
                    && addr.PostalCode === this.entity.ShippingPostalCode
                    && addr.City === this.entity.ShippingCity
                    && addr.Country === this.entity.ShippingCountry;
            });

            if (shippingAddress) {
                this.entity['_shippingAddress'] = shippingAddress;
            }
        }

        this.model$.next(this.entity);
        this.initFormLayout();
    }

    public onFormChange(changes) {
        const model = this.model$.getValue();

        if (changes['PaymentTermsID']) {
            if (changes['PaymentTermsID'].currentValue) {
                model.PaymentTerms = this.paymentTerms.find((term) => {
                    return term.ID ===  changes['PaymentTermsID'].currentValue;
                });

                if (this.entityType === 'CustomerInvoice') {
                    this.setPaymentDueDate(this.entity);
                }
            } else {
                // runs if delivery term dropdown is reset/chosen as empty value, to empty the entity
                model.PaymentTerms = null;
            }
        }

        if (changes['DeliveryTermsID']) {
            if (changes['DeliveryTermsID'].currentValue) {
                model.DeliveryTerms = this.deliveryTerms.find((term) => {
                    return term.ID ===  changes['DeliveryTermsID'].currentValue;
                });
                this.setDeliveryDate(this.entity);
            } else {
                // runs if delivery term dropdown is reset/chosen as empty value, to empty the entity
                model.DeliveryTerms = null;
            }
        }

        const shippingAddress = changes['_shippingAddress'];
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
        let idx = 0;

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

        const saveObservable = this.businessRelationService.Put(
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
        const addressFieldOptions = {
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

        const fields: UniFieldLayout[] = [
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'Requisition',
                FieldType: FieldType.TEXT,
                Label: 'Rekvisisjon',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'PaymentTermsID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Betalingsbetingelse',
                Section: 0,
                Options: {
                    source: this.paymentTerms,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.CreditDays + ' kredittdager (' + item.Name + ')') : '';
                    },
                    debounceTime: 200,
                    addEmptyValue: true
                },
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DeliveryTermsID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Leveringsbetingelse',
                Section: 0,
                Options: {
                    source: this.deliveryTerms,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.CreditDays + ' leveringsdager (' + item.Name + ')') : '';
                    },
                    debounceTime: 200,
                    addEmptyValue: true
                },
                ReadOnly: this.readonly
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Leveringsdato',
                Section: 0,
                ReadOnly: this.readonly,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: '_ShippingAddress',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Leveringsadresse',
                Options: addressFieldOptions,
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryName',
                FieldType: FieldType.TEXT,
                Label: 'Mottaker',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryMethod',
                FieldType: FieldType.TEXT,
                Label: 'Leveringsmåte',
                Section: 0,
            }
        ];

        if (this.entityType !== 'CustomerInvoice') {
            fields.forEach(field => {
                field.ReadOnly = this.readonly;
            });
        }

        // Add KID to the form when entity is Order or Invoice!
        if (this.entityType === 'CustomerOrder' || this.entityType === 'CustomerInvoice') {
            fields.splice(3, 0, <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'PaymentInfoTypeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'KID',
                Section: 0,
                Options: {
                    source: this.paymentInfoTypes.filter((item) => item.StatusCode === 42400 && !item.Locked),
                    valueProperty: 'ID',
                    template: (item) => {
                        return item.Name;
                    },
                    debounceTime: 200,
                    addEmptyValue: true
                },
                ReadOnly: this.readonly || this.entity.StatusCode === 41004,
                Hidden: this.entity.StatusCode && this.entity.StatusCode > 42001
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID',
                Section: 0,
                ReadOnly: true,
                Hidden: this.entity.StatusCode < 42002 || this.entity.StatusCode === null
            });
        }

        this.fields$.next(fields);
    }

    private setPaymentDueDate(entity) {
        if (entity.PaymentTerms && entity.PaymentTerms.CreditDays) {
            entity.PaymentDueDate = entity.InvoiceDate;
            if (entity.PaymentTerms.CreditDays < 0) {
                entity.PaymentDueDate = new LocalDate(
                    moment(entity.InvoiceDate).endOf('month').toDate()
                );
            }
            entity.PaymentDueDate = new LocalDate(
                moment(entity.PaymentDueDate).add(Math.abs(entity.PaymentTerms.CreditDays), 'days').toDate()
            );
        } else {
            entity.PaymentDueDate = null;
        }
    }

    private setDeliveryDate(entity) {
        if (entity.DeliveryTerms && entity.DeliveryTerms.CreditDays) {
            entity.DeliveryDate = entity.InvoiceDate;
            if (entity.DeliveryTerms.CreditDays < 0) {
                entity.DeliveryDate = new LocalDate(moment(entity.InvoiceDate).endOf('month').toDate());
            }
            entity.DeliveryDate = new LocalDate(
                moment(entity.DeliveryDate).add(Math.abs(entity.DeliveryTerms.CreditDays), 'days').toDate()
            );
        } else {
            entity.DeliveryDate = null;
        }
    }
}
