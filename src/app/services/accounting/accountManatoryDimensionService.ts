import { BizHttp } from "@uni-framework/core/http/BizHttp";
import { AccountManatoryDimension, CustomerInvoiceItem } from "@uni-entities";
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
        //let params = [];
        let expandsAd: AccountDimension[] = [];
        items.forEach(item => {
            const ad = new AccountDimension();
            ad.AccountID = item.AccountID;
            ad.DimensionsID = item.DimensionsID;
            //params.push(ad);///*{*/item.AccountID, item.DimensionsID/*}*/); //ad);//item.AccountID);//
            expandsAd.push(ad);
        });
        //const paramsStr = JSON.stringify(params);
        return super.ActionWithBody(null, expandsAd, `get-manatory-dimensions-reports`, RequestMethod.Post);
    }

    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-manatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

}

export class AccountDimension {
    public AccountID: number;
    public DimensionsID: number;
}

