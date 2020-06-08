import {Component, Input, SimpleChanges} from '@angular/core';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {FieldType} from '@uni-framework/ui/uniform';
import {AssetDetailFormConfigBuilder} from '@app/components/accounting/assets/asset-detail/asset-detail-form-config-builder';
import {Asset} from '@uni-entities';

@Component({
    selector: 'tax-depreciation-form',
    templateUrl: './tax-depreciation-form.html'
})
export class TaxDepreciationFormComponent {
    @Input() asset: Asset;
    fieldsConfig = [];

    constructor(
        private assetsFormService: AssetDetailFormConfigBuilder,
        private actions: AssetsActions
    ) {
    }

    ngOnChanges() {
        if (this.asset) {
            this.fieldsConfig = this.buildFieldsConfig();
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        this.actions.markAssetAsDirty();
        this.actions.updateCurrentAssetFromChanges(changes);
    }

    buildFieldsConfig() {
        return [
            {
                Property: '_DepreciationStartYear',
                Label: 'Med i skatteregnskapet fra og med år',
                FieldType: FieldType.TEXT,
                ReadOnly: true
            },
            {
                Property: '_TaxDepreciationRate',
                Label: 'Skattemessing avskrivningssats',
                FieldType: FieldType.NUMERIC,
                ReadOnly: true,
                Options: {
                    decimalLength: 0
                }
            }
        ];
    }
}
