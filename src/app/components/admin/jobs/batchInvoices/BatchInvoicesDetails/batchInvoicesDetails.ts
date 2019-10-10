import { Component, Input } from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { BatchInvoice, BatchInvoiceItem } from '@app/unientities';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { CommentService } from '@uni-framework/comments/commentService';
import { Router } from '@angular/router';

@Component({
    selector: 'batchinvoices-details',
    templateUrl: './batchinvoicesDetails.html'
})
export class BatchInvoicesDetails {

    public filteredItems$: Observable<BatchInvoiceItem[]>;
    public query: string;
    @Input() public items: BatchInvoiceItem[];
    @Input() public headerByEntity: string;
    @Input() public batchinvoice: BatchInvoice;


    constructor(
        private commentsService: CommentService,
        private router: Router) {}

    ngOnChanges() {
        this.query =  '';
        this.searchQueryChange(this.query);
    }

    searchQueryChange(query) {
        if (query === '') {
            this.filteredItems$ = of(this.items);
        } else {
            this.filteredItems$ = of(this.items).pipe(
                map(items => {
                    return items.filter((it: any) => {
                        const itemNumber = it.CustomerOrder.OrderNumber || '';
                        const custormerName = it.CustomerOrder.CustomerName || '';
                        const customerNumber = it.CustomerOrder.CustomerOrgNumber || '';
                        return itemNumber.toString().startsWith(query)
                            || custormerName.startsWith(query)
                            || customerNumber.toString().startsWith(query);
                    });
                })
            );
        }
    }

    goToInvoice(item) {
        if (item.CustomerInvoiceID) {
            this.router.navigateByUrl('/sales/invoices/' + item.CustomerInvoiceID);
        } else {
            this.getError(item);
        }
    }

    getLink(item) {
        if (item.CustomerOrderID) {
            return '#/sales/orders/' + item.CustomerOrderID;
        } else {
            return '#/sales/invoices/' + item.CustomerInvoiceID;
        }
    }

    getError(item) {
        if (item._isOpen) {
            item._isOpen = false;
            return;
        }
        this.commentsService.getAll('batchinvoiceitem', item.ID).subscribe(comments => {
            item._comment = comments[0];
            item._isOpen = true;
        });
    }
}
