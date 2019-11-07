import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { AccountService } from '@app/services/accounting/accountService';
import { UniModalService } from '@uni-framework/uni-modal';
import { Observable } from 'rxjs';
import { StatusCode } from '@app/components/sales/salesHelper/salesEnums';
import { NewAccountModal } from '@app/components/accounting/NewAccountModal';

export const accountColumn = (table: AgGridWrapper, accountService: AccountService, modalService: UniModalService) => {
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
            addNewButton: {
                label: 'Opprett ny konto',
                action: text => openNewAccountModal(modalService, table.getCurrentRow(), text)
            },
        });
};

function accountSearch(accountService: AccountService, searchValue: string): Observable<any> {

    let filter = '';
    if (searchValue === '') {
        filter = `Visible eq 'true' and ( isnull(AccountID,0) eq 0 ) ` +
            `or ( ( isnull(AccountID,0) eq 0 ) ` +
            `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted} ) ` +
            `or ( Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}) ))`;
    } else {

        if (isNaN(parseInt(searchValue, 10))) {
            filter = `Visible eq 'true' and (contains(AccountName\,'${searchValue}') ` +
                `and isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0) ` +
                `or (contains(AccountName\,'${searchValue}') ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                `or (Account.AccountName eq '${searchValue}' ` +
                `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
        } else {
            filter = `Visible eq 'true' and ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') ` +
                `or contains(AccountName\,'${searchValue}')  ) ` +
                `and ( isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0 )) ` +
                `or ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') or contains(AccountName\,'${searchValue}') ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                `or (Account.AccountNumber eq '${parseInt(searchValue, 10)}' ` +
                `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
        }
    }

    return accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
}

function openNewAccountModal(modalService: UniModalService, item: any, searchCritera: string): Promise<Account> {
    return new Promise((resolve, reject) => {
        modalService.open(NewAccountModal, { data: { searchCritera: searchCritera } })
            .onClose
            .subscribe((account) => {
                if (account) {
                    resolve(account);
                }
            });
    });
}
