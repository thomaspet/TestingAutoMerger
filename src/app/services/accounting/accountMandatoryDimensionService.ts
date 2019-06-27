
import { BizHttp } from "@uni-framework/core/http/BizHttp";
import { AccountMandatoryDimension, Dimensions, SalaryTransaction } from "@uni-entities";
import { UniHttp } from "@uni-framework/core/http/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RequestMethod } from "@angular/http";
import {StatisticsService} from '../common/statisticsService';


@Injectable()
export class AccountMandatoryDimensionService extends BizHttp<AccountMandatoryDimension> {

    constructor(
        http: UniHttp,
        private statisticsService: StatisticsService
    ) {
        super(http);
        this.relativeURL = AccountMandatoryDimension.RelativeUrl;
        this.entityType = AccountMandatoryDimension.EntityType;
    }


    public getMandatoryDimensionsReports(items: any[]): Observable<any> {
        let params: AccountDimension[] = [];
        items.forEach(item => {
            const ad = new AccountDimension();
            ad.AccountID = item.AccountID;
            if (item.DimensionsID && item.DimensionsID > 0) {
                ad.DimensionsID = item.DimensionsID;
            } else {
                ad.Dimensions = item.Dimensions;
            }
            params.push(ad);
        });
        return super.ActionWithBody(null, params, `get-mandatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportsForPayroll(salaryTransactions: SalaryTransaction[]): Observable<any> {
        let params: AccountDimension[] = [];
        salaryTransactions
        .forEach(item => {
            const ad = new AccountDimension();
            ad.AccountNumber = item.Account;
            if (item.DimensionsID && item.DimensionsID > 0) {
                ad.DimensionsID = item.DimensionsID;
            } else {
                ad.Dimensions = item.Dimensions;
            }
            if (!params.find(x => x.AccountNumber === ad.AccountNumber && x.DimensionsID === ad.DimensionsID && x.Dimensions === ad.Dimensions)) {
                params.push(ad);
            }
        });
        return super.ActionWithBody(null, params, `get-mandatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportByDimension(accountID: number, dimensions: Dimensions): Observable<any> {
        return super.ActionWithBody(null, dimensions, `get-mandatory-dimensions-report-by-dimensions&accountID=${accountID}`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-mandatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

    public GetNumberOfAccountsWithMandatoryDimensions (): Observable<number> {
        return this.statisticsService.GetAll('model=AccountMandatoryDimension&select=count(ID)')
            .map(res => {
                const count = res && res.Data && res.Data[0] && res.Data[0].countID;
                return count || 0;
            });
    }

    public checkRecurringInvoices(accountID: number) : Observable<any> {
        return super.GetAction(null, `check-recurringinvoices&accountID=${accountID}`);
    }
}

//Flytte til?
export class AccountDimension {
    public AccountID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


