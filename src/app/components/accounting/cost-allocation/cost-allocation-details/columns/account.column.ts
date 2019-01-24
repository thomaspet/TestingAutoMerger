import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import {
    accountSearch,
    openNewAccountModal
} from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-items-table.helpers';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { AccountService } from '@app/services/accounting/accountService';
import { UniModalService } from '@uni-framework/uni-modal';

export default (table: AgGridWrapper, accountService: AccountService, modalService: UniModalService) => {
    return new UniTableColumn('Account', 'Konto', UniTableColumnType.Lookup)
        .setDisplayField('Account.AccountNumber')
        .setTemplate((rowModel) => {
            if (rowModel.Account) {
                const account = rowModel.Account;
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
                return accountSearch(accountService, searchValue);
            },
            addNewButtonVisible: true,
            addNewButtonText: 'Opprett ny konto',
            addNewButtonCallback: (text) => {
                return openNewAccountModal(modalService, table.getCurrentRow(), text);
            }
        });
};
