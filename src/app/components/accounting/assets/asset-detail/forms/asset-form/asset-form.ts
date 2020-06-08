import {Component, Input, SimpleChanges} from '@angular/core';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {FieldType} from '@uni-framework/ui/uniform';
import {Account, Asset} from '@uni-entities';
import {AssetDetailFormConfigBuilder} from '@app/components/accounting/assets/asset-detail/asset-detail-form-config-builder';

@Component({
    selector: 'asset-form',
    templateUrl: './asset-form.html'
})
export class AssetFormComponent {
    @Input() asset: Asset;
    @Input() supplierInvoiceID: number;
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
                Property: 'Name',
                Label: 'Navn',
                FieldType: FieldType.TEXT,
            },
            {
                Property: 'ID',
                Label: 'Nr.',
                FieldType: FieldType.TEXT,
                ReadOnly: true
            },
            {
                Property: 'PurchaseDate',
                Label: 'Kjøpt dato',
                FieldType: FieldType.LOCAL_DATE_PICKER,
            },
            {
                Property: 'PurchaseAmount',
                Label: 'Kjøpt pris',
                FieldType: FieldType.NUMERIC,
                ReadOnly: this.asset.ID || this.supplierInvoiceID,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'BalanceAccountID',
                Label: 'Balansekonto',
                FieldType: FieldType.AUTOCOMPLETE,
                Tooltip: { Text: 'Her registreres balansekontoen der eiendelen er regnskapsført.' },
                Options: {
                    search: this.assetsFormService.balanceAccountSearch,
                    template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : '',
                    valueProperty: 'ID',
                    getDefaultData: (() => this.assetsFormService.getAccount(this.asset?.BalanceAccountID))
                }
            },
            {
                Property: 'AssetGroupCode',
                Label: 'Saldogruppe',
                FieldType: FieldType.AUTOCOMPLETE,
                Tooltip: { Text:    'Feltet er til bruk for skattemessig avskrivning.' +
                                    ' Denne er forhåndsvalgt ut fra hvilken balansekonto som er i bruk, men kan overstyres.'
                },
                Options: {
                    search: this.assetsFormService.assetGroupSearch,
                    template: (assetGroup: any) => assetGroup ? `${assetGroup.Name }` : '',
                    valueProperty: 'Code',
                    getDefaultData: () => this.assetsFormService.getAssetGroupByCode(this.asset.AssetGroupCode)
                }
            },
        ];
    }
}
