import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from '../../../unientities';

@Component({
    selector: 'tof-details-form',
    template: `
        <uni-form [fields]="fields"
                  [model]="entity"
                  [config]="formConfig"
                  (readyEvent)="onFormReady($event)"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDetailsForm {
    @ViewChild(UniForm)
    private form: UniForm;

    @Input()
    public readonly: boolean;

    @Input()
    public entityType: string;

    @Input()
    public entity: any;

    @Output()
    public entityChange: EventEmitter<any> = new EventEmitter();

    private fields: any[];
    public formConfig: any = {autofocus: false};

    public ngOnChanges(changes) {
        if (changes['entityType'] && this.entityType) {
            this.initFormFields();
        }

        if (changes['readonly'] && this.form) {
            setTimeout(() => {
                if (this.readonly) {
                    this.form.readMode();
                } else {
                    this.form.editMode();
                }
            });
        }
    }

    public onFormReady() {
        if (this.readonly) {
            this.form.readMode();
        }
    }

    public onFormChange(model) {
        this.entityChange.emit(model);
    }

    private initFormFields() {
        let fields = [
            {
                EntityType: this.entityType,
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
                EntityType: this.entityType,
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
                EntityType: this.entityType,
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
                Property: 'InvoiceDate',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
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
                EntityType: this.entityType,
                Property: 'PaymentDueDate',
                Placement: 2,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
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
            {
                // ComponentLayoutID: 3,
                EntityType: this.entityType,
                Property: 'Comment',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXTAREA,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kommentar',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 7,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
        ];

        if (this.entityType === 'CustomerQuote') {
            fields[3].Label = 'Tilbudsdato';
            fields[3].Property = 'QuoteDate';
            fields[4].Label = 'Gyldig til dato';
            fields[4].Property = 'ValidUntilDate';
        } else if (this.entityType === 'CustomerOrder') {
            fields[3].Label = 'Ordredato';
            fields[3].Property = 'OrderDate';
            fields[4].Hidden = true;
        }

        this.fields = fields;
    }

}
