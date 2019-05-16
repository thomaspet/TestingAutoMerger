import { BizHttp } from "@uni-framework/core/http/BizHttp";
import { AccountManatoryDimension, CustomerInvoiceItem, Dimensions } from "@uni-entities";
import { UniHttp } from "@uni-framework/core/http/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RequestMethod } from "@angular/http";

@Injectable()
export class AccountManatoryDimensionService extends BizHttp<AccountManatoryDimension> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AccountManatoryDimension.RelativeUrl;
        this.entityType = AccountManatoryDimension.EntityType;
    }

    public getMandatoryDimensionsReports(items: CustomerInvoiceItem[]): Observable<any> {
        let params: AccountDimension[] = [];
        items.forEach(item => {
            const ad = new AccountDimension();
            ad.AccountID = item.AccountID;
            ad.DimensionsID = item.DimensionsID;
            params.push(ad);
        });
        return super.ActionWithBody(null, params, `get-manatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportByDimension(accountID: number, dimensions: Dimensions): Observable<any> {
        return super.ActionWithBody(null, dimensions, `get-manatory-dimensions-report-by-dimensions&accountID=${accountID}`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-manatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

}

//Flytte til?
export class AccountDimension {
    public AccountID: number;
    public DimensionsID: number;
}

