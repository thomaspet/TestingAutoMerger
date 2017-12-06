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
        filter = (filter ? filter + ' and ' : '') + `Account.Deleted eq 'false' and isnull(VatType.Deleted,'false') eq 'false'`;
        return this.statisticsService.GetAll(`model=Account&top=${top}&filter=${filter}&orderby=${orderby}&expand=VatType,TopLevelAccountGroup&select=Account.ID as AccountID,Account.AccountID as MainAccountID,Account.AccountNumber as AccountAccountNumber,Account.AccountName as AccountAccountName,Account.UsePostPost as AccountUsePostPost,Account.Locked as AccountLocked,Account.LockManualPosts as AccountLockManualPosts,VatType.ID as VatTypeID,VatType.VatCode as VatTypeVatCode,VatType.Name as VatTypeName,TopLevelAccountGroup.GroupNumber,VatType.VatPercent as VatTypeVatPercent,VatType.ReversedTaxDutyVat as VatTypeReversedTaxDutyVat,VatType.IncomingAccountID as VatTypeIncomingAccountID,VatType.OutgoingAccountID as VatTypeOutgoingAccountID,VatType.DirectJournalEntryOnly as VatTypeDirectJournalEntryOnly,Account.CustomerID as AccountCustomerID,Account.SupplierID as AccountSupplierID,Account.UseDeductivePercent as AccountUseDeductivePercent`)
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
            account.UseDeductivePercent = data.AccountUseDeductivePercent;
            account.UsePostPost = data.AccountUsePostPost;
            account.Locked = data.AccountLocked;
            account.LockManualPosts = data.AccountLockManualPosts;

            if (data.TopLevelAccountGroupGroupNumber) {
                account.TopLevelAccountGroup = new AccountGroup();
                account.TopLevelAccountGroup.GroupNumber = data.TopLevelAccountGroupGroupNumber;
            }

            if (data.VatTypeID) {
                account.VatType = new VatType();
                account.VatType.ID = data.VatTypeID;
                account.VatType.VatCode = data.VatTypeVatCode;
                account.VatType.Name = data.VatTypeName;
                account.VatType.VatPercent = data.VatTypeVatPercent;
                account.VatType.ReversedTaxDutyVat = data.VatTypeReversedTaxDutyVat;
                account.VatType.IncomingAccountID = data.VatTypeIncomingAccountID;
                account.VatType.OutgoingAccountID = data.VatTypeOutgoingAccountID;
                account.VatType.DirectJournalEntryOnly = data.VatTypeDirectJournalEntryOnly;
            }

            accounts.push(account);
        });

        return accounts;
    }
}
