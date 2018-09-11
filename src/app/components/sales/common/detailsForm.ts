import {Component, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {CompanySettings, CurrencyCode, LocalDate, Project, Seller, StatusCodeCustomerInvoice} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

declare const _;

@Component({
    selector: 'tof-details-form',
    template: `
        <uni-form [fields]="fields$"
                  [model]="entity$"
                  [config]="formConfig$"
                  (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDetailsForm {
    @Input() public readonly: boolean;
    @Input() public entityType: string;
    @Input() public entity: any;
    @Input() public currencyCodes: Array<CurrencyCode>;
    @Input() public projects: Project;
    @Input() public sellers: Seller[];
    @Input() public companySettings: CompanySettings;

    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    public tabbedPastLastField: EventEmitter<any> = new EventEmitter();
    public entity$: BehaviorSubject<any> = new BehaviorSubject({});
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        this.entity$.next(this.entity);
        this.initFormFields();
    }

    public ngOnChanges(changes) {
        this.entity$.next(this.entity);
        if ((this.projects && this.entityType) || ((changes['readonly'] || changes['entity']))) {
            this.initFormFields();
        }
    }

    public onFormChange(changes: SimpleChanges) {
        const keys = Object.keys(changes);
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
            const fields: UniFieldLayout[] = [
                <any> {
                    // Legend: 'Detaljer',
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'InvoiceDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fakturadato',
                    Section: 0,
                    ReadOnly: this.readonly,
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'PaymentDueDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Forfallsdato',
                    Section: 0,
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'CurrencyCodeID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Valuta',
                    Section: 0,
                    Options: {
                        source: this.currencyCodes,
                        valueProperty: 'ID',
                        displayProperty: 'Code',
                        debounceTime: 200
                    },
                    ReadOnly: this.readonly,
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'OurReference',
                    FieldType: FieldType.TEXT,
                    Label: 'Vår referanse',
                    Section: 0,
                    MaxLength: 255,
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'YourReference',
                    FieldType: FieldType.TEXT,
                    Label: 'Deres referanse',
                    Section: 0,
                    MaxLength: 255,
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'EmailAddress',
                    FieldType: FieldType.TEXT,
                    Label: 'E-postadresse',
                    Section: 0,
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
                        addEmptyValue: true
                    },
                },
                <any> {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'DefaultSeller.ID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Hovedselger',
                    Section: 0,
                    Options: {
                        source: this.sellers,
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        debounceTime: 200,
                        addEmptyValue: true,
                        events: {
                            tab: (event) => this.tabbedPastLastField.emit(event),
                            enter: (event) => this.tabbedPastLastField.emit(event)
                        },
                    },
                },
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

            if (this.entityType !== 'CustomerInvoice') {
                fields.forEach(field => {
                    field.ReadOnly = this.readonly;
                });
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
