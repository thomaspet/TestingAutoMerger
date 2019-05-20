import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Account, VatType, AccountGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/statisticsService';

@Injectable()
export class AccountService extends BizHttp<Account> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = Account.RelativeUrl;
        this.entityType = Account.EntityType;
        this.DefaultOrderBy = 'AccountNumber';
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
            `Customer.StatusCode as CustomerStatusCode`)
            .map(x => x.Data ? x.Data : [])
            .map(x => this.mapStatisticsToAccountObjects(x));
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

            if (data.TopLevelAccountGroupGroupNumber) {
                account.TopLevelAccountGroup = new AccountGroup();
                account.TopLevelAccountGroup.GroupNumber = data.TopLevelAccountGroupGroupNumber;
            }

            accounts.push(account);
        });

        return accounts;
    }

    public addManatoryDimensions(data: any) {
        const urldata = [
            'FromAccountNo=' + data.FromAccountNo,
            'ToAccountNo=' + data.ToAccountNo,
            'DimensionNo=' + data.DimensionNo,
            'ManatoryType=' + data.ManatoryType,
        ]
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('accountmanatorydimension?action=add-accounts-manatory-dimensions&' + urldata.join('&'))
            .send()
            .map(res => res.json());
    }
}
