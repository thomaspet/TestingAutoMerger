import { BizHttp } from "@uni-framework/core/http/BizHttp";
import { AccountManatoryDimension, CustomerInvoiceItem } from "@uni-entities";
import { UniHttp } from "@uni-framework/core/http/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AccountManatoryDimensionService extends BizHttp<AccountManatoryDimension> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AccountManatoryDimension.RelativeUrl;
        this.entityType = AccountManatoryDimension.EntityType;
    }

    public getMandatoryDimensionsReports(items: CustomerInvoiceItem[]): Observable<any> {
        let params = [];
        items.forEach(item => {
            const ad = new AccountDimension();
            ad.AccountID = item.AccountID;
            ad.DimensionsID = item.DimensionsID;
            params.push(ad /*{
                AccountID: item.AccountID, 
                DimensionsID: item.DimensionsID
                }*/);
        });
        const paramsStr = JSON.stringify(params);
        return super.GetAction(null, `get-manatory-dimensions-reports&items=${paramsStr}`);
    }
    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-manatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

}

export class AccountDimension {
    public AccountID: number;
    public DimensionsID: number;
}

