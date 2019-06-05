
import { BizHttp } from "@uni-framework/core/http/BizHttp";
import { AccountManatoryDimension, CustomerInvoiceItem, Dimensions, Account, SalaryTransaction } from "@uni-entities";
import { UniHttp } from "@uni-framework/core/http/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RequestMethod } from "@angular/http";
import {StatisticsService} from '../common/statisticsService';
import { StatisticsResponse } from "@app/models/StatisticsResponse";
import { errorHandler } from "@angular/platform-browser/src/browser";


@Injectable()
export class AccountManatoryDimensionService extends BizHttp<AccountManatoryDimension> {

    constructor(
        http: UniHttp,
        private statisticsService: StatisticsService
    ) {
        super(http);
        this.relativeURL = AccountManatoryDimension.RelativeUrl;
        this.entityType = AccountManatoryDimension.EntityType;
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
        return super.ActionWithBody(null, params, `get-manatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportsForPayroll(salaryTransactions: SalaryTransaction[]): Observable<any> {
        let params: AccountDimension[] = [];
        //TODO dette virker ikke som forventet, kun 1 rad per Account, selv om dim er ulike
        //const uniqueADs = Array.from(new Set(salaryTransactions.map((item: any) => item)));
        /*const uniqueADs = Array.from(new Set(salaryTransactions.map(x => x.Account)))
            .map(Account => {
                return {
                    Account: Account,
                    DimensionsID: salaryTransactions.find(x => x.Account === Account).DimensionsID,
                    Dimensions: salaryTransactions.find(x => x.Account === Account).Dimensions
                }
            });*/
        /*const uniqueADs = Array.from(new Set(salaryTransactions
            .map((trans: SalaryTransaction) => {
                return {
                    AccountNumber: Account,
                    DimensionsID: trans.DimensionsID,
                    Dimensions: trans.Dimensions
                }
            })));
        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }*/
        //const uniqueADsFiltered = uniqueADs./*map((item: any) => {item.AccountNumber, item.DimensionsID}).*/filter(unique);

        salaryTransactions
        //uniqueADs
        .forEach(item => {
            const ad = new AccountDimension();
            ad.AccountNumber = item.Account;
            //ad.AccountNumber = item.AccountNumber;
            if (item.DimensionsID && item.DimensionsID > 0) {
                ad.DimensionsID = item.DimensionsID;
            } else {
                ad.Dimensions = item.Dimensions;
            }
            if (!params.find(x => x.AccountNumber === ad.AccountNumber && x.DimensionsID === ad.DimensionsID && x.Dimensions === ad.Dimensions)) {
                params.push(ad);
            }
        });
        //const uparams = Array.from(new Set(params.map((item: any) => item)));
          
        //const uniqueParams = params.map((item: AccountDimension) => {item.AccountNumber, item.DimensionsID}).filter(unique);
        return super.ActionWithBody(null, params, `get-manatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportByDimension(accountID: number, dimensions: Dimensions): Observable<any> {
        return super.ActionWithBody(null, dimensions, `get-manatory-dimensions-report-by-dimensions&accountID=${accountID}`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-manatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

    public GetNumberOfAccountsWithManatoryDimensions (): Observable<any> {
        return this.statisticsService.GetAll('model=AccountManatoryDimension&select=count(ID)');
    }
}

//Flytte til?
export class AccountDimension {
    public AccountID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


