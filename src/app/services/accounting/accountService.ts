import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Account, VatType, AccountGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/statisticsService';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {StatusCode} from '@app/components/sales/salesHelper/salesEnums';

@Injectable()
export class AccountService extends BizHttp<Account> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = Account.RelativeUrl;
        this.entityType = Account.EntityType;
        this.DefaultOrderBy = 'AccountNumber';
    }

    public searchPublicAccounts(searchValue) {
        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and ( isnull(AccountID,0) eq 0 ) ` +
                `or ( ( isnull(AccountID,0) eq 0 ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted} ) ` +
                `or ( Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}) ))`;
        } else {
            filter = `( contains(keywords,'${searchValue}') ) or `;
            if (isNaN(parseInt(searchValue, 10))) {
                filter += `Visible eq 'true' and (contains(AccountName\,'${searchValue}') ` +
                    `and isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0) ` +
                    `or (contains(AccountName\,'${searchValue}') ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountName eq '${searchValue}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            } else {
                filter += `Visible eq 'true' and ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') ` +
                    `or contains(AccountName\,'${searchValue}')  ) ` +
                    `and ( isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0 )) ` +
                    `or ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') or contains(AccountName\,'${searchValue}') ) ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountNumber eq '${parseInt(searchValue, 10)}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            }
        }
        return this.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    public searchAccounts(filter: string, top: number = 500, orderby = 'AccountNumber') {
        return this.statisticsService.GetAll(`model=Account` +
            `&top=${top}` +
            `&filter=${filter}` +
            `&orderby=${orderby}` +
            `&expand=TopLevelAccountGroup` +
            `&join=Account.Customerid eq Customer.ID and Account.supplierid eq Supplier.id` +
            `&select=Account.ID as AccountID,Account.AccountID as MainAccountID,Account.AccountNumber as AccountAccountNumber,` +
            `Account.AccountName as AccountAccountName,Account.UsePostPost as AccountUsePostPost,Account.Locked as AccountLocked,` +
            `Account.LockManualPosts as AccountLockManualPosts,VatTypeID as VatTypeID,TopLevelAccountGroup.GroupNumber,` +
            `Account.CustomerID as AccountCustomerID,Account.SupplierID as AccountSupplierID,` +
            `Account.UseVatDeductionGroupID as AccountUseVatDeductionGroupID,Supplier.StatusCode as SupplierStatusCode,` +
            `Customer.StatusCode as CustomerStatusCode,Keywords as AccountKeywords,Description as AccountDescription`)
        .pipe(
                map(x => x.Data ? x.Data : []),
                map(x => this.mapStatisticsToAccountObjects(x))
        );
    }
    public getSaftMappingAccounts(): Observable<any> {
        return this.http.asGET()
            .withEndPoint(this.relativeURL + '?action=saftmapping-accounts')
            .send()
            .map(res => res.body);
    }

    public setSaftMappings(accountNumbers: number[] = null) {
        return this.http.asPUT()
            .withEndPoint(this.relativeURL + '?action=set-saftmappings')
            .withBody(accountNumbers)
            .send()
            ;
    }

    private mapStatisticsToAccountObjects(statisticsData: any[]): Account[] {
        const accounts = [];

        statisticsData.forEach(data => {
            const account: Account = new Account();
            account.ID = data.AccountID;
            account.AccountNumber = data.AccountAccountNumber;
            account.AccountName = data.AccountAccountName;
            account.AccountID = data.MainAccountID;
            account.VatTypeID = data.VatTypeID;
            account.CustomerID = data.AccountCustomerID;
            account.SupplierID = data.AccountSupplierID;
            account.UseVatDeductionGroupID = data.AccountUseVatDeductionGroupID;
            account.UsePostPost = data.AccountUsePostPost;
            account.Locked = data.AccountLocked;
            account.LockManualPosts = data.AccountLockManualPosts;
            account.StatusCode = data.SupplierStatusCode || data.CustomerStatusCode;

            account['Keywords'] = data.AccountKeywords;
            account['Description'] = data.AccountDescription;

            if (data.TopLevelAccountGroupGroupNumber) {
                account.TopLevelAccountGroup = new AccountGroup();
                account.TopLevelAccountGroup.GroupNumber = data.TopLevelAccountGroupGroupNumber;
            }

            accounts.push(account);
        });

        return accounts;
    }

    public addMandatoryDimensions(data: any) {
        const urldata = [
            'FromAccountNo=' + data.FromAccountNo,
            'ToAccountNo=' + data.ToAccountNo,
            'DimensionNo=' + data.DimensionNo,
            'MandatoryType=' + data.MandatoryType,
        ];
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('accountmandatorydimension?action=add-accounts-mandatory-dimensions&' + urldata.join('&'))
            .send().pipe(map(res => res.body));
    }

    public checkLinkedBankAccountsAndPostPost(FromAccountNumber: any, ToAccountNumber?: any) {
        if (!ToAccountNumber) {
            ToAccountNumber = FromAccountNumber;
        }
        return this.statisticsService.GetAll(
                `model=Account`
                + `&select=account.*,bankaccount.ID,bankaccount.AccountNumber`
                + `&filter=Accountnumber ge ${FromAccountNumber} and  Accountnumber le ${ToAccountNumber} and bankaccount.ID gt 0`
                + `&join=Account.id eq Bankaccount.accountid`).pipe(
                    map(data => {
                        let usePostPost = false;
                        data.Data.forEach(item => {
                            if (item.UsePostPost === true) {
                                usePostPost = true;
                            }
                        });
                        return (usePostPost || data.Data.length > 0);
                    })
        );
    }
}
