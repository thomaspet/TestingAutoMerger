import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {FieldType} from '@uni-framework/ui/uniform';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {AssetsService} from '@app/services/common/assetsService';

@Component({
    selector: 'eiendeler-settings',
    templateUrl: './eiendeler-settings.html'
})
export class EiendelerSettings {
    @Input('model') accountingCompanySettings;
    @Output() changeEvent = new EventEmitter();
    showAssetsModal: {ShowRegisterAssetModalValue: boolean};
    showAssetsModalField = [
        {
            Property: 'ShowRegisterAssetModalValue',
            Label: 'Vis modal for å registrere kjøp som eiendel',
            FieldType: FieldType.CHECKBOX,
            Options: {
                slideToggle: true
            }
        }
    ];
    accountsFields = [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleProfitVatAccountID',
            Label: 'Salgskonto eiendeler, ved vinst, mvapliktig',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleProfitNoVatAccountID',
            Label: 'Salgskonto eiendeler, ved vinst, mvafritt',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleLossVatAccountID',
            Label: 'Salgskonto eiendeler, ved tap, mvapliktig',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleProfitBalancingAccountID',
            Label: 'Motkonto balanseverdi solgte eiendeler, vinst',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleLossNoVatAccountID',
            Label: 'Salgskonto eiendeler, ved tap, mvafritt',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleLossBalancingAccountID',
            Label: 'Motkonto balanseverdi solgte eiendeler, tap',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                valueProperty: 'ID'
            }
        }
    ];

    productField = [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'AssetSaleProductID',
            Label: 'Produkt',
            FieldType: FieldType.UNI_SEARCH,
            Options: {
                uniSearchConfig: this.uniSearchAccountConfig.generateProductsConfig(),
                valueProperty: 'ID'
            }
        },
    ];

    constructor(private uniSearchAccountConfig: UniSearchAccountConfig, private assetsService: AssetsService) {
    }
    ngOnInit() {
        this.assetsService.getUseAsset().subscribe(useAsset => {
            this.showAssetsModal = {
                ShowRegisterAssetModalValue: useAsset
            };
        });
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes.ShowRegisterAssetModalValue) {
            this.saveShowAssetsModal(changes.ShowRegisterAssetModalValue.currentValue);
        } else {
            this.changeEvent.emit(changes);
        }
    }

    private saveShowAssetsModal(value: boolean) {
        this.assetsService.setUseAsset(value).subscribe(x => {
            // do nothing
        });
    }
}
