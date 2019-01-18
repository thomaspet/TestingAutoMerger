import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import {
    accountSearch,
    openNewAccountModal, vatTypeGroupConfig
} from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-items-table.helpers';
import { from } from 'rxjs/observable/from';
import { map } from 'rxjs/operator/map';

const accountColumn = new UniTableColumn('Account', 'Konto', UniTableColumnType.Lookup)
    .setDisplayField('Account.AccountNumber')
    .setTemplate((rowModel) => {
        if (rowModel.DebitAccount) {
            const account = rowModel.DebitAccount;
            return account.AccountNumber
                + ': '
                + account.AccountName;
        }
        return '';
    })
    .setWidth('10%')
    .setOptions({
        itemTemplate: (selectedItem) => {
            return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
        },
        lookupFunction: (searchValue) => {
            return accountSearch(searchValue);
        },
        addNewButtonVisible: true,
        addNewButtonText: 'Opprett ny konto',
        addNewButtonCallback: (text) => {
            return openNewAccountModal(this.table.getCurrentRow(), text);
        }
    });
const vatTypeColumn = new UniTableColumn('VatType', 'MVA', UniTableColumnType.Lookup)
    .setDisplayField('VatType.VatCode')
    .setWidth('8%')
    .setSkipOnEnterKeyNavigation(true)
    .setTemplate((rowModel) => {
        if (rowModel.DebitVatType) {
            const vatType = rowModel.DebitVatType;
            return `${vatType.VatCode}: ${vatType.VatPercent}%`;
        }
        return '';
    })
    .setOptions({
        itemTemplate: (item) => {
            return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
        },
        lookupFunction: (searchValue) => {
            // this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
            const vatTypes = []
            return from([]).pipe(
                map(result => this.vattypes.filter(
                    (vattype) => vattype.VatCode === searchValue
                    || vattype.VatPercent === searchValue
                    || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
                    || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%`
                    || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`
                ))
            );
        },
        groupConfig: vatTypeGroupConfig
    })
    // this.companySettingsService.Get(1),
    .setEditable(x => this.companySettings.TaxMandatoryType === 3);
const columns = [
    accountColumn
];

const tableConfig = new UniTableConfig('accounting.costallocation.items', true, true, 20)
    .setSearchable(false)
    .setEditable(true)
    .setColumns(columns)
    .setColumnMenuVisible(true, false);
/*tableConfig.defaultRowData = (() => {
    const value = new EventSubscriber();
    value.Active = true;
    return value;
})();*/

export default tableConfig;
