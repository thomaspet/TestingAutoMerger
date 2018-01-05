import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {
    UniTable, UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {StatusCodeCustomerInvoice, StatusCodeCustomerOrder, StatusCodeCustomerQuote} from '../../../unientities';
import {
    ErrorService,
    StatisticsService,
    SellerService,
    CustomerInvoiceService,
    CustomerOrderService,
    CustomerQuoteService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'seller-sales-list',
    templateUrl: './sellerSalesList.html',
})
export class SellerSalesList {
    @ViewChild(UniTable) public table: UniTable;

    private salesTableConfig: UniTableConfig;
    private toolbarconfig: IToolbarConfig;
    private sellerId: number;
    private salesList: any;
    private busy: boolean = true;
    private mode: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private toastService: ToastService,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private sellerService: SellerService,
        private invoiceService: CustomerInvoiceService,
        private orderService: CustomerOrderService,
        private quoteService: CustomerQuoteService
    ) {
    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            this.mode = params['mode'];
            this.route.parent.params.subscribe(parent => {
                this.sellerId = +parent['id'];

                this.setupTable();
                this.loadSales();
                this.sellerService.Get(this.sellerId).subscribe(seller => {
                    this.setupToolbar(seller.Name);
                });
            });
        });
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
            `filter=SellerLink.SellerID eq ${this.sellerId} and StatusCode ne ${statusDraft}&` +
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

    private setupToolbar(seller: string) {
        this.toolbarconfig = {
            title: this.sellerId > 0 ? seller : '',
            navigation: {
                prev: () => this.previousSeller(),
                next: () => this.nextSeller(),
                add: () => this.addSeller()
            }
        };
    }

    private previousSeller() {
        this.sellerService.getPreviousID(this.sellerId)
            .subscribe(id => {
                if (id) {
                    this.router.navigateByUrl('/sales/sellers/' + id + '/sales');
                } else {
                    this.toastService.addToast(
                        'Ingen flere selgere før denne selgeren!', ToastType.warn, ToastTime.short
                    );
                }
            });
    }

    private nextSeller() {
        this.sellerService.getNextID(this.sellerId)
            .subscribe(id => {
                if (id) {
                    this.router.navigateByUrl('/sales/sellers/' + id + '/sales');
                } else {
                    this.toastService.addToast(
                        'Ingen flere selgere etter denne selgeren!', ToastType.warn, ToastTime.short
                    );
                }
            });
    }

    private addSeller() {
        this.router.navigateByUrl('/sales/sellers/0');
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/invoices/' + event.rowModel.ID);
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
                return row.SellerLinkPercent || '100';
            });

        const sellerIncAmountCol = new UniTableColumn('SellerAmount', 'Selgersum inkl. mva', UniTableColumnType.Money)
            .setTemplate(row => {
                return (row.TaxInclusiveAmount * (row.SellerLinkPercent || 100) / 100).toString();
            });

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth('7rem');

        // Setup table
        this.salesTableConfig = new UniTableConfig('common.seller.sellerSalesList', false, true, 25)
            .setSearchable(true)
            .setSortable(true)
            .setColumns([
                numberCol, dateCol, statusCol,
                customerNumberCol, customerNameCol, totalExAmountCol, totalIncAmountCol,
                sellerPercentCol, sellerIncAmountCol
            ]);
    }
}
