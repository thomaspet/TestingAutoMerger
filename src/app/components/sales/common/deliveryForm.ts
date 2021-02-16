import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Address, LocalDate, Terms, PaymentInfoType} from '@app/unientities';
import {AddressService, BusinessRelationService, CustomerService, ErrorService, TermsService} from '@app/services/services';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform';
import {UniModalService, UniAddressModal} from '@uni-framework/uni-modal';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'tof-delivery-form',
    template: `
        <uni-form
            [fields]="fields$"
            [model]="model$"
            [config]="formConfig$"
            (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDeliveryForm implements OnInit {
    @Input() readonly: boolean;
    @Input() entityType: string;
    @Input() entity: any;
    @Input() paymentInfoTypes: PaymentInfoType[];

    @Output() entityChange: EventEmitter<any> = new EventEmitter();

    paymentTerms: Terms[];
    deliveryTerms: Terms[];

    model$: BehaviorSubject<any> = new BehaviorSubject({});
    formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private customerService: CustomerService,
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private termsService: TermsService
    ) {}

    ngOnInit() {
        forkJoin(
            this.termsService.GetAction(null, 'get-payment-terms'),
            this.termsService.GetAction(null, 'get-delivery-terms'),
        ).subscribe(
            res => {
                this.paymentTerms = res[0] || [];
                this.deliveryTerms = res[1] || [];

                this.model$.next(this.entity);
                this.initFormLayout();
            },
            err => this.errorService.handle(err)
        );
    }

    ngOnDestroy() {
        this.model$.complete();
        this.formConfig$.complete();
        this.fields$.complete();
    }

    ngOnChanges() {
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

    onFormChange(changes) {
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
        const address = model['_shippingAddress'];
        if (changes['_shippingAddress']) {
            if (address && address['_isDirty']) {
                address['_isDirty'] = false;
                this.saveAddressAndEmitChange(address);
                return;
            } else {
                this.addressService.addressToShipping(model, address);
            }
        }
        this.model$.next(model);
        this.entityChange.emit(model);
    }

    private saveAddressAndEmitChange(address) {
        const businessRelation = this.entity.Customer.Info;
        const addressIndex = businessRelation.Addresses.findIndex(a => {
            return a['_createguid'] === address['_createguid']
                || a.ID === address.ID;
        });

        this.businessRelationService.Put(businessRelation.ID, businessRelation).subscribe(
            res => {
                // Invalidate the cache of customerService since we've indirectly altered
                // a customer by updating businessRelation
                this.customerService.invalidateCache();

                this.entity.Customer.Info = res;
                this.addressService.addressToShipping(this.entity, res.Addresses[addressIndex]);
                this.model$.next(this.entity);
                this.entityChange.emit(this.entity);

            },
            err => this.errorService.handle(err)
        );
    }

    private initFormLayout() {
        const addressFieldOptions = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_shippingAddress',
            hideDeleteButton: true,
            editor: (value) => {
                if (!this.entity || !this.entity.Customer) {
                    this.toastService.addToast(
                        'Kan ikke opprette addresse uten kunde',
                        ToastType.warn,
                        5
                    );

                    return Promise.resolve(null);
                }

                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    header: 'Leveringsadresse'
                });

                return modal.onClose.take(1).map(address => {
                    if (address && !address.ID) {
                        address['_createguid'] = this.addressService.getNewGuid();
                    }

                    return address;
                }).toPromise();
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
                MaxLength: 255,
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
                Hidden: this.entityType === 'RecurringInvoice'
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
                MaxLength: 255,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'DeliveryMethod',
                FieldType: FieldType.TEXT,
                Label: 'Leveringsmåte',
                Section: 0,
                MaxLength: 100,
            }
        ];

        if (this.entityType !== 'CustomerInvoice') {
            fields.forEach(field => {
                field.ReadOnly = this.readonly;
            });
        }

        // Add KID to the form when entity is Order or Invoice!
        if (this.entityType === 'CustomerOrder' || this.entityType === 'CustomerInvoice' || this.entityType === 'RecurringInvoice') {
            fields.splice(3, 0, <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'PaymentInfoTypeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'KID',
                Section: 0,
                Options: {
                    source: this.paymentInfoTypes.length > 0
                        ? this.paymentInfoTypes.filter((item) => item.StatusCode === 42400 && !item.Locked)
                        : [],
                    valueProperty: 'ID',
                    template: (item) => {
                        return item.Name;
                    },
                    debounceTime: 200,
                    addEmptyValue: true
                },
                ReadOnly: (this.readonly || this.entity.StatusCode === 41004) && this.entityType !== 'RecurringInvoice',
                Hidden: this.entity.StatusCode && this.entity.StatusCode > 42001 && this.entityType !== 'RecurringInvoice'
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
                Hidden: this.entity.StatusCode < 42002 || this.entity.StatusCode === null || this.entityType === 'RecurringInvoice',
                MaxLength: 100,
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
