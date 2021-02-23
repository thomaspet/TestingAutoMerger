import { Injectable } from "@angular/core";
import { BatchInvoice, BatchInvoiceItem, BatchInvoiceOperation, CustomerInvoice } from "@uni-entities";
import { BizHttp, UniHttp } from "@uni-framework/core/http";
import { Observable } from "rxjs";

@Injectable()
export class MassInvoiceService extends BizHttp<BatchInvoice> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = BatchInvoice.RelativeUrl;
        this.entityType = BatchInvoice.EntityType;
    }

    public postMassInvoice(customerIds: number[], invoice: CustomerInvoice, notifyEmail: boolean = false): Observable<BatchInvoice> {
        const batch = this.mapInvoiceToBatchInvoice(invoice);
        batch.NotifyEmail = notifyEmail;
        batch.Items = [];

        for (const id of customerIds) {
            const item = new BatchInvoiceItem()
            item.CustomerID = id;
            batch.Items.push(item);
        }

        return this.http.asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withBody(batch)
            .withEndPoint(`${this.relativeURL}`)
            .send()
            .map(res => res.body);
    }

    public invoiceBatch(batch: BatchInvoice): Observable<boolean> {
        return this.http.asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${batch.ID}?action=invoice`)
            .send()
            .map(res => res.ok)
    }

    private mapInvoiceToBatchInvoice(invoice: CustomerInvoice, batch: BatchInvoice = undefined): BatchInvoice {
        batch = batch || new BatchInvoice();
        batch.OurRef = invoice.OurReference;
        batch.YourRef = invoice.YourReference;
        batch.InvoiceDate = invoice.InvoiceDate;
        batch.DueDate = invoice.PaymentDueDate;
        batch.Comment = invoice.Comment;
        batch.Operation = BatchInvoiceOperation.InvoiceMultipleCustomerByDraft;
        batch.CopyFromEntityId = invoice.ID;
        batch.FreeTxt = invoice.FreeTxt;
        return batch;
    }
}