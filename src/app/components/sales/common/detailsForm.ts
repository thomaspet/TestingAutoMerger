import {Component, Input, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {CurrencyCode} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const _;

@Component({
    selector: 'tof-details-form',
    template: `
        <uni-form [fields]="fields$"
                  [model]="entity$"
                  [config]="formConfig$"
                  (readyEvent)="onFormReady($event)"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDetailsForm {
    @ViewChild(UniForm) private form: UniForm;

    @Input() public readonly: boolean;
    @Input() public entityType: string;
    @Input() public entity: any;
    @Input() public currencyCodes: Array<CurrencyCode>;

    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    private entity$: BehaviorSubject<any> = new BehaviorSubject({});
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public ngOnInit() {
        this.entity$.next(this.entity);
    }

    public ngOnChanges(changes) {
        this.entity$.next(this.entity);

        if (changes['entityType'] && this.entityType) {
            this.initFormFields();
        } else if (changes['currencyCodes'] && this.currencyCodes) {
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

    public onFormChange(changes: SimpleChanges) {
        var keys = Object.keys(changes);
        keys.forEach(key => {
            _.set(this.entity, key, changes[key].currentValue);
        });
        this.entityChange.emit(this.entity);
    }

    private initFormFields() {
        if (this.currencyCodes && this.entity) {
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
                    Property: 'EmailAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Epost adresse',
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
                    Property: 'CurrencyCodeID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Valuta',
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
                    CustomFields: null,
                    Options: {
                        source: this.currencyCodes,
                        valueProperty: 'ID',
                        displayProperty: 'Code',
                        debounceTime: 200
                    }
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
                }
            ];

            if (this.entityType === 'CustomerQuote') {
                fields[4].Label = 'Tilbudsdato';
                fields[4].Property = 'QuoteDate';
                fields[5].Label = 'Gyldig til dato';
                fields[5].Property = 'ValidUntilDate';
            } else if (this.entityType === 'CustomerOrder') {
                fields[4].Label = 'Ordredato';
                fields[4].Property = 'OrderDate';
                fields[5].Hidden = true;
            }

            this.fields$.next(fields);
        }
    }
}
