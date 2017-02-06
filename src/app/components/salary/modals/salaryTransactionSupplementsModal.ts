import { Component, ViewChild, Output, EventEmitter, Type, AfterViewInit, Input } from '@angular/core';
import { UniModal } from '../../../../framework/modals/modal';
import { SalaryTransaction, SalaryTransactionSupplement, Valuetype } from '../../../unientities';

import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'sal-trans-supplements-modal-content',
    templateUrl: 'app/components/salary/modals/salaryTransactionSupplementsModalContent.html'
})
export class SalaryTransactionSupplementsModalContent {
    @Input('config') private config: { cancel: () => void, submit: (trans: SalaryTransaction) => void };
    private _config$: BehaviorSubject<any> = new BehaviorSubject({});
    private salaryTransaction$: BehaviorSubject<SalaryTransaction> = new BehaviorSubject(new SalaryTransaction());
    private readOnly: boolean;
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor() {

    }

    public ngOnInit() {
        this._config$.next(this.config);
    }

    public open(trans: SalaryTransaction, readOnly: boolean) {
        this.salaryTransaction$.next(trans);
        this.readOnly = readOnly;
        this.load();
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
        let field: UniFieldLayout = new UniFieldLayout();
        field.EntityType = 'SalaryTransactionSupplement';
        field.Label = supplement.WageTypeSupplement.Name;
        field.FieldType = type;
        field.Property = property;
        field.LineBreak = true;
        field.ReadOnly = this.readOnly;
        return field;
    }

}

@Component({
    selector: 'sal-trans-supplements-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})

export class SalaryTransactionSupplementsModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    private modalConfig: { cancel: () => void, submit: (trans: SalaryTransaction) => void };
    @Output() public updatedSalaryTransaction: EventEmitter<SalaryTransaction> = new EventEmitter<SalaryTransaction>(true);
    public type: Type<any> = SalaryTransactionSupplementsModalContent;

    constructor() {
        this.modalConfig = {
            cancel: () => {
                this.modal.close();
            },
            submit: (trans: SalaryTransaction) => {
                this.updatedSalaryTransaction.emit(trans);
                this.modal.close();
            }
        };
    }

    public ngAfterViewInit() {
        setTimeout(() => this.modal.createContent());
    }

    public openModal(trans: SalaryTransaction, readOnly: boolean) {
        this.modal.getContent().then((content: SalaryTransactionSupplementsModalContent) => {
            content.open(trans, readOnly);
            this.modal.open();
        });
    }
}
