import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Account, VatType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/StatisticsService';

@Injectable()
export class AccountService extends BizHttp<Account> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        //TODO: should resolve this from configuration based on type (IAccount)? Frank is working on something..
        this.relativeURL = Account.RelativeUrl;

        this.entityType = Account.EntityType;

        //set this property if you want a default sort order from the API, e.g. AccountNumber
        this.DefaultOrderBy = 'AccountNumber';
    }

    public searchAccounts(filter: string, top: number = 500) {
        filter = (filter ? filter + ' and ' : '') + `Account.Deleted eq 'false' and isnull(VatType.Deleted,'false') eq 'false'`;

        return this.statisticsService.GetAll(`model=Account&top=${top}&filter=${filter} &orderby=AccountNumber&expand=VatType&select=Account.ID as AccountID,Account.AccountNumber as AccountAccountNumber,Account.AccountName as AccountAccountName,VatType.ID as VatTypeID,VatType.VatCode as VatTypeVatCode,VatType.Name as VatTypeName,VatType.VatPercent as VatTypeVatPercent,VatType.ReversedTaxDutyVat as VatTypeReversedTaxDutyVat,VatType.IncomingAccountID as VatTypeIncomingAccountID,VatType.OutgoingAccountID as VatTypeOutgoingAccountID,Account.CustomerID as AccountCustomerID,Account.SupplierID as AccountSupplierID,Account.UseDeductivePercent as AccountUseDeductivePercent`)
            .map(x => x.Data ? x.Data : [])
            .map(x => this.mapStatisticsToAccountObjects(x));
    }

    private mapStatisticsToAccountObjects(statisticsData: any[]): Account[] {

        let accounts = [];

        statisticsData.forEach(data => {
            let account: Account = new Account();
            account.ID = data.AccountID;
            account.AccountNumber = data.AccountAccountNumber;
            account.AccountName = data.AccountAccountName;
            account.VatTypeID = data.VatTypeID;
            account.CustomerID = data.AccountCustomerID;
            account.SupplierID = data.AccountSupplierID;
            account.UseDeductivePercent = data.AccountUseDeductivePercent;

            if (data.VatTypeID) {
                account.VatType = new VatType();
                account.VatType.ID = data.VatTypeID;
                account.VatType.VatCode = data.VatTypeVatCode;
                account.VatType.Name = data.VatTypeName;
                account.VatType.VatPercent = data.VatTypeVatPercent;
                account.VatType.ReversedTaxDutyVat = data.VatTypeReversedTaxDutyVat;
                account.VatType.IncomingAccountID = data.VatTypeIncomingAccountID;
                account.VatType.OutgoingAccountID = data.VatTypeOutgoingAccountID;
            }

            accounts.push(account);
        });

        return accounts;
    }

    /*
     //if you need something special that is not supported by the base class, implement your own
     //method - either using the Get/Post/Put/Remove methods in the base class or by using the
     //base class' http-service directly
     public GetSpecialStuff(specialfilter: string) : Observable<any> {
     return this.http.asGET()....send();
     }

     //if you need something special in get/getall/post/put the default implementation can be overridden
     //you can also use the base class' methods in overridden methods, e.g. GetAll(..) in the example below
     public GetAll(query: string) : Observable<any> {

     if (query === null) {
     query = "filter=AccountNumber eq 1234";
     }

     return super.GetAll(query);
     }*/

}
