import {Component, Input, Output, EventEmitter, SimpleChanges, ViewChild} from '@angular/core';
import {FieldType, UniFieldLayout, UniForm} from '@uni-framework/ui/uniform';
import {CompanySettings, Contact, CurrencyCode, LocalDate, Project, Seller} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {set} from 'lodash';
import * as moment from 'moment';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    selector: 'tof-details-form',
    template: `
        <uni-form
            [fields]="fields$"
            [model]="entity$"
            [config]="{autofocus: false}"
            (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})
export class TofDetailsForm {
    @ViewChild(UniForm) form: UniForm;

    @Input() readonly: boolean;
    @Input() entityType: string;
    @Input() entity: any;
    @Input() currencyCodes: CurrencyCode[];
    @Input() projects: Project;
    @Input() sellers: Seller[];
    @Input() contacts: Contact[];
    @Input() companySettings: CompanySettings;

    @Output() entityChange = new EventEmitter();

    tabbedPastLastField = new EventEmitter();
    entity$ = new BehaviorSubject<any>({});
    fields$ = new BehaviorSubject<Partial<UniFieldLayout>[]>([]);

    constructor(private featurePermissionService: FeaturePermissionService) {}

    ngOnInit() {
        this.entity$.next(this.entity);
        this.initFormFields();
    }

    ngOnChanges(changes) {
        this.entity$.next(this.entity);
        if ((this.projects && this.entityType) || ((changes['readonly'] || changes['entity']))) {
            this.initFormFields();
        }
    }

    ngOnDestroy() {
        this.entity$.complete();
        this.fields$.complete();
    }

    onFormChange(changes: SimpleChanges) {
        const keys = Object.keys(changes);
        this.entity['_updatedFields'] = keys;
        keys.forEach(key => {
            if (key.includes('ProjectID')) {
                this.entity['_updatedField'] = Object.keys(changes)[0];
            }
            set(this.entity, key, changes[key].currentValue);
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
            const fields: Partial<UniFieldLayout>[] = [
                {
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
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'PaymentDueDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Forfallsdato',
                    Section: 0,
                },
                {
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
                {
                    FieldSet: 1,
                    FieldSetColumn: this.featurePermissionService.canShowUiFeature('ui.dimensions') ? 1 : 2,
                    EntityType: this.entityType,
                    Property: 'OurReference',
                    FieldType: FieldType.TEXT,
                    Label: 'Vår referanse',
                    Section: 0,
                    MaxLength: 255,
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'ReadyToInvoice',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Klar til faktura',
                    Section: 0,
                    Hidden: true
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'YourReference',
                    FieldType: FieldType.TYPEAHEAD,
                    Label: 'Deres referanse',
                    Section: 0,
                    MaxLength: 255,
                    Options: {
                        source: this.contacts,
                        valueProperty: 'Info.Name',
                        displayProperty: 'Info.Name'
                    }
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    EntityType: this.entityType,
                    Property: 'EmailAddress',
                    FieldType: FieldType.TEXT,
                    Label: 'E-postadresse',
                    Section: 0,
                },
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    FeaturePermission: 'ui.dimensions',
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
                {
                    FieldSet: 1,
                    FieldSetColumn: 2,
                    FeaturePermission: 'ui.sellers',
                    EntityType: this.entityType,
                    Property: 'DefaultSellerID',
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
                fields[4].Hidden = false;
            }

            if (this.entityType !== 'CustomerInvoice') {
                fields.forEach(field => {
                    field.ReadOnly = this.readonly;
                });
            }

            if (this.entityType === 'RecurringInvoice') {
                const avtalegiroFields = [
                    {
                        FieldSet: 1,
                        FieldSetColumn: 1,
                        EntityType: this.entityType,
                        ReadOnly: true,
                        Property: 'Customer.AvtaleGiroNotification',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Varsel AvtaleGiro',
                        Section: 0,
                        Tooltip: {
                            Text: 'Blir det sendt varsel på e-post om AvtaleGiro?'
                        }
                    },
                    {
                        FieldSet: 1,
                        FieldSetColumn: 1,
                        EntityType: this.entityType,
                        ReadOnly: true,
                        Property: 'Customer.AvtaleGiro',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Påmeldt AvtaleGiro',
                        Section: 0
                    }
                ];
                // If its details view for recurring invoice, dont show dates, they are in recurring settings view
                fields.splice(0, 2);

                // All fields are never read only in this view
                fields.map(f => {
                    f.ReadOnly = false;
                    return f;
                });

                // Add avtalegiro fields after setting all the other fields to readonly = false
                fields.splice(2, 0, ...avtalegiroFields);
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
