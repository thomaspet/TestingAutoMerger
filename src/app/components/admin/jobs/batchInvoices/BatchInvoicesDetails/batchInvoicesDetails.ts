import { Component, Input } from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { BatchInvoice, BatchInvoiceItem } from '@app/unientities';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { CommentService } from '@uni-framework/comments/commentService';
import { Router } from '@angular/router';
import {PaymentService} from '@app/services/accounting/paymentService';
import {BatchInvoiceService} from '@app/services/sales/batchInvoiceService';

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
        private batchInvoiceService: BatchInvoiceService,
        private statisticsService: StatisticsService,
        private paymentService: PaymentService,
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

    getPayments(item) {
        if (item._isOpen) {
            item._isOpen = false;
            return;
        }
        if (item._payments) {
            item._isOpen = true;
            return;
        }
        this.statisticsService.GetAllUnwrapped(`model=payment` +
            `&select=Payment.ID,JournalEntry.ID,JournalEntry.JournalEntryNumber,` +
            `Payment.AmountCurrency,Payment.StatusCode,Payment.StatusText,Payment.PaymentDate,CurrencyCode.Code` +
            `&filter=payment.CustomerInvoiceID eq ${item.CustomerInvoice.ID}` +
            `&join=Payment.JournalEntryID eq JournalEntry.ID and Payment.CurrencyCodeID eq CurrencyCode.ID`).subscribe(payments => {
                item._payments = payments.map(payment => {
                    const [journalEntryNumber, year] = payment.JournalEntryJournalEntryNumber.split('-');
                    payment._link = `#/accounting/transquery?JournalEntryNumber=${journalEntryNumber}&AccountYear=${year}`;
                    payment._statusText = (payment.PaymentStatusCode === 31002 || payment.PaymentStatusCode === 31003)
                        ? this.paymentService.getStatusText(44006) : this.paymentService.getStatusText(payment.PaymentStatusCode);
                    return payment;
                });
                item._isOpen = true;
        });
    }

    reBatchInvoices(item) {
        this.batchInvoiceService.invoiceAction(this.batchinvoice.ID).subscribe(res => console.log(res));
    }
}
