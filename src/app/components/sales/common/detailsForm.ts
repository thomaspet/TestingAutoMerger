import {Component, Input, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {UniForm, FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {CompanySettings, CurrencyCode, LocalDate, Project} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Dimension} from '../../../services/common/dimensionService';
import * as moment from 'moment';

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
    @Input() public projects: Project;
    @Input() public companySettings: CompanySettings;
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    public tabbedPastLastField: EventEmitter<any> = new EventEmitter();
    private entity$: BehaviorSubject<any> = new BehaviorSubject({});
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        this.entity$.next(this.entity);
    }

    public ngOnChanges(changes) {
        this.entity$.next(this.entity);

        if (this.projects && this.entityType) {
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

        if (changes['QuoteDate'] && changes['QuoteDate'].currentValue) {
            this.setDates(changes['QuoteDate'].currentValue);
        } else if (changes['OrderDate'] && changes['OrderDate'].currentValue) {
            this.setDates(changes['OrderDate'].currentValue);
        } else if (changes['InvoiceDate'] && changes['InvoiceDate'].currentValue) {
            this.setDates(changes['InvoiceDate'].currentValue);
        }

        this.entityChange.emit(this.entity);
    }

    private initFormFields() {
        if (this.currencyCodes && this.entity) {
            let fields: UniFieldLayout[] = [
                <any> {
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
                <any> {
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
                <any> {
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
                <any> {
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
                <any> {
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
                <any> {
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
                <any> {
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
                    ID: 7
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'DefaultDimensions.ProjectID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prosjekt',
                    Section: 0,
                    Options: {
                        source: this.projects,
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        debounceTime: 200,
                        events: {
                            tab: (event) => this.tabbedPastLastField.emit(event),
                            enter: (event) => this.tabbedPastLastField.emit(event)
                        }
                    },
                }
            ];

            if (this.entityType === 'CustomerQuote') {
                fields[0].Label = 'Tilbudsdato';
                fields[0].Property = 'QuoteDate';
                fields[1].Label = 'Gyldig til dato';
                fields[1].Property = 'ValidUntilDate';
            } else if (this.entityType === 'CustomerOrder') {
                fields[0].Label = 'Ordredato';
                fields[0].Property = 'OrderDate';
                fields[1].Hidden = true;
            }

            this.fields$.next(fields);
        }
    }

    private setDates(entityDate: LocalDate) {
        if (this.entityType === 'CustomerInvoice') {
            this.entity.PaymentDueDate = entityDate;
            if (!this.entity.PaymentTerms) {
                this.entity.PaymentDueDate = new LocalDate(
                    moment(this.entity.PaymentDueDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
                );
            } else if (this.entity.PaymentTerms.CreditDays) {
                if (this.entity.PaymentTerms.CreditDays < 0) {
                    this.entity.PaymentDueDate = new LocalDate(
                        moment(this.entity.PaymentDueDate).endOf('month').toDate()
                    );
                }
                this.entity.PaymentDueDate = new LocalDate(
                    moment(this.entity.PaymentDueDate).add(Math.abs(this.entity.PaymentTerms.CreditDays), 'days')
                        .toDate()
                );
            }
        }

        if (this.entity.DeliveryTerms && this.entity.DeliveryTerms.CreditDays) {
            this.entity.DeliveryDate = entityDate;
            if (this.entity.DeliveryTerms.CreditDays < 0) {
                this.entity.DeliveryDate = new LocalDate(moment(this.entity.DeliveryDate).endOf('month').toDate());
            }

            this.entity.DeliveryDate = new LocalDate(
                moment(this.entity.DeliveryDate).add(Math.abs(this.entity.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }
}
