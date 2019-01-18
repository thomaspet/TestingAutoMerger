import { Observable } from 'rxjs/Observable';
import { StatusCode } from '@app/components/sales/salesHelper/salesEnums';
import { NewAccountModal } from '@app/components/accounting/NewAccountModal';
import { IGroupConfig } from '@uni-framework/ui/unitable/controls';

export function accountSearch(searchValue: string): Observable<any> {

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

    return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
}

export function openNewAccountModal(item: any, searchCritera: string): Promise<Account> {
    return new Promise((resolve, reject) => {
        this.modalService.open(NewAccountModal, { data: { searchCritera: searchCritera } })
            .onClose
            .subscribe((account) => {
                if (account) {
                    resolve(account);
                }
            });
    });
}


export const vatTypeGroupConfig: IGroupConfig = {
    groupKey: 'VatCodeGroupingValue',
    visibleValueKey: 'Visible',
    groups: [
        {
            key: 1,
            header: 'Kjøp/kostnader.'
        },
        {
            key: 2,
            header: 'Kjøp/Importfaktura'
        },
        {
            key: 3,
            header: 'Import/Mva-beregning'
        },
        {
            key: 4,
            header: 'Salg/inntekter'
        }
        ,
        {
            key: 5,
            header: 'Salg uten mva.'
        }
        ,
        {
            key: 6,
            header: 'Kjøpskoder, spesielle'
        }
        ,
        {
            key: 7,
            header: 'Egendefinerte koder'
        }

    ]
};
