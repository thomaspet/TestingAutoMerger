import { Component } from '@angular/core';
import { BatchInvoiceService } from '@app/services/sales/batchInvoiceService';
import { BatchInvoice, BatchInvoiceItem } from '@app/unientities';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'batch-invoices-container',
    templateUrl: './batchInvoicesContainer.html'
})
export class BatchInvoicesContainer {
    public showBatchInvoiceDetails = false;
    public selectedRow: BatchInvoice;
    public items$: Observable<BatchInvoiceItem[]>;
    public headerByEntity: string;

    constructor(private batchInvoiceService: BatchInvoiceService) {
    }

    ngOnInit() {}

    rowSelected(row) {
        this.selectedRow = row;
        this.showBatchInvoiceDetails = true;
        this.items$ = this.batchInvoiceService
            .Get(row.ID, ['Items', 'Items.CustomerInvoice', 'Items.CustomerOrder'], true)
            .pipe(
                map(data => data.Items),
                tap(data => {
                    if (data.Items && data.Items.length > 0) {
                        this.headerByEntity = data.Items[0].CustomerInvoiceID ? 'Ordredato' :  'Fakturadato';
                    }
                })
            );
    }

    hideBatchInvoiceDetails() {
        this.showBatchInvoiceDetails = false;
    }
}
