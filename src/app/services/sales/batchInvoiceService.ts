import { Injectable } from "@angular/core";
import { BizHttp, UniHttp } from "@uni-framework/core/http";
import { BatchInvoice } from "@uni-entities";
import { Observable } from "rxjs";

@Injectable()
export class BatchInvoiceService extends BizHttp<BatchInvoice> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BatchInvoice.RelativeUrl;
        this.entityType = BatchInvoice.EntityType;
    }

    public invoiceAction(id: number): Observable<any> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=invoice`)
            .send()
            .map(response => response.body);
    }
    
}