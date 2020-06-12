import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {AssetStatusCode, LocalDate} from '@uni-entities';
import * as moment from 'moment';
import {Router} from '@angular/router';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {ConfirmActions} from '@uni-framework/uni-modal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {AssetsListComponent} from '@app/components/accounting/assets/assets-list/assets-list';

export const assetsColumns = (assetsActions: AssetsActions, router: Router) => [
    new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number, false),
    new UniTableColumn('Account.AccountNumber', 'Balansekonto', UniTableColumnType.Text, false)
        .setWidth(200)
        .setTemplate(rowModel => {
            let text = '';
            if (rowModel.AccountAccountNumber) {
                text += rowModel.AccountAccountNumber;
            }
            if (rowModel?.AccountAccountName) {
                text += ' - '  + rowModel.AccountAccountName;
            }
            return text;
        }),
    new UniTableColumn('Name', 'Navn', UniTableColumnType.Link, false)
        .setLinkClick(rowModel => router.navigateByUrl(`/accounting/assets/${rowModel.ID}`)),
    new UniTableColumn('AssetGroupCode', 'Gr.', UniTableColumnType.Text, false).setWidth(40),
    new UniTableColumn('PurchaseDate', 'Kjøpt', UniTableColumnType.LocalDate, false).setWidth(100),
    new UniTableColumn('PurchaseAmount', 'Pris', UniTableColumnType.Money, false).setWidth(100),
    new UniTableColumn('Lifetime', 'Levetid (mndr.)', UniTableColumnType.Number, false).setWidth(100),
    new UniTableColumn('DepreciationStartDate', 'Avskrives fra', UniTableColumnType.Text, false).setWidth(100)
        .setConditionalCls(rowModel => {
            if (!rowModel.AutoDepreciation && rowModel.AssetGroupCode !== 'X') {
                return 'asset-depreciation-link';
            }
            return '';
        })
        .setTemplate(rowModel => {
            if (rowModel.DepreciationStartDate && rowModel.AutoDepreciation) {
                return moment(new LocalDate(rowModel.DepreciationStartDate).toString()).format('MMM, YYYY');
            } else if (rowModel.AssetGroupCode === 'X') {
                return  'Ikke avskrivbar';
            } else if (rowModel.AutoDepreciation || rowModel.StatusCode !== AssetStatusCode.Active) {
                return '';
            } else if (!rowModel.AutoDepreciation) {
                return 'Start Avskrivning';
            }
            return '';
        })
        .setOnCellClick(rowModel => {
            if (
                rowModel.AutoDepreciation
                || rowModel.AssetGroupCode === 'X'
                || rowModel.StatusCode !== AssetStatusCode.Active
                // || rowModel.DepreciationStartDate
            ) {
                return;
            }
            if (!rowModel.AutoDepreciation) {
                assetsActions.save(rowModel).subscribe(asset => assetsActions.setCurrentAsset(asset));
            }
        }),
    new UniTableColumn('NetFinancialValue', 'Regnskapverdi', UniTableColumnType.Money, false)
        .setWidth(100)
        .setTemplate(rowModel => {
            if (rowModel.DepreciationAmount > 0) {
                const currentValue = rowModel.NetFinancialValue - rowModel.DepreciationAmount;
                return currentValue > 0 ? currentValue : 0;
            }
            return rowModel.NetFinancialValue;
        }),
    new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text, false)
        .setTemplate(rowModel => {
            switch (rowModel.StatusCode) {
                case AssetStatusCode.Sold:
                    return 'Solgt';
                case AssetStatusCode.Depreciated:
                    return 'Avskrevet';
                case AssetStatusCode.Lost:
                    return 'Tapt';
                case AssetStatusCode.Active:
                    if (rowModel.AssetGroupCode === 'X') {
                        return '';
                    }
                    let lastDepreciationDate = moment(rowModel.DepreciationStartDate, 'YYYY-MM-DD')
                        .add({months: 1}).subtract({days: 1}).format('DD.MM.YYYY');
                    if (rowModel.DepreciatedTo) {
                        lastDepreciationDate = moment(rowModel.DepreciatedTo, 'YYYY-MM-DD').format('DD.MM.YYYY');
                        return rowModel.AutoDepreciation ? 'Avskrives (Sist ' + lastDepreciationDate + ')' : 'Ikke startet';
                    } else {
                        return rowModel.AutoDepreciation ? 'Avskrives (Første gang ' + lastDepreciationDate + ')' : 'Ikke startet';
                    }
                case AssetStatusCode.DepreciationFailed:
                    return 'Avskrivning feilet';
            }
        })
];
