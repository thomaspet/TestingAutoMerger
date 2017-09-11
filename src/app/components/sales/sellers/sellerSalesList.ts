import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem, ITableFilter} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {StatusCodeCustomerInvoice} from '../../../unientities';
import {IPosterWidget} from '../../common/poster/poster';
import {
    ErrorService,
    StatisticsService,
    SellerService,
    CustomerInvoiceService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'seller-sales-list',
    templateUrl: './sellerSalesList.html',
})
export class SellerSalesList {
    @ViewChild(UniTable) private table: UniTable;

    private salesTableConfig: UniTableConfig;
    private toolbarconfig: IToolbarConfig;
    private sellerId: number;
    private salesList: any;
    private busy: boolean = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private toastService: ToastService,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private sellerService: SellerService,
        private invoiceService: CustomerInvoiceService
    ) {
        this.setupTable();
    }

    private ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.sellerId = +params['id'];

            this.loadSales();
            this.sellerService.Get(this.sellerId).subscribe(seller => {
                this.setupToolbar(seller.Name);
            });
        });
    }

    private loadSales() {
        this.statisticsService.GetAllUnwrapped(
            `model=CustomerInvoice&` +
            `expand=Customer,Customer.Info&` +
            `select=InvoiceDate as InvoiceDate,InvoiceNumber as InvoiceNumber,ID as CustomerInvoiceID,` +
                   `TaxInclusiveAmount as TaxInclusiveAmount,TaxExclusiveAmount as TaxExclusiveAmount,` +
                   `SellerLink.Percent,StatusCode as StatusCode,InvoiceType as InvoiceType,` +
                   `CustomerID as CustomerID,Customer.CustomerNumber as CustomerNumber,Info.Name as CustomerName&` +
            `join=CustomerInvoice.ID eq SellerLink.CustomerInvoiceID&` +
            `filter=SellerLink.SellerID eq ${this.sellerId} and StatusCode ne ${StatusCodeCustomerInvoice.Draft}&` +
            `orderBy=InvoiceDate desc,InvoiceNumber desc`
        ).subscribe(sales => {
            this.salesList = sales;
            this.salesList.map(row => {
                row.StatusCode = this.invoiceService.getStatusText(row.StatusCode, row.InvoiceType);
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
                    this.toastService.addToast('Ingen flere selgere før denne selgeren!', ToastType.warn, ToastTime.short);
                }
            });
    }

    private nextSeller() {
        this.sellerService.getNextID(this.sellerId)
            .subscribe(id => {
                if (id) {
                    this.router.navigateByUrl('/sales/sellers/' + id + '/sales');
                } else {
                    this.toastService.addToast('Ingen flere selgere etter denne selgeren!', ToastType.warn, ToastTime.short);
                }
            });
    }

    private addSeller() {
        this.router.navigateByUrl('/sales/sellers/0');
    }

    private onRowSelected(event) {
        this.router.navigateByUrl('/sales/invoices/' + event.rowModel.ID);
    }

    private setupTable() {
        // setup default filter
        const filter: ITableFilter[] = [];
        filter.push({field: 'StatusCode', operator: 'eq', value: 'Betalt', group: 0});
        
        // setup table
        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('7rem');

        let invoiceCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
            .setTemplate(row => {
                return `<a href='/#/sales/invoices/${row.CustomerInvoiceID}'>${row.InvoiceNumber}</a>`;
            })
            .setWidth('7rem');

        let customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Number)
            .setWidth('7rem')
            .setTemplate(row => {
                return `<a href='/#/sales/customer/${row.CustomerID}'>${row.CustomerNumber}</a>`;
            });

        let customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Number);
        let totalExAmountCol = new UniTableColumn('TaxExclusiveAmount', 'Sum eks. mva', UniTableColumnType.Money)
        let totalIncAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Sum inkl. mva', UniTableColumnType.Money)

        let sellerPercentCol = new UniTableColumn('SellerLinkPercent', '%', UniTableColumnType.Percent)
            .setWidth('4rem');

        let sellerIncAmountCol = new UniTableColumn('SellerAmount', 'Selgersum inkl. mva', UniTableColumnType.Money)
            .setTemplate(row => {
                return (row.TaxInclusiveAmount * row.SellerLinkPercent / 100).toString();
            });

        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth('7rem');

        // Setup table
        this.salesTableConfig = new UniTableConfig('common.seller.sellerSalesList', false, true, 25)
            .setSearchable(true)
            .setSortable(true)
            .setFilters(filter)            
            .setColumns([
                invoiceCol, invoiceDateCol, statusCol,
                customerNumberCol, customerNameCol, totalExAmountCol, totalIncAmountCol,
                sellerPercentCol, sellerIncAmountCol
            ]);
    }
}
