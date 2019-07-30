import {Input, Component} from '@angular/core';
import {Router} from '@angular/router';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';

import {
    StatusCodeCustomerInvoice,
    StatusCodeCustomerOrder,
    StatusCodeCustomerQuote
} from '../../../unientities';

import {
    StatisticsService,
    CustomerInvoiceService,
    CustomerOrderService,
    CustomerQuoteService
} from '../../../services/services';

@Component({
    selector: 'seller-sales-list',
    templateUrl: './sellerSalesList.html',
})
export class SellerSalesList {
    @Input() public mode: string;
    @Input() public sellerID: number;

    public salesTableConfig: UniTableConfig;
    public salesList: any;
    public busy: boolean = true;

    constructor(
        private statisticsService: StatisticsService,
        private invoiceService: CustomerInvoiceService,
        private orderService: CustomerOrderService,
        private quoteService: CustomerQuoteService
    ) {}

    public ngOnChanges(changes) {
        if (this.sellerID && this.mode) {
            this.setupTable();
            this.loadSales();
        }
    }

    private loadSales() {
        let entity;
        let statusDraft: number;
        let type = '';
        switch (this.mode) {
            case 'orders':
                entity = 'Order';
                statusDraft = StatusCodeCustomerOrder.Draft;
                break;
            case 'quotes':
                entity = 'Quote';
                statusDraft = StatusCodeCustomerQuote.Draft;
                break;
            default:
                entity = 'Invoice';
                statusDraft = StatusCodeCustomerInvoice.Draft;
                type = 'InvoiceType as InvoiceType,';
        }

        this.statisticsService.GetAllUnwrapped(
            `model=Customer${entity}&` +
            `expand=Customer,Customer.Info&` +
            `select=${entity}Date as Date,${entity}Number as Number,ID as ID,` +
                   `TaxInclusiveAmount as TaxInclusiveAmount,TaxExclusiveAmount as TaxExclusiveAmount,` +
                   `SellerLink.Percent,StatusCode as StatusCode,${type}` +
                   `CustomerID as CustomerID,Customer.CustomerNumber as CustomerNumber,Info.Name as CustomerName&` +
            `join=Customer${entity}.ID eq SellerLink.Customer${entity}ID&` +
            `filter=SellerLink.SellerID eq ${this.sellerID} and StatusCode ne ${statusDraft}&` +
            `orderBy=${entity}Date desc,${entity}Number desc`
        ).subscribe(sales => {
            this.salesList = sales;
            this.salesList.map(row => {
                switch (this.mode) {
                    case 'orders':
                        row.StatusCode = this.orderService.getStatusText(row.StatusCode);
                        break;
                    case 'quotes':
                        row.StatusCode = this.quoteService.getStatusText(row.StatusCode);
                        break;
                    default:
                        row.StatusCode = this.invoiceService.getStatusText(row.StatusCode, row.InvoiceType);
                }
            });
            this.busy = false;
        });
    }

    private setupTable() {
        let modeText = 'Faktura';
        switch (this.mode) {
            case 'orders':
                modeText = 'Ordre';
                break;
            case 'quotes':
                modeText = 'Tilbud';
                break;
        }

        // setup table
        const dateCol = new UniTableColumn('Date', `${modeText}dato`, UniTableColumnType.LocalDate)
            .setWidth('7rem');

        const numberCol = new UniTableColumn('Number', `${modeText}nr`, UniTableColumnType.Text)
            .setLinkResolver(row => `/sales/${this.mode}/${row.ID}`)
            .setWidth('7rem');

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Number)
            .setWidth('7rem')
            .setLinkResolver(row => `/sales/customer/${row.CustomerID}`);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Number);
        const totalExAmountCol = new UniTableColumn('TaxExclusiveAmount', 'Sum eks. mva', UniTableColumnType.Money);
        const totalIncAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Sum inkl. mva', UniTableColumnType.Money);

        const sellerPercentCol = new UniTableColumn('SellerLinkPercent', '%', UniTableColumnType.Percent)
            .setWidth('4rem')
            .setTemplate(row => {
                return row.SellerLinkPercent || '0';
            });

        const sellerIncAmountCol = new UniTableColumn('SellerAmount', 'Selgersum inkl. mva', UniTableColumnType.Money)
            .setTemplate(row => {
                return (row.TaxInclusiveAmount * (row.SellerLinkPercent || 100) / 100).toString();
            });

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth('7rem');

        let pageSize = (window.innerHeight - 450);

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        // Setup table
        this.salesTableConfig = new UniTableConfig('common.seller.sellerSalesList', false, true, pageSize)
            .setSearchable(true)
            .setSortable(true)
            .setColumns([
                numberCol, dateCol, statusCol,
                customerNumberCol, customerNameCol, totalExAmountCol, totalIncAmountCol,
                sellerPercentCol, sellerIncAmountCol
            ]);
    }
}
