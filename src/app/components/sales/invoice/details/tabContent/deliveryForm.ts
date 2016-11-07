import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {CustomerInvoice, FieldType, Address, StatusCodeCustomerInvoice} from '../../../../../unientities';
import {UniForm} from '../../../../../../framework/uniform';
import {AddressModal} from '../../../../common/modals/modals';
import {AddressService} from '../../../../../services/services';
declare const _;

@Component({
    selector: 'invoice-delivery-form',
    template: `
        <uni-form [fields]="fields"
                  [model]="invoice"
                  [config]="{}"
                  (readyEvent)="onFormReady($event)"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class InvoiceDeliveryForm {
    @ViewChild(UniForm)
    private form: UniForm;

    @ViewChild(AddressModal)
    private addressModal: AddressModal;

    @Input()
    public invoice: CustomerInvoice;

    @Output()
    public invoiceChange: EventEmitter<CustomerInvoice> = new EventEmitter<CustomerInvoice>();

    private fields: any[];
    private readonly: boolean;

    constructor(private addressService: AddressService) {
        this.initFormLayout();
    }

    public ngOnChanges() {
        if (this.invoice) {
            this.invoice = _.cloneDeep(this.invoice);
            this.readonly = this.invoice.StatusCode && this.invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;

            if (this.readonly && this.form) {
                this.form.readMode();
            } else {
                this.form.editMode();
            }
        }
    }

    public onFormReady() {
        if (this.readonly) {
            this.form.readMode();
        }
    }

    public onFormChange(model) {
        this.invoiceChange.next(model);
    }

    private saveAddressOnCustomer(address: Address, resolve) {
        let index = 0;

        if (!address.ID) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.invoice.Customer.Info.Addresses.push(address);
            index = this.invoice.Customer.Info.Addresses.length - 1;
        } else {
            index = this.invoice.Customer.Info.Addresses.findIndex(addr => addr.ID === address.ID);
            this.invoice.Customer.Info.Addresses[index] = address;
        }

        // remove duplicate entries
        this.invoice.Customer.Info.Addresses = _.uniq(this.invoice.Customer.Info.Addresses, '_createguid');
    }

    private initFormLayout() {
        // TODO: get layout from backend?
        this.fields = [
            {
                EntityType: 'CustomerInvoice',
                Property: 'ShippingAddressLine1',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Leveringsadresse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
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
                EntityType: 'CustomerInvoice',
                Property: 'ShippingPostalCode',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Postnummer',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: null,
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
                EntityType: 'CustomerInvoice',
                Property: 'ShippingCity',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'By',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
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
                EntityType: 'CustomerInvoice',
                Property: 'ShippingCountry',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Land',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: true,
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
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
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
                LineBreak: null,
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
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
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
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
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
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
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

        // this.extendFormLayout();
    }

}
