import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import { SalaryTransaction, SalaryTransactionSupplement, Valuetype } from '@uni-entities';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';

@Component({
    selector: 'salary-trans-supplements-modal',
    templateUrl: './salary-transaction-supplement-modal.component.html'
})

export class SalaryTransSupplementModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public salaryTransaction$: BehaviorSubject<SalaryTransaction> = new BehaviorSubject(new SalaryTransaction());
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    constructor() { }

    public ngOnInit() {
        this.salaryTransaction$.next(this.options.data);
        this.load();
    }

    public close(emitValue?: boolean) {
        this.salaryTransaction$
            .asObservable()
            .take(1)
            .map(trans => emitValue ? trans : null)
            .subscribe(trans => this.onClose.next(trans));
    }

    private load() {
        let fields: UniFieldLayout[] = [];
        const supplements = this.salaryTransaction$.getValue().Supplements;
        if (!supplements) { return; }
        supplements
            .forEach((supplement: SalaryTransactionSupplement, index) => {
                if (supplement.Deleted) {
                    return;
                }
                if (!supplement.WageTypeSupplement && this.salaryTransaction$.getValue().Wagetype) {
                    supplement.WageTypeSupplement = this.salaryTransaction$.getValue()
                        .Wagetype
                        .SupplementaryInformations
                        .find(x => x.ID === supplement.WageTypeSupplementID);
                }
                if (!supplement.WageTypeSupplement || supplement.WageTypeSupplement.GetValueFromTrans) {
                    return;
                }
                switch (supplement.WageTypeSupplement.ValueType) {
                    case Valuetype.IsBool:
                        fields.push(this.createCheckBox(supplement, index));
                        break;
                    case Valuetype.IsDate:
                        fields.push(this.createDatePicker(supplement, index));
                        break;
                    case Valuetype.IsMoney:
                        fields.push(this.createNumberField(supplement, index));
                        break;
                    case Valuetype.IsString:
                        fields.push(this.createTexField(supplement, index));
                        break;
                    case Valuetype.Period:
                        fields = [...fields, ...this.createFromToDatePicker(supplement, index)];
                        break;
                }
            });
        this.fields$.next(fields);
    }

    private createCheckBox(supplement: SalaryTransactionSupplement, index: number): UniFieldLayout {
        if (!supplement.ValueBool) {
            if (supplement.WageTypeSupplement.SuggestedValue === 'true'
                || supplement.WageTypeSupplement.SuggestedValue === 'false') {
                supplement.ValueBool = supplement.WageTypeSupplement.SuggestedValue === 'true' ? true : false;
            }
        }
        return this.getNewField(supplement, FieldType.CHECKBOX, `Supplements[${index}].ValueBool`);
    }

    private createDatePicker(supplement: SalaryTransactionSupplement, index: number): UniFieldLayout {
        return this.getNewField(supplement, FieldType.LOCAL_DATE_PICKER, `Supplements[${index}].ValueDate`);
    }

    private createFromToDatePicker(supplement: SalaryTransactionSupplement, index: number): UniFieldLayout[] {
        return [
            this.getNewField(
                supplement, FieldType.LOCAL_DATE_PICKER, `Supplements[${index}].ValueDate`, `${supplement.WageTypeSupplement.Name} start`),
            this.getNewField(
                supplement, FieldType.LOCAL_DATE_PICKER, `Supplements[${index}].ValueDate2`, `${supplement.WageTypeSupplement.Name} slutt`)
        ];
    }

    private createNumberField(supplement: SalaryTransactionSupplement, index: number): UniFieldLayout {
        if (!supplement.ValueMoney && !isNaN(+supplement.WageTypeSupplement.SuggestedValue)) {
            supplement.ValueMoney = +supplement.WageTypeSupplement.SuggestedValue;
        }
        return this.getNewField(supplement, FieldType.NUMERIC, `Supplements[${index}].ValueMoney`);
    }

    private createTexField(supplement: SalaryTransactionSupplement, index: number): UniFieldLayout {
        if (!supplement.ValueString) {
            supplement.ValueString = supplement.WageTypeSupplement.SuggestedValue;
        }
        return this.getNewField(supplement, FieldType.TEXT, `Supplements[${index}].ValueString`);
    }

    private getNewField(
        supplement: SalaryTransactionSupplement,
        type: FieldType,
        property: string,
        name: string = supplement.WageTypeSupplement.Name
    ): UniFieldLayout {
        return <UniFieldLayout>{
            EntityType: 'SalaryTransactionSupplement',
            Label: name,
            FieldType: type,
            Property: property,
            LineBreak: true,
            ReadOnly: this.options.modalConfig?.readOnly,
        };
    }
}
