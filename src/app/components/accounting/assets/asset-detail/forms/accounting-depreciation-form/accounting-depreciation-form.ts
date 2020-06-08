import {Component, Input, SimpleChanges} from '@angular/core';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {FieldType} from '@uni-framework/ui/uniform';
import {AssetDetailFormConfigBuilder} from '@app/components/accounting/assets/asset-detail/asset-detail-form-config-builder';
import {Asset} from '@uni-entities';

@Component({
    selector: 'accounting-depreciation-form',
    templateUrl: './accounting-depreciation-form.html'
})
export class AccountingDepreciationFormComponent {
    @Input() asset: Asset;
    fieldsConfig = [];
    checkboxConfig = []
    constructor(
        private assetsFormService: AssetDetailFormConfigBuilder,
        private actions: AssetsActions
    ) {
    }

    ngOnChanges() {
        if (this.asset) {
            this.fieldsConfig = this.buildFieldsConfig();
            this.checkboxConfig = this.buildCheckBoxConfig();
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        this.actions.markAssetAsDirty();
        this.actions.updateCurrentAssetFromChanges(changes);
        this.fieldsConfig = this.buildFieldsConfig();
        this.checkboxConfig = this.buildCheckBoxConfig();
    }

    buildCheckBoxConfig() {
        return [
            {
                Property: 'AutoDepreciation',
                Label: 'La systemet bokføre avskrivningen automatisk i regnskapet',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: this.asset?.AssetGroupCode === 'X',
                Options: {
                    slideToggle: true
                }
            },
        ];
    }

    buildFieldsConfig() {
        return [
            {
                Property: 'DepreciationStartDate',
                Label: 'Avskrives fra og med',
                FieldType: FieldType.MONTH_PICKER,
                ReadOnly: this.asset.AssetGroupCode === 'X'
            },
            {
                Property: 'Lifetime',
                Label: 'Levetid fra første avskrivning (måneder)',
                FieldType: FieldType.NUMERIC,
                Options: {
                    decimalLength: 0
                }
            },
            {
                Property: '_MonthlyDepreciationAmount',
                Label: 'Månedlig avskrivning',
                FieldType: FieldType.NUMERIC,
                ReadOnly: true,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: '_DepreciationEndDate',
                Label: 'Ferdig avskrevet',
                FieldType: FieldType.MONTH_PICKER,
                ReadOnly: true
            }
        ];
    }
}
