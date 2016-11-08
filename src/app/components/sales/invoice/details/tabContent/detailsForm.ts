import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniForm} from '../../../../../../framework/uniform';
import {CustomerInvoice, FieldType, StatusCodeCustomerInvoice} from '../../../../../unientities';
declare const _;

@Component({
    selector: 'invoice-details-form',
    template: `
        <uni-form [fields]="fields"
                  [model]="invoice"
                  [config]="formConfig"
                  (readyEvent)="onFormReady($event)"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
        <label class="comment-textarea" *ngIf="invoice">Kommentar
            <textarea ngDefaultControl [(ngModel)]="invoice.Comment" [disabled]="readonly"></textarea>
        </label>
    `
})
export class InvoiceDetailsForm {
    @ViewChild(UniForm)
    private form: UniForm;

    @Input()
    public invoice: CustomerInvoice;

    @Output()
    public invoiceChange: EventEmitter<CustomerInvoice> = new EventEmitter<CustomerInvoice>();

    private fields: any[];
    private readonly: boolean;
    public formConfig: any = {autofocus: false};

    constructor() {
        this.initFormFields();
    }

    public ngOnChanges(changes) {
        if (changes['invoice'] && this.invoice) {
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

    private initFormFields() {
        this.fields = [
            {
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
                Property: 'YourReference',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Deres referanse',
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
                // ComponentLayoutID: 3,
                EntityType: 'CustomerInvoice',
                Property: 'OurReference',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Vår referanse',
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
                Property: 'Requisition',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Rekvisisjon',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: true,
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
                Property: 'InvoiceDate',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.DATEPICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Fakturadato',
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
                ID: 5,
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
                Property: 'PaymentDueDate',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.DATEPICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Forfallsdato',
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
            },
            // {
            //     // ComponentLayoutID: 3,
            //     EntityType: 'CustomerInvoice',
            //     Property: 'Comment',
            //     Placement: 1,
            //     Hidden: false,
            //     FieldType: FieldType.TEXTAREA,
            //     ReadOnly: false,
            //     LookupField: false,
            //     Label: 'Kommentar',
            //     Description: '',
            //     HelpText: '',
            //     FieldSet: 0,
            //     Section: 0,
            //     Placeholder: null,
            //     LineBreak: null,
            //     Combo: null,
            //     Legend: '',
            //     StatusCode: 0,
            //     ID: 7,
            //     Deleted: false,
            //     CreatedAt: null,
            //     UpdatedAt: null,
            //     CreatedBy: null,
            //     UpdatedBy: null,
            //     CustomFields: null
            // },
        ];
    }
}
