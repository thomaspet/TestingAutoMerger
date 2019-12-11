import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {HttpParams} from '@angular/common/http';
import {StatisticsService, ErrorService} from '@app/services/services';
import {StatusCode, BatchInvoice} from '@uni-entities';
import {BatchInvoiceService} from '@app/services/sales/batchInvoiceService';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'batch-invoice-details',
    templateUrl: './batch-invoice-details.html',
    styleUrls: ['./batch-invoice-details.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchInvoiceDetails {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    @Input() batchInvoice: BatchInvoice;
    @Output() close = new EventEmitter();
    @Output() reloadList = new EventEmitter();

    tableConfig = this.getTableConfig();
    lookupFunction;
    invoicing: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private statisticsService: StatisticsService,
        private batchInvoiceService: BatchInvoiceService,
        private errorService: ErrorService,
        private toastService: ToastService,
    ) {}

    ngOnChanges(changes) {
        if (changes['batchInvoice'] && this.batchInvoice) {
            this.lookupFunction = this.getLookupFunction();
        }
    }

    rerunBatchInvoice() {
        this.invoicing = true;
        this.batchInvoiceService.startInvoicing(this.batchInvoice.ID).subscribe(
            () => {
                this.toastService.toast({
                    title: `Samlefakturering #${this.batchInvoice.ID} startet på nytt`,
                    type: ToastType.info,
                    duration: 5
                });

                this.reloadList.emit();
                this.close.emit();
            },
            (err) => {
                this.errorService.handle(err);
                this.invoicing = false;
                this.cdr.markForCheck();
            }
        );
    }

    private getLookupFunction() {
        return (tableParams: HttpParams) => {
            const select = [
                'ID',
                'CustomerInvoiceID as CustomerInvoiceID',
                'CustomerInvoice.CustomerName as InvoiceCustomerName',
                'CustomerInvoice.InvoiceNumber as InvoiceNumber',
                'CustomerInvoice.TaxExclusiveAmount as InvoiceTaxExclusiveAmount',
                'CustomerOrderID as CustomerOrderID',
                'CustomerOrder.CustomerName as OrderCustomerName',
                'CustomerOrder.OrderNumber as OrderNumber',
                'CustomerOrder.TaxExclusiveAmount as OrderTaxExclusiveAmount',
                'StatusCode as StatusCode',
                'Comment.Text as ErrorText'
            ].join(',');

            const params = tableParams
                .set('model', 'BatchInvoiceItem')
                .set('filter', `BatchInvoiceID eq ${this.batchInvoice.ID}`)
                .set('select', select)
                .set('expand', 'CustomerInvoice,CustomerOrder')
                .set('join', 'BatchInvoiceItem.CommentID eq Comment.ID')
                .set('orderby', 'StatusCode desc');

            return this.statisticsService.GetAllByHttpParams(params, true);
        };
    }

    private getTableConfig() {
        return new UniTableConfig('batchinvoice_details', false, false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('OrderNumber', 'Ordre')
                    .setWidth('9rem', false)
                    .setLinkResolver(row => row.CustomerOrderID && `/sales/orders/${row.CustomerOrderID}`)
                    .setTemplate(row => {
                        if (row.OrderNumber) {
                            return `Ordre ${row.OrderNumber}`;
                        }
                    }),
                new UniTableColumn('CustomerInvoiceID', 'Faktura')
                    .setWidth('9rem', false)
                    .setLinkResolver(row => row.InvoiceNumber && `/sales/invoices/${row.CustomerInvoiceID}`)
                    .setTemplate(row => {
                        if (row.InvoiceNumber) {
                            return `Faktura ${row.InvoiceNumber}`;
                        }
                    }),
                new UniTableColumn('CustomerInvoiceCustomerName', 'Kunde')
                    .setTemplate(row => row.InvoiceCustomerName || row.OrderCustomerName),
                new UniTableColumn('TaxExclusiveAmount', 'Sum eks. mva', UniTableColumnType.Money)
                    .setWidth('8rem', false)
                    .setTemplate(row => row.InvoiceTaxExclusiveAmount || row.OrderTaxExclusiveAmount),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Status)
                    .setStatusMap({
                        [StatusCode.Draft]: 'I kø',
                        [StatusCode.Pending]: 'I kø',
                        [StatusCode.Active]: 'Under arbeid',
                        [StatusCode.Completed]: { label: 'Fullført', class: 'good' },
                        [StatusCode.Error]: {
                            label: 'Feilet',
                            class: 'bad',
                            tooltip: row => row.ErrorText || 'Mangler feilmelding'
                        },
                        0: 'Ingen status'
                    }),
            ]);
    }
}
