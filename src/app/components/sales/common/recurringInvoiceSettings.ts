import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { FieldType, UniForm, UniFieldLayout } from '@uni-framework/ui/uniform';
declare const _;

@Component({
    selector: 'uni-recurring-invoice-settings-view',
    template: `
        <uni-form
            [fields]="fields$"
            [model]="model$"
            [config]="{}"
            (changeEvent)="onFormChange($event)">
        </uni-form>
    `
})

export class UniRecurringInvoiceSettingsView implements OnInit {

    @Input() public entity: any;
    @Input() public entityType: string;
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<any> = new BehaviorSubject({});
    public produceAsValues = [
        { value: 0, label: 'Ordre' },
        { value: 1, label: 'Faktura' }
    ];

    public timeperiodValues = [
        { value: 0, label: 'Aldri' },
        { value: 1, label: 'Dag' },
        { value: 2, label: 'Uke' },
        { value: 3, label: 'Måned' },
        { value: 4, label: 'Kvartal' },
        { value: 5, label: 'År' }
    ];

    constructor() {}

    public ngOnInit() {
        this.fields$.next(this.initFormFields());
    }

    public ngOnChanges(changes) {
        this.model$.next(this.entity);
    }

    public onFormChange(changes) {
        const keys = Object.keys(changes);
        keys.forEach(key => {
            if (key === 'PreparationDays' && !changes[key].currentValue) {
                _.set(this.entity, key, 0);
            } else {
                _.set(this.entity, key, changes[key].currentValue);
            }
        });
        this.entityChange.emit(this.entity);
    }

    public initFormFields(): UniFieldLayout[] {
        return [
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'Interval',
                FieldType: FieldType.NUMERIC,
                Label: 'Gjenta utsending hver',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'TimePeriod',
                FieldType: FieldType.DROPDOWN,
                Label: '',
                Section: 0,
                Options: {
                    source: this.timeperiodValues,
                    hideDeleteButton: true,
                    valueProperty: 'value',
                    displayProperty: 'label',
                    debounceTime: 200
                },
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'ProduceAs',
                FieldType: FieldType.DROPDOWN,
                Label: 'Produserer',
                Section: 0,
                Options: {
                    source: this.produceAsValues,
                    hideDeleteButton: true,
                    valueProperty: 'value',
                    displayProperty: 'label',
                    debounceTime: 200
                },
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'StartDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Avtaledato',
                Section: 0
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'NextInvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Neste fakturadato',
                Section: 0,
                Classes: 'next-invoice-highlighted'
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'EndDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Sluttdato',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'PreparationDays',
                FieldType: FieldType.NUMERIC,
                Label: 'Klargjøringsdager',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                Property: 'MaxIterations',
                FieldType: FieldType.NUMERIC,
                Label: 'Maks antall',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'NoCreditDays',
                FieldType: FieldType.CHECKBOX,
                Label: 'Ingen kredittdager',
                Section: 0,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                ReadOnly: true,
                Property: 'Customer.AvtaleGiroAmount',
                FieldType: FieldType.NUMERIC,
                Label: 'Beløpsgrense AvtaleGiro',
                Section: 0,                
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: this.entityType,
                ReadOnly: true,
                Property: 'Customer.AvtaleGiro',
                FieldType: FieldType.CHECKBOX,
                Label: 'Påmeldt AvtaleGiro',
                Section: 0,                
            }
        ];
    }
}
