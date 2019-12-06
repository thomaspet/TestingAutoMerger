import {Injectable} from '@angular/core';
import {BizHttp, UniHttp, RequestMethod} from '@uni-framework/core/http';
import {BatchInvoice} from '@uni-entities';
import {Observable} from 'rxjs';

@Injectable()
export class BatchInvoiceService extends BizHttp<BatchInvoice> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BatchInvoice.RelativeUrl;
        this.entityType = BatchInvoice.EntityType;
    }

    addItems(batchInvoiceID, itemIDs: number[], entityType: 'CustomerOrder' | 'CustomerInvoice') {
        return super.ActionWithBody(batchInvoiceID, itemIDs, `add${entityType}`, 'put');
    }

    startInvoicing(batchInvoiceID: number) {
        return this.PutAction(batchInvoiceID, 'invoice');
    }

    invoiceAction(id: number): Observable<any> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=invoice`)
            .send()
            .map(response => response.body);
    }
}
