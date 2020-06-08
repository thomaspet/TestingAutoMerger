import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {Router} from '@angular/router';

export const assetsColumns = (router: Router) => [
    new UniTableColumn('JournalEntryNumber', 'Bilagsnummer', UniTableColumnType.Link, false)
        .setLinkClick(rowModel => router.navigateByUrl(`/accounting/transquery?JournalEntryNumber=${rowModel?.JournalEntryNumber.split('-')[0]}&AccountYear=${rowModel?.JournalEntryNumber.split('-')[1]}`)),
    new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate, false),
    new UniTableColumn('AccountNumber', 'Konto', UniTableColumnType.Text, false)
        .setTemplate(rowModel => `${rowModel?.Account_AccountNumber} - ${rowModel?.Account_AccountName}`),
    new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, false),
    new UniTableColumn('AmountCurrency', 'Sum', UniTableColumnType.Money, false)
        .setIsSumColumn(true)
        .setConditionalCls((rowModel) => {
            if (rowModel?.AssetJELine?.AmountCurrency < 0)  {
                return 'bad';
            }
        })
];

export const historyTableConfig = (router: Router) => new UniTableConfig('accounting.assets.list', false, true, 15)
    .setSortable(true)
    .setVirtualScroll(true)
    .setSearchable(false)
    .setColumnMenuVisible(true)
    .setColumns(assetsColumns(router));
