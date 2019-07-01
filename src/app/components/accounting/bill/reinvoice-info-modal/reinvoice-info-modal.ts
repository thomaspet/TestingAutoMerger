import {Component, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, StatisticsService, CustomerInvoiceService, CustomerOrderService} from '@app/services/services';
import {CustomerInvoice, CustomerOrder} from '@uni-entities';

@Component({
    selector: 'reinvoice-info-modal',
    templateUrl: './reinvoice-info-modal.html',
    styleUrls: ['./reinvoice-info-modal.sass']
})
export class ReInvoiceInfoModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    invoices: Partial<CustomerInvoice>[];
    orders: Partial<CustomerOrder>[];

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private invoiceService: CustomerInvoiceService,
        private orderService: CustomerOrderService
    ) {}

    public ngOnInit() {
        const reInvoiceID = this.options.data;

        const orderOdata = this.getOdata(reInvoiceID, 'CustomerOrder');
        const invoiceOdata = this.getOdata(reInvoiceID, 'CustomerInvoice');

        this.busy = true;
        forkJoin(
            this.statisticsService.GetAllUnwrapped(orderOdata),
            this.statisticsService.GetAllUnwrapped(invoiceOdata)
        ).subscribe(
            res => {
                this.orders = (res[0] || []).map(order => {
                    order['_status'] = this.orderService.getStatusText(order.StatusCode);
                    return order;
                });

                this.invoices = (res[1] || []).map(invoice => {
                    invoice['_status'] = this.invoiceService.getStatusText(invoice.StatusCode);
                    return invoice;
                });

                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.onClose.emit();
            }
        );
    }

    goToInvoice(invoice) {
        this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
        this.onClose.emit();
    }

    goToOrder(order) {
        this.router.navigateByUrl('/sales/orders/' + order.ID);
        this.onClose.emit();
    }

    getOdata(reInvoiceID: number, entityType: 'CustomerInvoice' | 'CustomerOrder') {
        const selects = [
            `ID as ID`,
            `CustomerID as CustomerID`,
            `CustomerName as CustomerName`,
            `StatusCode as StatusCode`,
            `TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency`
        ];

        let selectString = selects.map(select => `${entityType}.${select}`).join(',');

        if (entityType === 'CustomerInvoice') {
            selectString += `,customerinvoice.invoiceNumber as InvoiceNumber`;
        } else {
            selectString += `,CustomerOrder.orderNumber as OrderNumber`;
        }

        const filter = [
            `DestinationEntityName eq '${entityType}'`,
            `SourceEntityName eq 'ReInvoice'`,
            `SourceInstanceID eq ${reInvoiceID}`
        ].join(' and ');

        const join = `${entityType} on Tracelink.DestinationInstanceId eq ${entityType}.ID`;
        return `model=Tracelink&select=${selectString}&filter=${filter}&join=${join}`;
    }

}
