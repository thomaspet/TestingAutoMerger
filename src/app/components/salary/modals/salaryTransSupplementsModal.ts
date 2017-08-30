import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../../framework/uniModal/barrel';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {SalaryTransaction, SalaryTransactionSupplement, Valuetype} from '../../../unientities';

@Component({
    selector: 'salary-trans-supplements-modal',
    templateUrl: './salaryTransSupplementsModal.html'
})

export class SalaryTransSupplementsModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private salaryTransaction$: BehaviorSubject<SalaryTransaction> = new BehaviorSubject(new SalaryTransaction());
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
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
        if (this.salaryTransaction$.getValue().Supplements) {
            this.salaryTransaction$.getValue().Supplements
                .forEach((supplement: SalaryTransactionSupplement, index) => {
                    if (!supplement.WageTypeSupplement && this.salaryTransaction$.getValue().Wagetype) {
                        supplement.WageTypeSupplement = this.salaryTransaction$.getValue()
                            .Wagetype
                            .SupplementaryInformations
                            .find(x => x.ID === supplement.WageTypeSupplementID);
                    }


                    if (supplement.WageTypeSupplement) {
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
                        }
                    }
            });
        }
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
        if (!supplement.ValueDate) {
            supplement.ValueDate = new Date(supplement.WageTypeSupplement.SuggestedValue);
        }
        return this.getNewField(supplement, FieldType.LOCAL_DATE_PICKER, `Supplements[${index}].ValueDate`);
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

    private getNewField(supplement: SalaryTransactionSupplement, type: FieldType, property: string): UniFieldLayout {
        let config = this.options.modalConfig;
        let field: UniFieldLayout = new UniFieldLayout();
        field.EntityType = 'SalaryTransactionSupplement';
        field.Label = supplement.WageTypeSupplement.Name;
        field.FieldType = type;
        field.Property = property;
        field.LineBreak = true;
        field.ReadOnly = config && config.readOnly;
        return field;
    }
}
