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

    public tabbedPastLastField: EventEmitter<any> = new EventEmitter();
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

        if ((changes['readonly'] || changes['entity']) && this.form) {
            this.setEntityAccessability();
        }
    }

    public onFormReady() {
        this.setEntityAccessability();
    }

    public setEntityAccessability() {
        setTimeout(() => {
            if (!this.entity) {
                this.form.readMode();
            } else {

                if (this.entityType === 'CustomerInvoice') {
                    this.form.editMode();
                    switch (this.entity.StatusCode) {
                        case null:
                            break;
                        case 42001:
                            break;
                        case 42002:
                            this.setFieldsReadonly(['InvoiceDate', 'CurrencyCodeID']);
                            break;
                        case 42003:
                            this.setFieldsReadonly(['InvoiceDate', 'PaymentDueDate', 'CurrencyCodeID']);
                            break;
                        default:
                            this.form.readMode();
                            break;

                    }
                } else {
                    if (this.readonly) { this.form.readMode(); }
                    else { this.form.editMode(); }

                }
            }
        });
    }

    public setFieldsReadonly(fieldPropertyNames: Array<string>) {
         setTimeout(() => {
            let fields = this.fields$.getValue();
            if (fieldPropertyNames) {
                fieldPropertyNames.forEach(fieldPropertyName => {
                    fields.forEach(field => {
                        if (field['Property'] === fieldPropertyName) {
                            field['ReadOnly'] = true;
                        }
                    });
                });
            }
            this.fields$.next(fields);
        });
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
                    Legend: 'Detaljer',
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'InvoiceDate',
                    Placement: 2,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fakturadato',
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
                    Property: 'PaymentDueDate',
                    Placement: 2,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Forfallsdato',
                    Description: '',
                    HelpText: '',
                    Section: 0,
                    StatusCode: 0,
                    ID: 2,
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'CurrencyCodeID',
                    Placement: 1,
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Valuta',
                    Description: '',
                    HelpText: '',
                    Section: 0,
                    StatusCode: 0,
                    ID: 3,
                    Options: {
                        source: this.currencyCodes,
                        valueProperty: 'ID',
                        displayProperty: 'Code',
                        debounceTime: 200
                    }
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'OurReference',
                    Placement: 1,
                    FieldType: FieldType.TEXT,
                    Label: 'Vår referanse',
                    Description: '',
                    HelpText: '',
                    Section: 0,
                    StatusCode: 0,
                    ID: 5
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'YourReference',
                    Placement: 1,
                    FieldType: FieldType.TEXT,
                    Label: 'Deres referanse',
                    Description: '',
                    HelpText: '',
                    Section: 0,
                    StatusCode: 0,
                    ID: 6,
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'EmailAddress',
                    Placement: 1,
                    FieldType: FieldType.TEXT,
                    Label: 'Epost adresse',
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
                    Property: 'Requisition',
                    Placement: 1,
                    FieldType: FieldType.TEXT,
                    Label: 'Rekvisisjon',
                    Description: '',
                    HelpText: '',
                    Section: 0,
                    StatusCode: 0,
                    ID: 7,
                    Options: {
                        events: {
                            tab: (event) => this.tabbedPastLastField.emit(event),
                            enter: (event) => this.tabbedPastLastField.emit(event)
                        }
                    }
                },
            ];

            if (this.entityType === 'CustomerQuote') {
                fields[2].Label = 'Tilbudsdato';
                fields[2].Property = 'QuoteDate';
                fields[3].Label = 'Gyldig til dato';
                fields[3].Property = 'ValidUntilDate';
            } else if (this.entityType === 'CustomerOrder') {
                fields[2].Label = 'Ordredato';
                fields[2].Property = 'OrderDate';
                fields[3].Hidden = true;
            }

            this.fields$.next(fields);
        }
    }
}
