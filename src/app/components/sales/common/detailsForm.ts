import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniForm} from '../../../../framework/uniform';
import {FieldType} from '../../../unientities';
declare const _;

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

    constructor() {
        this.initFormFields();
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            this.entity = _.cloneDeep(this.entity);

            if (this.form && this.readonly) {
                setTimeout(() => {
                    this.form.readMode();
                });
            }
        }
    }

    public onFormReady() {
        if (this.readonly) {
            this.form.readMode();
        }
    }

    public onFormChange(model) {
        this.entityChange.next(model);
    }

    private initFormFields() {
        this.fields = [
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
                EntityType: this.entityType,
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
    }
}
