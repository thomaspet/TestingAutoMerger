import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Project, Seller, CompanySettings, CurrencyCode } from '@uni-entities';
import { FieldType } from '@uni-framework/ui/uniform';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'tof-currency-form',
    template: `
		<uni-form
            [config]="currencyFormConfig$"
            [fields]="currencyFormFields$"
            [model]="model$"
            (changeEvent)="onFormChange()">
    	</uni-form>
	`
})
export class TofCurrencyForm implements OnInit, OnChanges {
    @Input() public readonly: boolean;
    @Input() public entityType: string;
    @Input() public entity: any;
    @Input() public currencyCodes: Array<CurrencyCode>;
    @Input() public companySettings: CompanySettings;
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    private model$: BehaviorSubject<any> = new BehaviorSubject({});
    public currencyFormConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public currencyFormFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public ngOnInit() {
        this.getFormLayout();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.model$.next(this.entity);

        if (changes['currencyCodes'] && this.currencyCodes && this.entity) {
            this.getFormLayout();
        }
    }

    private getFormLayout() {
        let fields: any[] = [
            {
                Legend: 'Valuta',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'CurrencyCodeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Valuta',
                Options: {
                    source: this.currencyCodes,
                    valueProperty: 'ID',
                    displayProperty: 'Code',
                    debounceTime: 200
                },
                ReadOnly: this.readonly
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'UpdateCurrencyAmountsOnDateChange',
                FieldType: FieldType.CHECKBOX,
                Label: 'Endre valuta ved ny dato',
            }
        ];

        if (this.entityType === 'CustomerQuote') {
            fields = fields.concat([
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'UpdateCurrencyOnToOrder',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Endre valuta ved overføring til ordre',
                }
            ]);
        }

        if (this.entityType === 'CustomerQuote' || this.entityType === 'CustomerOrder') {
            fields = fields.concat([
                {
                    FieldSet: 1,
                    FieldSetColumn: 1,
                    EntityType: this.entityType,
                    Property: 'UpdateCurrencyOnToInvoice',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Endre valuta ved overføring til faktura',
                }
            ]);
        }

        this.currencyFormFields$.next(fields);
    }

    public onFormChange() {
        const model = this.model$.getValue();
        this.entityChange.emit(model);
    }

}
